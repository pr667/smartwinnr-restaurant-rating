const mongoose = require("mongoose");
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../utils/asyncHandler");
const { validateReviewInput } = require("../validators/reviewValidators");
const { getRestaurantRatingStats } = require("../utils/aggregations");

/**
 * @desc    Submit a review for a restaurant
 * @route   POST /api/restaurants/:id/reviews
 * @access  Private (CUSTOMER role only)
 */
const createReview = asyncHandler(async (req, res) => {
  const { id: restaurantId } = req.params;
  const { rating, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID format.",
    });
  }

  // Verify restaurant exists
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found.",
    });
  }

  // Validate review inputs
  const validation = validateReviewInput({ rating, content });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors,
    });
  }

  // Mandatory check: A customer can submit only ONE review per restaurant
  const existingReview = await Review.findOne({
    customer: req.user._id,
    restaurant: restaurantId,
  });

  if (existingReview) {
    return res.status(409).json({
      success: false,
      message: "You have already reviewed this restaurant.",
    });
  }

  try {
    const review = await Review.create({
      customer: req.user._id,
      restaurant: restaurantId,
      rating: Number(rating),
      content: content.trim(),
    });

    const populatedReview = await Review.findById(review._id)
      .populate("customer", "name email")
      .populate("restaurant", "name location cuisine");

    const updatedStats = await getRestaurantRatingStats(restaurantId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully.",
      review: populatedReview,
      updatedStats,
    });
  } catch (error) {
    // Graceful handling of MongoDB Compound Unique Index conflict (E11000)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this restaurant.",
      });
    }
    throw error;
  }
});

/**
 * @desc    Update customer's own review
 * @route   PATCH /api/reviews/:id
 * @access  Private (CUSTOMER role only)
 */
const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid review ID format.",
    });
  }

  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found.",
    });
  }

  // Check review author ownership
  if (review.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only edit your own reviews.",
    });
  }

  // Validate update input
  const validation = validateReviewInput({ rating, content }, true);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors,
    });
  }

  if (rating !== undefined) {
    review.rating = Number(rating);
  }
  if (content !== undefined) {
    review.content = content.trim();
  }

  await review.save();

  const populatedReview = await Review.findById(review._id)
    .populate("customer", "name email")
    .populate("restaurant", "name location cuisine");

  const updatedStats = await getRestaurantRatingStats(review.restaurant);

  res.status(200).json({
    success: true,
    message: "Review updated successfully.",
    review: populatedReview,
    updatedStats,
  });
});

/**
 * @desc    Delete customer's own review
 * @route   DELETE /api/reviews/:id
 * @access  Private (CUSTOMER role only)
 */
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid review ID format.",
    });
  }

  const review = await Review.findById(id);
  if (!review) {
    return res.status(404).json({
      success: false,
      message: "Review not found.",
    });
  }

  // Check review author ownership
  if (review.customer.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Access denied. You can only delete your own reviews.",
    });
  }

  const restaurantId = review.restaurant;
  await Review.findByIdAndDelete(id);

  const updatedStats = await getRestaurantRatingStats(restaurantId);

  res.status(200).json({
    success: true,
    message: "Review deleted successfully.",
    updatedStats,
  });
});

/**
 * @desc    Get all reviews submitted by the authenticated customer
 * @route   GET /api/reviews/me
 * @access  Private (CUSTOMER role only)
 */
const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ customer: req.user._id })
    .populate("restaurant", "name location cuisine address")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

module.exports = {
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
};
