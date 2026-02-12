import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, WidthType, AlignmentType, TextRun, HeadingLevel } from "docx";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch offer with all related data
    const offer = await prisma.offer.findFirst({
      where: {
        id: params.id,
        tenantId: session.user.tenantId,
      },
      include: {
        client: {
          include: {
            addresses: true,
            contacts: true,
          },
        },
        tenant: true,
        sections: {
          include: {
            articles: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        paymentSchedule: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Build document content
    const children: any[] = [];

    // Header
    children.push(
      new Paragraph({
        text: offer.tenant.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Offer ${offer.offerNumber}`,
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "" }) // Empty line
    );

    // Client information
    children.push(
      new Paragraph({
        text: "Client Information",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Company: ", bold: true }),
          new TextRun(offer.client.companyName),
        ],
      })
    );

    if (offer.client.email) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Email: ", bold: true }),
            new TextRun(offer.client.email),
          ],
        })
      );
    }

    if (offer.client.phone) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: "Phone: ", bold: true }),
            new TextRun(offer.client.phone),
          ],
        })
      );
    }

    children.push(new Paragraph({ text: "" })); // Empty line

    // Offer details
    children.push(
      new Paragraph({
        text: "Offer Details",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Title: ", bold: true }),
          new TextRun(offer.title),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Valid Until: ", bold: true }),
          new TextRun(offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : "N/A"),
        ],
      }),
      new Paragraph({ text: "" })
    );

    // Executive Summary
    if (offer.executiveSummary) {
      children.push(
        new Paragraph({
          text: "Executive Summary",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: offer.executiveSummary,
        }),
        new Paragraph({ text: "" })
      );
    }

    // Sections and Articles
    for (const section of offer.sections) {
      children.push(
        new Paragraph({
          text: section.title,
          heading: HeadingLevel.HEADING_2,
        })
      );

      if (section.description) {
        children.push(
          new Paragraph({
            text: section.description,
          })
        );
      }

      if (section.articles.length > 0) {
        // Articles table
        const tableRows = [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph({ text: "Item", alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: "Description", alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: "Unit", alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: "Qty", alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: "Price", alignment: AlignmentType.CENTER })] }),
              new TableCell({ children: [new Paragraph({ text: "Total", alignment: AlignmentType.CENTER })] }),
            ],
          }),
        ];

        section.articles.forEach((article) => {
          tableRows.push(
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph(article.name)] }),
                new TableCell({ children: [new Paragraph(article.description || "")] }),
                new TableCell({ children: [new Paragraph(article.unit)] }),
                new TableCell({ children: [new Paragraph(article.quantity.toString())] }),
                new TableCell({ children: [new Paragraph(`${parseFloat(article.unitPrice.toString()).toFixed(2)} ${offer.currency}`)] }),
                new TableCell({ children: [new Paragraph(`${parseFloat(article.total.toString()).toFixed(2)} ${offer.currency}`)] }),
              ],
            })
          );
        });

        children.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: tableRows,
          }),
          new Paragraph({ text: "" })
        );
      }
    }

    // Payment Schedule
    if (offer.paymentSchedule.length > 0) {
      children.push(
        new Paragraph({
          text: "Payment Schedule",
          heading: HeadingLevel.HEADING_2,
        })
      );

      const paymentRows = [
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: "Milestone", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Percentage", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Amount", alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: "Due Date", alignment: AlignmentType.CENTER })] }),
          ],
        }),
      ];

      offer.paymentSchedule.forEach((payment) => {
        paymentRows.push(
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph(payment.name)] }),
              new TableCell({ children: [new Paragraph(`${parseFloat(payment.percentage.toString()).toFixed(1)}%`)] }),
              new TableCell({ children: [new Paragraph(payment.amount ? `${parseFloat(payment.amount.toString()).toFixed(2)} ${offer.currency}` : "TBD")] }),
              new TableCell({ children: [new Paragraph(payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "TBD")] }),
            ],
          })
        );
      });

      children.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: paymentRows,
        }),
        new Paragraph({ text: "" })
      );
    }

    // Financial Summary
    children.push(
      new Paragraph({
        text: "Financial Summary",
        heading: HeadingLevel.HEADING_2,
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Subtotal: ", bold: true }),
          new TextRun(`${parseFloat(offer.subtotal.toString()).toFixed(2)} ${offer.currency}`),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "VAT: ", bold: true }),
          new TextRun(`${parseFloat(offer.vatTotal.toString()).toFixed(2)} ${offer.currency}`),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({ text: "Total: ", bold: true }),
          new TextRun(`${parseFloat(offer.total.toString()).toFixed(2)} ${offer.currency}`),
        ],
      }),
      new Paragraph({ text: "" })
    );

    // Terms and Conditions
    if (offer.termsAndConditions) {
      children.push(
        new Paragraph({
          text: "Terms and Conditions",
          heading: HeadingLevel.HEADING_2,
        }),
        new Paragraph({
          text: offer.termsAndConditions,
        })
      );
    }

    // Create document
    const doc = new Document({
      sections: [
        {
          children: children,
        },
      ],
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${offer.offerNumber}.docx"`,
      },
    });
  } catch (error) {
    console.error("Error generating Word document:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}