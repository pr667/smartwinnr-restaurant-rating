const express = require("express");
const router = express.Router();
const {
  updateReview,
  deleteReview,
  getMyReviews,
} = require("../controllers/reviewController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

// All routes here require authentication and CUSTOMER role
router.use(authenticateUser, authorizeRoles("CUSTOMER"));

router.get("/me", getMyReviews);
router.patch("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;
