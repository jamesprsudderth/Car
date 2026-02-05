/**
 * Strips dollar signs, commas, and whitespace from a price string
 * and returns the integer value, or null if unparseable.
 */
export function normalizePrice(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[$,\s]/g, "").trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
}

/**
 * Strips commas, "miles", "mi", and whitespace from a mileage string
 * and returns the integer value, or null if unparseable.
 */
export function normalizeMileage(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw
    .toLowerCase()
    .replace(/,/g, "")
    .replace(/miles?/gi, "")
    .replace(/\bmi\b/gi, "")
    .replace(/k\b/gi, "000")
    .trim();
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) || parsed < 0 ? null : parsed;
}

const BRAND_MAP: Record<string, string> = {
  chevy: "Chevrolet",
  chevrolet: "Chevrolet",
  vw: "Volkswagen",
  volkswagen: "Volkswagen",
  merc: "Mercedes-Benz",
  "mercedes-benz": "Mercedes-Benz",
  "mercedes benz": "Mercedes-Benz",
  mercedes: "Mercedes-Benz",
  bmw: "BMW",
  gmc: "GMC",
  ram: "RAM",
  "land rover": "Land Rover",
  "alfa romeo": "Alfa Romeo",
  "aston martin": "Aston Martin",
  "rolls-royce": "Rolls-Royce",
  "rolls royce": "Rolls-Royce",
  mini: "MINI",
  infiniti: "INFINITI",
  lexus: "Lexus",
  toyota: "Toyota",
  honda: "Honda",
  ford: "Ford",
  dodge: "Dodge",
  jeep: "Jeep",
  nissan: "Nissan",
  hyundai: "Hyundai",
  kia: "Kia",
  subaru: "Subaru",
  mazda: "Mazda",
  acura: "Acura",
  audi: "Audi",
  buick: "Buick",
  cadillac: "Cadillac",
  chrysler: "Chrysler",
  fiat: "FIAT",
  genesis: "Genesis",
  jaguar: "Jaguar",
  lincoln: "Lincoln",
  maserati: "Maserati",
  mitsubishi: "Mitsubishi",
  porsche: "Porsche",
  tesla: "Tesla",
  volvo: "Volvo",
  pontiac: "Pontiac",
  saturn: "Saturn",
  scion: "Scion",
  suzuki: "Suzuki",
  hummer: "Hummer",
  saab: "Saab",
  rivian: "Rivian",
  lucid: "Lucid",
  polestar: "Polestar",
  ferrari: "Ferrari",
  lamborghini: "Lamborghini",
  bentley: "Bentley",
  bugatti: "Bugatti",
  mclaren: "McLaren",
  lotus: "Lotus",
};

/**
 * Normalizes brand name to proper capitalization and standard form.
 */
export function normalizeBrand(raw: string): string {
  if (!raw) return "Unknown";
  const lower = raw.trim().toLowerCase();
  if (BRAND_MAP[lower]) return BRAND_MAP[lower];
  // Fall back to title case
  return raw
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Maps raw condition strings to one of: "New", "Used", or "Certified Pre-Owned".
 */
export function normalizeCondition(raw: string): string {
  if (!raw) return "Used";
  const lower = raw.trim().toLowerCase();
  if (lower === "new") return "New";
  if (
    lower.includes("certified") ||
    lower.includes("cpo") ||
    lower.includes("pre-owned") ||
    lower.includes("preowned")
  ) {
    // Distinguish between certified pre-owned and just pre-owned/used
    if (lower.includes("certified") || lower.includes("cpo")) {
      return "Certified Pre-Owned";
    }
    return "Used";
  }
  if (
    lower.includes("used") ||
    lower.includes("pre-owned") ||
    lower.includes("preowned")
  ) {
    return "Used";
  }
  return "Used";
}

const VEHICLE_TYPE_MAP: Record<string, string> = {
  sedan: "Sedan",
  coupe: "Coupe",
  coup: "Coupe",
  convertible: "Convertible",
  hatchback: "Hatchback",
  hatch: "Hatchback",
  wagon: "Wagon",
  suv: "SUV",
  crossover: "SUV",
  "sport utility": "SUV",
  truck: "Truck",
  pickup: "Truck",
  "pick-up": "Truck",
  van: "Van",
  minivan: "Van",
  "mini-van": "Van",
  "cargo van": "Van",
  "passenger van": "Van",
};

/**
 * Maps raw vehicle type strings to standard types.
 */
export function normalizeVehicleType(raw: string): string {
  if (!raw) return "Other";
  const lower = raw.trim().toLowerCase();

  for (const [key, value] of Object.entries(VEHICLE_TYPE_MAP)) {
    if (lower.includes(key)) return value;
  }

  return "Other";
}

/**
 * Returns a promise that resolves after the specified number of milliseconds.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
];

/**
 * Returns a random realistic Chrome user-agent string.
 */
export function randomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Builds an absolute URL from a base URL and a relative or absolute path.
 */
export function buildAbsoluteUrl(base: string, path: string): string {
  if (!path) return base;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  try {
    return new URL(path, base).href;
  } catch {
    // Fallback: simple concatenation
    const cleanBase = base.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : "/" + path;
    return cleanBase + cleanPath;
  }
}

/**
 * Attempts to parse a year from a string. Returns the year or null.
 */
export function parseYear(raw: string): number | null {
  const match = raw.match(/\b(19[89]\d|20[0-2]\d|203\d)\b/);
  if (!match) return null;
  const year = parseInt(match[1], 10);
  return year >= 1980 && year <= 2035 ? year : null;
}

/**
 * Attempts to parse year, brand, and model from a typical car title.
 * E.g. "2021 Toyota Camry LE" => { year: 2021, brand: "Toyota", model: "Camry", trim: "LE" }
 */
export function parseTitleComponents(title: string): {
  year: number | null;
  brand: string;
  model: string;
  trim?: string;
} {
  const cleaned = title.replace(/\s+/g, " ").trim();
  const yearMatch = cleaned.match(/\b(19[89]\d|20[0-2]\d|203\d)\b/);
  const year = yearMatch ? parseInt(yearMatch[1], 10) : null;

  // Remove the year from the string to parse brand/model
  let rest = cleaned;
  if (yearMatch) {
    rest = cleaned.replace(yearMatch[0], "").trim();
  }

  const parts = rest.split(/\s+/);

  if (parts.length === 0) {
    return { year, brand: "Unknown", model: "Unknown" };
  }

  // First word(s) are typically the brand
  let brand = parts[0] || "Unknown";
  let modelStart = 1;

  // Handle two-word brands
  const twoWordBrands = [
    "land rover",
    "alfa romeo",
    "aston martin",
    "rolls royce",
    "mercedes benz",
  ];
  if (parts.length >= 2) {
    const twoWord = (parts[0] + " " + parts[1]).toLowerCase();
    if (twoWordBrands.includes(twoWord)) {
      brand = parts[0] + " " + parts[1];
      modelStart = 2;
    }
  }

  brand = normalizeBrand(brand);

  const model = parts[modelStart] || "Unknown";
  const trim =
    parts.length > modelStart + 1
      ? parts.slice(modelStart + 1).join(" ")
      : undefined;

  return { year, brand, model, trim };
}
