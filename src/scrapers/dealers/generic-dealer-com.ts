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

const RATE_LIMIT_MS = 2000;
const MAX_PAGES = 3;

/**
 * Generic scraper for dealerships built on the Dealer.com platform.
 *
 * Dealer.com sites typically have:
 * - Inventory at /inventory.html, /searchnew.aspx, /searchused.aspx,
 *   /new-inventory/index.htm, /used-inventory/index.htm
 * - Structured div elements with class names like .vehicleCard, .vehicle-card
 * - Data attributes on container elements for VIN, stock number, etc.
 * - Pagination via ?start=N or ?page=N
 */
export class GenericDealerComScraper extends BaseScraper {
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

    // Try various Dealer.com inventory URL patterns
    const inventoryPaths = [
      { path: "/new-inventory/index.htm", condition: "New" },
      { path: "/used-inventory/index.htm", condition: "Used" },
      { path: "/searchnew.aspx", condition: "New" },
      { path: "/searchused.aspx", condition: "Used" },
      { path: "/inventory.html", condition: "Used" },
    ];

    for (const { path, condition } of inventoryPaths) {
      const found = await this.scrapeSection(path, condition, seenIds);
      cars.push(...found);

      // If we found cars, no need to try alternate paths for same condition
      if (found.length > 0) {
        console.log(
          `[${this.dealerName}] Found ${found.length} ${condition} vehicles at ${path}`
        );
      }
    }

    console.log(
      `[${this.dealerName}] Total vehicles scraped: ${cars.length}`
    );
    return cars;
  }

  private async scrapeSection(
    basePath: string,
    condition: string,
    seenIds: Set<string>
  ): Promise<ScrapedCar[]> {
    const cars: ScrapedCar[] = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      // Dealer.com uses different pagination depending on the page type
      const separator = basePath.includes("?") ? "&" : "?";
      const url =
        page === 1
          ? `${this.baseUrl}${basePath}`
          : `${this.baseUrl}${basePath}${separator}start=${(page - 1) * 25}`;

      console.log(
        `[${this.dealerName}] Fetching ${condition} page ${page}: ${url}`
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
          validateStatus: (status) => status < 400,
        });

        const pageCars = this.parseInventoryPage(response.data, condition);

        for (const car of pageCars) {
          if (!seenIds.has(car.externalId)) {
            seenIds.add(car.externalId);
            cars.push(car);
          }
        }

        console.log(
          `[${this.dealerName}] Page ${page} (${condition}): ${pageCars.length} vehicles`
        );

        // Stop if no results or fewer than expected
        if (pageCars.length === 0) break;

        await delay(RATE_LIMIT_MS);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // Path doesn't exist, skip
          break;
        }
        const message =
          error instanceof Error ? error.message : String(error);
        console.error(
          `[${this.dealerName}] Error on ${condition} page ${page}: ${message}`
        );
        break;
      }
    }

    return cars;
  }

  private parseInventoryPage(html: string, condition: string): ScrapedCar[] {
    const $ = cheerio.load(html);
    const cars: ScrapedCar[] = [];

    // Dealer.com vehicle card selectors (varies by template version)
    const selectors = [
      ".vehicleCard",
      ".vehicle-card",
      ".inventory-listing",
      ".srp-vehicle-card",
      "[data-vin]",
      ".row.vehicle",
      ".srpVehicle",
      ".ddc-content .vehicle",
    ];

    const selector = selectors.join(", ");

    $(selector).each((_i, el) => {
      try {
        const $el = $(el);

        // --- Extract from data attributes ---
        const dataVin =
          $el.attr("data-vin") ||
          $el.find("[data-vin]").first().attr("data-vin") ||
          "";
        const dataYear =
          $el.attr("data-year") ||
          $el.find("[data-year]").first().attr("data-year") ||
          "";
        const dataMake =
          $el.attr("data-make") ||
          $el.find("[data-make]").first().attr("data-make") ||
          "";
        const dataModel =
          $el.attr("data-model") ||
          $el.find("[data-model]").first().attr("data-model") ||
          "";
        const dataTrim =
          $el.attr("data-trim") ||
          $el.find("[data-trim]").first().attr("data-trim") ||
          "";
        const dataBodyStyle =
          $el.attr("data-bodystyle") ||
          $el.find("[data-bodystyle]").first().attr("data-bodystyle") ||
          "";
        const dataExteriorColor =
          $el.attr("data-exteriorcolor") ||
          $el.find("[data-exteriorcolor]").first().attr("data-exteriorcolor") ||
          "";
        const dataStock =
          $el.attr("data-stocknumber") ||
          $el.attr("data-stock") ||
          $el.find("[data-stocknumber]").first().attr("data-stocknumber") ||
          "";

        // --- Extract from visible HTML ---
        // Title / heading
        const titleEl = $el
          .find(
            ".vehicle-card-title a, .vehicleCard-title a, h2 a, h3 a, .title a, a.vehicle-name"
          )
          .first();
        const title =
          titleEl.text().trim() ||
          $el.find("h2, h3, .title").first().text().trim();
        const href =
          titleEl.attr("href") || $el.find("a").first().attr("href") || "";

        // Price
        const priceText = $el
          .find(
            ".price, .vehicleCard-price, .vehicle-card-price, .finalPrice, .internetPrice, .salePrice, .msrp"
          )
          .first()
          .text()
          .trim();
        const price = normalizePrice(priceText);

        // Mileage
        const mileageText = $el
          .find(".mileage, .odometer, .miles, .vehicleCard-mileage")
          .first()
          .text()
          .trim();
        const mileage = normalizeMileage(mileageText);

        // Image
        const imgEl = $el.find("img").first();
        const imageUrl =
          imgEl.attr("src") ||
          imgEl.attr("data-src") ||
          imgEl.attr("data-original") ||
          undefined;

        // Transmission
        const transmissionText = $el
          .find(".transmission, .trans")
          .first()
          .text()
          .trim();

        // Engine
        const engineText = $el.find(".engine").first().text().trim();

        // Drivetrain
        const drivetrainText = $el
          .find(".drivetrain, .drivetype")
          .first()
          .text()
          .trim();

        // Parse from title if data attributes are missing
        const parsed = parseTitleComponents(title || "");

        const year = dataYear ? parseInt(dataYear, 10) : parsed.year;
        const brand = dataMake ? normalizeBrand(dataMake) : parsed.brand;
        const model = dataModel || parsed.model;

        // Need at least some identifying information
        if (!year && !brand && !title) return;

        const externalId = dataVin
          ? `dc-${dataVin}`
          : dataStock
            ? `dc-${dataStock}`
            : `dc-${this.dealerId}-${_i}`;

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
          vehicleType: normalizeVehicleType(dataBodyStyle || ""),
          exteriorColor: dataExteriorColor || undefined,
          transmission: transmissionText || undefined,
          engine: engineText || undefined,
          drivetrain: drivetrainText || undefined,
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
