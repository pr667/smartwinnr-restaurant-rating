const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { validateRestaurantInput } = require("../validators/restaurantValidators");
const {
  getRestaurantRatingStats,
  getRestaurantRatingDistribution,
} = require("../utils/aggregations");

/**
 * @desc    Get the restaurant assigned to the authenticated owner
 * @route   GET /api/owner/restaurant
 * @access  Private (OWNER role only)
 */
const getOwnerRestaurant = asyncHandler(async (req, res) => {
  // Enforce ownership using authenticated user's ID
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return res.status(200).json({
      success: true,
      hasRestaurant: false,
      message: "No restaurant has been assigned to your owner account yet. Please contact the administrator.",
      restaurant: null,
    });
  }

  const [stats, ratingDistribution] = await Promise.all([
    getRestaurantRatingStats(restaurant._id),
    getRestaurantRatingDistribution(restaurant._id),
  ]);

  res.status(200).json({
    success: true,
    hasRestaurant: true,
    restaurant: {
      ...restaurant.toObject(),
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
    ratingDistribution,
  });
});

/**
 * @desc    Update permitted details of owner's assigned restaurant
 * @route   PATCH /api/owner/restaurant
 * @access  Private (OWNER role only)
 */
const updateOwnerRestaurant = asyncHandler(async (req, res) => {
  // Find restaurant strictly owned by authenticated owner
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "No restaurant assigned to your account was found.",
    });
  }

  const { name, location, cuisine, address, description, owner } = req.body;

  // Security check: Owner is NOT permitted to reassign ownership or modify owner ID
  if (owner !== undefined && owner.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "You are not authorized to modify restaurant ownership assignments.",
    });
  }

  // Validate permitted update fields
  const validation = validateRestaurantInput({ name, location, cuisine, address, description }, true);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors,
    });
  }

  if (name !== undefined) restaurant.name = name.trim();
  if (location !== undefined) restaurant.location = location.trim();
  if (cuisine !== undefined) restaurant.cuisine = cuisine.trim();
  if (address !== undefined) restaurant.address = address.trim();
  if (description !== undefined) restaurant.description = description.trim();

  await restaurant.save();

  const [stats, ratingDistribution] = await Promise.all([
    getRestaurantRatingStats(restaurant._id),
    getRestaurantRatingDistribution(restaurant._id),
  ]);

  res.status(200).json({
    success: true,
    message: "Restaurant details updated successfully.",
    restaurant: {
      ...restaurant.toObject(),
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
    ratingDistribution,
  });
});

/**
 * @desc    Get all reviews for owner's assigned restaurant
 * @route   GET /api/owner/restaurant/reviews
 * @access  Private (OWNER role only)
 */
const getOwnerRestaurantReviews = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "No restaurant assigned to your account was found.",
      reviews: [],
    });
  }

  const reviews = await Review.find({ restaurant: restaurant._id })
    .populate("customer", "name email createdAt")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    restaurantName: restaurant.name,
    reviews,
  });
});

/**
 * @desc    Get detailed analytics and rating distribution for owner's restaurant
 * @route   GET /api/owner/restaurant/analytics
 * @access  Private (OWNER role only)
 */
const getOwnerRestaurantAnalytics = asyncHandler(async (req, res) => {
  const restaurant = await Restaurant.findOne({ owner: req.user._id });

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "No restaurant assigned to your account was found.",
    });
  }

  const [stats, ratingDistribution, totalReviewsCount] = await Promise.all([
    getRestaurantRatingStats(restaurant._id),
    getRestaurantRatingDistribution(restaurant._id),
    Review.countDocuments({ restaurant: restaurant._id }),
  ]);

  res.status(200).json({
    success: true,
    restaurantName: restaurant.name,
    averageRating: stats.averageRating,
    totalReviews: totalReviewsCount,
    ratingDistribution,
  });
});

module.exports = {
  getOwnerRestaurant,
  updateOwnerRestaurant,
  getOwnerRestaurantReviews,
  getOwnerRestaurantAnalytics,
};
