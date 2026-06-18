# Ella's Fitness Centre Gym Management Web Application

A modern, high-end Gym Management Platform designed with a luxurious Red, White, and Black aesthetic. Built with React (Vite, Tailwind CSS v4, Framer Motion) and Node.js (Express, MongoDB).

---

## 🌟 Premium Features

- **Client Workspace:**
  - Active Plan & Expiry Countdown Tracker.
  - Interactive session attendance summary (percentage progress grids).
  - Invoices & payment logs tracker.
  - Self-service profile updates.
- **Admin Command Center:**
  - Global metric cards (active/expired ratios, daily check-ins, revenues).
  - Recharts graphical dashboards (revenue curves, attendance rates, subscription distributions).
  - Member management panel (advanced directory search, filter, edit, date override, and account deletion).
  - Session Check-in board (mark morning/evening check-ins for any calendar date).
  - Webhook reminders log (WhatsApp reminder trigger & sent logs).
- **Integrations:**
  - **Razorpay Checkout:** Supports cards, net banking, UPI, and wallets. Features a client-side sandbox payment simulator for offline/test key environments.
  - **WhatsApp Alert Service:** Automated notifications 

---

## 🛠️ Tech Stack

- **Frontend:** React, Tailwind CSS v4, Framer Motion, React Router v6, Axios, Lucide React, Recharts.
- **Backend:** Node.js, Express.js, MongoDB (Mongoose).
- **Security:** JWT authentication, password encryption via Bcrypt, role guards.

---

## ⚙️ Quick Start Guide

### Prerequisites
- Node.js installed (v16+)
- MongoDB running locally on `mongodb://127.0.0.1:27017/gym_db` (or supply custom `MONGO_URI` in environment variables)

---

### Step 1: Set up the Backend
1. Open terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Start the Express API server:
   ```bash
   npm run dev
   ```
The backend API will run on `http://localhost:5000`.

---

### Step 2: Set up the Frontend
1. Open a new terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Start the Vite React development server:
   ```bash
   npm run dev
   ```
The frontend web application will run on `http://localhost:5173`.

---