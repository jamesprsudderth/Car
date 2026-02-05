import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function isAuthorized(request: NextRequest): boolean {
  const authHeader = request.headers.get("Authorization");
  const adminKey = process.env.ADMIN_API_KEY;

  if (!adminKey) {
    return false;
  }

  if (!authHeader) {
    return false;
  }

  // Support both "Bearer <key>" and raw key formats
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  return token === adminKey;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const logs = await prisma.scrapeLog.findMany({
      take: 50,
      orderBy: { startedAt: "desc" },
      include: {
        dealer: {
          select: { name: true },
        },
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching scrape logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch scrape logs" },
      { status: 500 }
    );
  }
}
