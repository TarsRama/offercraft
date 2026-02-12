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
      isActive: true,
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

    const templates = await prisma.articleTemplate.findMany({
      where,
      orderBy: { name: "asc" },
    });

    // Get categories for filter dropdown
    const categories = await prisma.articleTemplate.findMany({
      where: { tenantId: session.user.tenantId, isActive: true },
      select: { category: true },
      distinct: ["category"],
    }).then(results => results.map(r => r.category).filter(Boolean).sort());

    return NextResponse.json({ templates, categories });
  } catch (error) {
    console.error("Error fetching article templates:", error);
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

    const template = await prisma.articleTemplate.create({
      data: {
        tenantId: session.user.tenantId,
        name: data.name,
        description: data.description,
        category: data.category,
        unit: data.unit || "pcs",
        unitPrice: parseFloat(data.unitPrice) || 0,
        vatRate: parseFloat(data.vatRate) || 18,
        specifications: data.specifications || null,
        images: data.images || [],
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error("Error creating article template:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}