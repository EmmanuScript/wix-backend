require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Customer = require("./model/Customer");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const createUser = async () => {
  const newUser = new Customer({
    firstName: "John",
    lastName: "Doe",
    cardNumber: "1234567812345678",
    pin: "1234",
    cvv: "123",
    expiryDate: "12/25",
    amount: 10000, // Initial balance
  });

  await newUser.save();
  console.log("User created!");
  mongoose.connection.close();
};

createUser();
