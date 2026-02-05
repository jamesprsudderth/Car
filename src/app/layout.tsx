import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "automarket.NYC - Car Inventory Search",
  description: "Search car inventory across NYC dealers and online marketplaces",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Instrument+Serif&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans bg-bg text-text min-h-screen">
        <Navbar />
        <main>{children}</main>
        <footer className="border-t border-border bg-white mt-8">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-text-muted text-xs leading-relaxed text-center max-w-2xl mx-auto">
              automarket.NYC aggregates publicly available listing data. We are not
              affiliated with any listed dealer. Always verify pricing and
              availability on the dealer&apos;s website.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
