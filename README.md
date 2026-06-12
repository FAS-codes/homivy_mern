# Homivy — MERN E-Commerce Store

A full-stack home essentials store: **MongoDB + Express + React + Node**.

```
homivy/
├── backend/        Express REST API (JWT auth, Mongoose models, modular payments)
├── frontend/       React app (Vite) — storefront, user dashboard, admin dashboard
├── static-site/    Original static HTML version (kept for reference)
└── package.json    Root scripts to run both apps together
```

## Quick start

Prerequisites: Node 18+, MongoDB running locally (`mongodb://127.0.0.1:27017`).

```bash
# 1. install everything
npm run install:all

# 2. configure the API (defaults work for local dev)
cp backend/.env.example backend/.env

# 3. seed the database (categories, 20 products, demo users, coupons)
npm run seed

# 4. run API (:5050) + frontend (:5173) together
npm run dev
```

Open **http://localhost:5173**

### Demo accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@homivy.com | admin123 |
| Customer | demo@homivy.com | demo123 |

### Demo coupons
`WELCOME10` (10% off) · `HOME5` (£5 off £30+)

## Features

**Storefront** — home, shop with category filter/search/sort, product pages with
gallery, stock indicators, reviews, related products, cart (localStorage), checkout.

**User dashboard** (`/account`) — registration/login (JWT), profile management,
change password, order history, order details with tracking timeline, order
cancellation, wishlist, saved address book, logout.

**Admin dashboard** (`/admin`) — analytics (revenue chart, top products, low stock,
recent orders), product CRUD, category CRUD, order management with status/tracking
updates, customer list with spend, inventory management, sales reports by date range
and category, coupon CRUD, review moderation (approve/reject syncs product ratings).

**Payments** — modular gateway (`backend/payments/`). Active provider is the
placeholder (Cash on Delivery + demo card). Stripe and PayPal stubs are wired into
the same interface — implement the provider file, set `PAYMENT_PROVIDER` in `.env`,
and the checkout flow needs no changes.

**Database collections** — Users, Products, Categories, Orders, Reviews, Wishlists, Coupons.

## API overview

| Area | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me` |
| Users | `PUT /api/users/profile`, `PUT /api/users/password`, `POST/PUT/DELETE /api/users/addresses` |
| Products | `GET /api/products`, `GET /api/products/:slug`, admin CRUD |
| Categories | `GET /api/categories`, admin CRUD |
| Orders | `POST /api/orders` (checkout), `GET /api/orders/mine`, `GET /api/orders/:id`, `PUT /api/orders/:id/cancel`, admin list + `PUT /:id/status` |
| Reviews | `GET /api/reviews/product/:id`, `POST /api/reviews`, admin moderation |
| Wishlist | `GET /api/wishlist`, `POST /api/wishlist/:productId` (toggle) |
| Coupons | `POST /api/coupons/validate`, admin CRUD |
| Admin | `/api/admin/analytics`, `/api/admin/sales-report`, `/api/admin/customers`, `/api/admin/inventory/:id` |

See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment.
