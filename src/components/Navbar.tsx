"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Store } from "lucide-react";
import CarLogo from "./CarLogo";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <CarLogo className="w-10 h-5 text-accent group-hover:text-accent-hover transition-colors" />
            <span className="font-display text-xl text-primary tracking-tight">
              automarket<span className="text-accent">.NYC</span>
            </span>
          </Link>

          {/* Center Nav */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${pathname === "/"
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:text-text hover:bg-gray-50"
                }`}
            >
              <Search className="w-4 h-4" />
              Search
            </Link>
            <Link
              href="/dealers"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                ${pathname === "/dealers"
                  ? "bg-accent-light text-accent"
                  : "text-text-secondary hover:text-text hover:bg-gray-50"
                }`}
            >
              <Store className="w-4 h-4" />
              Dealers
            </Link>
          </div>

          {/* Mobile nav links */}
          <div className="flex md:hidden items-center gap-1">
            <Link href="/" className={`p-2 rounded-lg ${pathname === "/" ? "text-accent" : "text-text-secondary"}`}>
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/dealers" className={`p-2 rounded-lg ${pathname === "/dealers" ? "text-accent" : "text-text-secondary"}`}>
              <Store className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
