const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      maxlength: [100, "Restaurant name cannot exceed 100 characters"],
    },
    location: {
      type: String,
      required: [true, "Location (city/area) is required"],
      trim: true,
      maxlength: [80, "Location cannot exceed 80 characters"],
    },
    cuisine: {
      type: String,
      required: [true, "Cuisine is required"],
      trim: true,
      maxlength: [60, "Cuisine cannot exceed 60 characters"],
    },
    address: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Address cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Description cannot exceed 1000 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search and filtering
restaurantSchema.index({ name: "text", cuisine: "text", location: "text" });
restaurantSchema.index({ location: 1, cuisine: 1 });
restaurantSchema.index({ owner: 1 });

const Restaurant = mongoose.model("Restaurant", restaurantSchema);

module.exports = Restaurant;
