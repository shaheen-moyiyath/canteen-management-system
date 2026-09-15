# Canteen Ordering System 🍽️
**A Digital Solution for College Canteens**  
*Major Project - Department of Computer Science, Amal College of Advanced Studies, Nilambur*

---

## 📌 Project Overview
The **Canteen Ordering System** is a full-stack web application designed to digitize and automate daily meal orders in a college canteen. It replaces error-prone pen-and-paper tallying with:
- **Student Portal**: Daily menu discovery, multi-item ordering tray, real-time bill calculation, and past order history.
- **Admin & Kitchen Dashboard**: Live meal preparation tallies (e.g. *"Veg Thali: 52, Chicken Biryani: 35"*), counter pickup verification via College ID, menu catalog management (CRUD), and static daily reconciliation reports with printable export.

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: Next.js 14 (App Router, React 18, Tailwind CSS, Lucide React icons).
- **Backend**: Express.js REST API (Node.js).
- **Database**: MySQL (with zero-configuration automated embedded fallback when running without an active MySQL daemon).
- **Security**: Role-Based Access Control (RBAC) via JSON Web Tokens (JWT) & bcrypt password encryption (`roles: student, admin`).

---

## 📂 Project Directory Structure

```
canteen/
├── backend/
│   ├── config/
│   │   └── db.js                 # Dual MySQL (mysql2/promise) connection pool + auto fallback
│   ├── controllers/
│   │   ├── authController.js     # Login, registration, token verification
│   │   ├── menuController.js     # Public / student menu retrieval (available items)
│   │   ├── orderController.js    # Atomic order transaction & student order history
│   │   └── adminController.js    # Menu CRUD, live dashboard tallies, daily reconciliation report
│   ├── middleware/
│   │   └── auth.js               # JWT verification & RBAC authorization middleware
│   ├── routes/
│   │   ├── auth.js               # POST /api/auth/login, /api/auth/register, GET /api/auth/me
│   │   ├── menu.js               # GET /api/menu
│   │   ├── orders.js             # POST /api/orders, GET /api/orders/history
│   │   └── admin.js              # Menu CRUD, /dashboard, /reports/daily, /orders/:id/status
│   ├── database/
│   │   ├── schema.sql            # Exact MySQL DDL schema script
│   │   └── seed.sql              # Initial admin & student credentials + catalog
│   ├── test-integration.js       # End-to-end API integration test runner
│   ├── server.js                 # Express application entry point
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.js         # Root layout with Auth & Cart providers
│   │   │   ├── page.js           # Campus portal landing page
│   │   │   ├── login/page.js     # Login page with student/admin tabs & demo fillers
│   │   │   ├── student/
│   │   │   │   ├── menu/page.js      # Menu discovery & interactive ordering
│   │   │   │   └── history/page.js   # Order history & receipts
│   │   │   └── admin/
│   │   │       ├── dashboard/page.js # Live kitchen tallies & student counter verification
│   │   │       ├── menu/page.js      # Menu items CRUD & availability toggle
│   │   │       └── reports/page.js   # Daily static reconciliation summary report (print-ready)
│   │   ├── components/
│   │   │   ├── Navbar.js         # Responsive header with role badges & cart trigger
│   │   │   ├── CartDrawer.js     # Tray drawer with line totals & order placement
│   │   │   └── ProtectedRoute.js # Client-side RBAC guard
│   │   ├── context/
│   │   │   ├── AuthContext.js    # Global authentication & JWT state
│   │   │   └── CartContext.js    # Order cart & persistence
│   │   └── lib/
│   │       └── api.js            # Standardized API client
│   ├── tailwind.config.js
│   ├── package.json
│   └── .env.local
│
└── README.md
```

---

## 🔑 Default Credentials

| Role | Name | College ID | Password | Portal View |
|---|---|---|---|---|
| **Admin** | Canteen Administrator | `ADMIN01` | `admin123` | `/admin/dashboard` |
| **Student** | Muhammed Shaheen M | `AZAYSCS032` | `student123` | `/student/menu` |
| **Student** | Sainul Ashiqu N | `AZAYSCS043` | `student123` | `/student/menu` |
| **Student** | Rayan Ramzan Kollappatta | `AZAYSCS038` | `student123` | `/student/menu` |
| **Student** | Muhammed Nihal NK | `AZAYSCS029` | `student123` | `/student/menu` |
| **Student** | Sinan Khan K | `AZAYSCS049` | `student123` | `/student/menu` |

> *Tip: The Login page also provides one-click "Demo Credentials" buttons to quickly log in as either student or admin.*

---

## 🗄️ Database Setup (MySQL)

### Option A: Using Local MySQL Server / WAMP / XAMPP
1. Start your MySQL service (e.g. in XAMPP or WAMP Control Panel).
2. Open your MySQL client or phpMyAdmin and execute:
   ```bash
   mysql -u root -p < backend/database/schema.sql
   mysql -u root -p < backend/database/seed.sql
   ```
3. Update `backend/.env` with your MySQL connection credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=canteen_db
   DB_PORT=3306
   ```

### Option B: Zero-Config Out-of-the-Box Mode
If MySQL is not currently running on your machine, the backend will **automatically detect it and initialize a local SQLite fallback database (`backend/database/canteen.sqlite`) with the exact same schema and seed data**, allowing you to run and evaluate the application immediately!

---

## 🚀 Quick Start Guide

### 1. Start Express Backend
```bash
cd backend
npm install
npm start
```
*Backend runs on: `http://localhost:5000`*  
*Health check: `http://localhost:5000/api/health`*

To run integration tests:
```bash
node test-integration.js
```

### 2. Start Next.js Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on: `http://localhost:3000`*

---

## 🌐 API Specification

### Authentication
- `POST /api/auth/login` - Authenticate via `college_id` & `password`
- `GET /api/auth/me` - Get current user profile (Bearer token)
- `POST /api/auth/register` - Helper endpoint to register student

### Student Endpoints
- `GET /api/menu` - Fetch items where `is_available = 1`
- `POST /api/orders` - Place daily order with selected items
- `GET /api/orders/history` - Fetch student's order history & receipts

### Admin Endpoints
- `GET /api/admin/menu` - Fetch all items (available & unavailable)
- `POST /api/admin/menu` - Add new dish to menu
- `PUT /api/admin/menu/:id` - Update dish name, description, price, availability
- `DELETE /api/admin/menu/:id` - Delete or retire dish
- `GET /api/admin/dashboard` - Live order counts, kitchen meal tallies, student pickup list
- `PATCH /api/admin/orders/:id/status` - Mark order as `completed` or `cancelled`
- `GET /api/admin/reports/daily?date=YYYY-MM-DD` - Daily static reconciliation summary
