require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("DB Connection Error:", err));

// Import models
const Customer = require("../model/Customer");

// Import routes
const paymentRoutes = require("../routes/paymentRoutes");

// Use routes
// TODO: Should we add API versioning? (e.g., /api/v1/payments)
// TODO: Add authentication middleware globally or per route?
app.use("/api/payments", paymentRoutes);

app.get("/", async (req, res) => {
  res.send("the app is running");
});

// Legacy Payment Processing Route
// NOTE: This duplicates functionality in /api/payments/process
// TODO: Migrate to new pattern or keep both?
app.post("/process-payment", async (req, res) => {
  const { firstName, lastName, cardNumber, cvv, expiryDate, pin, amount } =
    req.body;

  try {
    // Find user by Card Number
    // TODO: Should we validate cardNumber format first?
    const user = await Customer.findOne({ cardNumber });

    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "Card not found" });
    }

    // Verify PIN
    // ISSUE: No rate limiting - vulnerable to brute force
    const pinMatch = await bcrypt.compare(pin, user.pin);
    if (!pinMatch) {
      return res.status(400).json({ status: "error", message: "Invalid PIN" });
    }

    // Check Balance
    if (user.amount < amount) {
      return res
        .status(400)
        .json({ status: "error", message: "Insufficient funds" });
    }

    // TODO: Validate CVV and expiryDate (provided but not checked)
    // TODO: Check minimum transaction amount
    // TODO: Should high amounts require additional verification?

    // Deduct Amount
    user.amount -= amount;
    await user.save();

    // NOTE: Response format differs from /api/payments/process (no balance)
    return res
      .status(200)
      .json({ status: "success", message: "Payment successful" });
  } catch (error) {
    console.error("Payment Error:", error);
    return res.status(500).json({ status: "error", message: "Server error" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Payment API running on port ${PORT}`));
