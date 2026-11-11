require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const { connectDB, disconnectDB } = require("../config/db");

const seedDemoData = async () => {
  try {
    console.log("[SeedDemo] Connecting to database...");
    await connectDB();

    console.log("[SeedDemo] Cleaning up existing demo collections...");
    await Promise.all([
      Review.deleteMany({}),
      Restaurant.deleteMany({}),
      User.deleteMany({}),
    ]);

    // Ensure database compound unique indexes exist
    await Review.init();
    await User.init();
    await Restaurant.init();

    console.log("[SeedDemo] Creating users...");

    // 1. Admin
    const admin = await User.create({
      name: "Platform Administrator",
      email: (process.env.ADMIN_EMAIL || "admin@smartwinnr.com").toLowerCase().trim(),
      password: process.env.ADMIN_PASSWORD || "Admin@12345",
      role: "ADMIN",
    });

    // 2. Restaurant Owners
    const owner1 = await User.create({
      name: "Chef Rajesh Verma",
      email: "owner.spice@smartwinnr.com",
      password: "Owner@12345",
      role: "OWNER",
    });

    const owner2 = await User.create({
      name: "Marco Bellini",
      email: "owner.tuscany@smartwinnr.com",
      password: "Owner@12345",
      role: "OWNER",
    });

    const owner3 = await User.create({
      name: "Kenji Sato",
      email: "owner.tokyo@smartwinnr.com",
      password: "Owner@12345",
      role: "OWNER",
    });

    // 3. Customers
    const customer1 = await User.create({
      name: "Priya Sharma",
      email: "priya.customer@smartwinnr.com",
      password: "Customer@12345",
      role: "CUSTOMER",
    });

    const customer2 = await User.create({
      name: "Rahul Mehta",
      email: "rahul.customer@smartwinnr.com",
      password: "Customer@12345",
      role: "CUSTOMER",
    });

    const customer3 = await User.create({
      name: "Sophia Rodriguez",
      email: "sophia.customer@smartwinnr.com",
      password: "Customer@12345",
      role: "CUSTOMER",
    });

    console.log("[SeedDemo] Creating restaurants...");

    const restaurants = await Restaurant.create([
      {
        name: "Spice Symphony",
        location: "Hyderabad",
        cuisine: "Indian",
        address: "Road No. 36, Jubilee Hills, Hyderabad",
        description:
          "An authentic celebration of royal Hyderabadi dum pukht and Awadhi delicacies, crafted using age-old ancestral spice blends and slow charcoal brass pot cooking.",
        owner: owner1._id,
      },
      {
        name: "Trattoria Da Tuscany",
        location: "Bangalore",
        cuisine: "Italian",
        address: "100 Feet Road, Indiranagar, Bangalore",
        description:
          "Artisanal wood-fired pizzas, hand-rolled tagliatelle, and authentic Tuscan comfort dishes served in a sunlit rustic courtyard with imported olive oils.",
        owner: owner2._id,
      },
      {
        name: "Sakura Blossom Omakase",
        location: "Mumbai",
        cuisine: "Japanese",
        address: "BKC Gourmet Lane, Bandra Kurla Complex, Mumbai",
        description:
          "Intimate 14-seat cedar wood sushi counter presenting seasonal fish flown in directly from Tokyo Toyosu market alongside aged single malts.",
        owner: owner3._id,
      },
      {
        name: "Cantina La Taqueria",
        location: "Bangalore",
        cuisine: "Mexican",
        address: "Lavelle Road, Central Business District, Bangalore",
        description:
          "Vibrant street taco sanctuary serving slow-braised birria tacos, freshly pressed heirloom corn tortillas, and craft agave mezcal cocktails.",
        owner: null, // Unassigned restaurant for admin demonstration
      },
      {
        name: "L'Etoile Parisian Bistro",
        location: "Delhi",
        cuisine: "French",
        address: "Chanakyapuri Diplomatic Enclave, New Delhi",
        description:
          "Classic Parisian brasserie offering duck confit, beef bourguignon, and fresh buttery viennoiseries in a gilded Belle Époque atmosphere.",
        owner: null,
      },
      {
        name: "Banyan Tree Pan-Asian",
        location: "Hyderabad",
        cuisine: "Pan-Asian",
        address: "Hitec City Cyber Towers Road, Madhapur, Hyderabad",
        description:
          "Contemporary Asian kitchen fusing Thai basil aromas, Vietnamese pho broths, and dim sum steamers under a preserved century-old indoor banyan canopy.",
        owner: null,
      },
    ]);

    console.log("[SeedDemo] Creating reviews with realistic ratings...");

    const rSpice = restaurants[0];
    const rTuscany = restaurants[1];
    const rSakura = restaurants[2];
    const rCantina = restaurants[3];

    // Reviews for Spice Symphony (Hyderabad)
    // Ratings: 5, 4, 4 -> Average: 4.3
    await Review.create([
      {
        customer: customer1._id,
        restaurant: rSpice._id,
        rating: 5,
        content:
          "The Dum Biryani is unequivocally world-class. The rice was deeply fragrant with saffron and cardamom, and the meat melted right off the bone. Exemplary hospitality!",
      },
      {
        customer: customer2._id,
        restaurant: rSpice._id,
        rating: 4,
        content:
          "Splendid ambiance in Jubilee Hills. Loved the Galouti Kebabs and Sheermal. Service was slightly slow on Saturday night, but the flavors were worth every second.",
      },
      {
        customer: customer3._id,
        restaurant: rSpice._id,
        rating: 4,
        content:
          "Wonderful depth of flavors! You can taste the slow simmering technique. The garlic naan and dal makhani pairing was heavenly.",
      },
    ]);

    // Reviews for Trattoria Da Tuscany (Bangalore)
    // Ratings: 5, 5 -> Average: 5.0
    await Review.create([
      {
        customer: customer1._id,
        restaurant: rTuscany._id,
        rating: 5,
        content:
          "The burrata truffle pizza and wild mushroom risotto are out of this world. Felt like dining right in Florence. Will return every weekend!",
      },
      {
        customer: customer2._id,
        restaurant: rTuscany._id,
        rating: 5,
        content:
          "Crisp Neapolitan crust, San Marzano tomato sweetness, and silky house-made tiramisu. Outstanding wine pairing guidance by Chef Marco.",
      },
    ]);

    // Reviews for Sakura Blossom (Mumbai)
    // Ratings: 4, 3 -> Average: 3.5
    await Review.create([
      {
        customer: customer2._id,
        restaurant: rSakura._id,
        rating: 4,
        content:
          "Exceptionally fresh hamachi and otoro nigiri. The wasabi is freshly grated. Premium pricing, but truly authentic Japanese craftsmanship.",
      },
      {
        customer: customer3._id,
        restaurant: rSakura._id,
        rating: 3,
        content:
          "Fish quality was undeniably fresh, but the seating felt quite cramped and the omakase pacing was a bit rushed towards the final course.",
      },
    ]);

    // Reviews for Cantina La Taqueria (Bangalore)
    // Rating: 5
    await Review.create([
      {
        customer: customer3._id,
        restaurant: rCantina._id,
        rating: 5,
        content:
          "Best birria tacos in Bangalore without question! The consommé for dipping has so much rich chili complexity. Great music and lively crowd.",
      },
    ]);

    console.log("\n=======================================================");
    console.log("   SMARTWINNR SEED DATA INITIALIZED SUCCESSFULLY");
    console.log("=======================================================");
    console.log("Sample User Accounts (Password for all accounts: see below):");
    console.log("-------------------------------------------------------");
    console.log("1. ADMINISTRATOR:");
    console.log(`   Email:    admin@smartwinnr.com`);
    console.log(`   Password: Admin@12345`);
    console.log("\n2. RESTAURANT OWNER (Spice Symphony):");
    console.log(`   Email:    owner.spice@smartwinnr.com`);
    console.log(`   Password: Owner@12345`);
    console.log("\n3. RESTAURANT OWNER (Trattoria Da Tuscany):");
    console.log(`   Email:    owner.tuscany@smartwinnr.com`);
    console.log(`   Password: Owner@12345`);
    console.log("\n4. CUSTOMER:");
    console.log(`   Email:    priya.customer@smartwinnr.com`);
    console.log(`   Password: Customer@12345`);
    console.log("\n5. CUSTOMER:");
    console.log(`   Email:    rahul.customer@smartwinnr.com`);
    console.log(`   Password: Customer@12345`);
    console.log("=======================================================\n");

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("[SeedDemo] Seeding failed:", error);
    try { await disconnectDB(); } catch (e) {}
    process.exit(1);
  }
};

seedDemoData();
