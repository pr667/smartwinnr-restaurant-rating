const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getUsers,
  updateUser,
  deleteUser,
  createOwner,
  getAdminRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getAdminReviews,
  deleteAdminReview,
} = require("../controllers/adminController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All admin routes require authentication and ADMIN role
router.use(authenticateUser, authorizeRoles("ADMIN"));

// Admin Dashboard stats
router.get("/dashboard", getDashboardStats);

// User management
router.get("/users", getUsers);
router.patch("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Owner creation
router.post("/owners", createOwner);

// Restaurant management
router.get("/restaurants", getAdminRestaurants);
router.post("/restaurants", createRestaurant);
router.patch("/restaurants/:id", updateRestaurant);
router.delete("/restaurants/:id", deleteRestaurant);

// Review management
router.get("/reviews", getAdminReviews);
router.delete("/reviews/:id", deleteAdminReview);

module.exports = router;
