import * as cron from "node-cron";
import { PrismaClient } from "@prisma/client";
import { runAllScrapers } from "./index";

/**
 * Cron-based scheduler for the AutoFind NYC scraper engine.
 *
 * Reads SCRAPE_INTERVAL_HOURS from the environment (default: 6 hours)
 * and schedules recurring scraper runs.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"commonjs"}' src/scrapers/scheduler.ts
 *
 * Or via npm script:
 *   npm run scrape:schedule
 *
 * Environment variables:
 *   SCRAPE_INTERVAL_HOURS - hours between scrape runs (default: 6)
 *   SCRAPE_RUN_ON_START   - if "true", runs scraper immediately on startup
 */

const SCRAPE_INTERVAL_HOURS = parseInt(
  process.env.SCRAPE_INTERVAL_HOURS || "6",
  10
);
const SCRAPE_RUN_ON_START = process.env.SCRAPE_RUN_ON_START === "true";

const prisma = new PrismaClient();
let isRunning = false;

async function executeScrapeRun(): Promise<void> {
  if (isRunning) {
    console.log(
      "[Scheduler] A scrape run is already in progress, skipping this cycle"
    );
    return;
  }

  isRunning = true;
  const startTime = new Date();
  console.log(
    `\n[Scheduler] Starting scheduled scrape run at ${startTime.toISOString()}`
  );

  try {
    const result = await runAllScrapers(prisma);

    console.log(
      `[Scheduler] Scheduled run completed: ${result.successful} successful, ${result.failed} failed, ${result.skipped} skipped`
    );

    const totalCars = result.summaries.reduce(
      (sum, s) => sum + s.carsFound,
      0
    );
    console.log(`[Scheduler] Total cars found: ${totalCars}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Scheduler] Scrape run failed with error: ${message}`);
  } finally {
    isRunning = false;
    const endTime = new Date();
    const durationSec =
      (endTime.getTime() - startTime.getTime()) / 1000;
    console.log(
      `[Scheduler] Run finished at ${endTime.toISOString()} (${durationSec.toFixed(1)}s)\n`
    );
  }
}

// Build the cron expression: run every N hours at minute 0
// e.g., every 6 hours => "0 */6 * * *"
const cronExpression = `0 */${SCRAPE_INTERVAL_HOURS} * * *`;

console.log("AutoFind NYC - Scraper Scheduler");
console.log("================================");
console.log(`Interval: every ${SCRAPE_INTERVAL_HOURS} hour(s)`);
console.log(`Cron expression: ${cronExpression}`);
console.log(`Run on start: ${SCRAPE_RUN_ON_START}`);
console.log(`Started at: ${new Date().toISOString()}\n`);

// Validate the cron expression
if (!cron.validate(cronExpression)) {
  console.error(`Invalid cron expression: ${cronExpression}`);
  process.exit(1);
}

// Schedule the recurring task
const task = cron.schedule(cronExpression, () => {
  executeScrapeRun().catch((err) => {
    console.error("[Scheduler] Unexpected error in cron handler:", err);
  });
});

console.log("[Scheduler] Cron job scheduled. Waiting for next run...");

// Optionally run immediately on startup
if (SCRAPE_RUN_ON_START) {
  console.log("[Scheduler] SCRAPE_RUN_ON_START is true, running now...");
  executeScrapeRun().catch((err) => {
    console.error("[Scheduler] Error in initial run:", err);
  });
}

// Handle graceful shutdown
function shutdown(signal: string) {
  console.log(`\n[Scheduler] Received ${signal}, shutting down...`);
  task.stop();
  prisma
    .$disconnect()
    .then(() => {
      console.log("[Scheduler] Disconnected from database. Goodbye.");
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
