import OpenAI from "openai";
import {
  ParsedFilters,
  AISearchResult,
  parseNaturalLanguageQuery,
} from "./ai-search-parser";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT = `You are a car search assistant for automarket.NYC, a car inventory aggregator serving New York City.
Your job is to extract structured search filters from natural language queries about cars.

Return a JSON object with these fields (all optional — only include fields relevant to the query):

{
  "brand": string — exact brand name from this list: Toyota, Honda, Ford, Chevrolet, BMW, Mercedes-Benz, Audi, Lexus, Nissan, Hyundai, Kia, Subaru, Mazda, Volkswagen, Volvo, Jeep, Dodge, RAM, GMC, Cadillac, Lincoln, Acura, Infiniti, Porsche, Jaguar, Land Rover, MINI, Buick, Chrysler, Genesis, Tesla, Rivian, Lucid, Fiat, Alfa Romeo, Maserati, Ferrari, Lamborghini, Bentley, Rolls-Royce, Aston Martin, McLaren, Mitsubishi, Polestar
  "model": string — specific model name to search for (e.g. "Camry", "Civic", "F-150", "Model Y")
  "vehicleType": string — one of: Sedan, SUV, Truck, Coupe, Convertible, Wagon, Hatchback, Minivan, Van, Crossover
  "condition": string — one of: New, Used, Certified Pre-Owned
  "minPrice": number — minimum price in dollars
  "maxPrice": number — maximum price in dollars
  "yearFrom": number — minimum year (e.g. 2020)
  "yearTo": number — maximum year (e.g. 2024)
  "maxMileage": number — maximum mileage
  "fuelType": string — one of: Gasoline, Electric, Hybrid, Diesel
  "search": string — additional keyword search terms for things that don't fit the structured fields
  "sort": string — one of: price_asc, price_desc, year_desc, year_asc, mileage_asc (based on user's sorting preference)
  "interpretation": string — a brief, friendly, human-readable summary of what you understood from the query (1 sentence)
}

Guidelines:
- "cheap", "affordable", "budget" → sort: "price_asc"
- "luxury" without a specific brand → search: "luxury"
- "family car" → vehicleType: "SUV"
- "sports car" → vehicleType: "Coupe"
- "electric" / "EV" → fuelType: "Electric"
- Understand slang: "whip", "ride" = car; "beater" = cheap used car; "daily driver" = reliable used sedan/SUV
- If the user mentions a dollar amount like "25k" or "$25,000", convert to the appropriate price field
- "low mileage" → maxMileage: 30000
- Be generous with interpretation — try to find a meaningful search even for vague queries
- Only return the JSON object, no other text`;

export async function parseWithOpenAI(
  query: string
): Promise<AISearchResult> {
  try {
    if (!process.env.OPENAI_API_KEY) {
      console.log("No OPENAI_API_KEY set, falling back to regex parser");
      return parseNaturalLanguageQuery(query);
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: query },
      ],
      temperature: 0.1,
      max_tokens: 300,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.warn("OpenAI returned empty response, falling back to regex");
      return parseNaturalLanguageQuery(query);
    }

    const parsed = JSON.parse(content);

    const filters: ParsedFilters = {};
    if (parsed.brand) filters.brand = parsed.brand;
    if (parsed.vehicleType) filters.vehicleType = parsed.vehicleType;
    if (parsed.condition) filters.condition = parsed.condition;
    if (parsed.minPrice) filters.minPrice = parsed.minPrice;
    if (parsed.maxPrice) filters.maxPrice = parsed.maxPrice;
    if (parsed.yearFrom) filters.yearFrom = parsed.yearFrom;
    if (parsed.yearTo) filters.yearTo = parsed.yearTo;
    if (parsed.maxMileage) filters.maxMileage = parsed.maxMileage;
    if (parsed.sort) filters.sort = parsed.sort;

    // Combine model name and search terms, plus fuelType as search
    const searchParts: string[] = [];
    if (parsed.model) searchParts.push(parsed.model);
    if (parsed.fuelType && parsed.fuelType !== "Gasoline") searchParts.push(parsed.fuelType);
    if (parsed.search) searchParts.push(parsed.search);
    if (searchParts.length > 0) filters.search = searchParts.join(" ");

    const interpretation =
      parsed.interpretation || `Searching for "${query}"`;

    return { filters, interpretation };
  } catch (error) {
    console.error("OpenAI search parser error:", error);
    console.log("Falling back to regex parser");
    return parseNaturalLanguageQuery(query);
  }
}
