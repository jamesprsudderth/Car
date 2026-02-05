// ── AI Search Parser ───────────────────────────────────────────────────────
// Converts natural language queries into structured filter parameters
// matching the /api/cars query params.

export interface ParsedFilters {
  brand?: string;
  vehicleType?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  yearFrom?: number;
  yearTo?: number;
  maxMileage?: number;
  search?: string;
  sort?: string;
}

export interface AISearchResult {
  filters: ParsedFilters;
  interpretation: string;
}

// ── Brand Aliases ─────────────────────────────────────────────────────────

const BRAND_MAP: Record<string, string> = {
  toyota: "Toyota",
  honda: "Honda",
  ford: "Ford",
  chevrolet: "Chevrolet",
  chevy: "Chevrolet",
  bmw: "BMW",
  "mercedes-benz": "Mercedes-Benz",
  mercedes: "Mercedes-Benz",
  benz: "Mercedes-Benz",
  audi: "Audi",
  lexus: "Lexus",
  nissan: "Nissan",
  hyundai: "Hyundai",
  kia: "Kia",
  subaru: "Subaru",
  mazda: "Mazda",
  volkswagen: "Volkswagen",
  vw: "Volkswagen",
  volvo: "Volvo",
  jeep: "Jeep",
  dodge: "Dodge",
  ram: "RAM",
  gmc: "GMC",
  cadillac: "Cadillac",
  lincoln: "Lincoln",
  acura: "Acura",
  infiniti: "Infiniti",
  porsche: "Porsche",
  jaguar: "Jaguar",
  "land rover": "Land Rover",
  "range rover": "Land Rover",
  mini: "MINI",
  buick: "Buick",
  chrysler: "Chrysler",
  genesis: "Genesis",
  tesla: "Tesla",
  rivian: "Rivian",
  lucid: "Lucid",
  fiat: "Fiat",
  alfa: "Alfa Romeo",
  "alfa romeo": "Alfa Romeo",
  maserati: "Maserati",
  ferrari: "Ferrari",
  lamborghini: "Lamborghini",
  bentley: "Bentley",
  "rolls-royce": "Rolls-Royce",
  "rolls royce": "Rolls-Royce",
  aston: "Aston Martin",
  "aston martin": "Aston Martin",
  mclaren: "McLaren",
  mitsubishi: "Mitsubishi",
  polestar: "Polestar",
};

// ── Vehicle Type Aliases ──────────────────────────────────────────────────

const VEHICLE_TYPE_MAP: Record<string, string> = {
  sedan: "Sedan",
  sedans: "Sedan",
  suv: "SUV",
  suvs: "SUV",
  "sport utility": "SUV",
  truck: "Truck",
  trucks: "Truck",
  pickup: "Truck",
  pickups: "Truck",
  "pick-up": "Truck",
  coupe: "Coupe",
  coupes: "Coupe",
  coupé: "Coupe",
  convertible: "Convertible",
  convertibles: "Convertible",
  wagon: "Wagon",
  wagons: "Wagon",
  "station wagon": "Wagon",
  hatchback: "Hatchback",
  hatchbacks: "Hatchback",
  hatch: "Hatchback",
  minivan: "Minivan",
  minivans: "Minivan",
  van: "Van",
  vans: "Van",
  crossover: "Crossover",
  crossovers: "Crossover",
};

// ── Luxury Brand Sets ─────────────────────────────────────────────────────

// Brand categories (available for future use in enhanced filtering)
// const LUXURY_BRANDS = new Set([
//   "BMW", "Mercedes-Benz", "Audi", "Lexus", "Porsche", "Jaguar",
//   "Land Rover", "Cadillac", "Lincoln", "Acura", "Infiniti", "Genesis",
//   "Volvo", "Maserati", "Bentley", "Rolls-Royce", "Ferrari",
//   "Lamborghini", "Aston Martin", "McLaren", "Lucid",
// ]);
//
// const ECONOMY_BRANDS = new Set([
//   "Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Mazda",
//   "Subaru", "Mitsubishi", "Volkswagen", "Chevrolet", "Ford",
// ]);

