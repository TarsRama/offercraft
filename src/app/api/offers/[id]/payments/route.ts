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

    const payments = await prisma.paymentSchedule.findMany({
      where: {
        offerId: params.id,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error("Error fetching payment schedule:", error);
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
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Get the next order number
    const lastPayment = await prisma.paymentSchedule.findFirst({
      where: { offerId: params.id },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const nextOrder = (lastPayment?.order || 0) + 1;

    const payment = await prisma.paymentSchedule.create({
      data: {
        offerId: params.id,
        name: data.name,
        percentage: parseFloat(data.percentage) || 0,
        amount: data.amount ? parseFloat(data.amount) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        description: data.description || null,
        status: data.status || "pending",
        order: nextOrder,
      },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error("Error creating payment milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}