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

// Define Customer Schema
const CustomerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  cardNumber: { type: String, unique: true },
  pin: String, // Encrypted
  cvv: String,
  expiryDate: String,
  amount: Number,
});

const Customer = mongoose.model("Customer", CustomerSchema);

app.get("/", async (req, res) => {
  res.send("the app is running");
});

// Payment Processing Route
app.post("/process-payment", async (req, res) => {
  const { firstName, lastName, cardNumber, cvv, expiryDate, pin, amount } =
    req.body;

  try {
    // Find user by Card Number
    const user = await Customer.findOne({ cardNumber });

    if (!user) {
      return res
        .status(400)
        .json({ status: "error", message: "Card not found" });
    }

    // Verify PIN
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

    // Deduct Amount
    user.amount -= amount;
    await user.save();

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
