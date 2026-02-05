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

const CARVANA_API_URL = "https://www.carvana.com/api/vehicles";
const CARVANA_BASE_URL = "https://www.carvana.com";
const PAGE_SIZE = 24;
const MAX_PAGES = 5;
const RATE_LIMIT_MS = 2000;

// NYC area coordinates / market identifiers
const NYC_MARKET = "newyork";
const NYC_LATITUDE = 40.7128;
const NYC_LONGITUDE = -74.006;

interface CarvanaVehicle {
  vehicleId: number;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
  transmission: string;
  driveTrain: string;
  engine: string;
  vin: string;
  bodyType: string;
  fuelType: string;
  mainImageUrl: string;
  imageUrls: string[];
  highlights: string[];
  condition: string;
  deliveryTimeFrame: string;
}

interface CarvanaSearchResponse {
  totalResults: number;
  results: CarvanaVehicle[];
  page: number;
  pageSize: number;
}

export class CarvanaScraper extends BaseScraper {
  constructor(prisma: PrismaClient, dealerId: string, dealerName: string) {
    super(prisma, dealerId, dealerName, CARVANA_BASE_URL);
  }

  async scrape(): Promise<ScrapedCar[]> {
    const cars: ScrapedCar[] = [];
    let totalResults = 0;

    for (let page = 1; page <= MAX_PAGES; page++) {
      console.log(
        `[${this.dealerName}] Fetching page ${page}/${MAX_PAGES}...`
      );

      try {
        const response = await axios.get<CarvanaSearchResponse>(
          CARVANA_API_URL,
          {
            params: {
              page,
              pageSize: PAGE_SIZE,
              market: NYC_MARKET,
              latitude: NYC_LATITUDE,
              longitude: NYC_LONGITUDE,
              sortBy: "Newest",
            },
            headers: {
              "User-Agent": randomUserAgent(),
              Accept: "application/json",
              "Accept-Language": "en-US,en;q=0.5",
              Referer: `${CARVANA_BASE_URL}/cars`,
              Origin: CARVANA_BASE_URL,
              "X-Requested-With": "XMLHttpRequest",
            },
            timeout: 15000,
          }
        );

        const data = response.data;

        if (page === 1) {
          totalResults = data.totalResults || 0;
          console.log(
            `[${this.dealerName}] Total available: ${totalResults} vehicles`
          );
        }

        if (!data.results || data.results.length === 0) {
          console.log(`[${this.dealerName}] No more results, stopping`);
          break;
        }

        for (const vehicle of data.results) {
          const car = this.mapVehicle(vehicle);
          if (car) {
            cars.push(car);
          }
        }

        console.log(
          `[${this.dealerName}] Page ${page}: ${data.results.length} vehicles parsed`
        );

        // Stop if we've fetched all results
        if (page * PAGE_SIZE >= totalResults) {
          break;
        }

        // Rate limit between pages
        if (page < MAX_PAGES) {
          await delay(RATE_LIMIT_MS);
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[${this.dealerName}] Error fetching page ${page}: ${message}`
        );

        // If we get a 403 or 429, back off and stop
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status === 403 || status === 429) {
            console.error(
              `[${this.dealerName}] Rate limited or blocked (${status}), stopping`
            );
            break;
          }
        }

        if (page < MAX_PAGES) {
          await delay(RATE_LIMIT_MS * 2); // Extra delay on error
        }
      }
    }

    console.log(
      `[${this.dealerName}] Total vehicles scraped: ${cars.length}`
    );
    return cars;
  }

  private mapVehicle(v: CarvanaVehicle): ScrapedCar | null {
    try {
      const id = v.vehicleId || v.stockNumber;
      if (!id) return null;

      // Build listing URL: Carvana uses /vehicle/{vehicleId}
      const listingUrl = `${CARVANA_BASE_URL}/vehicle/${v.vehicleId}`;

      // Build image URLs
      const imageUrls: string[] = [];
      if (v.imageUrls && Array.isArray(v.imageUrls)) {
        imageUrls.push(...v.imageUrls);
      }

      const imageUrl =
        v.mainImageUrl || (imageUrls.length > 0 ? imageUrls[0] : undefined);

      // Normalize fuel type
      let fuelType = v.fuelType || undefined;
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

      // Normalize transmission
      let transmission = v.transmission || undefined;
      if (transmission) {
        const lower = transmission.toLowerCase();
        if (lower.includes("auto")) {
          transmission = "Automatic";
        } else if (lower.includes("manual") || lower.includes("stick")) {
          transmission = "Manual";
        } else if (lower.includes("cvt")) {
          transmission = "CVT";
        }
      }

      return {
        externalId: `carvana-${v.vehicleId}`,
        listingUrl,
        brand: normalizeBrand(v.make || "Unknown"),
        model: v.model || "Unknown",
        year: v.year || new Date().getFullYear(),
        trim: v.trim || undefined,
        price: v.price && v.price > 0 ? v.price : undefined,
        mileage: v.mileage && v.mileage >= 0 ? v.mileage : undefined,
        condition: normalizeCondition(v.condition || "Used"),
        vehicleType: normalizeVehicleType(v.bodyType || ""),
        exteriorColor: v.exteriorColor || undefined,
        interiorColor: v.interiorColor || undefined,
        transmission,
        fuelType,
        drivetrain: v.driveTrain || undefined,
        engine: v.engine || undefined,
        vin: v.vin || undefined,
        imageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        description: v.highlights?.join(". ") || undefined,
      };
    } catch (error) {
      console.error(
        `[${this.dealerName}] Error mapping vehicle ${v.vehicleId}:`,
        error
      );
      return null;
    }
  }
}
