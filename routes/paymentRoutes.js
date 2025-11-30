const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// Payment routes
// TODO: Add authentication middleware
// TODO: Add rate limiting to prevent abuse

/**
 * Process payment
 * POST /api/payments/process
 */
router.post("/process", paymentController.processPayment);

/**
 * Get customer balance
 * GET /api/payments/balance/:cardNumber
 * Note: Using card number in URL might not be secure
 */
router.get("/balance/:cardNumber", paymentController.getBalance);

/**
 * Process refund
 * POST /api/payments/refund
 * TODO: Add authorization - only admins should refund
 */
router.post("/refund", paymentController.refundPayment);

/**
 * Verify card
 * POST /api/payments/verify
 */
router.post("/verify", paymentController.verifyCard);

module.exports = router;
