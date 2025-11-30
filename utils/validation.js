// Validation utility functions
// Basic validation helpers with some incomplete implementations

/**
 * Validate card number using Luhn algorithm
 * @param {string} cardNumber
 * @returns {boolean}
 */
exports.validateCardNumber = (cardNumber) => {
  if (!cardNumber) return false;

  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, "");

  // Check if all digits
  if (!/^\d+$/.test(cleaned)) return false;

  // Check length (typically 13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

/**
 * Validate CVV
 * @param {string} cvv
 * @returns {boolean}
 */
exports.validateCVV = (cvv) => {
  if (!cvv) return false;
  // Most cards: 3 digits, Amex: 4 digits
  return /^\d{3,4}$/.test(cvv);
};

/**
 * Validate expiry date
 * @param {string} expiryDate - Format: MM/YY or MM/YYYY
 * @returns {boolean}
 */
exports.validateExpiryDate = (expiryDate) => {
  if (!expiryDate) return false;

  // Check format
  const regex = /^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/;
  if (!regex.test(expiryDate)) return false;

  const [month, year] = expiryDate.split("/");
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // Convert year to full format
  let fullYear = year.length === 2 ? 2000 + parseInt(year) : parseInt(year);

  // Check if expired
  if (fullYear < currentYear) return false;
  if (fullYear === currentYear && parseInt(month) < currentMonth) return false;

  return true;
};

/**
 * Validate amount
 * @param {number} amount
 * @returns {boolean}
 */
exports.validateAmount = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return false;
  if (amount <= 0) return false;

  // TODO: Should there be a maximum amount limit?
  // Different merchants might have different limits

  // Check decimal places
  const decimals = (amount.toString().split(".")[1] || "").length;
  if (decimals > 2) return false;

  return true;
};

/**
 * Validate PIN
 * @param {string} pin
 * @returns {boolean}
 */
exports.validatePIN = (pin) => {
  if (!pin) return false;

  // PIN should be 4-6 digits
  // But different systems might have different requirements
  if (pin.length < 4 || pin.length > 6) return false;

  // Check if numeric
  if (!/^\d+$/.test(pin)) return false;

  return true;
};

/**
 * Mask card number for display
 * @param {string} cardNumber
 * @returns {string}
 */
exports.maskCardNumber = (cardNumber) => {
  if (!cardNumber) return "";
  const cleaned = cardNumber.replace(/[\s-]/g, "");
  if (cleaned.length < 4) return "****";
  return "**** **** **** " + cleaned.slice(-4);
};

/**
 * Sanitize input string
 * Remove potentially harmful characters
 * @param {string} input
 * @returns {string}
 */
exports.sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, "");

  // Trim whitespace
  sanitized = sanitized.trim();

  // TODO: Should we remove special characters?
  // Different fields might need different sanitization

  return sanitized;
};

/**
 * Validate email format
 * Customer model doesn't have email field yet
 * @param {string} email
 * @returns {boolean}
 */
exports.validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number
 * Format requirements unclear
 * @param {string} phone
 * @returns {boolean}
 */
exports.validatePhone = (phone) => {
  if (!phone) return false;

  // Remove common separators
  const cleaned = phone.replace(/[\s()-]/g, "");

  // Basic validation - 10-15 digits
  // International formats vary - this is simplified
  if (!/^\d{10,15}$/.test(cleaned)) return false;

  return true;
};

/**
 * Validate payment request body
 * @param {object} body
 * @returns {object} { valid: boolean, errors: array }
 */
exports.validatePaymentRequest = (body) => {
  const errors = [];

  if (!body.cardNumber) {
    errors.push("Card number is required");
  } else if (!exports.validateCardNumber(body.cardNumber)) {
    errors.push("Invalid card number");
  }

  if (!body.cvv) {
    errors.push("CVV is required");
  } else if (!exports.validateCVV(body.cvv)) {
    errors.push("Invalid CVV");
  }

  if (!body.expiryDate) {
    errors.push("Expiry date is required");
  } else if (!exports.validateExpiryDate(body.expiryDate)) {
    errors.push("Invalid or expired date");
  }

  if (!body.pin) {
    errors.push("PIN is required");
  } else if (!exports.validatePIN(body.pin)) {
    errors.push("Invalid PIN");
  }

  if (!body.amount) {
    errors.push("Amount is required");
  } else if (!exports.validateAmount(body.amount)) {
    errors.push("Invalid amount");
  }

  // Some endpoints require them, others don't

  return {
    valid: errors.length === 0,
    errors,
  };
};
