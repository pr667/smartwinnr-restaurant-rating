/**
 * Validates registration and login inputs
 */

// Password strength requirement:
// 8-16 chars, at least one uppercase, one lowercase, one number, one special character
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateRegistration = (data) => {
  const errors = [];
  const { name, email, password, confirmPassword } = data;

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Full name is required (minimum 2 characters)");
  }

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    errors.push("Please provide a valid email address");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  } else if (!PASSWORD_REGEX.test(password)) {
    errors.push(
      "Password must be 8-16 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    );
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push("Passwords do not match");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

const validateLogin = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    errors.push("Valid email is required");
  }

  if (!password || typeof password !== "string" || password.length === 0) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  PASSWORD_REGEX,
  EMAIL_REGEX,
};
