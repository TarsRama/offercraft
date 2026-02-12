import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string; paymentId: string } }
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

    const payment = await prisma.paymentSchedule.updateMany({
      where: {
        id: params.paymentId,
        offerId: params.id,
      },
      data: {
        name: data.name,
        percentage: parseFloat(data.percentage),
        amount: data.amount ? parseFloat(data.amount) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        description: data.description,
        status: data.status,
        order: parseInt(data.order),
      },
    });

    if (payment.count === 0) {
      return NextResponse.json({ error: "Payment milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Payment milestone updated successfully" });
  } catch (error) {
    console.error("Error updating payment milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string; paymentId: string } }
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

    const deleted = await prisma.paymentSchedule.deleteMany({
      where: {
        id: params.paymentId,
        offerId: params.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Payment milestone not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Payment milestone deleted successfully" });
  } catch (error) {
    console.error("Error deleting payment milestone:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}