import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// This is a placeholder implementation for sending emails
// In a real implementation, you would integrate with an email service like:
// - SendGrid, Mailgun, AWS SES, etc.
async function sendEmail(to: string, subject: string, body: string, attachmentUrl?: string) {
  // Placeholder - replace with actual email service
  console.log("Sending email:", { to, subject, body, attachmentUrl });
  
  // For demo purposes, we'll just simulate success
  return {
    success: true,
    messageId: `msg_${Date.now()}`,
  };
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
    const { to, templateId, customSubject, customMessage } = data;

    // Fetch offer with client details
    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        client: true,
        tenant: true,
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Get email template if specified
    let template = null;
    if (templateId) {
      template = await prisma.emailTemplate.findFirst({
        where: {
          id: templateId,
          tenantId: session.user.tenantId,
        },
      });
    } else {
      // Get default template
      template = await prisma.emailTemplate.findFirst({
        where: {
          tenantId: session.user.tenantId,
          isDefault: true,
        },
      });
    }

    // Prepare email content
    const recipientEmail = to || offer.client.email;
    if (!recipientEmail) {
      return NextResponse.json({ error: "No recipient email address" }, { status: 400 });
    }

    // Create share link for the offer
    const baseUrl = process.env.NEXTAUTH_URL || "https://offercraft.vercel.app";
    const shareLink = `${baseUrl}/shared/offers/${offer.id}`;

    // Prepare subject and body with variable substitution
    let emailSubject = customSubject || template?.subject || `Offer ${offer.offerNumber} from ${offer.tenant.name}`;
    let emailBody = customMessage || template?.body || `
Dear ${offer.client.companyName},

Please find attached our offer ${offer.offerNumber}: ${offer.title}

You can view and sign this offer online at: ${shareLink}

Best regards,
${offer.tenant.name}
    `;

    // Replace variables in email content
    const variables = {
      '{{offerNumber}}': offer.offerNumber,
      '{{offerTitle}}': offer.title,
      '{{clientName}}': offer.client.companyName,
      '{{companyName}}': offer.tenant.name,
      '{{shareLink}}': shareLink,
      '{{total}}': `${parseFloat(offer.total.toString()).toFixed(2)} ${offer.currency}`,
    };

    Object.entries(variables).forEach(([key, value]) => {
      emailSubject = emailSubject.replace(new RegExp(key, 'g'), value);
      emailBody = emailBody.replace(new RegExp(key, 'g'), value);
    });

    // Send email (this would integrate with actual email service)
    const emailResult = await sendEmail(recipientEmail, emailSubject, emailBody, shareLink);

    if (!emailResult.success) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Update offer status and log email
    await prisma.$transaction(async (tx) => {
      // Update offer status to SENT
      await tx.offer.update({
        where: { id: params.id },
        data: { 
          status: "SENT",
          sentAt: new Date(),
        },
      });

      // Log email
      await tx.emailLog.create({
        data: {
          offerId: params.id,
          to: recipientEmail,
          subject: emailSubject,
          status: "sent",
        },
      });

      // Log activity
      await tx.offerActivity.create({
        data: {
          offerId: params.id,
          type: "SENT",
          message: `Offer sent via email to ${recipientEmail}`,
          metadata: {
            recipient: recipientEmail,
            messageId: emailResult.messageId,
            sentBy: session.user.id,
          },
        },
      });
    });

    return NextResponse.json({
      message: "Offer sent successfully",
      recipient: recipientEmail,
      shareLink,
    });
  } catch (error) {
    console.error("Error sending offer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}