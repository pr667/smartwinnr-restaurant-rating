require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const { connectDB, disconnectDB } = require("../config/db");

const seedDemoData = async () => {
  try {
    console.log("[SeedDemo] Connecting to database...");
    const conn = await connectDB();

    // Verify database scope safety: strictly ensure we are on smartwinnr_restaurant_db
    if (conn.connection.name !== "smartwinnr_restaurant_db") {
      throw new Error(
        `Safety Abort: seedDemo is restricted to 'smartwinnr_restaurant_db'. Current database is '${conn.connection.name}'.`
      );
    }

    console.log("[SeedDemo] Verifying model indexes in Atlas...");
    await Promise.all([
      User.init(),
      Restaurant.init(),
      Review.init(),
    ]);

    console.log("[SeedDemo] Checking / initializing users idempotently...");

    // Helper to find or create a user without overwriting existing passwords
    const findOrCreateUser = async (name, email, password, role) => {
      const normalizedEmail = email.toLowerCase().trim();
      let user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        user = await User.create({
          name,
          email: normalizedEmail,
          password,
          role,
        });
        console.log(`  + Created ${role}: ${normalizedEmail}`);
      } else {
        console.log(`  = Existing ${role}: ${normalizedEmail} (preserved, password unchanged)`);
      }
      return user;
    };

    // 1. Admin
    const adminEmail = "demo.admin@smartwinnr.com";
    const admin = await findOrCreateUser(
      process.env.ADMIN_NAME || "Platform Administrator",
      adminEmail,
      "DemoAdmin@2026",
      "ADMIN"
    );

    // 2. Restaurant Owners
    const owner1 = await findOrCreateUser("Chef Rajesh Verma", "owner.spice@smartwinnr.com", "OwnerDemo@2026", "OWNER");
    const owner2 = await findOrCreateUser("Marco Bellini", "owner.tuscany@smartwinnr.com", "OwnerDemo@2026", "OWNER");

    // 3. Customers
    const customer1 = await findOrCreateUser("Priya Sharma", "priya.customer@smartwinnr.com", "CustomerDemo@2026", "CUSTOMER");
    const customer2 = await findOrCreateUser("Rahul Mehta", "rahul.customer@smartwinnr.com", "CustomerDemo@2026", "CUSTOMER");

    console.log("[SeedDemo] Checking / initializing restaurants idempotently...");

    const restaurantDefinitions = [
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
        location: "Hyderabad",
        cuisine: "Japanese",
        address: "Jubilee Hills Road No. 10, Hyderabad",
        description: "A seasonal sushi counter pairing careful Japanese technique with locally sourced produce.",
        owner: owner1._id,
      },
      {
        name: "Cantina La Taqueria",
        location: "Bangalore",
        cuisine: "Mexican",
        address: "Lavelle Road, Central Business District, Bangalore",
        description:
          "Vibrant street taco sanctuary serving slow-braised birria tacos, freshly pressed heirloom corn tortillas, and craft agave mezcal cocktails.",
        owner: owner2._id,
      },
      {
        name: "L'Etoile Parisian Bistro",
        location: "Bangalore",
        cuisine: "French",
        address: "Lavelle Road, Bengaluru",
        description:
          "Classic Parisian brasserie offering duck confit, beef bourguignon, and fresh buttery viennoiseries in a gilded Belle Époque atmosphere.",
        owner: null,
      },
      {
        name: "Banyan Tree Pan-Asian",
        location: "Bangalore",
        cuisine: "Pan-Asian",
        address: "Indiranagar, Bengaluru",
        description:
          "Contemporary Asian kitchen fusing Thai basil aromas, Vietnamese pho broths, and dim sum steamers under a preserved century-old indoor banyan canopy.",
        owner: null,
      },
    ];

    const restaurantDocs = [];
    for (const def of restaurantDefinitions) {
      let r = await Restaurant.findOne({ name: def.name });
      if (!r) {
        r = await Restaurant.create(def);
        console.log(`  + Created restaurant: ${r.name}`);
      } else {
        console.log(`  = Existing restaurant: ${r.name}`);
      }
      restaurantDocs.push(r);
    }

    console.log("[SeedDemo] Checking / initializing reviews idempotently...");

    const rSpice = restaurantDocs[0];
    const rTuscany = restaurantDocs[1];
    const rSakura = restaurantDocs[2];
    const rCantina = restaurantDocs[3];
    const rEtoile = restaurantDocs[4];
    const rBanyan = restaurantDocs[5];

    const reviewDefinitions = [
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
      {
        customer: customer2._id,
        restaurant: rSakura._id,
        rating: 4,
        content:
          "Exceptionally fresh hamachi and otoro nigiri. The wasabi is freshly grated. Premium pricing, but truly authentic Japanese craftsmanship.",
      },
      {
        customer: customer1._id,
        restaurant: rSakura._id,
        rating: 3,
        content:
          "Fish quality was undeniably fresh, but the seating felt quite cramped and the omakase pacing was a bit rushed towards the final course.",
      },
      {
        customer: customer2._id,
        restaurant: rCantina._id,
        rating: 5,
        content:
          "Best birria tacos in Bangalore without question! The consommé for dipping has so much rich chili complexity. Great music and lively crowd.",
      },
      { customer: customer1._id, restaurant: rCantina._id, rating: 2, content: "Fresh tortillas, though the filling was dry and service ran slowly." },
      { customer: customer1._id, restaurant: rEtoile._id, rating: 4, content: "Thoughtful French plates and a relaxed room; the desserts stood out." },
      { customer: customer2._id, restaurant: rEtoile._id, rating: 3, content: "Enjoyed the ambience, but a couple of dishes arrived lukewarm." },
      { customer: customer1._id, restaurant: rBanyan._id, rating: 4, content: "Excellent shared plates with bright herbs and a generous vegetarian menu." },
      { customer: customer2._id, restaurant: rBanyan._id, rating: 1, content: "Long wait and disappointing seasoning on the dishes we tried." },
    ];

    for (const revDef of reviewDefinitions) {
      const existing = await Review.findOne({
        customer: revDef.customer,
        restaurant: revDef.restaurant,
      });
      if (!existing) {
        await Review.create(revDef);
        console.log(`  + Created review by customer ${revDef.customer}`);
      } else {
        console.log(`  = Existing review preserved`);
      }
    }

    console.log("\n=======================================================");
    console.log("   SMARTWINNR SEED DATA VERIFICATION COMPLETED");
    console.log("=======================================================");
    console.log("Database: smartwinnr_restaurant_db (RoommateRadar untouched)");
    console.log("Sample User Accounts (Password for all accounts: see README):");
    console.log("-------------------------------------------------------");
    console.log("1. ADMINISTRATOR:                 demo.admin@smartwinnr.com");
    console.log("2. RESTAURANT OWNER (Spice):      owner.spice@smartwinnr.com");
    console.log("3. RESTAURANT OWNER (Tuscany):    owner.tuscany@smartwinnr.com");
    console.log("4. CUSTOMER (Priya):              priya.customer@smartwinnr.com");
    console.log("5. CUSTOMER (Rahul):              rahul.customer@smartwinnr.com");
    console.log("=======================================================\n");

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("[SeedDemo] Seeding failed:", error.message);
    try { await disconnectDB(); } catch (e) {}
    process.exit(1);
  }
};

seedDemoData();
