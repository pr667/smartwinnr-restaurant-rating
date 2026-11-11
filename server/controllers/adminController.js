const mongoose = require("mongoose");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { getPlatformAnalytics, enrichRestaurantsWithStats } = require("../utils/aggregations");
const { validateRegistration } = require("../validators/authValidators");
const { validateRestaurantInput } = require("../validators/restaurantValidators");

/**
 * @desc    Get Admin Dashboard statistics using real MongoDB aggregations
 * @route   GET /api/admin/dashboard
 * @access  Private (ADMIN role only)
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const analytics = await getPlatformAnalytics();

  const [recentReviews, recentRestaurants, userRoleCounts] = await Promise.all([
    Review.find()
      .populate("customer", "name email")
      .populate("restaurant", "name location")
      .sort({ createdAt: -1 })
      .limit(5),
    Restaurant.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .limit(5),
    User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const roleBreakdown = {
    ADMIN: 0,
    CUSTOMER: 0,
    OWNER: 0,
  };
  userRoleCounts.forEach((item) => {
    if (roleBreakdown.hasOwnProperty(item._id)) {
      roleBreakdown[item._id] = item.count;
    }
  });

  res.status(200).json({
    success: true,
    stats: {
      ...analytics,
      roleBreakdown,
    },
    recentReviews,
    recentRestaurants,
  });
});

/**
 * @desc    Get all users with search and role filters
 * @route   GET /api/admin/users
 * @access  Private (ADMIN role only)
 */
const getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;

  const query = {};

  if (search && search.trim() !== "") {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { email: { $regex: search.trim(), $options: "i" } },
    ];
  }

  if (role && ["ADMIN", "CUSTOMER", "OWNER"].includes(role.toUpperCase())) {
    query.role = role.toUpperCase();
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
  ]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    currentPage: pageNum,
    users,
  });
});

/**
 * @desc    Update a user
 * @route   PATCH /api/admin/users/:id
 * @access  Private (ADMIN role only)
 */
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format.",
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  // Prevent admin from accidentally changing their own role away from ADMIN
  if (user._id.toString() === req.user._id.toString() && role && role !== "ADMIN") {
    return res.status(400).json({
      success: false,
      message: "Administrators cannot demote their own account role.",
    });
  }

  if (name && typeof name === "string") user.name = name.trim();
  if (role && ["ADMIN", "CUSTOMER", "OWNER"].includes(role)) user.role = role;

  await user.save();

  res.status(200).json({
    success: true,
    message: "User updated successfully.",
    user,
  });
});

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (ADMIN role only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID format.",
    });
  }

  // Critical safeguard: Prevent admin from deleting themselves
  if (id === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "Security safeguard: You cannot delete your own administrator account.",
    });
  }

  const user = await User.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found.",
    });
  }

  // Cleanup references to avoid orphaned records
  if (user.role === "OWNER") {
    await Restaurant.updateMany({ owner: user._id }, { $set: { owner: null } });
  } else if (user.role === "CUSTOMER") {
    await Review.deleteMany({ customer: user._id });
  }

  await User.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "User and associated records cleaned up successfully.",
  });
});

/**
 * @desc    Create a Restaurant Owner account
 * @route   POST /api/admin/owners
 * @access  Private (ADMIN role only)
 */
const createOwner = asyncHandler(async (req, res) => {
  const { name, email, password, restaurantId } = req.body;

  const validation = validateRegistration({ name, email, password });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors,
    });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "Email is already registered.",
    });
  }

  // Create user with explicit OWNER role
  const owner = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "OWNER",
  });

  let assignedRestaurant = null;
  if (restaurantId) {
    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID format for assignment.",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) {
      restaurant.owner = owner._id;
      await restaurant.save();
      assignedRestaurant = restaurant;
    }
  }

  res.status(201).json({
    success: true,
    message: "Restaurant owner account created successfully.",
    owner,
    assignedRestaurant,
  });
});

/**
 * @desc    Get all restaurants for administration
 * @route   GET /api/admin/restaurants
 * @access  Private (ADMIN role only)
 */
