const mongoose = require("mongoose");

/**
 * Derives a test connection URI programmatically from MONGO_URI
 * using URL parser, preserving host and credentials while switching
 * database name to smartwinnr_restaurant_test.
 */
const getTestUri = () => {
  if (process.env.MONGO_TEST_URI && process.env.MONGO_TEST_URI.trim()) {
    return process.env.MONGO_TEST_URI.trim();
  }

  const baseUri = process.env.MONGO_URI;
  if (!baseUri) {
    throw new Error("MONGO_URI is not defined in environment variables.");
  }

  try {
    const parsed = new URL(baseUri);
    parsed.pathname = "/smartwinnr_restaurant_test";
    return parsed.toString();
  } catch (err) {
    // If URL parsing fails, throw clear error
    throw new Error("Failed to derive test database URI from MONGO_URI: " + err.message);
  }
};

/**
 * Connects to MongoDB Atlas development database
 * Strictly validates Atlas configuration and runs a ping verification.
 */
const connectDB = async (customUri = null) => {
  const uri = customUri || process.env.MONGO_URI;

  if (!uri || uri.trim() === "") {
    throw new Error(
      "Configuration Error: MONGO_URI is missing in server/.env.\n" +
      "Please obtain your MongoDB Atlas connection string from:\n" +
      "MongoDB Atlas -> Cluster0 -> Connect -> Drivers\n" +
      "and set MONGO_URI in server/.env pointing to 'smartwinnr_restaurant_db'."
    );
  }

  let parsedUri;
  try {
    parsedUri = new URL(uri);
  } catch {
    throw new Error("Configuration Error: MongoDB URI is invalid.");
  }
  if (parsedUri.hostname !== "cluster0.tx2biog.mongodb.net") {
    throw new Error("Configuration Error: MongoDB URI must target the configured Atlas Cluster0 hostname.");
  }
  if (customUri) {
    const database = decodeURIComponent(parsedUri.pathname.replace(/^\//, "").split("/")[0]);
    if (database !== "smartwinnr_restaurant_test") {
      throw new Error("Safety Violation: custom test connection must target smartwinnr_restaurant_test.");
    }
  }

  try {
    const conn = await mongoose.connect(uri, {
      dbName: customUri ? undefined : "smartwinnr_restaurant_db",
      serverSelectionTimeoutMS: 5000,
    });

    // Execute real ping to verify database responsiveness
    await conn.connection.db.admin().ping();
    const isAtlas = conn.connection.host.includes("mongodb.net");

    console.log(
      `[Database] Connected successfully to ${isAtlas ? "MongoDB Atlas" : "host: " + conn.connection.host} | Database: ${conn.connection.name}`
    );

    return conn;
  } catch (err) {
    console.error(`[Database Error] MongoDB connection failed: ${err.message}`);
    if (err.name === "MongooseServerSelectionError") {
      console.error(
        "[Troubleshooting] Ensure that:\n" +
        "1. Your current IP address is whitelisted in MongoDB Atlas under Network Access.\n" +
        "2. The database user credentials in server/.env are correct and have readWrite privileges.\n" +
        "3. Network connectivity allows outbound TLS to your Atlas cluster."
      );
    }
    throw err;
  }
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

module.exports = { connectDB, disconnectDB, getTestUri };
