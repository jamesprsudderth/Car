import { PrismaClient } from "@prisma/client";
import { runAllScrapers } from "./index";

/**
 * CLI entry point for running the scraper engine.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' src/scrapers/run.ts
 *
 * Or via npm script:
 *   npm run scrape
 */
async function main() {
  const prisma = new PrismaClient();

  try {
    console.log("AutoFind NYC - Scraper Engine");
    console.log("=============================\n");

    const result = await runAllScrapers(prisma);

    console.log("\n--- Final Summary ---");
    console.log(`Total dealers processed: ${result.totalDealers}`);
    console.log(`  Successful: ${result.successful}`);
    console.log(`  Failed: ${result.failed}`);
    console.log(`  Skipped: ${result.skipped}`);
    console.log(
      `  Duration: ${((result.completedAt.getTime() - result.startedAt.getTime()) / 1000).toFixed(1)}s`
    );

    // Print per-dealer summary
    if (result.summaries.length > 0) {
      console.log("\nPer-dealer results:");
      for (const s of result.summaries) {
        const statusIcon =
          s.status === "success"
            ? "OK"
            : s.status === "skipped"
              ? "SKIP"
              : "FAIL";
        const carsInfo =
          s.carsFound > 0 ? ` (${s.carsFound} cars)` : "";
        const errorInfo = s.error ? ` - ${s.error.slice(0, 80)}` : "";
        console.log(
          `  [${statusIcon}] ${s.dealerName}${carsInfo}${errorInfo}`
        );
      }
    }

    // Exit with appropriate code
    if (result.failed > 0 && result.successful === 0) {
      process.exit(1);
    }
    process.exit(0);
  } catch (error) {
    console.error("Fatal error running scrapers:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
