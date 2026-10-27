# Infinity Electronics

MERN e-commerce app for electronics products.

## Stack
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Auth:** JWT
- **Images:** Cloudinary
- **Payments:** Razorpay

## Features
- Customer: shop, cart, checkout, orders, profile
- Admin: products, categories, brands, orders, dashboard
- Search, filters, pagination
- Online payment with Razorpay

## Setup

### 1. Clone
<!-- bash -->
git clone https://github.com/Govind-Git-hub/Infinity-Electronics.git
cd Infinity-Electronics

# 2. Install
npm run install-all

# 3. Environment

Copy .env.example to backend/.env and fill in values:
MONGO_URI
JWT_SECRET
Cloudinary keys
Razorpay test keys

# 4. Run

npm run dev

# Frontend: http://localhost:5173
# Backend: http://localhost:5000

# Scripts

# Command        Description
# npm run dev     Backend + frontend together
# npm run server  Backend only
# npm run client  Frontend only

## Docker

### Requirements
- Docker Desktop

### Run
```bash
docker compose up --build

# StopBash
docker compose down

Adjust ports if yours differ.