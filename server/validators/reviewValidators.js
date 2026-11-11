const validateReviewInput = (data, isUpdate = false) => {
  const errors = [];
  const { rating, content } = data;

  if (!isUpdate || rating !== undefined) {
    if (rating === undefined || rating === null || rating === "") {
      errors.push("Rating is required");
    } else {
      const numRating = Number(rating);
      // Strictly verify integer between 1 and 5
      if (
        isNaN(numRating) ||
        !Number.isInteger(numRating) ||
        numRating < 1 ||
        numRating > 5
      ) {
        errors.push("Rating must be a whole number between 1 and 5");
      }
    }
  }

  if (!isUpdate || content !== undefined) {
    if (
      content === undefined ||
      content === null ||
      typeof content !== "string" ||
      content.trim().length === 0
    ) {
      errors.push("Review content is required");
    } else if (content.trim().length < 3) {
      errors.push("Review content must be at least 3 characters");
    } else if (content.trim().length > 1000) {
      errors.push("Review content cannot exceed 1000 characters");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateReviewInput,
};
