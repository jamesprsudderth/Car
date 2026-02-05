"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Car,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Fuel,
  Settings2,
  MapPin,
  LayoutGrid,
  List,
  RotateCcw,
  Sparkles,
  Loader2,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

interface Dealer {
  id: string;
  name: string;
  website: string;
  category: string;
}

interface CarListing {
  id: string;
  brand: string;
  model: string;
  year: number;
  trim: string | null;
  price: number | null;
  mileage: number | null;
  condition: string;
  vehicleType: string;
  exteriorColor: string | null;
  transmission: string | null;
  fuelType: string | null;
  drivetrain: string | null;
  imageUrl: string | null;
  description: string | null;
  listingUrl: string;
  dealer: Dealer;
}

interface FiltersData {
  brands: string[];
  vehicleTypes: string[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
}

interface CarsResponse {
  cars: CarListing[];
  total: number;
  page: number;
  totalPages: number;
  filters: FiltersData;
}

interface StatsData {
  totalActiveCars: number;
  totalActiveDealers: number;
}

interface DealerListItem {
  id: string;
  name: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number): string {
  return "$" + price.toLocaleString("en-US");
}

function formatMileage(mileage: number): string {
  if (mileage >= 1000) {
    return Math.round(mileage / 1000).toLocaleString() + "k mi";
  }
  return mileage.toLocaleString() + " mi";
}

function conditionColor(condition: string): string {
  switch (condition.toLowerCase()) {
    case "new":
      return "bg-green-100 text-green-700 border-green-200";
    case "used":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "cpo":
    case "certified pre-owned":
      return "bg-blue-100 text-blue-700 border-blue-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-4 w-2/3 bg-gray-100 rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-14 bg-gray-100 rounded" />
          <div className="h-5 w-14 bg-gray-100 rounded" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-20 bg-gray-100 rounded" />
          <div className="h-8 w-24 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ResultsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: 12 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Car Card ────────────────────────────────────────────────────────────────

function CarCard({ car }: { car: CarListing }) {
  return (
    <a
      href={car.listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-card-hover hover:border-gray-300 transition-all duration-200 flex flex-col cursor-pointer"
    >
      {/* Image */}
      <div className="aspect-[16/10] relative overflow-hidden bg-gray-50">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.year} ${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50">
            <Car className="w-12 h-12 text-gray-200" />
          </div>
        )}

        {/* Condition Badge */}
        <span
          className={`absolute top-2.5 left-2.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${conditionColor(car.condition)}`}
        >
          {car.condition}
        </span>
      </div>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        {/* Title */}
        <h3 className="text-text font-semibold text-sm leading-snug mb-1 line-clamp-1">
          {car.year} {car.brand} {car.model}
          {car.trim ? ` ${car.trim}` : ""}
        </h3>

        {/* Description */}
        {car.description && (
          <p className="text-[11px] text-text-muted leading-relaxed mb-2 line-clamp-2">
            {car.description}
          </p>
        )}

        {/* Spec Tags */}
        <div className="flex flex-wrap gap-1 mb-2.5">
          {car.mileage != null && (
            <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded">
              <Gauge className="w-3 h-3" />
              {formatMileage(car.mileage)}
            </span>
          )}
          {car.transmission && (
            <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded">
              <Settings2 className="w-3 h-3" />
              {car.transmission}
            </span>
          )}
          {car.fuelType && (
            <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded">
              <Fuel className="w-3 h-3" />
              {car.fuelType}
            </span>
          )}
        </div>

        <div className="mt-auto" />

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-2.5 border-t border-border-light">
          <div>
            {car.price != null ? (
              <span className="text-lg font-bold text-accent">
                {formatPrice(car.price)}
              </span>
            ) : (
              <span className="text-xs text-text-muted italic">
                Contact for Price
              </span>
            )}
          </div>
          <span className="inline-flex items-center gap-1 text-accent group-hover:text-accent-hover text-xs font-semibold transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            View at Dealer
          </span>
        </div>

        {/* Dealer */}
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border-light">
          <MapPin className="w-3 h-3 text-text-muted" />
          <span className="text-[11px] text-text-muted truncate">
            {car.dealer.name}
          </span>
        </div>
      </div>
    </a>
  );
}

// ── Sidebar Filter Section ──────────────────────────────────────────────────

function FilterSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sidebar-section">
      <span className="sidebar-label">{label}</span>
      {children}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1400px] mx-auto px-4 py-6">
          <ResultsGridSkeleton />
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [data, setData] = useState<CarsResponse | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dealers, setDealers] = useState<DealerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Unified search state
  const [searchInput, setSearchInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<CarsResponse | null>(null);
  const [aiInterpretation, setAiInterpretation] = useState("");
  const [aiParsedFilters, setAiParsedFilters] = useState<Record<string, string | number> | null>(null);
  const [isAiSearch, setIsAiSearch] = useState(false);

  // Filter state from URL
  const brand = searchParams.get("brand") || "";
  const vehicleType = searchParams.get("vehicleType") || "";
  const condition = searchParams.get("condition") || "";
  const dealer = searchParams.get("dealer") || "";
  const search = searchParams.get("search") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const yearFrom = searchParams.get("yearFrom") || "";
  const yearTo = searchParams.get("yearTo") || "";
  const maxMileage = searchParams.get("maxMileage") || "";
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const activeFilterCount = [
    brand, vehicleType, condition, dealer, search,
    minPrice, maxPrice, yearFrom, yearTo, maxMileage,
  ].filter(Boolean).length;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }
      if (!("page" in updates)) {
        params.delete("page");
      }
      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [searchParams, router]
  );

  const clearAllFilters = useCallback(() => {
    router.push("/", { scroll: false });
  }, [router]);

  // Unified smart search handler
  const handleSearch = useCallback(async (queryOverride?: string) => {
    const q = (queryOverride ?? searchInput).trim();
    if (!q) {
      // Clear AI results, show standard results
      setIsAiSearch(false);
      setAiResults(null);
      setAiInterpretation("");
      setAiParsedFilters(null);
      return;
    }
    setIsAiSearch(true);
    setAiLoading(true);
    setAiResults(null);
    setAiInterpretation("");
    setAiParsedFilters(null);
    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      if (!res.ok) throw new Error("Search failed");
      const json = await res.json();
      setAiResults({
        cars: json.cars,
        total: json.total,
        page: json.page,
        totalPages: json.totalPages,
        filters: { brands: [], vehicleTypes: [], priceRange: { min: 0, max: 0 }, yearRange: { min: 0, max: 0 } },
      });
      setAiInterpretation(json.interpretation);
      setAiParsedFilters(json.parsedFilters);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setAiLoading(false);
    }
  }, [searchInput]);

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setIsAiSearch(false);
    setAiResults(null);
    setAiInterpretation("");
    setAiParsedFilters(null);
  }, []);

  // Fetch cars
  useEffect(() => {
    const controller = new AbortController();
    async function fetchCars() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (brand) params.set("brand", brand);
        if (vehicleType) params.set("vehicleType", vehicleType);
        if (condition) params.set("condition", condition);
        if (dealer) params.set("dealer", dealer);
        if (search) params.set("search", search);
        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);
        if (yearFrom) params.set("yearFrom", yearFrom);
        if (yearTo) params.set("yearTo", yearTo);
        if (maxMileage) params.set("maxMileage", maxMileage);
        if (sort) params.set("sort", sort);
        if (page > 1) params.set("page", page.toString());

        const res = await fetch(`/api/cars?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const json: CarsResponse = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching cars:", err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchCars();
    return () => controller.abort();
  }, [brand, vehicleType, condition, dealer, search, minPrice, maxPrice, yearFrom, yearTo, maxMileage, sort, page]);

  // Fetch stats + dealer list
  useEffect(() => {
    async function fetchMeta() {
      try {
        const [statsRes, dealersRes] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/dealers"),
        ]);
        if (statsRes.ok) {
          const statsJson = await statsRes.json();
          setStats(statsJson);
        }
        if (dealersRes.ok) {
          const dealersJson = await dealersRes.json();
          setDealers(
            dealersJson.dealers.map((d: Dealer) => ({ id: d.id, name: d.name }))
          );
        }
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    }
    fetchMeta();
  }, []);

  const currentYear = new Date().getFullYear();
  const yearOptions: number[] = [];
  const minYear = data?.filters?.yearRange?.min || 2000;
  for (let y = currentYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
      {/* ── Smart Search Bar ─────────────────────────────────────────── */}
      <div className="mb-5">
        <div className="flex gap-3 items-center">
          <div className="flex-1 relative">
            <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
            <input
              type="text"
              role="searchbox"
              aria-label="Search cars"
              placeholder='Search cars — try "SUVs under $25k" or "used Honda Civic"...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="filter-input w-full pl-10 pr-10 py-3 text-sm rounded-xl border-border bg-white shadow-card"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => handleSearch()}
            disabled={aiLoading}
            className="btn-primary py-3 px-6 rounded-xl shadow-card disabled:opacity-50"
          >
            {aiLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            {aiLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Quick search suggestions */}
        {!isAiSearch && !aiLoading && (
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <span className="text-[11px] text-text-muted font-medium">Try:</span>
            {[
              "SUVs under $25k",
              "New BMW sedans",
              "Low mileage trucks",
              "Used Honda Civic",
              "Electric vehicles",
              "Sporty coupes under $40k",
            ].map((example) => (
              <button
                key={example}
                onClick={() => {
                  setSearchInput(example);
                  handleSearch(example);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border text-text-secondary hover:bg-accent-light hover:text-accent hover:border-green-200 transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* AI Interpretation Banner */}
        {aiInterpretation && isAiSearch && (
          <div className="mt-3 px-3.5 py-2.5 bg-accent-light rounded-xl border border-green-100">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-green-800 font-medium">{aiInterpretation}</p>
                {aiParsedFilters && Object.keys(aiParsedFilters).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {Object.entries(aiParsedFilters).map(([key, value]) => (
                      <span
                        key={key}
                        className="text-[10px] px-2 py-0.5 bg-white rounded-md border border-green-200 text-green-700 font-medium"
                      >
                        {key}: {String(value)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={clearSearch}
                className="text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Stats bar */}
        {stats && !isAiSearch && (
          <div className="flex items-center gap-4 mt-3 text-xs text-text-muted">
            <span>
              <span className="font-semibold text-text">{stats.totalActiveCars.toLocaleString()}</span> vehicles available
            </span>
            <span className="text-border">|</span>
            <span>
              <span className="font-semibold text-text">{stats.totalActiveDealers}</span> dealers
            </span>
          </div>
        )}
      </div>

      {/* ── Main Layout: Sidebar + Content ──────────────────────────── */}
      <div className="flex gap-6">
        {/* ── Left Sidebar Filters ──────────────────────────────────── */}
        <aside className={`hidden lg:block w-64 flex-shrink-0 ${isAiSearch ? "lg:hidden" : ""}`}>
          <div className="bg-white rounded-xl border border-border p-4 shadow-card sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-text">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-1 text-[11px] text-accent hover:text-accent-hover font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              )}
            </div>

            {/* Make / Brand */}
            <FilterSection label="Make">
              <select
                value={brand}
                onChange={(e) => updateParams({ brand: e.target.value })}
                className="filter-select w-full text-sm"
              >
                <option value="">All Makes</option>
                {data?.filters?.brands?.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </FilterSection>

            {/* Body Type */}
            <FilterSection label="Body Type">
              <select
                value={vehicleType}
                onChange={(e) => updateParams({ vehicleType: e.target.value })}
                className="filter-select w-full text-sm"
              >
                <option value="">All Types</option>
                {data?.filters?.vehicleTypes?.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </FilterSection>

            {/* Year */}
            <FilterSection label="Year">
              <div className="flex gap-2">
                <select
                  value={yearFrom}
                  onChange={(e) => updateParams({ yearFrom: e.target.value })}
                  className="filter-select w-full text-sm"
                >
                  <option value="">From</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <select
                  value={yearTo}
                  onChange={(e) => updateParams({ yearTo: e.target.value })}
                  className="filter-select w-full text-sm"
                >
                  <option value="">To</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </FilterSection>

            {/* Price */}
            <FilterSection label="Price">
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => updateParams({ minPrice: e.target.value })}
                  className="filter-input w-full text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => updateParams({ maxPrice: e.target.value })}
                  className="filter-input w-full text-sm"
                />
              </div>
            </FilterSection>

            {/* Mileage */}
            <FilterSection label="Mileage">
              <input
                type="number"
                placeholder="Max mileage"
                value={maxMileage}
                onChange={(e) => updateParams({ maxMileage: e.target.value })}
                className="filter-input w-full text-sm"
              />
            </FilterSection>

            {/* Condition */}
            <FilterSection label="Condition">
              <div className="space-y-1.5">
                {["New", "Used", "Certified Pre-Owned"].map((c) => (
                  <label key={c} className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === c}
                      onChange={() => updateParams({ condition: condition === c ? "" : c })}
                      className="w-3.5 h-3.5 text-accent border-border focus:ring-accent"
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text transition-colors">
                      {c}
                    </span>
                  </label>
                ))}
                {condition && (
                  <button
                    onClick={() => updateParams({ condition: "" })}
                    className="text-[11px] text-accent hover:text-accent-hover mt-1"
                  >
                    Clear
                  </button>
                )}
              </div>
            </FilterSection>

            {/* Dealer */}
            <div className="pb-2">
              <span className="sidebar-label">Dealer</span>
              <select
                value={dealer}
                onChange={(e) => updateParams({ dealer: e.target.value })}
                className="filter-select w-full text-sm"
              >
                <option value="">All Dealers</option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        {/* ── Main Content ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-border px-4 py-3 shadow-card">
            <p className="text-sm text-text-secondary">
              {isAiSearch ? (
                aiLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                    <span>Searching...</span>
                  </span>
                ) : aiResults ? (
                  <>
                    Found{" "}
                    <span className="font-bold text-text">
                      {aiResults.total.toLocaleString()}
                    </span>{" "}
                    results
                  </>
                ) : null
              ) : loading ? (
                <span className="inline-block w-28 h-4 bg-gray-100 rounded animate-pulse" />
              ) : (
                <>
                  Found{" "}
                  <span className="font-bold text-text">
                    {data?.total.toLocaleString() ?? 0}
                  </span>{" "}
                  results
                </>
              )}
            </p>

            <div className="flex items-center gap-3">
              {/* View toggle */}
              <div className="hidden sm:flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 transition-colors ${viewMode === "grid" ? "bg-accent text-white" : "text-text-muted hover:text-text bg-white"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 transition-colors ${viewMode === "list" ? "bg-accent text-white" : "text-text-muted hover:text-text bg-white"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              {!isAiSearch && (
                <select
                  value={sort}
                  onChange={(e) => updateParams({ sort: e.target.value })}
                  className="filter-select text-sm"
                >
                  <option value="newest">Recently Added</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="year_desc">Year: Newest</option>
                  <option value="year_asc">Year: Oldest</option>
                  <option value="mileage_asc">Mileage: Lowest</option>
                </select>
              )}
            </div>
          </div>

          {/* Mobile Filters (shown on small screens, standard mode only) */}
          {!isAiSearch && (
            <div className="lg:hidden mb-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <select value={brand} onChange={(e) => updateParams({ brand: e.target.value })} className="filter-select text-sm">
                <option value="">Make</option>
                {data?.filters?.brands?.map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
              <select value={vehicleType} onChange={(e) => updateParams({ vehicleType: e.target.value })} className="filter-select text-sm">
                <option value="">Type</option>
                {data?.filters?.vehicleTypes?.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={condition} onChange={(e) => updateParams({ condition: e.target.value })} className="filter-select text-sm">
                <option value="">Condition</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="Certified Pre-Owned">CPO</option>
              </select>
            </div>
          )}

          {/* Results Grid */}
          {isAiSearch ? (
            // AI Mode Results
            aiLoading ? (
              <ResultsGridSkeleton />
            ) : aiResults && aiResults.cars.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "flex flex-col gap-3"
                }
              >
                {aiResults.cars.map((car) =>
                  viewMode === "grid" ? (
                    <CarCard key={car.id} car={car} />
                  ) : (
                    <ListCard key={car.id} car={car} />
                  )
                )}
              </div>
            ) : aiResults ? (
              <div className="text-center py-20 bg-white rounded-xl border border-border">
                <Sparkles className="w-16 h-16 text-purple-200 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-text mb-2">
                  No matching cars found
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  Try rephrasing your query or broadening your criteria
                </p>
              </div>
            ) : null
          ) : loading ? (
            <ResultsGridSkeleton />
          ) : data && data.cars.length > 0 ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-3"
              }
            >
              {data.cars.map((car) =>
                viewMode === "grid" ? (
                  <CarCard key={car.id} car={car} />
                ) : (
                  <ListCard key={car.id} car={car} />
                )
              )}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-border">
              <Car className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-text mb-2">
                No cars found
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                Try adjusting your filters or search terms
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="btn-primary text-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Filters
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {!isAiSearch && data && data.totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => updateParams({ page: (page - 1).toString() })}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-white text-sm font-medium
                           text-text-secondary hover:text-text hover:border-gray-300 transition-all
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>

              {generatePageNumbers(page, data.totalPages).map((p, idx) =>
                p === -1 ? (
                  <span key={`dots-${idx}`} className="px-1 text-text-muted">
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: p.toString() })}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all
                      ${p === page
                        ? "bg-accent text-white shadow-sm"
                        : "bg-white border border-border text-text-secondary hover:border-gray-300"
                      }`}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                onClick={() => updateParams({ page: (page + 1).toString() })}
                disabled={page >= data.totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-white text-sm font-medium
                           text-text-secondary hover:text-text hover:border-gray-300 transition-all
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

// ── List View Card ──────────────────────────────────────────────────────────

function ListCard({ car }: { car: CarListing }) {
  return (
    <a
      href={car.listingUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex bg-white rounded-xl border border-border overflow-hidden hover:shadow-card-hover hover:border-gray-300 transition-all duration-200 cursor-pointer"
    >
      {/* Image */}
      <div className="w-48 flex-shrink-0 relative bg-gray-50">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.year} ${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center min-h-[120px]">
            <Car className="w-10 h-10 text-gray-200" />
          </div>
        )}
        <span
          className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-md border ${conditionColor(car.condition)}`}
        >
          {car.condition}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <h3 className="text-text font-semibold text-sm mb-1 truncate">
            {car.year} {car.brand} {car.model}
            {car.trim ? ` ${car.trim}` : ""}
          </h3>
          {car.description && (
            <p className="text-[11px] text-text-muted leading-relaxed mb-1.5 line-clamp-1">
              {car.description}
            </p>
          )}
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3 h-3 text-text-muted" />
            <span className="text-[11px] text-text-muted">{car.dealer.name}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {car.mileage != null && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded">
                <Gauge className="w-3 h-3" />
                {formatMileage(car.mileage)}
              </span>
            )}
            {car.transmission && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded">
                {car.transmission}
              </span>
            )}
            {car.fuelType && (
              <span className="inline-flex items-center gap-1 text-[11px] text-text-secondary bg-gray-50 px-1.5 py-0.5 rounded">
                {car.fuelType}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          {car.price != null ? (
            <span className="text-lg font-bold text-accent">
              {formatPrice(car.price)}
            </span>
          ) : (
            <span className="text-xs text-text-muted italic">Contact for Price</span>
          )}
          <span className="inline-flex items-center gap-1 text-accent group-hover:text-accent-hover text-xs font-semibold transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />
            View at Dealer
          </span>
        </div>
      </div>
    </a>
  );
}

// ── Pagination helper ───────────────────────────────────────────────────────

function generatePageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  pages.push(1);

  if (current > 3) pages.push(-1);

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push(-1);

  pages.push(total);

  return pages;
}
