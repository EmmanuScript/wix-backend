const Customer = require("../model/Customer");
const bcrypt = require("bcryptjs");

// Payment processing controller
// Handles payment transactions with basic validation
// NOTE: This duplicates some logic from api/index.js - which should be used?

/**
 * Process payment transaction
 * TODO: Add transaction history tracking
 * TODO: Should this validate CVV and expiryDate before processing?
 * TODO: Rate limiting needed but not implemented
 *
 * @param {Object} req.body - Payment details
 * @param {string} req.body.firstName - Optional? Required in some flows
 * @param {string} req.body.lastName - Optional? Required in some flows
 * @param {string} req.body.cardNumber - Required
 * @param {string} req.body.cvv - Provided but not validated here
 * @param {string} req.body.expiryDate - Provided but not validated here
 * @param {string} req.body.pin - Required, 4-6 digits
 * @param {number} req.body.amount - Required, but min/max unclear
 */
exports.processPayment = async (req, res) => {
  const { firstName, lastName, cardNumber, cvv, expiryDate, pin, amount } =
    req.body;

  try {
    // Find customer by card number
    const customer = await Customer.findOne({ cardNumber });

    if (!customer) {
      return res
        .status(400)
        .json({ status: "error", message: "Card not found" });
    }

    // Verify PIN
    // TODO: Should we track failed attempts and lock account?
    const pinMatch = await bcrypt.compare(pin, customer.pin);
    if (!pinMatch) {
      return res.status(400).json({ status: "error", message: "Invalid PIN" });
    }

    // Check balance
    if (customer.amount < amount) {
      return res
        .status(400)
        .json({ status: "error", message: "Insufficient funds" });
    }

    // TODO: Should we verify CVV and expiry date?
    // Different parts of code might have different requirements

    // Deduct amount
    customer.amount -= amount;
    await customer.save();

    // Log transaction
    console.log(
      `Payment processed: ${amount} from card ${cardNumber.slice(-4)}`
    );

    return res.status(200).json({
      status: "success",
      message: "Payment successful",
      balance: customer.amount,
    });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Get customer balance
 * TODO: Add authentication middleware
 * SECURITY ISSUE: Card number in URL is not secure
 *
 * @param {string} req.params.cardNumber - Card number (exposed in URL)
 */
exports.getBalance = async (req, res) => {
  const { cardNumber } = req.params;

  try {
    const customer = await Customer.findOne({ cardNumber });

    if (!customer) {
      return res
        .status(404)
        .json({ status: "error", message: "Customer not found" });
    }

    // Should we mask card number in response?
    // Should this require authentication first?
    // Anyone with card number can check balance - is this intended?
    return res.status(200).json({
      status: "success",
      data: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        balance: customer.amount,
        // TODO: Should we include cardNumber (masked) in response?
      },
    });
  } catch (error) {
    console.error("Balance Error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Refund transaction
 * INCOMPLETE: Needs transaction tracking to validate refunds
 * ISSUE: No validation against original transaction
 *
 * @param {string} req.body.cardNumber - Card to refund to
 * @param {number} req.body.amount - Amount to refund
 * @param {string} req.body.reason - Refund reason (optional? required?)
 */
exports.refundPayment = async (req, res) => {
  const { cardNumber, amount, reason } = req.body;

  try {
    const customer = await Customer.findOne({ cardNumber });

    if (!customer) {
      return res
        .status(404)
        .json({ status: "error", message: "Customer not found" });
    }

    // Credit amount back
    // TODO: Should we validate refund amount against original transaction?
    // TODO: Should there be a maximum refund amount?
    // TODO: Should we check if transaction exists before refunding?
    // TODO: Partial refunds supported but no tracking mechanism

    // SECURITY: No authorization check - anyone can issue refunds!
    customer.amount += amount;
    await customer.save();

    console.log(`Refund processed: ${amount} to card ${cardNumber.slice(-4)}`);

    return res.status(200).json({
      status: "success",
      message: "Refund processed",
      balance: customer.amount,
      // TODO: Should we return transaction/refund ID?
    });
  } catch (error) {
    console.error("Refund Error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};

/**
 * Verify card details
 * INCOMPLETE: CVV and expiry validation not implemented
 *
 * @param {string} req.body.cardNumber - Card number to verify
 * @param {string} req.body.cvv - CVV (provided but not checked!)
 * @param {string} req.body.expiryDate - Expiry (provided but not checked!)
 */
exports.verifyCard = async (req, res) => {
  const { cardNumber, cvv, expiryDate } = req.body;

  try {
    const customer = await Customer.findOne({ cardNumber });

    if (!customer) {
      return res
        .status(404)
        .json({ status: "error", message: "Card not found" });
    }
    return res.status(200).json({
      status: "success",
      message: "Card verified", // Misleading - only checked existence
      data: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        // Should we indicate what was actually verified?
      },
    });

    // TODO: Verify CVV and expiry date
  } catch (error) {
    console.error("Verification Error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
};
