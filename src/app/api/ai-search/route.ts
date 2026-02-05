import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { parseWithOpenAI } from "@/lib/openai-search-parser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = body.query?.trim();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Missing 'query' field" },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: "Query too long (max 500 characters)" },
        { status: 400 }
      );
    }

    const limit = Math.min(
      Math.max(1, parseInt(body.limit || "24", 10)),
      100
    );
    const page = Math.max(1, parseInt(body.page || "1", 10));
    const skip = (page - 1) * limit;

    // Parse natural language query using OpenAI (with regex fallback)
    const { filters, interpretation } = await parseWithOpenAI(query);

    // Build Prisma where clause from parsed filters
    const where: Prisma.CarWhereInput = { isActive: true };

    if (filters.brand) {
      where.brand = filters.brand;
    }

    if (filters.vehicleType) {
      where.vehicleType = filters.vehicleType;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) {
        (where.price as Prisma.IntNullableFilter).gte = filters.minPrice;
      }
      if (filters.maxPrice) {
        (where.price as Prisma.IntNullableFilter).lte = filters.maxPrice;
      }
    }

    if (filters.yearFrom || filters.yearTo) {
      where.year = {};
      if (filters.yearFrom) {
        (where.year as Prisma.IntFilter).gte = filters.yearFrom;
      }
      if (filters.yearTo) {
        (where.year as Prisma.IntFilter).lte = filters.yearTo;
      }
    }

    if (filters.maxMileage) {
      where.mileage = { lte: filters.maxMileage };
    }

    if (filters.search) {
      where.OR = [
        { brand: { contains: filters.search } },
        { model: { contains: filters.search } },
        { trim: { contains: filters.search } },
        { description: { contains: filters.search } },
      ];
    }

    // Build sort
    let orderBy: Prisma.CarOrderByWithRelationInput;
    switch (filters.sort) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "year_desc":
        orderBy = { year: "desc" };
        break;
      case "year_asc":
        orderBy = { year: "asc" };
        break;
      case "mileage_asc":
        orderBy = { mileage: "asc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Execute query
    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        include: { dealer: true },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.car.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      cars,
      total,
      page,
      totalPages,
      interpretation,
      parsedFilters: filters,
      query,
    });
  } catch (error) {
    console.error("AI search error:", error);
    return NextResponse.json(
      { error: "AI search failed" },
      { status: 500 }
    );
  }
}

// Also support GET for URL-based access with ?q= parameter
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q) {
    return NextResponse.json(
      { error: "Missing 'q' query parameter" },
      { status: 400 }
    );
  }

  const limit = request.nextUrl.searchParams.get("limit") || "24";
  const page = request.nextUrl.searchParams.get("page") || "1";

  // Reuse POST handler logic
  const fakeRequest = new NextRequest(request.url, {
    method: "POST",
    body: JSON.stringify({ query: q, limit, page }),
    headers: { "Content-Type": "application/json" },
  });

  return POST(fakeRequest);
}
