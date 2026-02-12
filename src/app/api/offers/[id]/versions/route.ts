import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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

    const versions = await prisma.offerVersion.findMany({
      where: {
        offerId: params.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { version: "desc" },
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error("Error fetching offer versions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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

    // Check if user has access to this offer
    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        sections: {
          include: {
            articles: true,
          },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Get the next version number
    const lastVersion = await prisma.offerVersion.findFirst({
      where: { offerId: params.id },
      orderBy: { version: "desc" },
      select: { version: true },
    });

    const nextVersion = (lastVersion?.version || 0) + 1;

    // Create version snapshot
    const version = await prisma.offerVersion.create({
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
          sections: offer.sections,
        },
        changedBy: session.user.id,
        changeNote: data.changeNote || null,
      },
    });

    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    console.error("Error creating offer version:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}