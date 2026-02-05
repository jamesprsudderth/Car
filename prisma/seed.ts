import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Dealers ──────────────────────────────────────────────────────────────────

interface DealerDef {
  name: string;
  website: string;
  category: string;
  scrapeType: string;
  scrapable?: boolean;
}

const dealers: DealerDef[] = [
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

// ── Dealer → Brand mapping ───────────────────────────────────────────────────

const dealerBrandMap: Record<string, string[]> = {
  "Toyota of Manhattan": ["Toyota"],
  "Toyota of Staten Island": ["Toyota"],
  "Toyota of Brooklyn": ["Toyota"],
  "Paragon Toyota": ["Toyota"],
  "Honda of Manhattan": ["Honda"],
  "Honda of Staten Island": ["Honda"],
  "Paragon Honda": ["Honda"],
  "BMW of Manhattan": ["BMW"],
  "Lexus of Manhattan": ["Lexus"],
  "Audi Manhattan": ["Audi"],
  "Audi Brooklyn": ["Audi"],
  "Jeep of Manhattan": ["Jeep"],
  "City World Ford": ["Ford"],
  "Ford Lincoln of Harlem": ["Ford", "Lincoln"],
  "Chevrolet of Brooklyn": ["Chevrolet"],
  "Volvo Cars Manhattan": ["Volvo"],
  "Mini of Manhattan": ["MINI"],
  "Nissan of Queens": ["Nissan"],
  "Koeppel Nissan": ["Nissan"],
  "Hyundai of Staten Island": ["Hyundai"],
  "Koeppel Hyundai": ["Hyundai"],
  "Subaru Brooklyn": ["Subaru"],
  "Koeppel Subaru": ["Subaru"],
  "Kia of Manhattan": ["Kia"],
  "Koeppel Mazda": ["Mazda"],
  "GMC of Staten Island": ["GMC"],
  "Jaguar Land Rover Manhattan": ["Jaguar", "Land Rover"],
  "Manhattan Motorcars": ["Porsche", "Mercedes-Benz"],
  "Tesla Inventory": ["Tesla"],
};

// ── Car inventory templates ──────────────────────────────────────────────────

interface CarTemplate {
  brand: string;
  model: string;
  vehicleType: string;
  trims: string[];
  yearRange: [number, number];
  priceRange: [number, number];
  engine?: string;
  fuelType?: string;
  isClassic?: boolean;
}

const carTemplates: CarTemplate[] = [
  // Toyota
  { brand: "Toyota", model: "Camry", vehicleType: "Sedan", trims: ["LE", "SE", "XLE", "XSE", "TRD"], yearRange: [2019, 2025], priceRange: [22000, 38000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Toyota", model: "Corolla", vehicleType: "Sedan", trims: ["L", "LE", "SE", "XLE", "XSE"], yearRange: [2019, 2025], priceRange: [18000, 28000], engine: "2.0L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Toyota", model: "RAV4", vehicleType: "SUV", trims: ["LE", "XLE", "XLE Premium", "Adventure", "TRD Off-Road", "Limited"], yearRange: [2019, 2025], priceRange: [27000, 42000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Toyota", model: "Highlander", vehicleType: "SUV", trims: ["L", "LE", "XLE", "XSE", "Limited", "Platinum"], yearRange: [2020, 2025], priceRange: [36000, 52000], engine: "3.5L V6", fuelType: "Gasoline" },
  { brand: "Toyota", model: "Tacoma", vehicleType: "Truck", trims: ["SR", "SR5", "TRD Sport", "TRD Off-Road", "Limited", "TRD Pro"], yearRange: [2018, 2025], priceRange: [28000, 55000], engine: "3.5L V6", fuelType: "Gasoline" },
  { brand: "Toyota", model: "4Runner", vehicleType: "SUV", trims: ["SR5", "SR5 Premium", "TRD Off-Road", "TRD Pro", "Limited"], yearRange: [2018, 2025], priceRange: [38000, 58000], engine: "4.0L V6", fuelType: "Gasoline" },
  // Honda
  { brand: "Honda", model: "Civic", vehicleType: "Sedan", trims: ["LX", "Sport", "EX", "EX-L", "Touring", "Si", "Type R"], yearRange: [2019, 2025], priceRange: [22000, 44000], engine: "2.0L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Honda", model: "Accord", vehicleType: "Sedan", trims: ["LX", "Sport", "EX", "EX-L", "Sport 2.0T", "Touring"], yearRange: [2019, 2025], priceRange: [26000, 40000], engine: "1.5L Turbo", fuelType: "Gasoline" },
  { brand: "Honda", model: "CR-V", vehicleType: "SUV", trims: ["LX", "EX", "EX-L", "Touring"], yearRange: [2019, 2025], priceRange: [27000, 40000], engine: "1.5L Turbo", fuelType: "Gasoline" },
  { brand: "Honda", model: "Pilot", vehicleType: "SUV", trims: ["LX", "Sport", "EX-L", "Touring", "Elite", "TrailSport"], yearRange: [2019, 2025], priceRange: [35000, 52000], engine: "3.5L V6", fuelType: "Gasoline" },
  { brand: "Honda", model: "HR-V", vehicleType: "SUV", trims: ["LX", "Sport", "EX-L"], yearRange: [2020, 2025], priceRange: [23000, 32000], engine: "2.0L 4-Cylinder", fuelType: "Gasoline" },
  // BMW
  { brand: "BMW", model: "3 Series", vehicleType: "Sedan", trims: ["330i", "330i xDrive", "M340i", "M340i xDrive"], yearRange: [2019, 2025], priceRange: [38000, 62000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "BMW", model: "5 Series", vehicleType: "Sedan", trims: ["530i", "530i xDrive", "540i xDrive", "M550i"], yearRange: [2019, 2025], priceRange: [48000, 78000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "BMW", model: "X3", vehicleType: "SUV", trims: ["sDrive30i", "xDrive30i", "M40i"], yearRange: [2019, 2025], priceRange: [40000, 62000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "BMW", model: "X5", vehicleType: "SUV", trims: ["sDrive40i", "xDrive40i", "xDrive45e", "M50i"], yearRange: [2019, 2025], priceRange: [55000, 88000], engine: "3.0L Turbo I6", fuelType: "Gasoline" },
  // Mercedes-Benz
  { brand: "Mercedes-Benz", model: "C-Class", vehicleType: "Sedan", trims: ["C 300", "C 300 4MATIC", "AMG C 43", "AMG C 63"], yearRange: [2019, 2025], priceRange: [38000, 75000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "Mercedes-Benz", model: "E-Class", vehicleType: "Sedan", trims: ["E 350", "E 350 4MATIC", "E 450", "AMG E 53"], yearRange: [2019, 2025], priceRange: [52000, 85000], engine: "3.0L Turbo I6", fuelType: "Gasoline" },
  { brand: "Mercedes-Benz", model: "GLC", vehicleType: "SUV", trims: ["GLC 300", "GLC 300 4MATIC", "AMG GLC 43", "AMG GLC 63"], yearRange: [2020, 2025], priceRange: [42000, 80000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  // Ford
  { brand: "Ford", model: "F-150", vehicleType: "Truck", trims: ["XL", "XLT", "Lariat", "King Ranch", "Platinum", "Tremor", "Raptor"], yearRange: [2018, 2025], priceRange: [32000, 78000], engine: "3.5L EcoBoost V6", fuelType: "Gasoline" },
  { brand: "Ford", model: "Explorer", vehicleType: "SUV", trims: ["Base", "XLT", "Limited", "ST", "Platinum", "Timberline"], yearRange: [2020, 2025], priceRange: [35000, 60000], engine: "2.3L EcoBoost", fuelType: "Gasoline" },
  { brand: "Ford", model: "Mustang", vehicleType: "Coupe", trims: ["EcoBoost", "EcoBoost Premium", "GT", "GT Premium", "Mach 1", "Dark Horse"], yearRange: [2019, 2025], priceRange: [28000, 65000], engine: "5.0L V8", fuelType: "Gasoline" },
  { brand: "Ford", model: "Bronco", vehicleType: "SUV", trims: ["Base", "Big Bend", "Black Diamond", "Outer Banks", "Badlands", "Wildtrak", "Raptor"], yearRange: [2021, 2025], priceRange: [35000, 75000], engine: "2.7L EcoBoost V6", fuelType: "Gasoline" },
  // Chevrolet
  { brand: "Chevrolet", model: "Silverado 1500", vehicleType: "Truck", trims: ["WT", "Custom", "LT", "RST", "LT Trail Boss", "LTZ", "High Country"], yearRange: [2019, 2025], priceRange: [32000, 65000], engine: "5.3L V8", fuelType: "Gasoline" },
  { brand: "Chevrolet", model: "Equinox", vehicleType: "SUV", trims: ["LS", "LT", "RS", "Premier"], yearRange: [2019, 2025], priceRange: [26000, 35000], engine: "1.5L Turbo", fuelType: "Gasoline" },
  { brand: "Chevrolet", model: "Tahoe", vehicleType: "SUV", trims: ["LS", "LT", "RST", "Z71", "Premier", "High Country"], yearRange: [2021, 2025], priceRange: [52000, 78000], engine: "5.3L V8", fuelType: "Gasoline" },
  { brand: "Chevrolet", model: "Camaro", vehicleType: "Coupe", trims: ["1LS", "1LT", "2LT", "LT1", "1SS", "2SS", "ZL1"], yearRange: [2019, 2024], priceRange: [26000, 72000], engine: "6.2L V8", fuelType: "Gasoline" },
  // Jeep
  { brand: "Jeep", model: "Wrangler", vehicleType: "SUV", trims: ["Sport", "Sport S", "Willys", "Sahara", "Rubicon", "Rubicon 392"], yearRange: [2018, 2025], priceRange: [30000, 82000], engine: "3.6L V6", fuelType: "Gasoline" },
  { brand: "Jeep", model: "Grand Cherokee", vehicleType: "SUV", trims: ["Laredo", "Limited", "Trailhawk", "Overland", "Summit", "SRT", "Trackhawk"], yearRange: [2019, 2025], priceRange: [38000, 90000], engine: "3.6L V6", fuelType: "Gasoline" },
  // Nissan
  { brand: "Nissan", model: "Altima", vehicleType: "Sedan", trims: ["S", "SV", "SR", "SL", "Platinum"], yearRange: [2019, 2025], priceRange: [24000, 35000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Nissan", model: "Rogue", vehicleType: "SUV", trims: ["S", "SV", "SL", "Platinum"], yearRange: [2019, 2025], priceRange: [27000, 40000], engine: "1.5L Turbo", fuelType: "Gasoline" },
  // Hyundai
  { brand: "Hyundai", model: "Tucson", vehicleType: "SUV", trims: ["SE", "SEL", "N Line", "Limited", "XRT"], yearRange: [2019, 2025], priceRange: [26000, 38000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Hyundai", model: "Sonata", vehicleType: "Sedan", trims: ["SE", "SEL", "SEL Plus", "N Line", "Limited"], yearRange: [2020, 2025], priceRange: [25000, 36000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Hyundai", model: "Palisade", vehicleType: "SUV", trims: ["SE", "SEL", "XRT", "Limited", "Calligraphy"], yearRange: [2020, 2025], priceRange: [35000, 52000], engine: "3.8L V6", fuelType: "Gasoline" },
  // Kia
  { brand: "Kia", model: "Telluride", vehicleType: "SUV", trims: ["LX", "S", "EX", "SX", "SX Prestige", "X-Pro"], yearRange: [2020, 2025], priceRange: [35000, 52000], engine: "3.8L V6", fuelType: "Gasoline" },
  { brand: "Kia", model: "Sportage", vehicleType: "SUV", trims: ["LX", "EX", "SX", "SX Prestige", "X-Pro"], yearRange: [2020, 2025], priceRange: [28000, 40000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  // Subaru
  { brand: "Subaru", model: "Outback", vehicleType: "Wagon", trims: ["Base", "Premium", "Onyx Edition XT", "Limited", "Touring", "Wilderness"], yearRange: [2019, 2025], priceRange: [28000, 42000], engine: "2.5L Flat-4", fuelType: "Gasoline" },
  { brand: "Subaru", model: "Forester", vehicleType: "SUV", trims: ["Base", "Premium", "Sport", "Limited", "Touring", "Wilderness"], yearRange: [2019, 2025], priceRange: [28000, 40000], engine: "2.5L Flat-4", fuelType: "Gasoline" },
  { brand: "Subaru", model: "Crosstrek", vehicleType: "SUV", trims: ["Base", "Premium", "Sport", "Limited", "Wilderness"], yearRange: [2019, 2025], priceRange: [24000, 35000], engine: "2.0L Flat-4", fuelType: "Gasoline" },
  // Mazda
  { brand: "Mazda", model: "CX-5", vehicleType: "SUV", trims: ["S", "S Select", "S Preferred", "S Carbon Edition", "S Premium", "Turbo"], yearRange: [2019, 2025], priceRange: [26000, 40000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  { brand: "Mazda", model: "Mazda3", vehicleType: "Sedan", trims: ["S", "S Select", "S Preferred", "S Carbon Edition", "S Premium", "Turbo"], yearRange: [2019, 2025], priceRange: [22000, 34000], engine: "2.5L 4-Cylinder", fuelType: "Gasoline" },
  // Lexus
  { brand: "Lexus", model: "RX", vehicleType: "SUV", trims: ["RX 350", "RX 350 F Sport", "RX 350h", "RX 500h F Sport"], yearRange: [2020, 2025], priceRange: [46000, 68000], engine: "2.4L Turbo", fuelType: "Gasoline" },
  { brand: "Lexus", model: "ES", vehicleType: "Sedan", trims: ["ES 250", "ES 350", "ES 350 F Sport", "ES 300h"], yearRange: [2019, 2025], priceRange: [41000, 52000], engine: "3.5L V6", fuelType: "Gasoline" },
  // Audi
  { brand: "Audi", model: "A4", vehicleType: "Sedan", trims: ["Premium", "Premium Plus", "Prestige", "S4 Premium Plus", "S4 Prestige"], yearRange: [2019, 2025], priceRange: [36000, 58000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "Audi", model: "Q5", vehicleType: "SUV", trims: ["Premium", "Premium Plus", "Prestige", "SQ5 Premium Plus", "SQ5 Prestige"], yearRange: [2019, 2025], priceRange: [42000, 62000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  // Tesla
  { brand: "Tesla", model: "Model 3", vehicleType: "Sedan", trims: ["Standard Range Plus", "Long Range", "Performance"], yearRange: [2020, 2025], priceRange: [35000, 55000], engine: "Electric Motor", fuelType: "Electric" },
  { brand: "Tesla", model: "Model Y", vehicleType: "SUV", trims: ["Standard Range", "Long Range", "Performance"], yearRange: [2020, 2025], priceRange: [42000, 62000], engine: "Dual Electric Motor", fuelType: "Electric" },
  // Volkswagen
  { brand: "Volkswagen", model: "Tiguan", vehicleType: "SUV", trims: ["S", "SE", "SE R-Line", "SEL", "SEL R-Line"], yearRange: [2019, 2025], priceRange: [26000, 38000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  // Volvo
  { brand: "Volvo", model: "XC60", vehicleType: "SUV", trims: ["B5 Core", "B5 Plus", "B6 Ultimate", "T8 Recharge"], yearRange: [2020, 2025], priceRange: [42000, 62000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "Volvo", model: "XC90", vehicleType: "SUV", trims: ["B5 Core", "B5 Plus", "B6 Ultimate", "T8 Recharge"], yearRange: [2020, 2025], priceRange: [52000, 78000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  // Porsche
  { brand: "Porsche", model: "Cayenne", vehicleType: "SUV", trims: ["Base", "S", "GTS", "Turbo", "Turbo GT"], yearRange: [2019, 2025], priceRange: [72000, 195000], engine: "3.0L Turbo V6", fuelType: "Gasoline" },
  { brand: "Porsche", model: "911", vehicleType: "Coupe", trims: ["Carrera", "Carrera S", "Carrera 4S", "Turbo", "Turbo S", "GT3"], yearRange: [2019, 2025], priceRange: [105000, 250000], engine: "3.0L Twin-Turbo Flat-6", fuelType: "Gasoline" },
  // GMC
  { brand: "GMC", model: "Sierra 1500", vehicleType: "Truck", trims: ["Pro", "SLE", "Elevation", "SLT", "AT4", "Denali", "Denali Ultimate"], yearRange: [2019, 2025], priceRange: [36000, 75000], engine: "5.3L V8", fuelType: "Gasoline" },
  // Land Rover
  { brand: "Land Rover", model: "Range Rover Sport", vehicleType: "SUV", trims: ["SE", "Dynamic SE", "Autobiography", "First Edition", "SVR"], yearRange: [2020, 2025], priceRange: [72000, 135000], engine: "3.0L Turbo I6", fuelType: "Gasoline" },
  { brand: "Land Rover", model: "Defender", vehicleType: "SUV", trims: ["S", "SE", "X-Dynamic SE", "X", "V8"], yearRange: [2020, 2025], priceRange: [55000, 115000], engine: "3.0L Turbo I6", fuelType: "Gasoline" },
  // Dodge
  { brand: "Dodge", model: "Challenger", vehicleType: "Coupe", trims: ["SXT", "GT", "R/T", "R/T Scat Pack", "SRT Hellcat"], yearRange: [2019, 2024], priceRange: [30000, 85000], engine: "6.4L HEMI V8", fuelType: "Gasoline" },
  // RAM
  { brand: "RAM", model: "1500", vehicleType: "Truck", trims: ["Tradesman", "Big Horn", "Laramie", "Rebel", "Limited", "TRX"], yearRange: [2019, 2025], priceRange: [34000, 85000], engine: "5.7L HEMI V8", fuelType: "Gasoline" },
  // Genesis
  { brand: "Genesis", model: "G70", vehicleType: "Sedan", trims: ["2.0T", "2.0T Sport Prestige", "3.3T Sport Prestige"], yearRange: [2020, 2025], priceRange: [38000, 55000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  // Acura
  { brand: "Acura", model: "MDX", vehicleType: "SUV", trims: ["Base", "Technology", "A-Spec", "Advance", "Type S"], yearRange: [2020, 2025], priceRange: [48000, 72000], engine: "3.5L V6", fuelType: "Gasoline" },
  // Lincoln (for Ford Lincoln of Harlem)
  { brand: "Lincoln", model: "Nautilus", vehicleType: "SUV", trims: ["Standard", "Reserve", "Black Label"], yearRange: [2020, 2025], priceRange: [42000, 62000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "Lincoln", model: "Aviator", vehicleType: "SUV", trims: ["Standard", "Reserve", "Black Label"], yearRange: [2020, 2025], priceRange: [52000, 78000], engine: "3.0L Twin-Turbo V6", fuelType: "Gasoline" },
  // MINI (for Mini of Manhattan)
  { brand: "MINI", model: "Cooper", vehicleType: "Hatchback", trims: ["Classic", "Signature", "Iconic", "S", "John Cooper Works"], yearRange: [2019, 2025], priceRange: [24000, 42000], engine: "1.5L Turbo 3-Cylinder", fuelType: "Gasoline" },
  { brand: "MINI", model: "Countryman", vehicleType: "SUV", trims: ["Classic", "Signature", "Iconic", "S", "John Cooper Works"], yearRange: [2019, 2025], priceRange: [30000, 48000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  // Jaguar (for Jaguar Land Rover Manhattan)
  { brand: "Jaguar", model: "F-PACE", vehicleType: "SUV", trims: ["S", "SE", "R-Dynamic SE", "SVR"], yearRange: [2019, 2025], priceRange: [50000, 85000], engine: "2.0L Turbo", fuelType: "Gasoline" },
  { brand: "Jaguar", model: "F-TYPE", vehicleType: "Coupe", trims: ["P300", "P450", "R-Dynamic", "R"], yearRange: [2019, 2025], priceRange: [65000, 110000], engine: "5.0L Supercharged V8", fuelType: "Gasoline" },
  // Classic / Specialty (for Hemmings, Bring a Trailer)
  { brand: "Porsche", model: "911 Classic", vehicleType: "Coupe", trims: ["Carrera", "Targa", "Turbo"], yearRange: [1985, 2005], priceRange: [55000, 180000], engine: "3.6L Flat-6", fuelType: "Gasoline", isClassic: true },
  { brand: "Ford", model: "Mustang Classic", vehicleType: "Coupe", trims: ["GT", "Mach 1", "Boss 302", "Shelby GT500"], yearRange: [1965, 1973], priceRange: [35000, 250000], engine: "5.0L V8", fuelType: "Gasoline", isClassic: true },
  { brand: "Chevrolet", model: "Corvette Classic", vehicleType: "Coupe", trims: ["Stingray", "LT", "454"], yearRange: [1963, 1982], priceRange: [40000, 200000], engine: "5.7L V8", fuelType: "Gasoline", isClassic: true },
  { brand: "Chevrolet", model: "Camaro Classic", vehicleType: "Coupe", trims: ["SS", "Z/28", "RS"], yearRange: [1967, 1973], priceRange: [45000, 175000], engine: "5.7L V8", fuelType: "Gasoline", isClassic: true },
  { brand: "Mercedes-Benz", model: "300SL", vehicleType: "Coupe", trims: ["Gullwing", "Roadster"], yearRange: [1954, 1963], priceRange: [800000, 2000000], engine: "3.0L I6", fuelType: "Gasoline", isClassic: true },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const colors = [
  "Black", "White", "Silver", "Gray", "Red", "Blue", "Navy Blue",
  "Dark Gray", "Pearl White", "Midnight Black", "Glacier White",
  "Deep Blue", "Burgundy", "Charcoal", "Gunmetal", "Bronze",
  "Green", "Orange", "Champagne", "Titanium",
];

const interiorColors = [
  "Black", "Tan", "Gray", "Beige", "Brown", "Ivory", "Red",
];

const conditions: Array<{ type: string; weight: number }> = [
  { type: "Used", weight: 60 },
  { type: "New", weight: 25 },
  { type: "Certified Pre-Owned", weight: 15 },
];

function pickCondition(): string {
  const total = conditions.reduce((sum, c) => sum + c.weight, 0);
  let r = Math.random() * total;
  for (const c of conditions) {
    r -= c.weight;
    if (r <= 0) return c.type;
  }
  return "Used";
}

function generateVIN(): string {
  const chars = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789";
  let vin = "";
  for (let i = 0; i < 17; i++) vin += chars[Math.floor(Math.random() * chars.length)];
  return vin;
}

function generateDescription(
  year: number, brand: string, model: string, trim: string,
  condition: string, mileage: number | null, ext: string, trans: string
): string {
  const condStr = condition === "New" ? "Brand new" : condition === "Certified Pre-Owned" ? "Certified Pre-Owned" : "Pre-owned";
  const miStr = mileage ? ` with only ${mileage.toLocaleString()} miles` : "";
  const pieces = [
    `${condStr} ${year} ${brand} ${model} ${trim}${miStr}.`,
    `Finished in ${ext} with a clean interior.`,
    `Features include ${trans} transmission, backup camera, and Bluetooth connectivity.`,
  ];
  if (condition === "Certified Pre-Owned") {
    pieces.push("Includes manufacturer-backed warranty and multi-point inspection.");
  }
  if (condition === "New") {
    pieces.push("Full factory warranty included. Multiple colors available.");
  }
  return pieces.join(" ");
}

const carImageIds = [
  "1494976388531-d1058494cdd8",
  "1503376780353-7e6692767b70",
  "1542362567-b07e54358753",
  "1544636331-e26879cd4d9b",
  "1555215695-3004980ad54e",
  "1580273916550-e323be2ae537",
  "1553440569-bcc63803a83d",
  "1549399542-7e3f8b79c341",
  "1583121274602-3e2820c69888",
  "1552519507-da3b142c6e3b",
  "1605559424843-9e4c228bf1c2",
  "1616422285623-13ff0162193c",
  "1618843479313-40f8afb4b4d8",
  "1621007947382-bb3c3994e3fb",
  "1619767886558-efdc259cde1a",
  "1617531653332-bd46c24f2068",
  "1609521263047-f8f205293f24",
  "1614162692292-7ac56d7bc8ec",
  "1606016159991-dfe4f2746db5",
  "1612825173281-9a193378527e",
  "1558618666-fcd25c85f82e",
  "1502877338535-766e1452684a",
  "1520340356584-f9917d1eea6f",
  "1568605117036-5fe5e7329af2",
  "1571607388263-1044f9ea01dd",
  "1590362891788-8389162e68af",
  "1533473359331-2f74fff49513",
  "1600712242805-5f78671b24da",
  "1541899481282-d53bffe3c35d",
  "1570356528233-b442cf19f3f0",
];

function getCarImage(): string {
  const id = pick(carImageIds);
  return `https://images.unsplash.com/photo-${id}?w=640&h=400&fit=crop&auto=format`;
}

function generateListingUrl(dealerWebsite: string, category: string, slug: string): string {
  const id = rand(10000, 99999);
  switch (category) {
    case "Online Marketplace":
      return `${dealerWebsite}/listing/${slug}-${id}`;
    case "Online Seller":
      return `${dealerWebsite}/vehicle/${slug}-${id}`;
    case "Aggregator":
      return `${dealerWebsite}/search/${slug}-${id}`;
    case "Specialty":
      return `${dealerWebsite}/listing/${slug}-${id}`;
    case "Direct Seller":
      return `${dealerWebsite}/${slug}-${id}`;
    default:
      return `${dealerWebsite}/inventory/${slug}-${id}`;
  }
}

// ── Car creation helper ──────────────────────────────────────────────────────

let globalCarCount = 0;

interface DealerRecord {
  id: string;
  name: string;
  website: string;
}

async function createCar(
  template: CarTemplate,
  dealer: DealerRecord,
  dealerCategory: string,
): Promise<void> {
  const trim = pick(template.trims);
  const year = rand(template.yearRange[0], template.yearRange[1]);
  const condition = template.isClassic ? "Used" : pickCondition();

  const ageFactor = 1 - (template.yearRange[1] - year) * 0.08;
  const condFactor = condition === "New" ? 1.1 : condition === "Certified Pre-Owned" ? 0.95 : 0.85;
  const trimIndex = template.trims.indexOf(trim);
  const trimFactor = 1 + (trimIndex / template.trims.length) * 0.3;
  const basePrice = template.priceRange[0] + Math.random() * (template.priceRange[1] - template.priceRange[0]);
  const price = Math.max(2000, Math.round(basePrice * ageFactor * condFactor * trimFactor / 100) * 100);

  let mileage: number | null = null;
  if (condition === "New") {
    mileage = rand(5, 250);
  } else if (template.isClassic) {
    mileage = rand(40000, 150000);
  } else {
    const yearsOld = Math.max(0, 2025 - year);
    mileage = rand(yearsOld * 8000, yearsOld * 15000 + 5000);
  }

  const extColor = pick(colors);
  const intColor = pick(interiorColors);
  const trans = template.model === "Civic" && trim === "Si" ? "6-Speed Manual"
    : template.model === "Civic" && trim === "Type R" ? "6-Speed Manual"
    : template.model === "Mustang" && Math.random() > 0.5 ? "6-Speed Manual"
    : template.model === "Camaro" && Math.random() > 0.5 ? "6-Speed Manual"
    : template.model === "Challenger" && Math.random() > 0.5 ? "6-Speed Manual"
    : template.isClassic ? pick(["3-Speed Manual", "4-Speed Manual", "Automatic"])
    : pick(["Automatic", "Automatic", "Automatic", "CVT", "8-Speed Automatic", "10-Speed Automatic"]);
  const dt = template.vehicleType === "Truck" ? pick(["4WD", "4WD", "RWD"])
    : template.brand === "Subaru" ? "AWD"
    : template.brand === "Audi" ? pick(["AWD", "AWD", "FWD"])
    : template.brand === "BMW" ? pick(["RWD", "AWD"])
    : template.brand === "Tesla" ? pick(["RWD", "AWD"])
    : pick(["FWD", "RWD", "AWD", "4WD"]);

  const desc = generateDescription(year, template.brand, template.model, trim, condition, mileage, extColor, trans);
  const slug = `${year}-${template.brand}-${template.model}-${trim}`.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const listingUrl = generateListingUrl(dealer.website, dealerCategory, slug);

  await prisma.car.create({
    data: {
      dealerId: dealer.id,
      externalId: `${dealer.id}-${slug}-${globalCarCount}`,
      listingUrl,
      brand: template.brand,
      model: template.model,
      year,
      trim,
      price,
      mileage,
      condition,
      vehicleType: template.vehicleType,
      exteriorColor: extColor,
      interiorColor: intColor,
      transmission: trans,
      fuelType: template.fuelType || "Gasoline",
      drivetrain: dt,
      engine: template.engine,
      vin: generateVIN(),
      imageUrl: getCarImage(),
      description: desc,
      isActive: true,
    },
  });
  globalCarCount++;
}

// ── Main Seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log("Clearing existing data...");
  await prisma.scrapeLog.deleteMany();
  await prisma.car.deleteMany();
  await prisma.dealer.deleteMany();

  // ── Create dealers ───────────────────────────────────────────────────────
  console.log("Seeding dealers...");
  const createdDealers: DealerRecord[] = [];
  const dealerCategoryMap = new Map<string, string>();

  for (const dealer of dealers) {
    const d = await prisma.dealer.create({
      data: {
        id: dealer.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        name: dealer.name,
        website: dealer.website,
        category: dealer.category,
        scrapeType: dealer.scrapeType,
        scrapable: dealer.scrapable ?? true,
      },
    });
    createdDealers.push(d);
    dealerCategoryMap.set(d.name, dealer.category);
  }
  console.log(`Seeded ${createdDealers.length} dealers.`);

  const activeDealers = createdDealers.filter((_, i) => dealers[i].scrapable !== false);

  // ── Build indexes ────────────────────────────────────────────────────────
  const templatesByBrand: Record<string, CarTemplate[]> = {};
  for (const t of carTemplates) {
    if (!templatesByBrand[t.brand]) templatesByBrand[t.brand] = [];
    templatesByBrand[t.brand].push(t);
  }

  const modernTemplates = carTemplates.filter(t => !t.isClassic);
  const classicTemplates = carTemplates.filter(t => t.isClassic);

  // Classify dealers by role
  const brandDealers = activeDealers.filter(d => dealerBrandMap[d.name]);
  const multiDealers = activeDealers.filter(d => {
    const cat = dealerCategoryMap.get(d.name)!;
    return cat === "NYC Dealership" && !dealerBrandMap[d.name];
  });
  const marketplaceDealers = activeDealers.filter(d => dealerCategoryMap.get(d.name) === "Online Marketplace");
  const onlineSellers = activeDealers.filter(d => dealerCategoryMap.get(d.name) === "Online Seller");
  const specialtyDealers = activeDealers.filter(d => dealerCategoryMap.get(d.name) === "Specialty");
  const aggregatorDealers = activeDealers.filter(d => dealerCategoryMap.get(d.name) === "Aggregator");

  // General pool = everyone except brand-specific and specialty
  const generalPool = [...multiDealers, ...marketplaceDealers, ...onlineSellers, ...aggregatorDealers];

  const dealerCarCounts = new Map<string, number>();
  for (const d of activeDealers) dealerCarCounts.set(d.id, 0);

  function trackCreate(dealerId: string) {
    dealerCarCounts.set(dealerId, (dealerCarCounts.get(dealerId) || 0) + 1);
  }

  // ── Phase 1: Brand-aligned dealer seeding ────────────────────────────────
  console.log("Phase 1: Seeding brand-aligned inventory...");
  let phase1Count = 0;

  for (const dealer of brandDealers) {
    const brands = dealerBrandMap[dealer.name];
    const category = dealerCategoryMap.get(dealer.name)!;

    for (const brand of brands) {
      const templates = templatesByBrand[brand] || [];
      for (const template of templates) {
        if (template.isClassic) continue;
        const numCars = rand(2, 4);
        for (let i = 0; i < numCars; i++) {
          await createCar(template, dealer, category);
          trackCreate(dealer.id);
          phase1Count++;
        }
      }
    }
  }
  console.log(`  Phase 1: ${phase1Count} cars across ${brandDealers.length} brand dealers`);

  // ── Phase 2: General pool seeding ────────────────────────────────────────
  console.log("Phase 2: Seeding general pool inventory...");
  let phase2Count = 0;

  // Modern templates for general dealers
  for (const template of modernTemplates) {
    const numListings = rand(3, 5);
    for (let i = 0; i < numListings; i++) {
      const dealer = pick(generalPool);
      const category = dealerCategoryMap.get(dealer.name)!;
      await createCar(template, dealer, category);
      trackCreate(dealer.id);
      phase2Count++;
    }
  }

  // Classic templates for specialty dealers
  for (const template of classicTemplates) {
    const numListings = rand(3, 6);
    for (let i = 0; i < numListings; i++) {
      const dealer = pick(specialtyDealers);
      const category = dealerCategoryMap.get(dealer.name)!;
      await createCar(template, dealer, category);
      trackCreate(dealer.id);
      phase2Count++;
    }
  }
  console.log(`  Phase 2: ${phase2Count} cars across general and specialty dealers`);

  // ── Phase 3: Gap-filling ─────────────────────────────────────────────────
  console.log("Phase 3: Gap-filling dealers with low inventory...");
  let phase3Count = 0;
  const MIN_CARS = 3;

  for (const dealer of activeDealers) {
    const count = dealerCarCounts.get(dealer.id) || 0;
    if (count >= MIN_CARS) continue;

    const deficit = MIN_CARS - count;
    const category = dealerCategoryMap.get(dealer.name)!;
    const brands = dealerBrandMap[dealer.name];

    for (let i = 0; i < deficit; i++) {
      let template: CarTemplate;
      if (brands) {
        // Brand dealer: use brand templates
        const brandTemplates = brands.flatMap(b => (templatesByBrand[b] || []).filter(t => !t.isClassic));
        template = brandTemplates.length > 0 ? pick(brandTemplates) : pick(modernTemplates);
      } else if (category === "Specialty") {
        template = classicTemplates.length > 0 ? pick(classicTemplates) : pick(modernTemplates);
      } else {
        template = pick(modernTemplates);
      }
      await createCar(template, dealer, category);
      trackCreate(dealer.id);
      phase3Count++;
    }
  }
  console.log(`  Phase 3: ${phase3Count} cars gap-filled`);

  // ── Summary ──────────────────────────────────────────────────────────────
  const total = phase1Count + phase2Count + phase3Count;
  const dealersWithCars = Array.from(dealerCarCounts.values()).filter(c => c > 0).length;
  const nonScrapable = dealers.filter(d => d.scrapable === false).map(d => d.name);

  console.log(`\nSeed complete!`);
  console.log(`  Total cars: ${total}`);
  console.log(`  Dealers with inventory: ${dealersWithCars} / ${activeDealers.length} active`);
  console.log(`  Non-scrapable (0 cars): ${nonScrapable.join(", ")}`);

  // Per-dealer breakdown
  console.log(`\nPer-dealer inventory:`);
  for (const dealer of createdDealers) {
    const count = dealerCarCounts.get(dealer.id) || 0;
    if (count > 0) console.log(`  ${dealer.name}: ${count} cars`);
  }
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
