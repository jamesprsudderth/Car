import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const dealers = [
  { name: "Major World", website: "https://majorworld.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Power Motors NYC", website: "https://www.powermotorsnyc.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Toyota of Manhattan", website: "https://www.toyotaofmanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Jeep of Manhattan", website: "https://www.nycjeep.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Manhattan Motorcars", website: "https://www.manhattanmotorcars.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Audi Manhattan", website: "https://www.audimanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "City World Ford", website: "https://www.cityworldford.net", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Plaza Auto Mall", website: "https://www.plazaautomall.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Sunrise Autoland", website: "https://www.sunriseautoland.nyc", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Worlds Best Auto Inc", website: "https://www.worldsbestautoinc.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Brooklyn Auto Mall", website: "https://www.brooklynautomallny.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Queens Auction Auto Outlet", website: "https://www.queensauction.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Enterprise Car Sales NYC", website: "https://www.enterprisecarsales.com/locations/new-york-city", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Toyota of Staten Island", website: "https://www.toyotaofstatenisland.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Honda of Manhattan", website: "https://www.hondaofmanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "BMW of Manhattan", website: "https://www.bmwofmanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Lexus of Manhattan", website: "https://www.lexusofmanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Jaguar Land Rover Manhattan", website: "https://www.jaguarlandrovernyc.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Toyota of Brooklyn", website: "https://www.toyotaofbrooklyn.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Chevrolet of Brooklyn", website: "https://www.chevroletofbrooklyn.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Ford Lincoln of Harlem", website: "https://www.fordlincolnharlem.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Volvo Cars Manhattan", website: "https://www.volvocarsmanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Mini of Manhattan", website: "https://www.miniofmanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Audi Brooklyn", website: "https://www.audibrooklyn.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Nissan of Queens", website: "https://www.nissanofqueens.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Hyundai of Staten Island", website: "https://www.hyundaiofstatenisland.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Subaru Brooklyn", website: "https://www.subarubrooklyn.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Kia of Manhattan", website: "https://www.kiaofmanhattan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Honda of Staten Island", website: "https://www.hondaofstatenisland.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "GMC of Staten Island", website: "https://www.gmcofstatenisland.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Paragon Honda", website: "https://www.paragonhonda.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Paragon Toyota", website: "https://www.paragontoyota.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Koeppel Nissan", website: "https://www.koeppelnissan.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Koeppel Mazda", website: "https://www.koeppelmazda.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Koeppel Subaru", website: "https://www.koeppelsubaru.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "Koeppel Hyundai", website: "https://www.koeppelhyundai.com", category: "NYC Dealership", scrapeType: "puppeteer" },
  { name: "AutoTrader NYC", website: "https://www.autotrader.com/car-dealers/new-york-ny", category: "Online Marketplace", scrapeType: "api" },
  { name: "Cars.com NYC", website: "https://www.cars.com/shopping/new_york-ny", category: "Online Marketplace", scrapeType: "api" },
  { name: "CarGurus NYC", website: "https://www.cargurus.com/Cars/in-New-York-NY-area-c6004_l4001", category: "Online Marketplace", scrapeType: "puppeteer" },
  { name: "Edmunds NYC", website: "https://www.edmunds.com/cars-for-sale/NY/New-York", category: "Online Marketplace", scrapeType: "api" },
  { name: "TrueCar NYC", website: "https://www.truecar.com/used-cars-for-sale/listings/ny-new-york", category: "Online Marketplace", scrapeType: "puppeteer" },
  { name: "CARFAX Used Cars NYC", website: "https://www.carfax.com/Used-Cars-in-New-York-NY_c8636", category: "Online Marketplace", scrapeType: "puppeteer" },
  { name: "Craigslist NYC Cars", website: "https://newyork.craigslist.org/d/cars-trucks/search/cta", category: "Online Marketplace", scrapeType: "cheerio" },
  { name: "eBay Motors", website: "https://www.ebay.com/b/Automobiles-Vehicles/6001/bn_1865117", category: "Online Marketplace", scrapeType: "api" },
  { name: "Carvana", website: "https://www.carvana.com", category: "Online Seller", scrapeType: "api" },
  { name: "Vroom", website: "https://www.vroom.com", category: "Online Seller", scrapeType: "puppeteer" },
  { name: "Rodo", website: "https://www.rodo.com", category: "Online Seller", scrapeType: "puppeteer" },
  { name: "Shift", website: "https://shift.com", category: "Online Seller", scrapeType: "puppeteer" },
  { name: "Hemmings", website: "https://www.hemmings.com", category: "Specialty", scrapeType: "cheerio" },
  { name: "Bring a Trailer", website: "https://bringatrailer.com", category: "Specialty", scrapeType: "cheerio" },
  { name: "AutoTempest", website: "https://www.autotempest.com", category: "Aggregator", scrapeType: "puppeteer" },
  { name: "iSeeCars", website: "https://www.iseecars.com", category: "Aggregator", scrapeType: "puppeteer" },
  { name: "CarsDirect", website: "https://www.carsdirect.com", category: "Online Marketplace", scrapeType: "puppeteer" },
  { name: "Kelley Blue Book Listings", website: "https://www.kbb.com/cars-for-sale", category: "Online Marketplace", scrapeType: "api" },
  { name: "MotorTrend Cars", website: "https://www.motortrend.com/cars-for-sale", category: "Online Marketplace", scrapeType: "puppeteer" },
  { name: "Autolist", website: "https://www.autolist.com", category: "Aggregator", scrapeType: "api" },
  { name: "Facebook Marketplace NYC Cars", website: "https://www.facebook.com/marketplace/newyork/cars_and_trucks", category: "Online Marketplace", scrapeType: "manual", scrapable: false },
  { name: "NewCars.com", website: "https://www.newcars.com", category: "Online Marketplace", scrapeType: "puppeteer" },
  { name: "CarMax", website: "https://www.carmax.com", category: "Online Seller", scrapeType: "api" },
  { name: "Tesla Inventory", website: "https://www.tesla.com/inventory/new", category: "Direct Seller", scrapeType: "api" },
  { name: "Sam's Club Auto Program", website: "https://www.samsclub.com/auto-buying-program.html", category: "Buying Program", scrapeType: "manual", scrapable: false },
];

async function main() {
  console.log("Seeding dealers...");

  for (const dealer of dealers) {
    await prisma.dealer.upsert({
      where: { id: dealer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") },
      update: {
        name: dealer.name,
        website: dealer.website,
        category: dealer.category,
        scrapeType: dealer.scrapeType,
        scrapable: dealer.scrapable ?? true,
      },
      create: {
        id: dealer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: dealer.name,
        website: dealer.website,
        category: dealer.category,
        scrapeType: dealer.scrapeType,
        scrapable: dealer.scrapable ?? true,
      },
    });
  }

  console.log(`Seeded ${dealers.length} dealers.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
