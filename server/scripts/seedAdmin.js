require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const User = require("../models/User");
const { connectDB, disconnectDB } = require("../config/db");

const seedAdmin = async () => {
  try {
    const conn = await connectDB();

    if (conn.connection.name !== "smartwinnr_restaurant_db") {
      throw new Error(
        `Safety Abort: seedAdmin is restricted to 'smartwinnr_restaurant_db'. Current database is '${conn.connection.name}'.`
      );
    }

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@smartwinnr.com").toLowerCase().trim();
    const adminName = process.env.ADMIN_NAME || "Platform Administrator";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@12345";

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[SeedAdmin] Administrator account '${adminEmail}' already exists (ID: ${existingAdmin._id}). Ensuring role is ADMIN...`);
      if (existingAdmin.role !== "ADMIN") {
        existingAdmin.role = "ADMIN";
        await existingAdmin.save();
      }
    } else {
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: "ADMIN",
      });
      console.log(`[SeedAdmin] Administrator successfully created!`);
      console.log(`Email: ${admin.email}`);
      console.log(`Role: ${admin.role}`);
    }

    console.log("[SeedAdmin] Done.");
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error("[SeedAdmin] Error initializing administrator:", error.message);
    try { await disconnectDB(); } catch (e) {}
    process.exit(1);
  }
};

seedAdmin();
