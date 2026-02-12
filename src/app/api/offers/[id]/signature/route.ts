import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check if offer exists and is shareable (no auth required for public view)
    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        status: { in: ["SENT", "VIEWED", "ACCEPTED"] }, // Only allow signature on sent offers
      },
      include: {
        signature: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found or not available for signature" }, { status: 404 });
    }

    return NextResponse.json({
      hasSigned: !!offer.signature,
      signature: offer.signature ? {
        signerName: offer.signature.signerName,
        signerEmail: offer.signature.signerEmail,
        signedAt: offer.signature.signedAt,
      } : null,
    });
  } catch (error) {
    console.error("Error fetching signature status:", error);
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
    const data = await request.json();
    const { signerName, signerEmail, signatureData } = data;

    if (!signerName || !signerEmail || !signatureData) {
      return NextResponse.json({ error: "Missing required signature data" }, { status: 400 });
    }

    // Check if offer exists and is available for signature
    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        status: { in: ["SENT", "VIEWED"] }, // Don't allow re-signing
      },
      include: {
        signature: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found or not available for signature" }, { status: 404 });
    }

    if (offer.signature) {
      return NextResponse.json({ error: "Offer has already been signed" }, { status: 400 });
    }

    // Get client IP and user agent
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Create signature and update offer status
    const result = await prisma.$transaction(async (tx) => {
      // Create signature
      const signature = await tx.signature.create({
        data: {
          offerId: params.id,
          signerName,
          signerEmail,
          signatureData,
          ipAddress,
          userAgent,
        },
      });

      // Update offer status to ACCEPTED
      const updatedOffer = await tx.offer.update({
        where: { id: params.id },
        data: { 
          status: "ACCEPTED",
          acceptedAt: new Date(),
        },
      });

      // Log activity
      await tx.offerActivity.create({
        data: {
          offerId: params.id,
          type: "SIGNED",
          message: `Offer digitally signed by ${signerName}`,
          metadata: {
            signerEmail,
            ipAddress,
          },
        },
      });

      return { signature, offer: updatedOffer };
    });

    return NextResponse.json({
      message: "Offer signed successfully",
      signature: {
        signerName: result.signature.signerName,
        signerEmail: result.signature.signerEmail,
        signedAt: result.signature.signedAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating signature:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}