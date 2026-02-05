import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // String filters
    const brand = searchParams.get("brand");
    const vehicleType = searchParams.get("vehicleType");
    const condition = searchParams.get("condition");
    const dealer = searchParams.get("dealer");
    const search = searchParams.get("search");

    // Number filters
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const yearFrom = searchParams.get("yearFrom");
    const yearTo = searchParams.get("yearTo");
    const maxMileage = searchParams.get("maxMileage");

    // Sorting and pagination
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "24", 10)));
    const skip = (page - 1) * limit;

    // Build where clause - only active cars
    const where: Prisma.CarWhereInput = {
      isActive: true,
    };

    if (brand) {
      where.brand = { equals: brand, mode: "insensitive" };
    }

    if (vehicleType) {
      where.vehicleType = { equals: vehicleType, mode: "insensitive" };
    }

    if (condition) {
      where.condition = { equals: condition, mode: "insensitive" };
    }

    if (dealer) {
      where.dealerId = dealer;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        (where.price as Prisma.IntNullableFilter).gte = parseInt(minPrice, 10);
      }
      if (maxPrice) {
        (where.price as Prisma.IntNullableFilter).lte = parseInt(maxPrice, 10);
      }
    }

    if (yearFrom || yearTo) {
      where.year = {};
      if (yearFrom) {
        (where.year as Prisma.IntFilter).gte = parseInt(yearFrom, 10);
      }
      if (yearTo) {
        (where.year as Prisma.IntFilter).lte = parseInt(yearTo, 10);
      }
    }

    if (maxMileage) {
      where.mileage = { lte: parseInt(maxMileage, 10) };
    }

    if (search) {
      where.OR = [
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { trim: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Build orderBy
    let orderBy: Prisma.CarOrderByWithRelationInput;
    switch (sort) {
      case "price_asc":
        orderBy = { price: { sort: "asc", nulls: "last" } };
        break;
      case "price_desc":
        orderBy = { price: { sort: "desc", nulls: "last" } };
        break;
      case "year_desc":
        orderBy = { year: "desc" };
        break;
      case "year_asc":
        orderBy = { year: "asc" };
        break;
      case "mileage_asc":
        orderBy = { mileage: { sort: "asc", nulls: "last" } };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Fetch cars and total count in parallel
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

    // Fetch filter metadata for active cars
    const activeCarFilter: Prisma.CarWhereInput = { isActive: true };

    const [brands, vehicleTypes, priceAgg, yearAgg] = await Promise.all([
      prisma.car.findMany({
        where: activeCarFilter,
        select: { brand: true },
        distinct: ["brand"],
        orderBy: { brand: "asc" },
      }),
      prisma.car.findMany({
        where: activeCarFilter,
        select: { vehicleType: true },
        distinct: ["vehicleType"],
        orderBy: { vehicleType: "asc" },
      }),
      prisma.car.aggregate({
        where: { ...activeCarFilter, price: { not: null } },
        _min: { price: true },
        _max: { price: true },
      }),
      prisma.car.aggregate({
        where: activeCarFilter,
        _min: { year: true },
        _max: { year: true },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      cars,
      total,
      page,
      totalPages,
      filters: {
        brands: brands.map((b) => b.brand),
        vehicleTypes: vehicleTypes.map((v) => v.vehicleType),
        priceRange: {
          min: priceAgg._min.price ?? 0,
          max: priceAgg._max.price ?? 0,
        },
        yearRange: {
          min: yearAgg._min.year ?? 0,
          max: yearAgg._max.year ?? 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return NextResponse.json(
      { error: "Failed to fetch cars" },
      { status: 500 }
    );
  }
}
