import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const activeCarFilter = { isActive: true as const };

    const [
      totalActiveCars,
      totalActiveDealers,
      priceAgg,
      yearAgg,
      conditionCounts,
    ] = await Promise.all([
      prisma.car.count({ where: activeCarFilter }),
      prisma.dealer.count({ where: { isActive: true } }),
      prisma.car.aggregate({
        where: { ...activeCarFilter, price: { not: null } },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.car.aggregate({
        where: activeCarFilter,
        _min: { year: true },
        _max: { year: true },
      }),
      prisma.car.groupBy({
        by: ["condition"],
        where: activeCarFilter,
        _count: { condition: true },
      }),
    ]);

    const carsByCondition: Record<string, number> = {};
    for (const entry of conditionCounts) {
      carsByCondition[entry.condition] = entry._count.condition;
    }

    return NextResponse.json({
      totalActiveCars,
      totalActiveDealers,
      averagePrice: priceAgg._avg.price ? Math.round(priceAgg._avg.price) : 0,
      priceRange: {
        min: priceAgg._min.price ?? 0,
        max: priceAgg._max.price ?? 0,
      },
      yearRange: {
        min: yearAgg._min.year ?? 0,
        max: yearAgg._max.year ?? 0,
      },
      carsByCondition,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
