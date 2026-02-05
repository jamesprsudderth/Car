import { PrismaClient } from "@prisma/client";
import { ScrapedCar } from "./types";

export abstract class BaseScraper {
  protected prisma: PrismaClient;
  dealerId: string;
  dealerName: string;
  baseUrl: string;

  constructor(
    prisma: PrismaClient,
    dealerId: string,
    dealerName: string,
    baseUrl: string
  ) {
    this.prisma = prisma;
    this.dealerId = dealerId;
    this.dealerName = dealerName;
    this.baseUrl = baseUrl;
  }

  /**
   * Subclasses must implement this to scrape car listings and return them.
   */
  abstract scrape(): Promise<ScrapedCar[]>;

  /**
   * Persists scraped cars to the database via upsert, marks missing cars
   * as inactive, and records the scrape in the ScrapeLog.
   */
  async saveResults(cars: ScrapedCar[]): Promise<void> {
    const startTime = Date.now();
    let carsAdded = 0;
    let carsUpdated = 0;
    let carsRemoved = 0;

    // Create a scrape log entry
    const scrapeLog = await this.prisma.scrapeLog.create({
      data: {
        dealerId: this.dealerId,
        status: "running",
        carsFound: cars.length,
        startedAt: new Date(),
      },
    });

    try {
      // Collect all externalIds seen in this scrape
      const seenExternalIds: string[] = [];

      for (const car of cars) {
        if (!car.externalId) continue;
        seenExternalIds.push(car.externalId);

        // Check if this car already exists for this dealer
        const existing = await this.prisma.car.findUnique({
          where: {
            dealerId_externalId: {
              dealerId: this.dealerId,
              externalId: car.externalId,
            },
          },
        });

        if (existing) {
          // Update existing listing
          await this.prisma.car.update({
            where: { id: existing.id },
            data: {
              listingUrl: car.listingUrl,
              brand: car.brand,
              model: car.model,
              year: car.year,
              trim: car.trim ?? existing.trim,
              price: car.price ?? existing.price,
              mileage: car.mileage ?? existing.mileage,
              condition: car.condition,
              vehicleType: car.vehicleType,
              exteriorColor: car.exteriorColor ?? existing.exteriorColor,
              interiorColor: car.interiorColor ?? existing.interiorColor,
              transmission: car.transmission ?? existing.transmission,
              fuelType: car.fuelType ?? existing.fuelType,
              drivetrain: car.drivetrain ?? existing.drivetrain,
              engine: car.engine ?? existing.engine,
              vin: car.vin ?? existing.vin,
              imageUrl: car.imageUrl ?? existing.imageUrl,
              imageUrls:
                car.imageUrls && car.imageUrls.length > 0
                  ? car.imageUrls
                  : existing.imageUrls,
              description: car.description ?? existing.description,
              isActive: true,
              lastSeen: new Date(),
            },
          });
          carsUpdated++;
        } else {
          // Create new listing
          await this.prisma.car.create({
            data: {
              dealerId: this.dealerId,
              externalId: car.externalId,
              listingUrl: car.listingUrl,
              brand: car.brand,
              model: car.model,
              year: car.year,
              trim: car.trim,
              price: car.price,
              mileage: car.mileage,
              condition: car.condition,
              vehicleType: car.vehicleType,
              exteriorColor: car.exteriorColor,
              interiorColor: car.interiorColor,
              transmission: car.transmission,
              fuelType: car.fuelType,
              drivetrain: car.drivetrain,
              engine: car.engine,
              vin: car.vin,
              imageUrl: car.imageUrl,
              imageUrls: car.imageUrls ?? [],
              description: car.description,
              isActive: true,
              firstSeen: new Date(),
              lastSeen: new Date(),
            },
          });
          carsAdded++;
        }
      }

      // Mark cars not seen in this scrape as inactive
      if (seenExternalIds.length > 0) {
        const deactivated = await this.prisma.car.updateMany({
          where: {
            dealerId: this.dealerId,
            isActive: true,
            externalId: {
              notIn: seenExternalIds,
            },
          },
          data: {
            isActive: false,
          },
        });
        carsRemoved = deactivated.count;
      }

      // Update dealer's lastScraped timestamp
      await this.prisma.dealer.update({
        where: { id: this.dealerId },
        data: { lastScraped: new Date() },
      });

      // Update scrape log with final counts
      const duration = Date.now() - startTime;
      await this.prisma.scrapeLog.update({
        where: { id: scrapeLog.id },
        data: {
          status: "success",
          carsFound: cars.length,
          carsAdded,
          carsUpdated,
          carsRemoved,
          duration,
          completedAt: new Date(),
        },
      });

      console.log(
        `[${this.dealerName}] Saved results: ${carsAdded} added, ${carsUpdated} updated, ${carsRemoved} deactivated (${duration}ms)`
      );
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      await this.prisma.scrapeLog.update({
        where: { id: scrapeLog.id },
        data: {
          status: "error",
          errorMessage: errorMessage.slice(0, 2000),
          duration,
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Main entry point: scrapes listings and persists them.
   * Catches and logs errors to ScrapeLog.
   */
  async run(): Promise<{ carsFound: number; error?: string }> {
    console.log(`[${this.dealerName}] Starting scrape...`);
    const startTime = Date.now();

    try {
      const cars = await this.scrape();
      console.log(
        `[${this.dealerName}] Scraped ${cars.length} cars, saving to database...`
      );

      if (cars.length > 0) {
        await this.saveResults(cars);
      } else {
        // Log an empty successful scrape
        await this.prisma.scrapeLog.create({
          data: {
            dealerId: this.dealerId,
            status: "success",
            carsFound: 0,
            carsAdded: 0,
            carsUpdated: 0,
            carsRemoved: 0,
            duration: Date.now() - startTime,
            startedAt: new Date(startTime),
            completedAt: new Date(),
          },
        });
      }

      const duration = Date.now() - startTime;
      console.log(
        `[${this.dealerName}] Scrape completed in ${duration}ms (${cars.length} cars found)`
      );

      return { carsFound: cars.length };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(`[${this.dealerName}] Scrape failed: ${errorMessage}`);

      // Log error to ScrapeLog (if saveResults didn't already log it)
      try {
        await this.prisma.scrapeLog.create({
          data: {
            dealerId: this.dealerId,
            status: "error",
            errorMessage: errorMessage.slice(0, 2000),
            duration,
            startedAt: new Date(startTime),
            completedAt: new Date(),
          },
        });
      } catch (logError) {
        console.error(
          `[${this.dealerName}] Failed to log scrape error:`,
          logError
        );
      }

      return { carsFound: 0, error: errorMessage };
    }
  }
}