const getAdminRestaurants = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;

  const query = {};
  if (search && search.trim() !== "") {
    query.$or = [
      { name: { $regex: search.trim(), $options: "i" } },
      { location: { $regex: search.trim(), $options: "i" } },
      { cuisine: { $regex: search.trim(), $options: "i" } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, rawRestaurants] = await Promise.all([
    Restaurant.countDocuments(query),
    Restaurant.find(query)
      .populate("owner", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  const enrichedRestaurants = await enrichRestaurantsWithStats(rawRestaurants);

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
 * @desc    Create a new restaurant
 * @route   POST /api/admin/restaurants
 * @access  Private (ADMIN role only)
 */
const createRestaurant = asyncHandler(async (req, res) => {
  const { name, location, cuisine, address, description, owner } = req.body;

  const validation = validateRestaurantInput({ name, location, cuisine, address, description, owner });
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors,
    });
  }

  // If owner is supplied, verify valid owner
  if (owner) {
    const ownerUser = await User.findById(owner);
    if (!ownerUser) {
      return res.status(400).json({
        success: false,
        message: "Assigned owner user was not found.",
      });
    }
    if (ownerUser.role !== "OWNER") {
      return res.status(400).json({
        success: false,
        message: `Assigned user '${ownerUser.name}' does not have the OWNER role.`,
      });
    }
  }

  const restaurant = await Restaurant.create({
    name: name.trim(),
    location: location.trim(),
    cuisine: cuisine.trim(),
    address: address ? address.trim() : "",
    description: description ? description.trim() : "",
    owner: owner || null,
  });

  const populated = await Restaurant.findById(restaurant._id).populate("owner", "name email");

  res.status(201).json({
    success: true,
    message: "Restaurant created successfully.",
    restaurant: populated,
  });
});

/**
 * @desc    Update a restaurant
 * @route   PATCH /api/admin/restaurants/:id
 * @access  Private (ADMIN role only)
 */
const updateRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID format.",
    });
  }

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found.",
    });
  }

  const { name, location, cuisine, address, description, owner } = req.body;

  const validation = validateRestaurantInput({ name, location, cuisine, address, description, owner }, true);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors[0],
      errors: validation.errors,
    });
  }

  if (owner !== undefined) {
    if (owner === null || owner === "") {
      restaurant.owner = null;
    } else {
      const ownerUser = await User.findById(owner);
      if (!ownerUser || ownerUser.role !== "OWNER") {
        return res.status(400).json({
          success: false,
          message: "Assigned user must be an existing user with OWNER role.",
        });
      }
      restaurant.owner = owner;
    }
  }

  if (name !== undefined) restaurant.name = name.trim();
  if (location !== undefined) restaurant.location = location.trim();
  if (cuisine !== undefined) restaurant.cuisine = cuisine.trim();
  if (address !== undefined) restaurant.address = address.trim();
  if (description !== undefined) restaurant.description = description.trim();

  await restaurant.save();

  const populated = await Restaurant.findById(restaurant._id).populate("owner", "name email");

  res.status(200).json({
    success: true,
    message: "Restaurant updated successfully.",
    restaurant: populated,
  });
});

/**
 * @desc    Delete a restaurant and cleanup reviews
 * @route   DELETE /api/admin/restaurants/:id
 * @access  Private (ADMIN role only)
 */
const deleteRestaurant = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid restaurant ID format.",
    });
  }

  const restaurant = await Restaurant.findById(id);
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found.",
    });
  }

  // Delete all associated reviews to avoid orphaned records
  await Review.deleteMany({ restaurant: id });
  await Restaurant.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Restaurant and its associated reviews deleted successfully.",
  });
});

/**
 * @desc    Get all reviews platform-wide for administration
 * @route   GET /api/admin/reviews
 * @access  Private (ADMIN role only)
 */
const getAdminReviews = asyncHandler(async (req, res) => {
  const { search, rating, page = 1, limit = 20 } = req.query;

  const query = {};

  if (rating) {
    const num = parseInt(rating, 10);
    if (num >= 1 && num <= 5) {
      query.rating = num;
    }
  }

  if (search && search.trim() !== "") {
    query.content = { $regex: search.trim(), $options: "i" };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  const [total, reviews] = await Promise.all([
    Review.countDocuments(query),
    Review.find(query)
      .populate("customer", "name email")
      .populate("restaurant", "name location cuisine")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    totalPages: Math.ceil(total / limitNum) || 1,
    currentPage: pageNum,
    reviews,
  });
});

/**
 * @desc    Delete an inappropriate review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private (ADMIN role only)
 */
const deleteAdminReview = asyncHandler(async (req, res) => {
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

  await Review.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Inappropriate review deleted successfully from the platform.",
  });
});

module.exports = {
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
};
