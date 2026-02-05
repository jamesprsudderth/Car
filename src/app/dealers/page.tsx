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
    <div className="bg-surface rounded-xl border border-border p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-border rounded-lg" />
          <div className="space-y-2">
            <div className="h-5 w-36 bg-border rounded" />
            <div className="h-3 w-20 bg-border rounded-full" />
          </div>
        </div>
      </div>
      <div className="h-4 w-48 bg-border rounded mb-3" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 bg-border rounded" />
        <div className="h-9 w-28 bg-border rounded-lg" />
      </div>
    </div>
  );
}

// ── Category Badge ──────────────────────────────────────────────────────────

function categoryStyle(category: string): string {
  const cat = category.toLowerCase();
  if (cat.includes("luxury") || cat.includes("exotic")) {
    return "bg-purple-500/15 text-purple-400 border-purple-500/20";
  }
  if (cat.includes("used") || cat.includes("independent")) {
    return "bg-amber-500/15 text-amber-400 border-amber-500/20";
  }
  if (cat.includes("franchise") || cat.includes("new")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
  }
  if (cat.includes("ev") || cat.includes("electric")) {
    return "bg-cyan-500/15 text-cyan-400 border-cyan-500/20";
  }
  return "bg-blue-500/15 text-blue-400 border-blue-500/20";
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

  // Extract unique categories
  const categories = Array.from(
    new Set(dealers.map((d) => d.category))
  ).sort();

  // Filter dealers by category
  const filteredDealers =
    activeCategory === "all"
      ? dealers
      : dealers.filter((d) => d.category === activeCategory);

  // Total listings across filtered dealers
  const totalListings = filteredDealers.reduce(
    (sum, d) => sum + d._count.cars,
    0
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <section className="mb-8">
        <h1 className="font-display text-4xl sm:text-5xl text-text mb-3 tracking-tight">
          Dealer Directory
        </h1>
        <p className="text-text-muted text-lg">
          Browse all NYC dealers in our network
        </p>
      </section>

      {/* Stats Bar */}
      {!loading && (
        <div className="flex items-center gap-6 text-sm mb-8">
          <div className="flex items-center gap-2">
            <Store className="w-4 h-4 text-accent" />
            <span className="text-text font-semibold">
              {filteredDealers.length}
            </span>
            <span className="text-text-muted">dealers</span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-emerald-400" />
            <span className="text-text font-semibold">
              {totalListings.toLocaleString()}
            </span>
            <span className="text-text-muted">active listings</span>
          </div>
        </div>
      )}

      {/* Category Tabs */}
      {!loading && categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${
                activeCategory === "all"
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-text-muted hover:text-text hover:border-text-muted/30"
              }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${
                  activeCategory === cat
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-text-muted hover:text-text hover:border-text-muted/30"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Dealers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <DealerCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredDealers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDealers.map((dealer) => (
            <a
              key={dealer.id}
              href={dealer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-surface rounded-xl border border-border p-5 hover:border-accent/30 hover:scale-[1.02] transition-all duration-300 ease-out block"
            >
              {/* Top Row */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition-colors duration-200">
                    <Store className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-text font-semibold text-sm leading-snug group-hover:text-accent transition-colors duration-200">
                      {dealer.name}
                    </h3>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border mt-1 ${categoryStyle(dealer.category)}`}
                    >
                      {dealer.category}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </div>

              {/* Website */}
              <div className="flex items-center gap-1.5 mb-4 text-text-muted">
                <Globe className="w-3.5 h-3.5" />
                <span className="text-xs truncate">
                  {dealer.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                </span>
              </div>

              {/* Listings Count */}
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div className="flex items-center gap-2">
                  <Car className="w-4 h-4 text-text-muted" />
                  <span className="text-sm text-text font-semibold">
                    {dealer._count.cars}
                  </span>
                  <span className="text-sm text-text-muted">
                    active listings
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <Store className="w-16 h-16 text-border mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">
            No dealers found
          </h3>
          <p className="text-text-muted text-sm">
            No dealers match the selected category
          </p>
        </div>
      )}
    </div>
  );
}
