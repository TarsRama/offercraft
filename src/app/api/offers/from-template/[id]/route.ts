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

    // Fetch the template
    const template = await prisma.offerTemplate.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Generate offer number
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

    // Calculate validity date
    const validityDate = new Date();
    validityDate.setDate(validityDate.getDate() + template.validityDays);

    // Create offer from template
    const offer = await prisma.$transaction(async (tx) => {
      const newOffer = await tx.offer.create({
        data: {
          tenantId: session.user.tenantId,
          clientId: data.clientId,
          createdById: session.user.id,
          offerNumber,
          title: data.title || template.name,
          status: "DRAFT",
          currency: data.currency || "EUR",
          validUntil: validityDate,
          termsAndConditions: template.terms,
          subtotal: 0,
          discountTotal: 0,
          vatTotal: 0,
          total: 0,
        },
      });

      // Create sections and articles from template
      const templateSections = template.sections as any[];
      
      if (templateSections && templateSections.length > 0) {
        for (let i = 0; i < templateSections.length; i++) {
          const sectionData = templateSections[i];
          
          const section = await tx.offerSection.create({
            data: {
              offerId: newOffer.id,
              title: sectionData.title,
              description: sectionData.description || null,
              sortOrder: i,
            },
          });

          // Create articles for this section
          if (sectionData.articles && sectionData.articles.length > 0) {
            await tx.article.createMany({
              data: sectionData.articles.map((article: any, articleIndex: number) => ({
                sectionId: section.id,
                name: article.name,
                description: article.description || null,
                unit: article.unit || "pcs",
                unitPrice: parseFloat(article.unitPrice) || 0,
                quantity: parseFloat(article.quantity) || 1,
                vatRate: parseFloat(article.vatRate) || 0,
                discountPercent: parseFloat(article.discountPercent) || 0,
                discountFixed: 0,
                total: parseFloat(article.total) || 0,
                sortOrder: articleIndex,
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
        message: `Offer created from template: ${template.name}`,
        metadata: { 
          templateId: template.id,
          createdBy: session.user.id 
        },
      },
    });

    return NextResponse.json(offer, { status: 201 });
  } catch (error) {
    console.error("Error creating offer from template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}