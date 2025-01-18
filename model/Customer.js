const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Define Customer Schema
const CustomerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  cardNumber: { type: String, unique: true, required: true },
  pin: { type: String, required: true }, // Encrypted
  cvv: { type: String, required: true },
  expiryDate: { type: String, required: true },
  amount: { type: Number, default: 0 },
});

// Encrypt PIN before saving
CustomerSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

const Customer = mongoose.model("Customer", CustomerSchema);
module.exports = Customer;
