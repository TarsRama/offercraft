import { PrismaClient } from "@prisma/client";
import { mockPrisma } from "./prisma-mock";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  useMock?: boolean;
};

// Check if we should use mock (when DATABASE_URL is not properly configured)
const shouldUseMock = process.env.NODE_ENV === "development" && 
  (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("your-database-url"));

let prismaClient: any;

if (shouldUseMock) {
  console.log("🔥 Using mock database for development");
  prismaClient = mockPrisma;
} else {
  try {
    prismaClient = globalForPrisma.prisma ??
      new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });
  } catch (error) {
    console.log("⚠️  Database connection failed, using mock database");
    prismaClient = mockPrisma;
  }
}

if (process.env.NODE_ENV !== "production" && !shouldUseMock) {
  globalForPrisma.prisma = prismaClient;
}

export const prisma = prismaClient;
export default prisma;
