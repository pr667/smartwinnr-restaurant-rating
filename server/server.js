require("dotenv").config();
const app = require("./app");
const { connectDB } = require("./config/db");
const Review = require("./models/Review");
const User = require("./models/User");
const Restaurant = require("./models/Restaurant");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log("[Server] Initializing database connection...");
    await connectDB();

    // Ensure all model indexes are built, specifically the compound unique review index
    console.log("[Server] Synchronizing database indexes...");
    await Promise.all([
      User.init(),
      Restaurant.init(),
      Review.init(),
    ]);
    console.log("[Server] Compound unique review index & model indexes verified.");

    const server = app.listen(PORT, () => {
      console.log(`[Server] SmartWinnr API listening on http://localhost:${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
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
    console.error("[Server] Fatal startup error:", error);
    process.exit(1);
  }
};

startServer();
