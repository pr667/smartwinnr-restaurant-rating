const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const {
  getRestaurantRatingStats,
  getRestaurantRatingDistribution,
  enrichRestaurantsWithStats,
} = require("../utils/aggregations");

/**
 * @desc    Get all restaurants with backend search, location/cuisine filters & pagination
 * @route   GET /api/restaurants
 * @access  Public (customer rating enriched if authenticated)
 */
const getRestaurants = asyncHandler(async (req, res) => {
  const { search, location, cuisine, page = 1, limit = 12, sort } = req.query;

  const query = {};

  // Case-insensitive name search
  if (search && search.trim() !== "") {
    query.name = { $regex: search.trim(), $options: "i" };
  }

  // Location filter
  if (location && location.trim() !== "") {
    query.location = { $regex: location.trim(), $options: "i" };
  }

  // Cuisine filter
  if (cuisine && cuisine.trim() !== "") {
    query.cuisine = { $regex: cuisine.trim(), $options: "i" };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  // Sorting
  let sortOption = { createdAt: -1 };
  if (sort === "name_asc") sortOption = { name: 1 };
  if (sort === "name_desc") sortOption = { name: -1 };

  const [total, rawRestaurants] = await Promise.all([
    Restaurant.countDocuments(query),
    Restaurant.find(query)
      .populate("owner", "name email")
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum),
  ]);

  const customerId = req.user ? req.user._id : null;
  const enrichedRestaurants = await enrichRestaurantsWithStats(
    rawRestaurants,
    customerId
  );

  res.status(200).json({
    success: true,
    count: enrichedRestaurants.length,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    currentPage: pageNum,
    restaurants: enrichedRestaurants,
  });
});

/**
 * @desc    Get single restaurant by ID with stats, rating distribution, and reviews
 * @route   GET /api/restaurants/:id
 * @access  Public
 */
const getRestaurantById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID format.",
    });
  }

  const restaurant = await Restaurant.findById(id).populate("owner", "name email");
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found.",
    });
  }

  // Fetch rating stats and distribution from MongoDB aggregation
  const [stats, ratingDistribution, reviews] = await Promise.all([
    getRestaurantRatingStats(id),
    getRestaurantRatingDistribution(id),
    Review.find({ restaurant: id })
      .populate("customer", "name email")
      .sort({ createdAt: -1 }),
  ]);

  let customerReview = null;
  if (req.user && req.user.role === "CUSTOMER") {
    customerReview = reviews.find(
      (r) => r.customer && r.customer._id.toString() === req.user._id.toString()
    ) || null;
  }

  res.status(200).json({
    success: true,
    restaurant: {
      ...restaurant.toObject(),
      averageRating: stats.averageRating,
      totalReviews: stats.totalReviews,
    },
    ratingDistribution,
    reviews,
    customerReview,
  });
});

/**
 * @desc    Get reviews for a specific restaurant
 * @route   GET /api/restaurants/:id/reviews
 * @access  Public
 */
const getRestaurantReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID format.",
    });
  }

  const reviews = await Review.find({ restaurant: id })
    .populate("customer", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

module.exports = {
  getRestaurants,
  getRestaurantById,
  getRestaurantReviews,
};
