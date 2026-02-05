import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return false;
  }

  if (!authHeader) {
    return false;
  }

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === adminKey;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { runAllScrapers } = await import("@/scrapers/index");
    const prisma = new PrismaClient();

    try {
      const result = await runAllScrapers(prisma);

      return NextResponse.json({
        success: true,
        message: "Scraping completed successfully",
        result,
      });
    } finally {
      await prisma.$disconnect();
    }
  } catch (error) {
    console.error("Scraping failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Scraping failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