// ── Parser ────────────────────────────────────────────────────────────────

export function parseNaturalLanguageQuery(query: string): AISearchResult {
  const filters: ParsedFilters = {};
  const interpretParts: string[] = [];
  const q = query.toLowerCase().trim();

  // ── Extract price information ──────────────────────────────────────

  // "under $20k" / "below 20000" / "less than $20,000" / "up to 25k"
  const underPriceMatch = q.match(
    /(?:under|below|less than|up to|max|no more than|cheaper than|at most)\s*\$?([\d,]+)\s*k?\b/i
  );
  if (underPriceMatch) {
    let val = parseInt(underPriceMatch[1].replace(/,/g, ""), 10);
    if (val < 1000 && q.includes("k")) val *= 1000;
    else if (val < 1000) val *= 1000; // "under 20" likely means under $20k
    filters.maxPrice = val;
    interpretParts.push(`max price $${val.toLocaleString()}`);
  }

  // "over $30k" / "above 30000" / "more than $30,000" / "starting at 25k"
  const overPriceMatch = q.match(
    /(?:over|above|more than|at least|starting at|min|from)\s*\$?([\d,]+)\s*k?\b/i
  );
  if (overPriceMatch && !underPriceMatch) {
    let val = parseInt(overPriceMatch[1].replace(/,/g, ""), 10);
    if (val < 1000) val *= 1000;
    filters.minPrice = val;
    interpretParts.push(`min price $${val.toLocaleString()}`);
  }

  // "around $25k" / "about $20,000" / "approximately 30k"
  const aroundPriceMatch = q.match(
    /(?:around|about|approximately|roughly|near|~)\s*\$?([\d,]+)\s*k?\b/i
  );
  if (aroundPriceMatch && !underPriceMatch && !overPriceMatch) {
    let val = parseInt(aroundPriceMatch[1].replace(/,/g, ""), 10);
    if (val < 1000) val *= 1000;
    filters.minPrice = Math.round(val * 0.8);
    filters.maxPrice = Math.round(val * 1.2);
    interpretParts.push(`price around $${val.toLocaleString()}`);
  }

  // "$20,000 - $30,000" or "20k to 30k" or "between 20000 and 30000"
  const priceRangeMatch = q.match(
    /\$?([\d,]+)\s*k?\s*(?:-|to|and)\s*\$?([\d,]+)\s*k?\b/
  );
  if (priceRangeMatch && !filters.minPrice && !filters.maxPrice) {
    let low = parseInt(priceRangeMatch[1].replace(/,/g, ""), 10);
    let high = parseInt(priceRangeMatch[2].replace(/,/g, ""), 10);
    if (low < 1000) low *= 1000;
    if (high < 1000) high *= 1000;
    if (low > high) [low, high] = [high, low];
    // Only treat as price if values look like prices (not years)
    if (low >= 1000 && high <= 500000) {
      filters.minPrice = low;
      filters.maxPrice = high;
      interpretParts.push(`price $${low.toLocaleString()} - $${high.toLocaleString()}`);
    }
  }

  // ── Extract year information ────────────────────────────────────────

  // "2023 or newer" / "2020+" / "from 2022" / "after 2019"
  const yearFromMatch = q.match(
    /(?:from\s+|after\s+|since\s+)?(20[12]\d)\s*(?:or newer|\+|and up|and newer|onwards)?/
  );
  // "year" range: "2020 to 2023" / "2020-2023"
  const yearRangeMatch = q.match(/(20[12]\d)\s*(?:-|to)\s*(20[12]\d)/);

  if (yearRangeMatch) {
    const y1 = parseInt(yearRangeMatch[1], 10);
    const y2 = parseInt(yearRangeMatch[2], 10);
    filters.yearFrom = Math.min(y1, y2);
    filters.yearTo = Math.max(y1, y2);
    interpretParts.push(`years ${filters.yearFrom}-${filters.yearTo}`);
  } else if (yearFromMatch) {
    const year = parseInt(yearFromMatch[1], 10);
    if (q.includes("or older") || q.includes("or earlier") || q.includes("before")) {
      filters.yearTo = year;
      interpretParts.push(`${year} or older`);
    } else {
      filters.yearFrom = year;
      interpretParts.push(`${year} or newer`);
    }
  }

  // "newer than 2020" / "before 2023"
  const newerThanMatch = q.match(/newer than\s+(20[12]\d)/);
  if (newerThanMatch && !filters.yearFrom) {
    filters.yearFrom = parseInt(newerThanMatch[1], 10) + 1;
    interpretParts.push(`newer than ${newerThanMatch[1]}`);
  }
  const beforeMatch = q.match(/(?:before|older than|prior to)\s+(20[12]\d)/);
  if (beforeMatch && !filters.yearTo) {
    filters.yearTo = parseInt(beforeMatch[1], 10) - 1;
    interpretParts.push(`before ${beforeMatch[1]}`);
  }

  // ── Extract mileage information ────────────────────────────────────

  // "under 50k miles" / "low mileage" / "less than 30000 miles"
  const mileageMatch = q.match(
    /(?:under|below|less than|max|up to)\s*([\d,]+)\s*k?\s*(?:miles?|mi)\b/i
  );
  if (mileageMatch) {
    let val = parseInt(mileageMatch[1].replace(/,/g, ""), 10);
    if (val < 1000) val *= 1000;
    filters.maxMileage = val;
    interpretParts.push(`max ${val.toLocaleString()} miles`);
  } else if (/\blow\s*mileage\b/.test(q) || /\blow\s*miles?\b/.test(q)) {
    filters.maxMileage = 30000;
    interpretParts.push("low mileage (under 30k mi)");
  }

  // ── Extract condition ──────────────────────────────────────────────

  if (/\bnew\b/.test(q) && !/\bnewer\b/.test(q) && !/\bnewest\b/.test(q) && !/\bbrand new\b/.test(q)) {
    // Check context - "new" should refer to condition, not "newest"
    if (/\bbrand\s*new\b/.test(q) || /\bnew\s+(?:car|vehicle|suv|sedan|truck)/i.test(q) || /\bnew\b/.test(q)) {
      filters.condition = "New";
      interpretParts.push("new condition");
    }
  }
  if (/\bused\b/.test(q) || /\bpre-?owned\b/.test(q) || /\bsecond\s*hand\b/.test(q)) {
    filters.condition = "Used";
    interpretParts.push("used condition");
  }
  if (/\bcpo\b/.test(q) || /\bcertified\b/.test(q) || /\bcertified\s*pre-?owned\b/.test(q)) {
    filters.condition = "Certified Pre-Owned";
    interpretParts.push("certified pre-owned");
  }

  // ── Extract vehicle type ───────────────────────────────────────────

  for (const [alias, type] of Object.entries(VEHICLE_TYPE_MAP)) {
    const regex = new RegExp(`\\b${alias}\\b`, "i");
    if (regex.test(q)) {
      filters.vehicleType = type;
      interpretParts.push(`type: ${type}`);
      break;
    }
  }

  // ── Extract brand ──────────────────────────────────────────────────

  // Try multi-word brands first
  const multiWordBrands = Object.entries(BRAND_MAP)
    .filter(([alias]) => alias.includes(" "))
    .sort((a, b) => b[0].length - a[0].length);

  for (const [alias, brand] of multiWordBrands) {
    if (q.includes(alias)) {
      filters.brand = brand;
      interpretParts.push(`make: ${brand}`);
      break;
    }
  }

  // Then single-word brands
  if (!filters.brand) {
    for (const [alias, brand] of Object.entries(BRAND_MAP)) {
      if (alias.includes(" ")) continue;
      const regex = new RegExp(`\\b${alias}\\b`, "i");
      if (regex.test(q)) {
        filters.brand = brand;
        interpretParts.push(`make: ${brand}`);
        break;
      }
    }
  }

  // ── Extract sorting intent ─────────────────────────────────────────

  if (/\bcheap(est)?\b/.test(q) || /\bbudget\b/.test(q) || /\baffordable\b/.test(q) || /\bbargain\b/.test(q) || /\bvalue\b/.test(q) || /\binexpensive\b/.test(q)) {
    filters.sort = "price_asc";
    if (!filters.maxPrice) {
      interpretParts.push("sorted by lowest price");
    }
  } else if (/\bexpensive\b/.test(q) || /\bpriciest\b/.test(q) || /\bhigh\s*end\b/.test(q) || /\bpremium\b/.test(q)) {
    filters.sort = "price_desc";
    interpretParts.push("sorted by highest price");
  } else if (/\bnewest\b/.test(q) || /\blatest\b/.test(q) || /\brecent\b/.test(q)) {
    filters.sort = "year_desc";
    interpretParts.push("sorted by newest year");
  } else if (/\boldest\b/.test(q)) {
    filters.sort = "year_asc";
    interpretParts.push("sorted by oldest year");
  } else if (/\blowest?\s*mileage\b/.test(q) || /\bfewest?\s*miles\b/.test(q)) {
    filters.sort = "mileage_asc";
    interpretParts.push("sorted by lowest mileage");
  }

  // ── Semantic category detection ────────────────────────────────────

  // "luxury" → filter to luxury brands or add as search term
  if (/\bluxury\b/.test(q) && !filters.brand) {
    // We can't filter multiple brands in the current API,
    // so add "luxury" as a search hint
    filters.search = "luxury";
    interpretParts.push('searching for "luxury"');
  }

  // "family" → typically SUV/minivan
  if (/\bfamily\b/.test(q) && !filters.vehicleType) {
    filters.vehicleType = "SUV";
    interpretParts.push("family-friendly (SUV)");
  }

  // "sports car" / "sporty"
  if ((/\bsports?\s*car\b/.test(q) || /\bsporty\b/.test(q)) && !filters.vehicleType) {
    filters.vehicleType = "Coupe";
    interpretParts.push("sports car (Coupe)");
  }

  // "electric" / "ev" / "hybrid"
  if (/\belectric\b/.test(q) || /\bev\b/.test(q)) {
    if (!filters.search) filters.search = "electric";
    interpretParts.push('fuel type: "electric"');
  } else if (/\bhybrid\b/.test(q)) {
    if (!filters.search) filters.search = "hybrid";
    interpretParts.push('fuel type: "hybrid"');
  }

  // ── Extract model names as search ──────────────────────────────────

  // Common model names that aren't brands
  const MODELS = [
    "camry", "corolla", "rav4", "highlander", "tacoma", "tundra", "4runner",
    "civic", "accord", "cr-v", "crv", "hr-v", "hrv", "pilot", "odyssey",
    "f-150", "f150", "mustang", "explorer", "bronco", "escape", "ranger",
    "silverado", "tahoe", "equinox", "malibu", "camaro", "traverse",
    "3 series", "5 series", "x3", "x5", "m3", "m5",
    "a4", "a6", "q5", "q7",
    "model 3", "model y", "model s", "model x",
    "wrangler", "grand cherokee", "cherokee", "gladiator",
    "cx-5", "cx5", "cx-9", "mazda3", "mazda6",
    "outback", "forester", "crosstrek", "impreza", "wrx",
    "altima", "sentra", "rogue", "pathfinder",
    "tucson", "santa fe", "elantra", "sonata", "palisade",
    "telluride", "sorento", "sportage", "forte",
    "rx", "es", "is", "nx", "gx",
    "c-class", "e-class", "s-class", "gle", "glc",
    "cayenne", "macan", "911", "taycan",
  ];

  if (!filters.search) {
    for (const model of MODELS) {
      const regex = new RegExp(`\\b${model.replace(/-/g, "[- ]?")}\\b`, "i");
      if (regex.test(q)) {
        filters.search = model.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        interpretParts.push(`model: "${filters.search}"`);
        break;
      }
    }
  }

  // ── Build interpretation string ────────────────────────────────────

  let interpretation: string;
  if (interpretParts.length === 0) {
    // Fallback: use the whole query as a search term
    filters.search = query.trim();
    interpretation = `Searching for "${query.trim()}"`;
  } else {
    interpretation = `Searching for cars: ${interpretParts.join(", ")}`;
  }

  return { filters, interpretation };
}
