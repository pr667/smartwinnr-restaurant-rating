const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");

/**
 * Calculates average rating and total reviews for a single restaurant
 * Returns { averageRating: Number | null, totalReviews: Number }
 */
const getRestaurantRatingStats = async (restaurantId) => {
  const matchId = new mongoose.Types.ObjectId(restaurantId);

  const stats = await Review.aggregate([
    {
      $match: { restaurant: matchId },
    },
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (!stats || stats.length === 0) {
    return {
      averageRating: null,
      totalReviews: 0,
    };
  }

  return {
    averageRating: Math.round(stats[0].averageRating * 10) / 10,
    totalReviews: stats[0].totalReviews,
  };
};

/**
 * Calculates rating distribution (1-5 stars) for a restaurant
 * Always returns counts for 1, 2, 3, 4, 5
 */
const getRestaurantRatingDistribution = async (restaurantId) => {
  const matchId = new mongoose.Types.ObjectId(restaurantId);

  const distributionRaw = await Review.aggregate([
    {
      $match: { restaurant: matchId },
    },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: -1 },
    },
  ]);

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  distributionRaw.forEach((item) => {
    if (distribution.hasOwnProperty(item._id)) {
      distribution[item._id] = item.count;
    }
  });

  return distribution;
};

/**
 * Platform-wide analytics for Admin Dashboard
 * Uses real MongoDB aggregation across all records
 */
const getPlatformAnalytics = async () => {
  const [totalUsers, totalRestaurants, totalReviews, ratingAggregate, distributionRaw] =
    await Promise.all([
      User.countDocuments(),
      Restaurant.countDocuments(),
      Review.countDocuments(),
      Review.aggregate([
        {
          $group: {
            _id: null,
            averagePlatformRating: { $avg: "$rating" },
          },
        },
      ]),
      Review.aggregate([
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]),
    ]);

  const averagePlatformRating =
    ratingAggregate.length > 0 && ratingAggregate[0].averagePlatformRating !== null
      ? Math.round(ratingAggregate[0].averagePlatformRating * 10) / 10
      : null;

  const distribution = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  distributionRaw.forEach((item) => {
    if (distribution.hasOwnProperty(item._id)) {
      distribution[item._id] = item.count;
    }
  });

  return {
    totalUsers,
    totalRestaurants,
    totalReviews,
    averagePlatformRating,
    ratingDistribution: distribution,
  };
};

/**
 * Enriches an array of restaurant plain objects or documents with:
 * - averageRating
 * - totalReviews
 * - userRating (if customerId provided)
 */
const enrichRestaurantsWithStats = async (restaurants, customerId = null) => {
  if (!restaurants || restaurants.length === 0) {
    return [];
  }

  const restaurantIds = restaurants.map((r) =>
    new mongoose.Types.ObjectId(r._id)
  );

  // Aggregate stats for all restaurants in batch
  const statsList = await Review.aggregate([
    {
      $match: { restaurant: { $in: restaurantIds } },
    },
    {
      $group: {
        _id: "$restaurant",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const statsMap = new Map();
  statsList.forEach((s) => {
    statsMap.set(s._id.toString(), {
      averageRating: Math.round(s.averageRating * 10) / 10,
      totalReviews: s.totalReviews,
    });
  });

  // If customer is authenticated, fetch their reviews in batch
  const userReviewMap = new Map();
  if (customerId && mongoose.Types.ObjectId.isValid(customerId)) {
    const userReviews = await Review.find({
      customer: customerId,
      restaurant: { $in: restaurantIds },
    }).select("restaurant rating _id");

    userReviews.forEach((rev) => {
      userReviewMap.set(rev.restaurant.toString(), {
        rating: rev.rating,
        reviewId: rev._id,
      });
    });
  }

  return restaurants.map((r) => {
    const doc = r.toObject ? r.toObject() : { ...r };
    const rId = doc._id.toString();
    const stat = statsMap.get(rId) || { averageRating: null, totalReviews: 0 };
    const userRev = userReviewMap.get(rId) || null;

    return {
      ...doc,
      averageRating: stat.averageRating,
      totalReviews: stat.totalReviews,
      customerReview: userRev,
    };
  });
};

module.exports = {
  getRestaurantRatingStats,
  getRestaurantRatingDistribution,
  getPlatformAnalytics,
  enrichRestaurantsWithStats,
};
