"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink,
  Car,
  Store,
  Globe,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

interface DealerData {
  id: string;
  name: string;
  website: string;
  category: string;
  isActive: boolean;
  _count: {
    cars: number;
  };
}

// ── Skeleton ────────────────────────────────────────────────────────────────

function DealerCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-100 rounded-lg" />
          <div className="space-y-2">
            <div className="h-5 w-36 bg-gray-100 rounded" />
            <div className="h-3 w-20 bg-gray-100 rounded-full" />
          </div>
        </div>
      </div>
      <div className="h-4 w-48 bg-gray-100 rounded mb-3" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-gray-100 rounded" />
        <div className="h-9 w-28 bg-gray-100 rounded-lg" />
      </div>
    </div>
  );
}

// ── Category Badge ──────────────────────────────────────────────────────────

function categoryStyle(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes("nyc")) {
    return "bg-green-50 text-green-700 border-green-200";
  }
  if (cat.includes("online") || cat.includes("marketplace")) {
    return "bg-blue-50 text-blue-700 border-blue-200";
  }
  if (cat.includes("seller")) {
    return "bg-purple-50 text-purple-700 border-purple-200";
  }
  if (cat.includes("specialty")) {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (cat.includes("aggregator")) {
    return "bg-cyan-50 text-cyan-700 border-cyan-200";
  }
  return "bg-gray-50 text-gray-600 border-gray-200";
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function DealersPage() {
  const [dealers, setDealers] = useState<DealerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    async function fetchDealers() {
      try {
        const res = await fetch("/api/dealers");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setDealers(json.dealers);
      } catch (err) {
        console.error("Error fetching dealers:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDealers();
  }, []);

  const categories = Array.from(
    new Set(dealers.map((d) => d.category))
  ).sort();

  const filteredDealers =
    activeCategory === "all"
      ? dealers
      : dealers.filter((d) => d.category === activeCategory);

  const totalListings = filteredDealers.reduce(
    (sum, d) => sum + d._count.cars,
    0
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <section className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl text-text mb-2 tracking-tight">
          Dealer Directory
        </h1>
        <p className="text-text-secondary text-sm">
          Browse all NYC dealers and online marketplaces in our network
        </p>
      </section>

      {/* Stats + Category Tabs */}
      <div className="bg-white rounded-xl border border-border p-4 shadow-card mb-6">
        {!loading && (
          <div className="flex items-center gap-6 text-sm mb-4">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-accent" />
              <span className="text-text font-semibold">{filteredDealers.length}</span>
              <span className="text-text-muted">dealers</span>
            </div>
            <span className="text-border">|</span>
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-accent" />
              <span className="text-text font-semibold">{totalListings.toLocaleString()}</span>
              <span className="text-text-muted">active listings</span>
            </div>
          </div>
        )}

        {!loading && categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                ${activeCategory === "all"
                  ? "bg-accent text-white shadow-sm"
                  : "bg-gray-50 border border-border text-text-secondary hover:text-text hover:border-gray-300"
                }`}
            >
              All ({dealers.length})
            </button>
            {categories.map((cat) => {
              const count = dealers.filter((d) => d.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                    ${activeCategory === cat
                      ? "bg-accent text-white shadow-sm"
                      : "bg-gray-50 border border-border text-text-secondary hover:text-text hover:border-gray-300"
                    }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Dealers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <DealerCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredDealers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredDealers.map((dealer) => (
            <a
              key={dealer.id}
              href={dealer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl border border-border p-4 hover:shadow-card-hover hover:border-gray-300 transition-all duration-200 block"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-accent-light rounded-lg flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Store className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-text font-semibold text-sm leading-snug group-hover:text-accent transition-colors">
                      {dealer.name}
                    </h3>
                    <span
                      className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border mt-1 ${categoryStyle(dealer.category)}`}
                    >
                      {dealer.category}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Website */}
              <div className="flex items-center gap-1.5 mb-3 text-text-muted">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span className="text-[11px] truncate">
                  {dealer.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </div>

              {/* Listings Count */}
              <div className="flex items-center gap-2 pt-3 border-t border-border-light">
                <Car className="w-3.5 h-3.5 text-text-muted" />
                <span className="text-xs">
                  <span className="font-bold text-text">{dealer._count.cars}</span>
                  <span className="text-text-muted ml-1">listings</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-border">
          <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">
            No dealers found
          </h3>
          <p className="text-text-secondary text-sm">
            No dealers match the selected category
          </p>
        </div>
      )}
    </div>
  );
}
