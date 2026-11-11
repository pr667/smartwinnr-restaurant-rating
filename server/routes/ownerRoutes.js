const express = require("express");
const router = express.Router();
const {
  getOwnerRestaurant,
  updateOwnerRestaurant,
  getOwnerRestaurantReviews,
  getOwnerRestaurantAnalytics,
} = require("../controllers/ownerController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All owner routes require authentication and OWNER role
router.use(authenticateUser, authorizeRoles("OWNER"));

router.get("/restaurant", getOwnerRestaurant);
router.patch("/restaurant", updateOwnerRestaurant);
router.get("/restaurant/reviews", getOwnerRestaurantReviews);
router.get("/restaurant/analytics", getOwnerRestaurantAnalytics);

module.exports = router;
