export interface ScrapedCar {
  externalId: string;
  listingUrl: string;
  brand: string;
  model: string;
  year: number;
  trim?: string;
  price?: number;
  mileage?: number;
  condition: string;
  vehicleType: string;
  exteriorColor?: string;
  interiorColor?: string;
  transmission?: string;
  fuelType?: string;
  drivetrain?: string;
  engine?: string;
  vin?: string;
  imageUrl?: string;
  imageUrls?: string[];
  description?: string;
}

export interface ScrapeSummary {
  dealerId: string;
  dealerName: string;
  status: "success" | "error" | "skipped";
  carsFound: number;
  carsAdded: number;
  carsUpdated: number;
  carsRemoved: number;
  duration: number;
  error?: string;
}

export interface OrchestratorResult {
  totalDealers: number;
  successful: number;
  failed: number;
  skipped: number;
  summaries: ScrapeSummary[];
  startedAt: Date;
  completedAt: Date;
}
