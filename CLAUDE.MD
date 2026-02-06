# AutoFind NYC - Car Inventory Scraper

## Project Overview

AutoFind NYC is a Next.js application that scrapes car inventory data from multiple dealers and provides an AI-powered search interface. The system automatically collects, stores, and updates car listings from various sources.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Web Scraping**: Puppeteer (headless browser automation)
- **AI**: OpenAI API for natural language search
- **Scheduling**: node-cron for automated scraping

## Architecture

### Database Schema (Prisma)

**Dealer Model**
- Stores dealer information (name, website, scrape configuration)
- Tracks scraping status and schedule
- Related to cars and scrape logs

**Car Model**
- Vehicle listings with detailed specs (brand, model, year, price, mileage, etc.)
- Tracked over time (firstSeen, lastSeen, isActive)
- Supports multiple images
- Indexed for efficient search (brand, price, year, mileage, condition, vehicleType)

**ScrapeLog Model**
- Audit trail of scraping operations
- Tracks success/failure, duration, and counts

### Key Directories

- `/src/app/` - Next.js pages and API routes
  - `/api/admin/scrape/` - Manual scraping triggers
  - `/api/admin/scrape-logs/` - Scraping history
  - `/api/ai-search/` - AI-powered search endpoint
  - `/api/cars/` - Car listings API
  - `/api/dealers/` - Dealer management API
  - `/api/stats/` - Statistics API
  - `/dealers/page.tsx` - Dealer management UI

- `/src/scrapers/` - Web scraping implementation
  - `base-scraper.ts` - Abstract base class for scrapers
  - `types.ts` - Shared scraping types
  - `utils.ts` - Helper functions
  - `run.ts` - CLI script to run scrapers manually
  - `scheduler.ts` - Automated scheduling system
  - `/dealers/` - Dealer-specific scraper implementations
    - `carvana.ts` - Carvana scraper
    - `carmax.ts` - CarMax scraper
    - `craigslist.ts` - Craigslist scraper
    - `generic-dealer-inspire.ts` - Generic scraper for Dealer Inspire sites
    - `generic-dealer-com.ts` - Generic scraper for Dealer.com sites
    - `stub.ts` - Template for new scrapers

- `/src/components/` - React components
  - `Navbar.tsx` - Navigation component
  - `CarLogo.tsx` - Logo component

- `/src/lib/` - Utility libraries
  - `prisma.ts` - Prisma client singleton
  - `ai-search-parser.ts` - AI search query parser
  - `openai-search-parser.ts` - OpenAI integration

- `/prisma/` - Database configuration
  - `schema.prisma` - Database schema
  - `seed.ts` - Database seeding

## Available Scripts

```bash
npm run dev           # Start development server (http://localhost:3000)
npm run build         # Build for production
npm run start         # Start production server
npm run lint          # Run ESLint
npm run scrape        # Run scrapers manually
npm run scrape:schedule # Start scheduled scraping
```

## Environment Variables

Required environment variables (see `.env.example`):
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key for AI search
- Additional scraper-specific configuration may be needed

## Development Workflow

### Adding a New Dealer Scraper

1. Create a new file in `/src/scrapers/dealers/`
2. Extend the `BaseScraper` class from `base-scraper.ts`
3. Implement the `scrape()` method
4. Return an array of `ScrapedCar` objects
5. Register the scraper in `/src/scrapers/index.ts`
6. Add dealer entry to the database

### Database Changes

1. Modify `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <migration_name>`
3. Run `npx prisma generate` to update the Prisma client

### Testing Scrapers

```bash
# Run all scrapers
npm run scrape

# Test specific dealer by modifying run.ts or using admin API
curl -X POST http://localhost:3000/api/admin/scrape
```

## Key Features

### Web Scraping System
- Modular scraper architecture with base class
- Support for static (Cheerio) and dynamic (Puppeteer) scraping
- Error handling and logging
- Automatic retry logic
- Scheduled execution with node-cron

### AI Search
- Natural language query parsing
- Converts user queries to database filters
- Uses OpenAI GPT models

### Data Management
- Automatic deduplication using `dealerId` + `externalId`
- Tracks listing lifecycle (firstSeen, lastSeen, isActive)
- Soft deletion when listings are removed
- Historical scrape logging

## Common Tasks

### Add a new scraper
Reference the stub.ts template and existing scrapers

### View scrape logs
Check `/api/admin/scrape-logs` or the ScrapeLog table

### Debug scraping issues
- Check scraper implementation
- Verify dealer configuration in database
- Review scrape logs for error messages
- Test scraper URL directly

### Update database schema
Modify schema.prisma → create migration → generate client

## Notes for Claude

- When working with scrapers, always test against live data carefully to avoid overwhelming target sites
- Prisma client is a singleton - use the instance from `src/lib/prisma.ts`
- The scraping system uses Puppeteer with stealth plugin to avoid detection
- Car data should be normalized (consistent formatting for brands, models, etc.)
- Always validate scraped data before inserting to database
- Consider rate limiting and respectful scraping practices
