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
        { companyName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { vatNumber: { contains: search, mode: "insensitive" } },
      ];
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          contacts: true,
          addresses: true,
          offers: {
            select: {
              id: true,
              status: true,
              total: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.client.count({ where }),
    ]);

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching clients:", error);
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

    const client = await prisma.$transaction(async (tx) => {
      // Create the main client
      const newClient = await tx.client.create({
        data: {
          tenantId: session.user.tenantId,
          companyName: data.companyName,
          vatNumber: data.vatNumber || null,
          email: data.email || null,
          phone: data.phone || null,
          website: data.website || null,
          notes: data.notes || null,
          status: data.status || "LEAD",
        },
      });

      // Create contact persons
      if (data.contacts && data.contacts.length > 0) {
        await tx.clientContact.createMany({
          data: data.contacts.map((contact: any) => ({
            clientId: newClient.id,
            name: contact.name,
            email: contact.email || null,
            phone: contact.phone || null,
            position: contact.position || null,
            isPrimary: contact.isPrimary || false,
          })),
        });
      }

      // Create addresses
      if (data.addresses && data.addresses.length > 0) {
        await tx.clientAddress.createMany({
          data: data.addresses.map((address: any) => ({
            clientId: newClient.id,
            street: address.street,
            city: address.city,
            state: address.state || null,
            country: address.country,
            zipCode: address.zipCode || null,
            type: address.type || "BILLING",
            isPrimary: address.isPrimary || false,
          })),
        });
      }

      return newClient;
    });

    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}