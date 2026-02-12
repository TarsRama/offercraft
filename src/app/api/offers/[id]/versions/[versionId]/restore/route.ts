import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has access to this offer
    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Get the version to restore
    const version = await prisma.offerVersion.findFirst({
      where: {
        id: params.versionId,
        offerId: params.id,
      },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    // Create a new version snapshot before restoring
    const lastVersion = await prisma.offerVersion.findFirst({
      where: { offerId: params.id },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (lastVersion?.version || 0) + 1;

    const restoredOffer = await prisma.$transaction(async (tx) => {
      // Create backup of current state
      await tx.offerVersion.create({
        data: {
          offerId: params.id,
          version: nextVersion,
          data: {
            offer: {
              id: offer.id,
              title: offer.title,
              status: offer.status,
              currency: offer.currency,
              validUntil: offer.validUntil,
              executiveSummary: offer.executiveSummary,
              termsAndConditions: offer.termsAndConditions,
              subtotal: offer.subtotal,
              discountTotal: offer.discountTotal,
              vatTotal: offer.vatTotal,
              total: offer.total,
            },
          },
          changedBy: session.user.id,
          changeNote: `Auto-backup before restoring to version ${version.version}`,
        },
      });

      const versionData = version.data as any;
      
      // Delete current sections and articles
      await tx.article.deleteMany({
        where: {
          section: {
            offerId: params.id,
          },
        },
      });
      await tx.offerSection.deleteMany({
        where: { offerId: params.id },
      });

      // Update offer with version data
      const updatedOffer = await tx.offer.update({
        where: { id: params.id },
        data: {
          title: versionData.offer.title,
          executiveSummary: versionData.offer.executiveSummary,
          termsAndConditions: versionData.offer.termsAndConditions,
          subtotal: versionData.offer.subtotal,
          discountTotal: versionData.offer.discountTotal,
          vatTotal: versionData.offer.vatTotal,
          total: versionData.offer.total,
        },
      });

      // Recreate sections and articles
      if (versionData.sections && versionData.sections.length > 0) {
        for (let i = 0; i < versionData.sections.length; i++) {
          const sectionData = versionData.sections[i];
          
          const section = await tx.offerSection.create({
            data: {
              offerId: params.id,
              title: sectionData.title,
              description: sectionData.description || null,
              sortOrder: i,
            },
          });

          if (sectionData.articles && sectionData.articles.length > 0) {
            await tx.article.createMany({
              data: sectionData.articles.map((article: any, articleIndex: number) => ({
                sectionId: section.id,
                name: article.name,
                description: article.description || null,
                unit: article.unit || "pcs",
                unitPrice: article.unitPrice,
                quantity: article.quantity,
                vatRate: article.vatRate,
                discountPercent: article.discountPercent,
                discountFixed: article.discountFixed || 0,
                total: article.total,
                sortOrder: articleIndex,
              })),
            });
          }
        }
      }

      return updatedOffer;
    });

    // Log activity
    await prisma.offerActivity.create({
      data: {
        offerId: params.id,
        type: "RESTORED",
        message: `Offer restored to version ${version.version}`,
        metadata: {
          restoredVersion: version.version,
          restoredBy: session.user.id,
        },
      },
    });

    return NextResponse.json({
      message: "Offer restored successfully",
      offer: restoredOffer,
    });
  } catch (error) {
    console.error("Error restoring offer version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}