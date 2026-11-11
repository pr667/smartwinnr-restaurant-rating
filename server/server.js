require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const Review = require("./models/Review");
const User = require("./models/User");
const Restaurant = require("./models/Restaurant");

const PORT = parseInt(process.env.PORT, 10) || 5000;

// Step 2: Validate required configuration before starting
const validateConfig = () => {
  const missing = [];
  if (!process.env.MONGO_URI || !process.env.MONGO_URI.trim()) {
    missing.push("MONGO_URI");
  }
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    missing.push("JWT_SECRET");
  }

  if (missing.length > 0) {
    throw new Error(
      `Fatal Configuration Error: Missing required environment variable(s): ${missing.join(", ")} in server/.env`
    );
  }

  if (process.env.JWT_SECRET.length < 32) {
    console.warn("[Security Warning] JWT_SECRET is less than 32 characters. Consider rotating with crypto.randomBytes(64).");
  }
};

const startServer = async () => {
  try {
    console.log("[Server] Validating application configuration...");
    validateConfig();

    console.log("[Server] Initializing MongoDB Atlas connection...");
    const conn = await connectDB();

    // Step 5: Initialize essential indexes before accepting requests
    console.log("[Server] Synchronizing database indexes...");
    await Promise.all([
      User.init(),
      Restaurant.init(),
      Review.init(),
    ]);

    // Verify compound unique review index exists
    const reviewIndexes = await Review.collection.indexes();
    const hasCompoundUnique = reviewIndexes.some(
      (idx) => idx.unique && idx.key && idx.key.customer === 1 && idx.key.restaurant === 1
    );

    if (hasCompoundUnique) {
      console.log("[Server] Verified: Compound unique review index { customer: 1, restaurant: 1 } is active.");
    } else {
      console.warn("[Server Warning] Compound unique review index was not detected in active collection indexes.");
    }

    const server = app.listen(PORT, () => {
      console.log(`[Server] SmartWinnr API listening on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`[Server] Database: ${conn.connection.name}`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      console.log("\n[Server] Gracefully shutting down...");
      server.close(() => {
        console.log("[Server] HTTP server closed.");
        process.exit(0);
      });
    };

    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);
  } catch (error) {
    console.error("[Server] Fatal startup error:", error.message);
    process.exit(1);
  }
};

startServer();
