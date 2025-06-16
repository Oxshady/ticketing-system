# 🚆 Sekket Saffar – Ticketing Reservation System

**Sekket Saffar** is a full-featured ticketing and reservation backend system developed with **Node.js** and **MySQL**, designed as a graduation project. It supports secure train ticket bookings, seat selection, real-time payments with **Paymob**, user authentication via **Google OAuth**, and a loyalty point reward system.

> ✅ Built with real-world backend architecture best practices, RESTful APIs, and robust third-party integrations.

---

## 🌍 Live API

- **Base URL**: `https://ticketing-system-2esa.onrender.com/api`
- **Version**: `v1`
- **Content-Type**: `application/json`

---

## ✨ Features

- 🎟 **Ticket & Reservation Management**
  - Seat selection and availability checks
  - Reservation status tracking (Pending, Confirmed, Cancelled, Completed)

- 🔐 **Authentication**
  - Email/password login
  - Google OAuth 2.0 integration
  - Secure JWT-based access

- 💳 **Payment Integration**
  - Integration with **Paymob**
  - Full/partial payment support with loyalty point redemption
  - Webhook-based status confirmation

- 🏅 **Loyalty Points System**
  - Earn points on completed reservations
  - Redeem points for discounted tickets

- 🛠 **Admin APIs**
  - Manage users and trips
  - Pagination and filtering support

---

## 🏗 Tech Stack

| Layer            | Stack                          |
|------------------|--------------------------------|
| Backend          | Node.js, Express.js            |
| Database         | MySQL via Prisma ORM           |
| Auth             | JWT, Google OAuth 2.0          |
| Payment          | Paymob API                     |
| Dev Tools        | dotenv, bcrypt, nodemailer     |
| Deployment       | Render.com                     |

---

## 📁 Project Structure

```
ticketing-system/
│
├── prisma/             # Prisma schema & migrations
├── services/           # Business logic (auth, reservation, payment)
├── controllers/        # API controller handlers
├── routes/             # Route definitions (auth, admin, etc.)
├── middlewares/        # Auth & error middleware
├── utils/              # JWT helpers, error classes, points calc
├── config/             # Paymob & Google OAuth setup
├── populateData.js     # Database seeder
└── server.js           # Server startup script
```

---

## 📘 API Documentation

### 🔐 Authentication

| Endpoint         | Method | Description                    |
|------------------|--------|--------------------------------|
| `/auth/register` | POST   | Register new user              |
| `/auth/login`    | POST   | Login & get JWT                |
| `/auth/google`   | GET    | Google OAuth redirect          |

---

### 👤 Admin – User Management

> 🔒 Requires Bearer token (admin)

| Endpoint          | Method | Description             | Notes                            |
|-------------------|--------|-------------------------|----------------------------------|
| `/admin/user`     | POST   | Get user by ID          | Body: `{ "userId": "<uuid>" }`   |
| `/admin/user`     | PUT    | Update user             | Includes `firstName`, `lastName` |
| `/admin/user`     | DELETE | Delete user             |                                  |
| `/admin/user`     | POST   | Create new user         |                                  |
| `/admin/users`    | GET    | Get all users           |                                  |

---

### 🚆 Admin – Trip Management

| Endpoint           | Method | Description            | Notes                              |
|--------------------|--------|------------------------|------------------------------------|
| `/admin/trip`      | POST   | Create trip            | Full trip data in request body     |
| `/admin/trip`      | POST   | Get trip by ID         | `{ "tripId": "<uuid>" }` in body   |
| `/admin/trip`      | PUT    | Update trip            |                                    |
| `/admin/trip`      | DELETE | Delete trip            |                                    |
| `/admin/trips`     | GET    | List all trips         | Supports pagination                |

---

### 🧾 Reservations

| Endpoint         | Method | Description                      |
|------------------|--------|----------------------------------|
| `/reservation`   | POST   | Create new reservation           |
| `/trip/:id/seats`| GET    | Get available seats for a trip   |
| `/trip`          | GET    | Get all available trips          |

**Create Reservation Example:**

```json
{
  "userId": "<uuid>",
  "tripId": "<uuid>",
  "seatIds": ["<seat-uuid>"],
  "redemptionType": "partial_discount", // optional
  "pointsToRedeem": 200                 // optional
}
```

---

### 💳 Payment (Paymob)

| Endpoint             | Method | Description                         |
|----------------------|--------|-------------------------------------|
| `/payment/initiate`  | POST   | Create payment session              |
| `/payment/webhook`   | POST   | Handle Paymob webhook for status    |

---

### 🏅 Loyalty Points

| Endpoint             | Method | Description               |
|----------------------|--------|---------------------------|
| `/loyalty`   | GET    | Retrieve user points      |

---

## ❗ Error Handling

All errors return:

```json
{
  "message": "User-friendly error",
  "error": "Detailed developer error"
}
```

---

## 🧪 Setup Instructions

1. **Clone the repository**
```bash
git clone https://github.com/your-username/sekket-masr.git
cd sekket-masr
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
vi .env
# Fill in DB URL, JWT secret, Google client ID/secret, Paymob keys
```

4. **Generate Prisma client & migrate DB**
```bash
npx prisma generate
npx prisma migrate dev
```

5. **Seed the database**
```bash
node populateData.js
```

6. **Start the server**
```bash
npm run dev
```

