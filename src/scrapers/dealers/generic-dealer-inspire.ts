import axios from "axios";
import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";
import { BaseScraper } from "../base-scraper";
import { ScrapedCar } from "../types";
import {
  normalizePrice,
  normalizeMileage,
  normalizeBrand,
  normalizeCondition,
  normalizeVehicleType,
  parseTitleComponents,
  delay,
  randomUserAgent,
  buildAbsoluteUrl,
} from "../utils";

const INVENTORY_PATHS = ["/new-inventory/", "/used-inventory/"];
const MAX_PAGES_PER_SECTION = 3;
const RATE_LIMIT_MS = 2000;

/**
 * Generic scraper for dealerships built on the Dealer Inspire platform.
 *
 * Dealer Inspire sites typically have:
 * - Inventory pages at /new-inventory/ and /used-inventory/
 * - JSON-LD structured data in <script type="application/ld+json"> tags
 * - Structured HTML with vehicle cards containing data attributes
 * - Pagination via ?page=N or ?start=N query params
 */
export class GenericDealerInspireScraper extends BaseScraper {
  constructor(
    prisma: PrismaClient,
    dealerId: string,
    dealerName: string,
    baseUrl: string
  ) {
    super(prisma, dealerId, dealerName, baseUrl);
  }

  async scrape(): Promise<ScrapedCar[]> {
    const cars: ScrapedCar[] = [];
    const seenIds = new Set<string>();

    for (const path of INVENTORY_PATHS) {
      const condition = path.includes("new") ? "New" : "Used";

      for (let page = 1; page <= MAX_PAGES_PER_SECTION; page++) {
        const url = `${this.baseUrl}${path}?page=${page}`;
        console.log(
          `[${this.dealerName}] Fetching ${condition} inventory page ${page}: ${url}`
        );

        try {
          const response = await axios.get(url, {
            headers: {
              "User-Agent": randomUserAgent(),
              Accept:
                "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
              "Accept-Language": "en-US,en;q=0.5",
            },
            timeout: 15000,
            maxRedirects: 5,
          });

          // First try JSON-LD structured data
          const jsonLdCars = this.parseJsonLd(response.data, condition);

          if (jsonLdCars.length > 0) {
            for (const car of jsonLdCars) {
              if (!seenIds.has(car.externalId)) {
                seenIds.add(car.externalId);
                cars.push(car);
              }
            }
            console.log(
              `[${this.dealerName}] Page ${page} (${condition}): ${jsonLdCars.length} from JSON-LD`
            );
          } else {
            // Fall back to HTML parsing
            const htmlCars = this.parseHtml(response.data, condition);
            for (const car of htmlCars) {
              if (!seenIds.has(car.externalId)) {
                seenIds.add(car.externalId);
                cars.push(car);
              }
            }
            console.log(
              `[${this.dealerName}] Page ${page} (${condition}): ${htmlCars.length} from HTML`
            );

            // If no cars found on this page, stop paginating this section
            if (htmlCars.length === 0) {
              break;
            }
          }

          await delay(RATE_LIMIT_MS);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : String(error);
          console.error(
            `[${this.dealerName}] Error fetching ${condition} page ${page}: ${message}`
          );
          // If the path returns 404, skip remaining pages for this section
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            break;
          }
          await delay(RATE_LIMIT_MS);
        }
      }
    }

