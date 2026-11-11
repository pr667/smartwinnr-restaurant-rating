const express = require("express");
const router = express.Router();
const {
  getRestaurants,
  getRestaurantById,
  getRestaurantReviews,
} = require("../controllers/restaurantController");
const { createReview } = require("../controllers/reviewController");
const {
  authenticateUser,
  optionalAuthenticateUser,
} = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// Public browsing (enriches personal rating if user is logged in)
router.get("/", optionalAuthenticateUser, getRestaurants);
router.get("/:id", optionalAuthenticateUser, getRestaurantById);
router.get("/:id/reviews", getRestaurantReviews);

// Customer submits review for a restaurant
router.post(
  "/:id/reviews",
  authenticateUser,
  authorizeRoles("CUSTOMER"),
  createReview
);

module.exports = router;
