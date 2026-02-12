import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Fetch the original offer
    const originalOffer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        sections: {
          include: {
            articles: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!originalOffer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Generate new offer number
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    
    const monthlyCount = await prisma.offer.count({
      where: {
        tenantId: session.user.tenantId,
        createdAt: {
          gte: new Date(`${currentYear}-${currentMonth}-01`),
          lt: new Date(`${currentYear}-${parseInt(currentMonth) + 1}-01`),
        },
      },
    });

    const offerNumber = `OFR-${currentYear}${currentMonth}-${String(monthlyCount + 1).padStart(4, "0")}`;

    // Create duplicate offer
    const duplicateOffer = await prisma.$transaction(async (tx) => {
      const newOffer = await tx.offer.create({
        data: {
          tenantId: session.user.tenantId,
          clientId: data.clientId || originalOffer.clientId, // Allow changing client
          createdById: session.user.id,
          offerNumber,
          title: data.title || `${originalOffer.title} (Copy)`,
          status: "DRAFT", // Always start as draft
          language: originalOffer.language,
          currency: originalOffer.currency,
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          executiveSummary: originalOffer.executiveSummary,
          termsAndConditions: originalOffer.termsAndConditions,
          subtotal: originalOffer.subtotal,
          discountTotal: originalOffer.discountTotal,
          vatTotal: originalOffer.vatTotal,
          total: originalOffer.total,
        },
      });

      // Duplicate sections and articles
      for (const section of originalOffer.sections) {
        const newSection = await tx.offerSection.create({
          data: {
            offerId: newOffer.id,
            title: section.title,
            description: section.description,
            sortOrder: section.sortOrder,
          },
        });

        // Duplicate articles
        if (section.articles.length > 0) {
          await tx.article.createMany({
            data: section.articles.map((article) => ({
              sectionId: newSection.id,
              name: article.name,
              description: article.description,
              unit: article.unit,
              unitPrice: article.unitPrice,
              quantity: article.quantity,
              vatRate: article.vatRate,
              discountPercent: article.discountPercent,
              discountFixed: article.discountFixed,
              total: article.total,
              specifications: article.specifications,
              images: article.images,
              sortOrder: article.sortOrder,
            })),
          });
        }
      }

      return newOffer;
    });

    // Log activity for both offers
    await Promise.all([
      prisma.offerActivity.create({
        data: {
          offerId: originalOffer.id,
          type: "DUPLICATED",
          message: `Offer duplicated as ${duplicateOffer.offerNumber}`,
          metadata: {
            duplicateId: duplicateOffer.id,
            duplicatedBy: session.user.id,
          },
        },
      }),
      prisma.offerActivity.create({
        data: {
          offerId: duplicateOffer.id,
          type: "CREATED",
          message: `Offer created as duplicate of ${originalOffer.offerNumber}`,
          metadata: {
            originalId: originalOffer.id,
            createdBy: session.user.id,
          },
        },
      }),
    ]);

    return NextResponse.json(duplicateOffer, { status: 201 });
  } catch (error) {
    console.error("Error duplicating offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}