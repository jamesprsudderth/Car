"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search,
  Filter,
  Car,
  ChevronDown,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Fuel,
  Settings2,
  MapPin,
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

function conditionStyle(condition: string): string {
  switch (condition.toLowerCase()) {
    case "new":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "used":
      return "bg-amber-500/15 text-amber-400 border-amber-500/20";
    case "cpo":
    case "certified pre-owned":
      return "bg-blue-500/15 text-blue-400 border-blue-500/20";
    default:
      return "bg-text-muted/15 text-text-muted border-text-muted/20";
  }
}

// ── Skeleton Components ─────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden animate-pulse">
      <div className="aspect-[16/10] bg-border" />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-14 bg-border rounded-full" />
          <div className="h-4 w-20 bg-border rounded" />
        </div>
        <div className="h-5 w-3/4 bg-border rounded" />
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-border rounded-md" />
          <div className="h-6 w-16 bg-border rounded-md" />
          <div className="h-6 w-16 bg-border rounded-md" />
        </div>
        <div className="h-4 w-full bg-border rounded" />
        <div className="h-4 w-2/3 bg-border rounded" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-6 w-24 bg-border rounded" />
          <div className="h-9 w-32 bg-border rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function ResultsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 12 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Car Card ────────────────────────────────────────────────────────────────