    console.log(
      `[${this.dealerName}] Total vehicles scraped: ${cars.length}`
    );
    return cars;
  }

  /**
   * Parses JSON-LD structured data from vehicle listing pages.
   * Dealer Inspire sites typically embed Vehicle schema.org data.
   */
  private parseJsonLd(html: string, condition: string): ScrapedCar[] {
    const $ = cheerio.load(html);
    const cars: ScrapedCar[] = [];

    $('script[type="application/ld+json"]').each((_i, el) => {
      try {
        const raw = $(el).html();
        if (!raw) return;

        const data = JSON.parse(raw);
        const items = Array.isArray(data) ? data : [data];

        for (const item of items) {
          // Handle both direct Vehicle type and ItemList containing vehicles
          if (item["@type"] === "ItemList" && item.itemListElement) {
            for (const listItem of item.itemListElement) {
              const vehicle = listItem.item || listItem;
              const car = this.mapJsonLdVehicle(vehicle, condition);
              if (car) cars.push(car);
            }
          } else if (
            item["@type"] === "Vehicle" ||
            item["@type"] === "Car" ||
            item["@type"] === "Product"
          ) {
            const car = this.mapJsonLdVehicle(item, condition);
            if (car) cars.push(car);
          }
        }
      } catch {
        // JSON parse error, skip this script tag
      }
    });

    return cars;
  }

  private mapJsonLdVehicle(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    item: Record<string, any>,
    condition: string
  ): ScrapedCar | null {
    try {
      const name = item.name || "";
      const sku = item.sku || item.vehicleIdentificationNumber || "";

      if (!name && !sku) return null;

      const parsed = parseTitleComponents(name);

      // Extract price from offers
      let price: number | undefined;
      if (item.offers) {
        const offer = Array.isArray(item.offers)
          ? item.offers[0]
          : item.offers;
        price = offer?.price
          ? parseInt(String(offer.price).replace(/[^0-9]/g, ""), 10) ||
            undefined
          : undefined;
      }

      // Extract image
      let imageUrl: string | undefined;
      let imageUrls: string[] | undefined;
      if (item.image) {
        if (typeof item.image === "string") {
          imageUrl = item.image;
        } else if (Array.isArray(item.image)) {
          imageUrls = item.image
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((img: any) => (typeof img === "string" ? img : img.url || ""))
            .filter(Boolean);
          imageUrl = imageUrls[0];
        } else if (item.image.url) {
          imageUrl = item.image.url;
        }
      }

      // Build listing URL
      const listingUrl = item.url
        ? buildAbsoluteUrl(this.baseUrl, item.url)
        : this.baseUrl;

      // Build external ID
      const externalId = sku
        ? `di-${sku}`
        : `di-${name.replace(/\s+/g, "-").toLowerCase().slice(0, 60)}`;

      return {
        externalId,
        listingUrl,
        brand: normalizeBrand(
          item.brand?.name || item.manufacturer || parsed.brand
        ),
        model: item.model || parsed.model,
        year:
          parseInt(item.vehicleModelDate || item.productionDate, 10) ||
          parsed.year ||
          new Date().getFullYear(),
        trim: parsed.trim,
        price,
        mileage: item.mileageFromOdometer
          ? parseInt(
              String(item.mileageFromOdometer.value || item.mileageFromOdometer)
                .replace(/[^0-9]/g, ""),
              10
            ) || undefined
          : undefined,
        condition: normalizeCondition(
          item.itemCondition?.replace("https://schema.org/", "") ||
            item.itemCondition?.replace("http://schema.org/", "") ||
            condition
        ),
        vehicleType: normalizeVehicleType(item.bodyType || ""),
        exteriorColor: item.color || undefined,
        interiorColor: item.vehicleInteriorColor || undefined,
        transmission: item.vehicleTransmission || undefined,
        fuelType: item.fuelType || undefined,
        drivetrain: item.driveWheelConfiguration || undefined,
        engine: item.vehicleEngine?.name || item.vehicleEngine || undefined,
        vin: item.vehicleIdentificationNumber || undefined,
        imageUrl,
        imageUrls,
        description: item.description || undefined,
      };
    } catch {
      return null;
    }
  }

  /**
   * Falls back to parsing structured HTML for Dealer Inspire vehicle cards.
   */
  private parseHtml(html: string, condition: string): ScrapedCar[] {
    const $ = cheerio.load(html);
    const cars: ScrapedCar[] = [];

    // Dealer Inspire vehicle cards are typically in elements like:
    // .vehicle-card, .inventory-listing, [data-vehicle], .srp-list-item
    const selectors = [
      ".vehicle-card",
      ".inventory-listing",
      "[data-vehicle]",
      ".srp-list-item",
      ".vehicle-card-details-container",
      ".hproduct",
    ];

    const selector = selectors.join(", ");

    $(selector).each((_i, el) => {
      try {
        const $el = $(el);

        // Extract vehicle data from data attributes (common in Dealer Inspire)
        const dataVin = $el.attr("data-vin") || $el.find("[data-vin]").attr("data-vin");
        const dataYear = $el.attr("data-year") || $el.find("[data-year]").attr("data-year");
        const dataMake = $el.attr("data-make") || $el.find("[data-make]").attr("data-make");
        const dataModel = $el.attr("data-model") || $el.find("[data-model]").attr("data-model");
        const dataTrim = $el.attr("data-trim") || $el.find("[data-trim]").attr("data-trim");
        const dataStock =
          $el.attr("data-stock") ||
          $el.attr("data-stocknumber") ||
          $el.find("[data-stock]").attr("data-stock");

        // Extract title from heading or link
        const titleEl = $el.find(
          "h2 a, h3 a, .vehicle-card-title a, .listing-title a, .vehicle-title a, a.vehicle-card-link"
        ).first();
        const title = titleEl.text().trim() || $el.find("h2, h3").first().text().trim();
        const href = titleEl.attr("href") || $el.find("a").first().attr("href") || "";

        // Extract price
        const priceText = $el
          .find(
            ".vehicle-card-price, .price, .final-price, .selling-price, .internetPrice, .msrp"
          )
          .first()
          .text()
          .trim();
        const price = normalizePrice(priceText);

        // Extract mileage
        const mileageText = $el
          .find(".mileage, .odometer, .miles")
          .first()
          .text()
          .trim();
        const mileage = normalizeMileage(mileageText);

        // Extract image
        const imgEl = $el.find("img").first();
        const imageUrl =
          imgEl.attr("src") ||
          imgEl.attr("data-src") ||
          imgEl.attr("data-lazy-src") ||
          undefined;

        // Build the scraped car from data attributes, falling back to title parsing
        const parsed = parseTitleComponents(title || "");

        const year = dataYear ? parseInt(dataYear, 10) : parsed.year;
        const brand = dataMake ? normalizeBrand(dataMake) : parsed.brand;
        const model = dataModel || parsed.model;

        if (!year && !brand) return; // Skip if we can't identify the vehicle

        const externalId = dataVin
          ? `di-${dataVin}`
          : dataStock
            ? `di-${dataStock}`
            : `di-${this.dealerId}-${_i}`;

        const listingUrl = href
          ? buildAbsoluteUrl(this.baseUrl, href)
          : this.baseUrl;

        cars.push({
          externalId,
          listingUrl,
          brand,
          model,
          year: year || new Date().getFullYear(),
          trim: dataTrim || parsed.trim,
          price: price ?? undefined,
          mileage: mileage ?? undefined,
          condition: normalizeCondition(condition),
          vehicleType: "Other",
          vin: dataVin || undefined,
          imageUrl,
          description: title || undefined,
        });
      } catch {
        // Skip individual card errors
      }
    });

    return cars;
  }
}
