require("dotenv").config({ path: __dirname + "/../.env" });
const http = require("http");
const app = require("../app");
const { connectDB, disconnectDB } = require("../config/db");

let server;
let baseUrl;

const request = (method, path, body = null, token = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers,
      },
      (res) => {
        let rawData = "";
        res.on("data", (chunk) => (rawData += chunk));
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(rawData);
          } catch (e) {
            json = rawData;
          }
          resolve({ status: res.statusCode, headers: res.headers, data: json });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
};

const runTests = async () => {
  console.log("\n=======================================================");
  console.log("   SMARTWINNR PLATFORM COMPREHENSIVE AUTOMATED TEST SUITE");
  console.log("=======================================================\n");

  await connectDB();

  // Start temporary test server
  server = app.listen(0);
  const port = server.address().port;
  baseUrl = `http://127.0.0.1:${port}`;
  console.log(`[Test Suite] Test HTTP server listening on ${baseUrl}\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = "") => {
    if (condition) {
      console.log(`  ✓ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ✕ FAIL: ${testName} ${details ? `(${details})` : ""}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    console.log("[1. System Health]");
    const health = await request("GET", "/api/health");
    assert(health.status === 200 && health.data.status === "ok", "API health endpoint returns 200 OK");

    // 2. Authentication & Validation Tests
    console.log("\n[2. Authentication & Validation]");

    // Invalid password rejected
    const weakPass = await request("POST", "/api/auth/register", {
      name: "Weak User",
      email: "weak@smartwinnr.com",
      password: "weak",
    });
    assert(weakPass.status === 400, "Registration rejects weak password (HTTP 400)");

    // Valid Customer Registration
    const testEmail = `test.diner.${Date.now()}@smartwinnr.com`;
    const reg = await request("POST", "/api/auth/register", {
      name: "Automated Diner",
      email: testEmail,
      password: "Customer@12345",
      confirmPassword: "Customer@12345",
      role: "ADMIN", // Sneakily attempting privilege escalation
    });
    assert(reg.status === 201 && reg.data.token, "Customer registration succeeds with HTTP 201");
    assert(reg.data.user.role === "CUSTOMER", "Public registration role is strictly forced to CUSTOMER");

    // Duplicate email registration rejected
    const dupReg = await request("POST", "/api/auth/register", {
      name: "Duplicate Diner",
      email: testEmail,
      password: "Customer@12345",
    });
    assert(dupReg.status === 409, "Duplicate email registration rejected with HTTP 409");

    // Customer Login
    const custLogin = await request("POST", "/api/auth/login", {
      email: "priya.customer@smartwinnr.com",
      password: "Customer@12345",
    });
    assert(custLogin.status === 200 && custLogin.data.token, "Customer login succeeds with HTTP 200 and JWT");
    const customerToken = custLogin.data.token;

    // Owner Login
    const ownerLogin = await request("POST", "/api/auth/login", {
      email: "owner.spice@smartwinnr.com",
      password: "Owner@12345",
    });
    assert(ownerLogin.status === 200 && ownerLogin.data.token, "Owner login succeeds with HTTP 200 and JWT");
    const ownerToken = ownerLogin.data.token;

    // Admin Login
    const adminLogin = await request("POST", "/api/auth/login", {
      email: "admin@smartwinnr.com",
      password: "Admin@12345",
    });
    assert(adminLogin.status === 200 && adminLogin.data.token, "Admin login succeeds with HTTP 200 and JWT");
    const adminToken = adminLogin.data.token;

    // 3. Role-Based Authorization
    console.log("\n[3. Role-Based Authorization]");
    const custToAdmin = await request("GET", "/api/admin/dashboard", null, customerToken);
    assert(custToAdmin.status === 403, "Customer blocked from Admin API (HTTP 403 Forbidden)");

    const custToOwner = await request("GET", "/api/owner/restaurant", null, customerToken);
    assert(custToOwner.status === 403, "Customer blocked from Owner API (HTTP 403 Forbidden)");

    const ownerToAdmin = await request("GET", "/api/admin/dashboard", null, ownerToken);
    assert(ownerToAdmin.status === 403, "Owner blocked from Admin API (HTTP 403 Forbidden)");

    const unauthAccess = await request("GET", "/api/reviews/me", null, null);
    assert(unauthAccess.status === 401, "Unauthenticated request rejected with HTTP 401");

    // 4. Restaurant Discovery & Query Filters
    console.log("\n[4. Restaurant Discovery, Search & Filters]");
    const allRestaurants = await request("GET", "/api/restaurants", null, customerToken);
    assert(allRestaurants.status === 200 && allRestaurants.data.restaurants.length > 0, "Public restaurant listing returns records");
    const restaurantsList = allRestaurants.data.restaurants;
    const spiceRest = restaurantsList.find((r) => r.name.includes("Spice"));
    assert(!!spiceRest, "Spice Symphony found in restaurant directory");

    // Search filter
    const searchRes = await request("GET", "/api/restaurants?search=Spice");
    assert(searchRes.status === 200 && searchRes.data.restaurants.every((r) => /spice/i.test(r.name)), "Backend search filter accurately matches restaurant name");

    // Location filter
    const locRes = await request("GET", "/api/restaurants?location=Hyderabad");
    assert(locRes.status === 200 && locRes.data.restaurants.every((r) => /hyderabad/i.test(r.location)), "Backend location filter matches restaurants");

    // Combined filter
    const combinedRes = await request("GET", "/api/restaurants?location=Hyderabad&cuisine=Indian");
    assert(combinedRes.status === 200 && combinedRes.data.restaurants.length > 0, "Combined location & cuisine filters work in tandem");

    // 5. Review CRUD & Compound Unique Index Enforcement
    console.log("\n[5. Review CRUD & Compound Unique Constraint]");
    const rId = spiceRest._id;

    // Check personal rating enrichment for Priya
    const details = await request("GET", `/api/restaurants/${rId}`, null, customerToken);
    assert(details.status === 200, "Restaurant details endpoint returns 200");
    assert(details.data.customerReview !== null, "Authenticated customer review properly identified in details");

    // Priya trying to submit SECOND review for Spice Symphony -> HTTP 409
    const dupReview = await request("POST", `/api/restaurants/${rId}/reviews`, {
      rating: 4,
      content: "Attempting duplicate review for Spice Symphony",
    }, customerToken);
    assert(dupReview.status === 409, "Duplicate review rejected with HTTP 409 'You have already reviewed this restaurant'");

    // Rating value boundary checks: reject 0, 6, 3.5
    const zeroRating = await request("POST", `/api/restaurants/${restaurantsList[4]._id}/reviews`, {
      rating: 0,
      content: "Testing 0 rating",
    }, customerToken);
    assert(zeroRating.status === 400, "Rating 0 rejected (HTTP 400)");

    const sixRating = await request("POST", `/api/restaurants/${restaurantsList[4]._id}/reviews`, {
      rating: 6,
      content: "Testing 6 rating",
    }, customerToken);
    assert(sixRating.status === 400, "Rating 6 rejected (HTTP 400)");

    const floatRating = await request("POST", `/api/restaurants/${restaurantsList[4]._id}/reviews`, {
      rating: 3.5,
      content: "Testing float rating",
    }, customerToken);
    assert(floatRating.status === 400, "Float rating 3.5 rejected (HTTP 400)");

    // Valid review submission for L'Etoile (unreviewed by Priya)
    const frenchRest = restaurantsList.find((r) => r.cuisine === "French");
    const validRev = await request("POST", `/api/restaurants/${frenchRest._id}/reviews`, {
      rating: 5,
      content: "Exquisite French cuisine with delicate buttery flavors.",
    }, customerToken);
    assert(validRev.status === 201 && validRev.data.review, "Valid review submitted successfully (HTTP 201)");
    const newRevId = validRev.data.review._id;

    // Update own review
    const updateRev = await request("PATCH", `/api/reviews/${newRevId}`, {
      rating: 4,
      content: "Updated review: Excellent ambiance and dessert.",
    }, customerToken);
    assert(updateRev.status === 200 && updateRev.data.review.rating === 4, "Customer can update own review (HTTP 200)");

    // Delete own review
    const delRev = await request("DELETE", `/api/reviews/${newRevId}`, null, customerToken);
    assert(delRev.status === 200, "Customer can delete own review (HTTP 200)");

    // 6. Owner Functionality
    console.log("\n[6. Restaurant Owner Console]");
    const ownerRest = await request("GET", "/api/owner/restaurant", null, ownerToken);
    assert(ownerRest.status === 200 && ownerRest.data.restaurant.name === "Spice Symphony", "Owner retrieves assigned restaurant via JWT identity");

    const ownerUpdate = await request("PATCH", "/api/owner/restaurant", {
      description: "Updated description by Chef Rajesh Verma verified proprietor.",
    }, ownerToken);
    assert(ownerUpdate.status === 200, "Owner can update permitted restaurant details (HTTP 200)");

    const ownerReassignAttempt = await request("PATCH", "/api/owner/restaurant", {
      owner: "660000000000000000000099",
    }, ownerToken);
    assert(ownerReassignAttempt.status === 403, "Owner is strictly forbidden from reassigning ownership (HTTP 403)");

    const ownerReviews = await request("GET", "/api/owner/restaurant/reviews", null, ownerToken);
    assert(ownerReviews.status === 200 && ownerReviews.data.reviews.length > 0, "Owner retrieves customer reviews with verified names");

    // 7. Administrator Management & Aggregation
    console.log("\n[7. Administrator Management & Aggregations]");
    const adminDash = await request("GET", "/api/admin/dashboard", null, adminToken);
    assert(adminDash.status === 200, "Admin dashboard stats retrieved successfully");
    const { totalUsers, totalRestaurants: totRest, totalReviews: totRev, averagePlatformRating, ratingDistribution } = adminDash.data.stats;

    assert(totalUsers >= 6, `Admin totalUsers query accurate: ${totalUsers}`);
    assert(totRest >= 6, `Admin totalRestaurants query accurate: ${totRest}`);
    assert(totRev >= 6, `Admin totalReviews query accurate: ${totRev}`);
    assert(typeof averagePlatformRating === "number" && averagePlatformRating > 0, `Average platform rating calculated via MongoDB aggregation: ${averagePlatformRating}`);
    assert(
      ratingDistribution.hasOwnProperty("5") &&
      ratingDistribution.hasOwnProperty("4") &&
      ratingDistribution.hasOwnProperty("3") &&
      ratingDistribution.hasOwnProperty("2") &&
      ratingDistribution.hasOwnProperty("1"),
      "Rating distribution always returns all 5 star buckets (1 through 5)"
    );

    // Self-deletion safeguard
    const myProfile = await request("GET", "/api/auth/me", null, adminToken);
    const selfDel = await request("DELETE", `/api/admin/users/${myProfile.data.user._id}`, null, adminToken);
    assert(selfDel.status === 400, "Administrator self-deletion is prevented by security safeguard (HTTP 400)");

    // Admin create new owner
    const newOwnerRes = await request("POST", "/api/admin/owners", {
      name: "Chef Test Owner",
      email: `owner.test.${Date.now()}@smartwinnr.com`,
      password: "Owner@12345",
    }, adminToken);
    assert(newOwnerRes.status === 201 && newOwnerRes.data.owner.role === "OWNER", "Admin creates restaurant owner account (HTTP 201)");

    console.log("\n=======================================================");
    console.log(`   TEST SUITE EXECUTION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log("=======================================================\n");

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("[Test Suite] Unhandled error during test execution:", err);
    process.exit(1);
  } finally {
    if (server) server.close();
    await disconnectDB();
  }
};

runTests();