function CarCard({ car }: { car: CarListing }) {
  return (
    <div className="group bg-surface rounded-xl border border-border overflow-hidden hover:border-accent/30 hover:scale-[1.02] transition-all duration-300 ease-out flex flex-col">
      {/* Image */}
      <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-border to-bg">
        {car.imageUrl ? (
          <img
            src={car.imageUrl}
            alt={`${car.year} ${car.brand} ${car.model}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="w-16 h-16 text-border" />
          </div>
        )}

        {/* Condition Badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${conditionStyle(car.condition)}`}
        >
          {car.condition}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Dealer badge */}
        <div className="flex items-center gap-1.5 mb-2">
          <MapPin className="w-3 h-3 text-text-muted" />
          <span className="text-xs text-text-muted font-medium truncate">
            {car.dealer.name}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-text font-semibold text-sm leading-snug mb-2 line-clamp-1">
          {car.year} {car.brand} {car.model}
          {car.trim ? ` ${car.trim}` : ""}
        </h3>

        {/* Spec Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {car.mileage != null && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg px-2 py-1 rounded-md">
              <Gauge className="w-3 h-3" />
              {formatMileage(car.mileage)}
            </span>
          )}
          {car.transmission && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg px-2 py-1 rounded-md">
              <Settings2 className="w-3 h-3" />
              {car.transmission}
            </span>
          )}
          {car.fuelType && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg px-2 py-1 rounded-md">
              <Fuel className="w-3 h-3" />
              {car.fuelType}
            </span>
          )}
          {car.drivetrain && (
            <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-bg px-2 py-1 rounded-md">
              {car.drivetrain}
            </span>
          )}
        </div>

        {/* Description */}
        {car.description && (
          <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2 flex-1">
            {car.description}
          </p>
        )}
        {!car.description && <div className="flex-1" />}

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
          <div>
            {car.price != null ? (
              <span className="text-lg font-bold text-text">
                {formatPrice(car.price)}
              </span>
            ) : (
              <span className="text-sm text-text-muted italic">
                Contact for Price
              </span>
            )}
          </div>
          <a
            href={car.listingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors duration-200"
          >
            View at {car.dealer.name.split(" ")[0]}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <Suspense fallback={<ResultsGridSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [data, setData] = useState<CarsResponse | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [dealers, setDealers] = useState<DealerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  // Count active filters
  const activeFilterCount = [
    brand,
    vehicleType,
    condition,
    dealer,
    search,
    minPrice,
    maxPrice,
    yearFrom,
    yearTo,
    maxMileage,
  ].filter(Boolean).length;

  // URL update helper
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
      // Reset to page 1 when filters change (unless page itself is being set)
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
  }, [
    brand,
    vehicleType,
    condition,
    dealer,
    search,
    minPrice,
    maxPrice,
    yearFrom,
    yearTo,
    maxMileage,
    sort,
    page,
  ]);

  // Fetch stats + dealer list on mount
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

  // Year range for dropdowns
  const currentYear = new Date().getFullYear() + 1;
  const yearOptions: number[] = [];
  const minYear = data?.filters?.yearRange?.min || 2000;
  for (let y = currentYear; y >= minYear; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section className="text-center mb-10">
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-text mb-3 tracking-tight">
          AutoFind NYC
        </h1>
        <p className="text-text-muted text-lg mb-5 max-w-xl mx-auto">
          Search car inventory across NYC dealers in one place
        </p>
        {stats && (
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-accent" />
              <span className="text-text font-semibold">
                {stats.totalActiveCars.toLocaleString()}
              </span>
              <span className="text-text-muted">cars</span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-text font-semibold">
                {stats.totalActiveDealers}
              </span>
              <span className="text-text-muted">dealers</span>
            </div>
          </div>
        )}
      </section>

      {/* ── Search Bar ─────────────────────────────────────────────── */}
      <section className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by brand, model, trim..."
              value={search}
              onChange={(e) => updateParams({ search: e.target.value })}
              className="filter-input w-full pl-10 pr-4 py-2.5"
            />
            {search && (
              <button
                onClick={() => updateParams({ search: "" })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all duration-200
              ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "bg-surface border-border text-text-muted hover:text-text hover:border-text-muted/30"
              }`}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${filtersOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>
      </section>

      {/* ── Collapsible Filters ────────────────────────────────────── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          filtersOpen ? "max-h-[500px] opacity-100 mb-6" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Brand */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Brand
              </label>
              <select
                value={brand}
                onChange={(e) => updateParams({ brand: e.target.value })}
                className="filter-select w-full"
              >
                <option value="">All Brands</option>
                {data?.filters?.brands?.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Type */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Vehicle Type
              </label>
              <select
                value={vehicleType}
                onChange={(e) => updateParams({ vehicleType: e.target.value })}
                className="filter-select w-full"
              >
                <option value="">All Types</option>
                {data?.filters?.vehicleTypes?.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => updateParams({ condition: e.target.value })}
                className="filter-select w-full"
              >
                <option value="">Any Condition</option>
                <option value="New">New</option>
                <option value="Used">Used</option>
                <option value="CPO">Certified Pre-Owned</option>
              </select>
            </div>

            {/* Dealer */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Dealer
              </label>
              <select
                value={dealer}
                onChange={(e) => updateParams({ dealer: e.target.value })}
                className="filter-select w-full"
              >
                <option value="">All Dealers</option>
                {dealers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Min Price
              </label>
              <input
                type="number"
                placeholder="No min"
                value={minPrice}
                onChange={(e) => updateParams({ minPrice: e.target.value })}
                className="filter-input w-full"
              />
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Max Price
              </label>
              <input
                type="number"
                placeholder="No max"
                value={maxPrice}
                onChange={(e) => updateParams({ maxPrice: e.target.value })}
                className="filter-input w-full"
              />
            </div>

            {/* Year Range */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Year From
              </label>
              <select
                value={yearFrom}
                onChange={(e) => updateParams({ yearFrom: e.target.value })}
                className="filter-select w-full"
              >
                <option value="">Any</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Year To
              </label>
              <select
                value={yearTo}
                onChange={(e) => updateParams({ yearTo: e.target.value })}
                className="filter-select w-full"
              >
                <option value="">Any</option>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Max Mileage */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 font-medium">
                Max Mileage
              </label>
              <input
                type="number"
                placeholder="No limit"
                value={maxMileage}
                onChange={(e) => updateParams({ maxMileage: e.target.value })}
                className="filter-input w-full"
              />
            </div>
          </div>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-border flex justify-end">
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 text-sm text-text-muted hover:text-accent transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Sort + Results Count ───────────────────────────────────── */}
      <section className="flex items-center justify-between mb-5">
        <p className="text-sm text-text-muted">
          {loading ? (
            <span className="inline-block w-32 h-4 bg-border rounded animate-pulse" />
          ) : (
            <>
              <span className="text-text font-semibold">
                {data?.total.toLocaleString() ?? 0}
              </span>{" "}
              results
            </>
          )}
        </p>
        <select
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="filter-select text-sm"
        >
          <option value="newest">Recently Added</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="year_desc">Year: Newest First</option>
          <option value="year_asc">Year: Oldest First</option>
          <option value="mileage_asc">Mileage: Lowest</option>
        </select>
      </section>

      {/* ── Results Grid ───────────────────────────────────────────── */}
      {loading ? (
        <ResultsGridSkeleton />
      ) : data && data.cars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Car className="w-16 h-16 text-border mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">
            No cars found
          </h3>
          <p className="text-text-muted text-sm mb-4">
            Try adjusting your filters or search terms
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-accent hover:text-accent-hover text-sm font-medium transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* ── Pagination ─────────────────────────────────────────────── */}
      {data && data.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => updateParams({ page: (page - 1).toString() })}
            disabled={page <= 1}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium
                       text-text-muted hover:text-text hover:border-text-muted/30 transition-all duration-200
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-muted"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          {/* Page Numbers */}
          {generatePageNumbers(page, data.totalPages).map((p, idx) =>
            p === -1 ? (
              <span key={`ellipsis-${idx}`} className="px-2 text-text-muted">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => updateParams({ page: p.toString() })}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    p === page
                      ? "bg-accent text-white"
                      : "border border-border text-text-muted hover:text-text hover:border-text-muted/30"
                  }`}
              >
                {p}
              </button>
            )
          )}

          <button
            onClick={() => updateParams({ page: (page + 1).toString() })}
            disabled={page >= data.totalPages}
            className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border text-sm font-medium
                       text-text-muted hover:text-text hover:border-text-muted/30 transition-all duration-200
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-muted"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}

// ── Pagination helper ───────────────────────────────────────────────────────

function generatePageNumbers(current: number, total: number): number[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: number[] = [];

  // Always include first page
  pages.push(1);

  if (current > 3) {
    pages.push(-1); // ellipsis
  }

  // Pages around current
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push(-1); // ellipsis
  }

  // Always include last page
  pages.push(total);

  return pages;
}
