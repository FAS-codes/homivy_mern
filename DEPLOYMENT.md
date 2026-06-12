# Deploying Homivy

The app deploys as three pieces: **MongoDB** (Atlas), the **Express API**, and the
**React frontend**. The recommended free-tier-friendly stack:

| Piece | Service |
|---|---|
| Database | MongoDB Atlas (free M0 cluster) |
| API | Render / Railway (Node web service) |
| Frontend | Vercel / Netlify (static build) |

## 1. MongoDB Atlas

1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user and allow network access (`0.0.0.0/0` or your API host's IPs).
3. Copy the connection string, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/homivy`
4. Seed production data once from your machine:
   ```bash
   MONGO_URI="mongodb+srv://…/homivy" npm run seed --prefix backend
   ```
   (or set it temporarily in `backend/.env`). **The seed wipes existing data** — run it once.
   Afterwards, change the admin password from the profile page.

## 2. API (Render example)

1. Push this repo to GitHub.
2. Render → New → Web Service → pick the repo.
   - **Root directory:** `backend`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
3. Environment variables:
   ```
   MONGO_URI    = your Atlas connection string
   JWT_SECRET   = a long random string (e.g. `openssl rand -hex 32`)
   JWT_EXPIRES  = 7d
   CLIENT_URL   = https://your-frontend-domain.vercel.app
   PAYMENT_PROVIDER = placeholder
   ```
4. Note the API URL, e.g. `https://homivy-api.onrender.com`.

## 3. Frontend (Vercel example)

The dev server proxies `/api` to localhost; in production the API lives on another
origin, so the frontend needs rewrites:

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://homivy-api.onrender.com/api/:path*" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Then: Vercel → New Project → pick the repo
- **Root directory:** `frontend`
- **Build command:** `npm run build`  ·  **Output:** `dist`

(Netlify equivalent: `_redirects` file with `/api/* https://…/api/:splat 200` and
`/* /index.html 200`.)

Finally, set the API's `CLIENT_URL` to the deployed frontend URL so CORS allows it.

## Alternative: single-server deployment

To serve everything from the Express app (one Render/Railway/VPS service):

1. `npm run build --prefix frontend`
2. Add to `backend/server.js` (before the 404 handler):
   ```js
   import path from "path";
   const dist = path.resolve("../frontend/dist");
   app.use(express.static(dist));
   app.get("*", (req, res) => res.sendFile(path.join(dist, "index.html")));
   ```
3. Deploy the whole repo with build command
   `npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend`
   and start command `npm start --prefix backend`.

## Enabling real payments later

The gateway is modular (`backend/payments/`):

1. **Stripe:** `npm i stripe` in `backend/`, implement `payments/providers/stripe.js`
   (create + confirm a PaymentIntent in `charge()`), set `STRIPE_SECRET_KEY` and
   `PAYMENT_PROVIDER=stripe`, and flip `enabled: true` for the Stripe entry in
   `payments/gateway.js` → `PAYMENT_METHODS`.
2. **PayPal:** same pattern via `payments/providers/paypal.js`.

The checkout page reads methods from `GET /api/orders/payment-methods`, so no
frontend changes are required.

## Production checklist

- [ ] Strong `JWT_SECRET` (never the dev default)
- [ ] Changed seeded admin password
- [ ] Atlas network access restricted where possible
- [ ] `CLIENT_URL` matches the real frontend origin
- [ ] HTTPS on both services (default on Render/Vercel)
