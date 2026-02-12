import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);
    
    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Generate slug from company name
    let slug = slugify(validatedData.companyName);
    
    // Check if slug exists and make it unique
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (existingTenant) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create tenant and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: validatedData.companyName,
          slug,
          settings: {
            currency: "EUR",
            language: "en",
            dateFormat: "DD/MM/YYYY",
          },
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        },
      });

      // Create user as tenant admin
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: validatedData.email,
          password: hashedPassword,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          role: "TENANT_ADMIN",
        },
      });

      return { tenant, user };
    });

    return NextResponse.json(
      {
        message: "Account created successfully",
        tenantSlug: result.tenant.slug,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
