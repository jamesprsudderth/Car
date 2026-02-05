import axios from "axios";
import { PrismaClient } from "@prisma/client";
import { BaseScraper } from "../base-scraper";
import { ScrapedCar } from "../types";
import {
  normalizeBrand,
  normalizeCondition,
  normalizeVehicleType,
  delay,
  randomUserAgent,
} from "../utils";

const CARMAX_API_URL = "https://www.carmax.com/cars/api/search/run";
const CARMAX_BASE_URL = "https://www.carmax.com";
const NYC_ZIP = "10001";
const SEARCH_RADIUS = 50;
const PAGE_SIZE = 24;
const MAX_PAGES = 5;
const RATE_LIMIT_MS = 1500;

interface CarMaxVehicle {
  StockNumber: string;
  Year: number;
  Make: string;
  Model: string;
  Trim: string;
  Price: number;
  Mileage: number;
  ExteriorColor: string;
  InteriorColor: string;
  Transmission: string;
  DriveTrain: string;
  Engine: string;
  Vin: string;
  BodyStyle: string;
  FuelType: string;
  PhotoUrl: string;
  Photos: string[];
  Highlights: string[];
  Description: string;
  IsNewArrival: boolean;
  StoreCity: string;
  StoreState: string;
}

interface CarMaxSearchResponse {
  TotalCount: number;
  Items: CarMaxVehicle[];
}

export class CarMaxScraper extends BaseScraper {
  constructor(prisma: PrismaClient, dealerId: string, dealerName: string) {
    super(prisma, dealerId, dealerName, CARMAX_BASE_URL);
  }

  async scrape(): Promise<ScrapedCar[]> {
    const cars: ScrapedCar[] = [];
    let totalCount = 0;

    for (let page = 0; page < MAX_PAGES; page++) {
      const skip = page * PAGE_SIZE;

      console.log(
        `[${this.dealerName}] Fetching page ${page + 1}/${MAX_PAGES} (skip=${skip})...`
      );

      try {
        const response = await axios.get<CarMaxSearchResponse>(CARMAX_API_URL, {
          params: {
            uri: "/cars/all",
            skip,
            take: PAGE_SIZE,
            radius: SEARCH_RADIUS,
            zip: NYC_ZIP,
            sort: "20",  // Sort by newest
          },
          headers: {
            "User-Agent": randomUserAgent(),
            Accept: "application/json",
            "Accept-Language": "en-US,en;q=0.5",
            Referer: `${CARMAX_BASE_URL}/cars/all`,
            Origin: CARMAX_BASE_URL,
          },
          timeout: 15000,
        });

        const data = response.data;

        if (page === 0) {
          totalCount = data.TotalCount || 0;
          console.log(
            `[${this.dealerName}] Total available: ${totalCount} vehicles`
          );
        }

        if (!data.Items || data.Items.length === 0) {
          console.log(`[${this.dealerName}] No more results, stopping`);
          break;
        }

        for (const vehicle of data.Items) {
          const car = this.mapVehicle(vehicle);
          if (car) {
            cars.push(car);
          }
        }

        console.log(
          `[${this.dealerName}] Page ${page + 1}: ${data.Items.length} vehicles parsed`
        );

        // Stop if we've fetched all available results
        if (skip + data.Items.length >= totalCount) {
          break;
        }

        // Rate limit between pages
        if (page < MAX_PAGES - 1) {
          await delay(RATE_LIMIT_MS);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[${this.dealerName}] Error fetching page ${page + 1}: ${message}`
        );
        if (page < MAX_PAGES - 1) {
          await delay(RATE_LIMIT_MS);
        }
      }
    }

    console.log(
      `[${this.dealerName}] Total vehicles scraped: ${cars.length}`
    );
    return cars;
  }

  private mapVehicle(v: CarMaxVehicle): ScrapedCar | null {
    try {
      if (!v.StockNumber) return null;

      const listingUrl = `${CARMAX_BASE_URL}/car/${v.StockNumber}`;

      // Build image URLs array
      const imageUrls: string[] = [];
      if (v.Photos && Array.isArray(v.Photos)) {
        imageUrls.push(...v.Photos);
      }

      // Primary photo
      const imageUrl = v.PhotoUrl || (imageUrls.length > 0 ? imageUrls[0] : undefined);

      // Determine fuel type
      let fuelType = v.FuelType || undefined;
      if (fuelType) {
        const lower = fuelType.toLowerCase();
        if (lower.includes("gas") || lower.includes("unleaded")) {
          fuelType = "Gasoline";
        } else if (lower.includes("diesel")) {
          fuelType = "Diesel";
        } else if (lower.includes("electric") && !lower.includes("hybrid")) {
          fuelType = "Electric";
        } else if (lower.includes("hybrid")) {
          fuelType = "Hybrid";
        } else if (lower.includes("flex")) {
          fuelType = "Flex Fuel";
        }
      }

      return {
        externalId: `carmax-${v.StockNumber}`,
        listingUrl,
        brand: normalizeBrand(v.Make || "Unknown"),
        model: v.Model || "Unknown",
        year: v.Year || new Date().getFullYear(),
        trim: v.Trim || undefined,
        price: v.Price && v.Price > 0 ? v.Price : undefined,
        mileage: v.Mileage && v.Mileage >= 0 ? v.Mileage : undefined,
        condition: normalizeCondition("Used"), // CarMax sells used and CPO
        vehicleType: normalizeVehicleType(v.BodyStyle || ""),
        exteriorColor: v.ExteriorColor || undefined,
        interiorColor: v.InteriorColor || undefined,
        transmission: v.Transmission || undefined,
        fuelType,
        drivetrain: v.DriveTrain || undefined,
        engine: v.Engine || undefined,
        vin: v.Vin || undefined,
        imageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        description: v.Description || v.Highlights?.join(". ") || undefined,
      };
    } catch (error) {
      console.error(
        `[${this.dealerName}] Error mapping vehicle ${v.StockNumber}:`,
        error
      );
      return null;
    }
  }
}
