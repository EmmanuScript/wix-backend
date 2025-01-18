# Payment Processing API

## Overview

This is a **Node.js & Express** backend service that processes payments using **MongoDB** for storing customer data. When a user submits payment details via **Wix**, the API verifies the card details, checks the account balance, and deducts the purchase amount if sufficient funds are available.

---

## Features

- Secure payment processing with encrypted PIN storage.
- Card validation before transaction processing.
- MongoDB database integration for storing user details.
- RESTful API with proper response handling.

---

## Technologies Used

- **Node.js** & **Express.js** (Backend Framework)
- **MongoDB** (Database)
- **Mongoose** (ODM for MongoDB)
- **bcrypt** (For PIN encryption)
- **dotenv** (Environment Variables Management)

---

## Installation & Setup

### Prerequisites

- **Node.js** (v14 or higher)
- **MongoDB** (Running locally or using MongoDB Atlas)

### 1️⃣ Clone Repository

```sh
git clone https://github.com/your-username/payment-api.git
cd payment-api
```

### 2️⃣ Install Dependencies

```sh
npm install
```

### 3️⃣ Create a `.env` File

Create a `.env` file in the project root and add:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paymentDB # Replace with your MongoDB connection string
SECRET_KEY=your-secret-key
```

### 4️⃣ Run the Server

```sh
npm start  # Runs on PORT 5000 by default
```

---

## API Endpoints

### 1️⃣ **Process Payment**

#### **Endpoint:**

```http
POST http://localhost:5000/process-payment
```

#### **Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

#### **Request Body:**

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "cardNumber": "4111111111111111",
  "cvv": "123",
  "expiryDate": "12/26",
  "pin": "4321",
  "amount": 100.0
}
```

#### **Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Payment processed successfully",
  "transactionId": "TXN123456789",
  "balance": 900.0
}
```

#### **Error Response (Insufficient Funds - 400):**

```json
{
  "status": "failed",
  "message": "Insufficient funds"
}
```

---

## Database Schema (MongoDB)

```js
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const CustomerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  cardNumber: { type: String, unique: true },
  encryptedPin: String,
  cvv: String,
  expiryDate: String,
  amount: Number,
});

CustomerSchema.pre("save", async function (next) {
  if (!this.isModified("encryptedPin")) return next();
  this.encryptedPin = await bcrypt.hash(this.encryptedPin, 10);
  next();
});

module.exports = mongoose.model("Customer", CustomerSchema);
```

---

## Testing with Postman

1. **Open Postman**.
2. **Set method to `POST`** and use `http://localhost:5000/process-payment`.
3. **Go to Body > raw > JSON** and paste the request body.
4. **Send the request** and check the response.

---

## Future Enhancements

- Implement JWT authentication for security.
- Integrate with third-party payment gateways.
- Add transaction history tracking.

---

## License

This project is licensed under the **MIT License**.

---

## Contributors

👤 **Your Name** - [GitHub](https://github.com/your-username)
