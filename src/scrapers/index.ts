import { PrismaClient } from "@prisma/client";
import { BaseScraper } from "./base-scraper";
import { OrchestratorResult, ScrapeSummary } from "./types";
import { CraigslistScraper } from "./dealers/craigslist";
import { CarMaxScraper } from "./dealers/carmax";
import { CarvanaScraper } from "./dealers/carvana";
import { GenericDealerInspireScraper } from "./dealers/generic-dealer-inspire";
import { GenericDealerComScraper } from "./dealers/generic-dealer-com";
import { StubScraper } from "./dealers/stub";

/**
 * Maps a dealer record from the database to the appropriate scraper class.
 */
function getScraperForDealer(
  prisma: PrismaClient,
  dealer: {
    id: string;
    name: string;
    website: string;
    scrapeType: string | null;
  }
): BaseScraper {
  const { id, name, website, scrapeType } = dealer;
  const lowerName = name.toLowerCase();

  // --- Match by dealer name first (specific scrapers) ---

  if (lowerName.includes("craigslist")) {
    return new CraigslistScraper(prisma, id, name);
  }

  if (lowerName === "carmax") {
    return new CarMaxScraper(prisma, id, name);
  }

  if (lowerName === "carvana") {
    return new CarvanaScraper(prisma, id, name);
  }

  // --- Match by scrapeType or website pattern for generic scrapers ---

  // Dealer Inspire platform detection: common patterns in URLs
  const dealerInspirePatterns = [
    "dealerinspire.com",
    "toyotaof",
    "hondaof",
    "bmwof",
    "audiof",
    "lexusof",
    "nycjeep",
    "volvocarsmanhattan",
    "miniofmanhattan",
    "subarubrooklyn",
    "kiaofmanhattan",
    "koeppel",
    "paragon",
  ];

  const lowerWebsite = website.toLowerCase();
  if (dealerInspirePatterns.some((p) => lowerWebsite.includes(p))) {
    return new GenericDealerInspireScraper(prisma, id, name, website);
  }

  // Dealer.com platform detection
  const dealerComPatterns = [
    "dealer.com",
    "cityworldford",
    "chevroletofbrooklyn",
    "fordlincolnharlem",
    "gmcofstatenisland",
    "hyundaiofstatenisland",
  ];

  if (dealerComPatterns.some((p) => lowerWebsite.includes(p))) {
    return new GenericDealerComScraper(prisma, id, name, website);
  }

  // If scrapeType hints at cheerio, try Dealer Inspire (generic HTML-based)
  if (scrapeType === "cheerio") {
    return new GenericDealerInspireScraper(prisma, id, name, website);
  }

  // Everything else gets a stub
  return new StubScraper(prisma, id, name, website);
}

/**
 * Orchestrates scraping across all active, scrapable dealers.
 * Runs scrapers sequentially with error isolation so one failure
 * does not halt the entire run.
 */
export async function runAllScrapers(
  prisma: PrismaClient
): Promise<OrchestratorResult> {
  const startedAt = new Date();
  const summaries: ScrapeSummary[] = [];

  console.log("=== AutoFind NYC Scraper Engine ===");
  console.log(`Started at: ${startedAt.toISOString()}`);

  // Load all active, scrapable dealers from the database
  const dealers = await prisma.dealer.findMany({
    where: {
      isActive: true,
      scrapable: true,
    },
    orderBy: { name: "asc" },
  });

  console.log(`Found ${dealers.length} active dealers to scrape\n`);

  let successful = 0;
  let failed = 0;
  let skipped = 0;

  for (const dealer of dealers) {
    const scraperStartTime = Date.now();

    // Skip dealers marked as manual or not scrapable
    if (dealer.scrapeType === "manual") {
      console.log(`[${dealer.name}] Skipping (manual scrape type)\n`);
      summaries.push({
        dealerId: dealer.id,
        dealerName: dealer.name,
        status: "skipped",
        carsFound: 0,
        carsAdded: 0,
        carsUpdated: 0,
        carsRemoved: 0,
        duration: 0,
      });
      skipped++;
      continue;
    }

    try {
      const scraper = getScraperForDealer(prisma, dealer);
      const result = await scraper.run();

      const duration = Date.now() - scraperStartTime;

      if (result.error) {
        summaries.push({
          dealerId: dealer.id,
          dealerName: dealer.name,
          status: "error",
          carsFound: result.carsFound,
          carsAdded: 0,
          carsUpdated: 0,
          carsRemoved: 0,
          duration,
          error: result.error,
        });
        failed++;
      } else {
        summaries.push({
          dealerId: dealer.id,
          dealerName: dealer.name,
          status: "success",
          carsFound: result.carsFound,
          carsAdded: 0, // Detailed counts logged in BaseScraper.saveResults
          carsUpdated: 0,
          carsRemoved: 0,
          duration,
        });
        successful++;
      }
    } catch (error) {
      const duration = Date.now() - scraperStartTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(
        `[${dealer.name}] Unhandled error: ${errorMessage}\n`
      );

      summaries.push({
        dealerId: dealer.id,
        dealerName: dealer.name,
        status: "error",
        carsFound: 0,
        carsAdded: 0,
        carsUpdated: 0,
        carsRemoved: 0,
        duration,
        error: errorMessage,
      });
      failed++;
    }

    console.log(""); // Blank line between dealers
  }

  const completedAt = new Date();
  const totalDuration = completedAt.getTime() - startedAt.getTime();

  console.log("=== Scrape Run Complete ===");
  console.log(`Completed at: ${completedAt.toISOString()}`);
  console.log(`Total duration: ${(totalDuration / 1000).toFixed(1)}s`);
  console.log(
    `Results: ${successful} successful, ${failed} failed, ${skipped} skipped out of ${dealers.length} dealers`
  );

  // Summary table
  const totalCarsFound = summaries.reduce((sum, s) => sum + s.carsFound, 0);
  console.log(`Total cars found across all dealers: ${totalCarsFound}`);

  return {
    totalDealers: dealers.length,
    successful,
    failed,
    skipped,
    summaries,
    startedAt,
    completedAt,
  };
}
