import axios from "axios";
import * as cheerio from "cheerio";
import { PrismaClient } from "@prisma/client";
import { BaseScraper } from "../base-scraper";
import { ScrapedCar } from "../types";
import {
  normalizePrice,
  parseTitleComponents,
  delay,
  randomUserAgent,
  buildAbsoluteUrl,
} from "../utils";

const BASE_URL = "https://newyork.craigslist.org";
const SEARCH_PATH = "/d/cars-trucks/search/cta";
const MAX_PAGES = 3;
const RESULTS_PER_PAGE = 120;
const RATE_LIMIT_MS = 2000;

export class CraigslistScraper extends BaseScraper {
  constructor(prisma: PrismaClient, dealerId: string, dealerName: string) {
    super(prisma, dealerId, dealerName, BASE_URL);
  }

  async scrape(): Promise<ScrapedCar[]> {
    const cars: ScrapedCar[] = [];

    for (let page = 0; page < MAX_PAGES; page++) {
      const offset = page * RESULTS_PER_PAGE;
      const url = `${BASE_URL}${SEARCH_PATH}?s=${offset}`;

      console.log(
        `[${this.dealerName}] Fetching page ${page + 1}/${MAX_PAGES}: ${url}`
      );

      try {
        const response = await axios.get(url, {
          headers: {
            "User-Agent": randomUserAgent(),
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
          },
          timeout: 15000,
        });

        const pageCars = this.parseListingPage(response.data);
        cars.push(...pageCars);

        console.log(
          `[${this.dealerName}] Page ${page + 1}: found ${pageCars.length} listings`
        );

        // If we got fewer results than expected, we've reached the end
        if (pageCars.length < RESULTS_PER_PAGE) {
          console.log(
            `[${this.dealerName}] Fewer results than expected, stopping pagination`
          );
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
        // Continue to next page on error
        if (page < MAX_PAGES - 1) {
          await delay(RATE_LIMIT_MS);
        }
      }
    }

    console.log(
      `[${this.dealerName}] Total listings scraped: ${cars.length}`
    );
    return cars;
  }

  private parseListingPage(html: string): ScrapedCar[] {
    const $ = cheerio.load(html);
    const cars: ScrapedCar[] = [];

    // Craigslist gallery/list view: each result is in an <li> with class "cl-static-search-result"
    // or in the older format, ".result-row"
    // The newer format (2024+) uses <li class="cl-static-search-result">
    // with <div class="title"> for the title and <div class="price"> for price

    // Try the newer Craigslist format first
    $("li.cl-static-search-result").each((_index, element) => {
      try {
        const $el = $(element);

        const titleEl = $el.find(".title");
        const title = titleEl.text().trim();
        if (!title) return;

        // Extract listing URL
        const linkEl = $el.find("a").first();
        const href = linkEl.attr("href") || "";
        const listingUrl = buildAbsoluteUrl(BASE_URL, href);

        // Extract price
        const priceText = $el.find(".price").text().trim();
        const price = normalizePrice(priceText);

        // Extract post ID from the URL for externalId
        const postIdMatch = href.match(/\/(\d+)\.html/);
        const externalId = postIdMatch
          ? `cl-${postIdMatch[1]}`
          : `cl-${Date.now()}-${_index}`;

        // Extract image if available
        const imgEl = $el.find("img").first();
        const imageUrl = imgEl.attr("src") || imgEl.attr("data-src") || undefined;

        // Parse year/brand/model from title
        const parsed = parseTitleComponents(title);

        const car: ScrapedCar = {
          externalId,
          listingUrl,
          brand: parsed.brand,
          model: parsed.model,
          year: parsed.year || new Date().getFullYear(),
          trim: parsed.trim,
          price: price ?? undefined,
          condition: "Used",
          vehicleType: "Other",
          imageUrl,
          description: title,
        };

        cars.push(car);
      } catch {
        // Skip individual listing errors
      }
    });

    // If no results found with the newer format, try the older format
    if (cars.length === 0) {
      $(".result-row, li.cl-search-result").each((_index, element) => {
        try {
          const $el = $(element);

          // Get the listing link
          const linkEl = $el.find("a.result-title, a.posting-title, a.titlestring").first();
          let title = linkEl.text().trim();
          let href = linkEl.attr("href") || "";

          // Fallback: try any anchor
          if (!title) {
            const fallbackLink = $el.find("a").first();
            title = fallbackLink.text().trim();
            href = fallbackLink.attr("href") || "";
          }

          if (!title) return;

          const listingUrl = buildAbsoluteUrl(BASE_URL, href);

          // Extract price
          const priceText =
            $el.find(".result-price, .priceinfo").first().text().trim();
          const price = normalizePrice(priceText);

          // Extract post ID from data attribute or URL
          const dataId =
            $el.attr("data-pid") || $el.attr("data-repost-of") || "";
          const postIdMatch = href.match(/\/(\d+)\.html/);
          const externalId = dataId
            ? `cl-${dataId}`
            : postIdMatch
              ? `cl-${postIdMatch[1]}`
              : `cl-${Date.now()}-${_index}`;

          // Extract image
          const imgEl = $el.find("img").first();
          const imageUrl =
            imgEl.attr("src") || imgEl.attr("data-src") || undefined;

          // Parse year/brand/model from title
          const parsed = parseTitleComponents(title);

          const car: ScrapedCar = {
            externalId,
            listingUrl,
            brand: parsed.brand,
            model: parsed.model,
            year: parsed.year || new Date().getFullYear(),
            trim: parsed.trim,
            price: price ?? undefined,
            condition: "Used",
            vehicleType: "Other",
            imageUrl,
            description: title,
          };

          cars.push(car);
        } catch {
          // Skip individual listing errors
        }
      });
    }

    return cars;
  }
}
