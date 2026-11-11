const mongoose = require("mongoose");

const validateRestaurantInput = (data, isUpdate = false) => {
  const errors = [];
  const { name, location, cuisine, address, description, owner } = data;

  if (!isUpdate || name !== undefined) {
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      errors.push("Restaurant name is required");
    } else if (name.trim().length > 100) {
      errors.push("Restaurant name cannot exceed 100 characters");
    }
  }

  if (!isUpdate || location !== undefined) {
    if (!location || typeof location !== "string" || location.trim().length === 0) {
      errors.push("Location is required");
    } else if (location.trim().length > 80) {
      errors.push("Location cannot exceed 80 characters");
    }
  }

  if (!isUpdate || cuisine !== undefined) {
    if (!cuisine || typeof cuisine !== "string" || cuisine.trim().length === 0) {
      errors.push("Cuisine is required");
    } else if (cuisine.trim().length > 60) {
      errors.push("Cuisine cannot exceed 60 characters");
    }
  }

  if (address !== undefined && typeof address === "string" && address.trim().length > 200) {
    errors.push("Address cannot exceed 200 characters");
  }

  if (description !== undefined && typeof description === "string" && description.trim().length > 1000) {
    errors.push("Description cannot exceed 1000 characters");
  }

  if (owner !== undefined && owner !== null && owner !== "") {
    if (!mongoose.Types.ObjectId.isValid(owner)) {
      errors.push("Invalid owner user ID format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRestaurantInput,
};
