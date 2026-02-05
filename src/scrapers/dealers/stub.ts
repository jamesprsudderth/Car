import { PrismaClient } from "@prisma/client";
import { BaseScraper } from "../base-scraper";
import { ScrapedCar } from "../types";

/**
 * Stub scraper for dealers that do not yet have a specific scraper implementation.
 * Logs a message and returns an empty result set.
 */
export class StubScraper extends BaseScraper {
  constructor(
    prisma: PrismaClient,
    dealerId: string,
    dealerName: string,
    baseUrl: string
  ) {
    super(prisma, dealerId, dealerName, baseUrl);
  }

  async scrape(): Promise<ScrapedCar[]> {
    console.log(`[${this.dealerName}] Scraper not yet implemented`);
    return [];
  }
}
