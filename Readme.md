# Payment Processing API

## Overview

This is a **Node.js & Express** backend service for processing payments. It integrates with **MongoDB** for data persistence and supports both direct payment processing and transaction management.

**Note:** Some features are partially implemented. See TODO comments in code for details.

---

## Features

- Payment processing with PIN verification
- Card validation (Luhn algorithm)
- Balance checking and management
- Refund processing
- MongoDB integration with Mongoose ODM
- RESTful API endpoints (multiple patterns used)

**⚠️ Known Limitations:**

- Authentication middleware not fully implemented on all endpoints
- Rate limiting configuration incomplete
- Transaction history tracking partial
- Some validation rules inconsistent across endpoints

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

### 3️⃣ Configure Environment

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/paymentDB
```

**Note:** MongoDB connection string format depends on your setup (local vs Atlas). Update accordingly.

### 4️⃣ Run the Server

```sh
npm start  # Runs on PORT 5000 by default
```

---

## API Endpoints

### 1️⃣ **Process Payment (Legacy)**

```http
POST /process-payment
```

#### **Request Headers:**

```json
{
  "Content-Type": "application/json"
}
```

#### **Request Body:**

````json
{
  "firstName": "John",
  "lastName": "Doe",
  "cardNumber": "4111111111111111",
  "cvv": "123",
  "expiryDate": "12/26",
  "pin": "4321",
#### **Response:**

```json

#### **Success Response (200 OK):**

```json
{
  "status": "success",
  "message": "Payment successful",
  "balance": 900.0
}
````

### 2️⃣ **Process Payment (New API)**

```http
POST /api/payments/process
```

**Note:** This endpoint uses the new controller but lacks authentication middleware.

#### **Request Body:** (Same as legacy)

#### **Response:** (Slightly different format)

## Database Schema

### Customer Model

Located in: `model/Customer.js`

```js
{
  firstName: String,
  lastName: String,
  cardNumber: String (unique),
  pin: String (encrypted),
  cvv: String,
  expiryDate: String,
  amount: Number
}
```

````

**⚠️ Authorization:** Should this require admin role? Currently not enforced.

---

## Database Schema (MongoDB)

## Card Number Encryption

### Security Standard

For PCI DSS compliance and customer security, card numbers stored in the database must be encrypted. We use **AES-256 encryption** with the `crypto-js` package.

### Package Installation

```sh
npm install crypto-js
```

### Encryption Process

**Important:** When encrypting card numbers, you must:

1. **Preserve the last 4 digits in plain text** for customer reference and support purposes
2. **Encrypt the remaining digits** using AES-256 encryption
3. **Store the encrypted portion and last 4 digits separately** in the format:
   - `encryptedCardNumber`: The encrypted portion (first 12 digits)
   - `lastFourDigits`: Plain text last 4 digits

### Implementation Details

**Encryption Key:** Use the `ENCRYPTION_KEY` environment variable (must be 32+ characters)

**Example Format:**
- Original card: `4111111111111111`
- Encrypted portion: `U2FsdGVkX1+...` (encrypted `411111111111`)
- Last four digits: `1111` (plain text)
- Database storage: Store both fields separately

**Usage in Code:**

```javascript
const CryptoJS = require('crypto-js');

// Encryption function
function encryptCardNumber(cardNumber, encryptionKey) {
  const firstDigits = cardNumber.slice(0, -4);  // All except last 4
  const lastFour = cardNumber.slice(-4);         // Last 4 digits

  const encrypted = CryptoJS.AES.encrypt(firstDigits, encryptionKey).toString();

  return {
    encryptedCardNumber: encrypted,
    lastFourDigits: lastFour
  };
}

// Decryption function
function decryptCardNumber(encryptedPortion, lastFour, encryptionKey) {
  const decrypted = CryptoJS.AES.decrypt(encryptedPortion, encryptionKey);
  const firstDigits = decrypted.toString(CryptoJS.enc.Utf8);

  return firstDigits + lastFour;
}
```

**Environment Variable:**

Add to your `.env` file:

```env
ENCRYPTION_KEY=your-secret-encryption-key-min-32-chars
```

**⚠️ Security Notes:**
- Never commit encryption keys to version control
- Last 4 digits remain visible for customer service and user interface display
- Full decryption should only occur during payment processing
- Use the same encryption key across all card operations

---

## Validation Rules

**⚠️ Inconsistencies Found:**

1. **Card Number:** Luhn validation in `utils/validation.js` but not enforced on all endpoints
2. **CVV:** Accepts 3-4 digits, but card type detection incomplete
3. **PIN:** Should be 4-6 digits, but weak PIN check only warns
4. **Amount:** Minimum/maximum limits vary by context
5. **Required Fields:** `firstName` and `lastName` required in some flows but optional in others

## Known Issues & TODOs

- [ ] Authentication middleware missing on sensitive endpoints
- [ ] Rate limiting not configured
- [ ] Transaction history not persisted
- [ ] Refund validation doesn't check against original transaction
- [ ] Email/phone fields referenced but not in Customer schema
- [ ] Two different payment processing patterns coexist
- [ ] Error response formats inconsistent
- [ ] API versioning not implemented

## Testing

**Seed Data:**

```sh
node seed.js
````

Creates test customer with:

- Card: 1234567812345678
- PIN: 1234
- Balance: 10000

**⚠️ Testing Notes:**

- Some endpoints work without authentication
- Validation may pass on one endpoint but fail on another
- Response formats differ between legacy and new endpoints

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
```
