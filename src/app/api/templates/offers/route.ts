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
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {
      tenantId: session.user.tenantId,
    };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const templates = await prisma.offerTemplate.findMany({
      where,
      orderBy: { name: "asc" },
    });

    // Get categories for filter dropdown
    const categories = await prisma.offerTemplate.findMany({
      where: { tenantId: session.user.tenantId },
      select: { category: true },
      distinct: ["category"],
    }).then(results => results.map(r => r.category).filter(Boolean).sort());

    return NextResponse.json({ templates, categories });
  } catch (error) {
    console.error("Error fetching offer templates:", error);
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

    // If creating from existing offer, fetch the offer data
    let sections = data.sections;
    if (data.fromOfferId) {
      const offer = await prisma.offer.findFirst({
        where: {
          id: data.fromOfferId,
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
        return NextResponse.json({ error: "Source offer not found" }, { status: 404 });
      }

      sections = offer.sections;
    }

    const template = await prisma.offerTemplate.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        description: data.description,
        category: data.category,
        sections: sections || [],
        terms: data.terms,
        validityDays: parseInt(data.validityDays) || 30,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating offer template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}