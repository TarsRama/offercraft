import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { offerNumber: { contains: search, mode: "insensitive" } },
        { client: { companyName: { contains: search, mode: "insensitive" } } },
      ];
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        include: {
          client: {
            select: {
              companyName: true,
              email: true,
            },
          },
          createdBy: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.offer.count({ where }),
    ]);

    return NextResponse.json({
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching offers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Generate offer number
    const currentYear = new Date().getFullYear();
    const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");
    
    // Get the count of offers for this month to generate sequential number
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

    // Create offer with sections and articles
    const offer = await prisma.$transaction(async (tx) => {
      // Create the main offer
      const newOffer = await tx.offer.create({
        data: {
          tenantId: session.user.tenantId,
          clientId: data.clientId,
          createdById: session.user.id,
          offerNumber,
          title: data.title,
          status: data.status || "DRAFT",
          currency: data.currency || "EUR",
          validUntil: data.validUntil ? new Date(data.validUntil) : null,
          executiveSummary: data.executiveSummary || null,
          termsAndConditions: data.termsAndConditions || null,
          subtotal: data.subtotal || 0,
          discountTotal: data.discountTotal || 0,
          vatTotal: data.vatTotal || 0,
          total: data.total || 0,
        },
      });

      // Create sections with articles
      if (data.sections && data.sections.length > 0) {
        for (const sectionData of data.sections) {
          const section = await tx.offerSection.create({
            data: {
              offerId: newOffer.id,
              title: sectionData.title,
              description: sectionData.description || null,
              sortOrder: sectionData.sortOrder || 0,
            },
          });

          // Create articles for this section
          if (sectionData.articles && sectionData.articles.length > 0) {
            await tx.article.createMany({
              data: sectionData.articles.map((article: any, index: number) => ({
                sectionId: section.id,
                name: article.name,
                description: article.description || null,
                unit: article.unit || "pcs",
                unitPrice: article.unitPrice || 0,
                quantity: article.quantity || 1,
                vatRate: article.vatRate || 0,
                discountPercent: article.discountPercent || 0,
                discountFixed: 0, // Not used in frontend yet
                total: article.total || 0,
                sortOrder: index,
              })),
            });
          }
        }
      }

      return newOffer;
    });

    // Log activity
    await prisma.offerActivity.create({
      data: {
        offerId: offer.id,
        type: "CREATED",
        message: `Offer created with status: ${offer.status}`,
        metadata: { createdBy: session.user.id },
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}