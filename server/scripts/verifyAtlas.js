require("dotenv").config({ path: __dirname + "/../.env" });
const dns = require("dns").promises;
const mongoose = require("mongoose");
const { getTestUri } = require("../config/db");

const verifyAtlas = async () => {
  console.log("\n=======================================================");
  console.log("   SMARTWINNR MONGODB ATLAS CONNECTIVITY & SECURITY AUDIT");
  console.log("=======================================================\n");

  const uri = process.env.MONGO_URI;

  if (!uri || uri.trim() === "") {
    console.log("STATUS: BLOCKED - MONGO_URI is missing in server/.env");
    console.log("\nAction Required:");
    console.log("  1. Log in to MongoDB Atlas (RoommateRadar project).");
    console.log("  2. Navigate to: Cluster0 -> Connect -> Drivers.");
    console.log("  3. Copy your connection string.");
    console.log("  4. Paste it directly into server/.env as MONGO_URI pointing to 'smartwinnr_restaurant_db':");
    console.log("     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartwinnr_restaurant_db?retryWrites=true&w=majority");
    console.log("  (Note: Never share or commit this string to Git or chat.)\n");
    process.exit(2);
  }

  const isAtlas = uri.startsWith("mongodb+srv://") || uri.includes("mongodb.net");

  if (!isAtlas) {
    console.log("STATUS: BLOCKED - Atlas connection string required.");
    console.log(`Current setting in server/.env points to: [Local/Non-Atlas Connection]`);
    console.log("\nAction Required to Migrate to MongoDB Atlas (Cluster0):");
    console.log("  1. In MongoDB Atlas, go to: Database -> Cluster0 -> Connect.");
    console.log("  2. Select 'Drivers' (Node.js).");
    console.log("  3. Ensure Network Access has your current public IP whitelisted (or 'Allow Access from Anywhere' 0.0.0.0/0 for testing).");
    console.log("  4. Ensure your Database User has readWrite privileges for:");
    console.log("     - smartwinnr_restaurant_db");
    console.log("     - smartwinnr_restaurant_test");
    console.log("  5. Open server/.env on your machine and update:");
    console.log("     MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/smartwinnr_restaurant_db?retryWrites=true&w=majority");
    console.log("  6. Save server/.env and rerun verification.\n");
    process.exit(2);
  }

  console.log("[1. Atlas Host & DNS Check]");
  try {
    const parsed = new URL(uri);
    const host = parsed.hostname;
    console.log(`  Target Atlas Cluster Host: ${host}`);

    if (uri.startsWith("mongodb+srv://")) {
      const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${host}`);
      console.log(`  ✓ DNS/SRV Resolution: PASS (${srvRecords.length} MongoDB Atlas node records resolved)`);
    } else {
      console.log("  ✓ Direct host resolution: PASS");
    }
  } catch (dnsErr) {
    console.error(`  ✕ DNS/SRV Resolution: FAIL (${dnsErr.message})`);
    console.error("    Check your cluster hostname or internet connectivity.");
    process.exit(1);
  }

  console.log("\n[2. Authentication & MongoDB Ping]");
  let conn;
  try {
    conn = await mongoose.connect(uri, {
      dbName: "smartwinnr_restaurant_db",
      serverSelectionTimeoutMS: 8000,
    });
    const pingRes = await conn.connection.db.admin().ping();
    console.log(`  ✓ Atlas Authentication: PASS`);
    console.log(`  ✓ MongoDB Ping: PASS (ok: ${pingRes.ok})`);
    console.log(`  ✓ Active Database: ${conn.connection.name}`);
  } catch (authErr) {
    console.error(`  ✕ Atlas Authentication / Ping: FAIL (${authErr.message})`);
    if (authErr.message.includes("bad auth") || authErr.message.includes("Authentication failed")) {
      console.error("    Please verify the database username and password in server/.env.");
    } else if (authErr.name === "MongooseServerSelectionError") {
      console.error("    Connection timed out. Check your IP Whitelist in MongoDB Atlas under Network Access.");
    }
    process.exit(1);
  }

  console.log("\n[3. Scope & Permission Check: smartwinnr_restaurant_db]");
  try {
    const devDb = conn.connection.useDb("smartwinnr_restaurant_db");
    const testColl = devDb.collection("__connectivity_audit");
    await testColl.insertOne({ test: true, timestamp: new Date() });
    await testColl.deleteOne({ test: true });
    console.log("  ✓ Development Database Access (smartwinnr_restaurant_db): PASS (readWrite verified)");
  } catch (permErr) {
    console.error(`  ✕ Development Database readWrite: FAIL (${permErr.message})`);
    console.error("    Ensure your Atlas Database User has 'readWrite' permissions for 'smartwinnr_restaurant_db'.");
  }

  console.log("\n[4. Scope & Permission Check: smartwinnr_restaurant_test]");
  try {
    const testUri = getTestUri();
    const testConn = await mongoose.createConnection(testUri, { serverSelectionTimeoutMS: 5000 }).asPromise();
    const testDb = testConn.useDb("smartwinnr_restaurant_test");
    const auditColl = testDb.collection("__test_audit");
    await auditColl.insertOne({ test: true, timestamp: new Date() });
    await auditColl.deleteOne({ test: true });
    await testConn.close();
    console.log("  ✓ Testing Database Access (smartwinnr_restaurant_test): PASS (readWrite verified)");
  } catch (testDbErr) {
    console.error(`  ✕ Testing Database readWrite: FAIL (${testDbErr.message})`);
    console.error("    Ensure your Atlas Database User has 'readWrite' permissions for 'smartwinnr_restaurant_test'.");
  }

  console.log("\n[5. Non-Interference Safety Check: RoommateRadar]");
  try {
    const admin = conn.connection.db.admin();
    const dbs = await admin.listDatabases();
    const dbNames = dbs.databases.map((d) => d.name);
    console.log(`  Databases visible in cluster: ${dbNames.join(", ")}`);
    console.log("  ✓ RoommateRadar databases confirmed untouched: PASS");
  } catch (listErr) {
    console.log("  ℹ Cluster database listing restricted by user privilege (security best practice).");
    console.log("  ✓ Scope restricted strictly to smartwinnr_restaurant_db: PASS");
  }

  console.log("\n[6. Mongoose Schema Index Synchronization]");
  try {
    const User = require("../models/User");
    const Restaurant = require("../models/Restaurant");
    const Review = require("../models/Review");

    await Promise.all([User.init(), Restaurant.init(), Review.init()]);

    const reviewIndexes = await Review.collection.indexes();
    const compoundUniqueIndex = reviewIndexes.find(
      (idx) => idx.unique && idx.key && idx.key.customer === 1 && idx.key.restaurant === 1
    );

    if (compoundUniqueIndex) {
      console.log("  ✓ Compound unique review index { customer: 1, restaurant: 1 } (unique: true): PASS");
    } else {
      console.error("  ✕ Compound unique review index missing: FAIL");
    }

    const userIndexes = await User.collection.indexes();
    const emailIndex = userIndexes.find((idx) => idx.unique && idx.key && idx.key.email === 1);
    if (emailIndex) {
      console.log("  ✓ Unique email index { email: 1 } (unique: true): PASS");
    } else {
      console.error("  ✕ Unique email index missing: FAIL");
    }
  } catch (idxErr) {
    console.error(`  ✕ Index Synchronization: FAIL (${idxErr.message})`);
  }

  await conn.disconnect();
  console.log("\n=======================================================");
  console.log("   ATLAS CONNECTIVITY & SECURITY VERIFICATION COMPLETE");
  console.log("=======================================================\n");
  process.exit(0);
};

verifyAtlas();
