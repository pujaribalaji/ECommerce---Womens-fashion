# Aarnika — MERN Ecommerce

Premium, Fabindia-inspired (but more modern) storefront for **Aarnika** built with the **MERN stack**:
- **MongoDB** (products, collections)
- **Express + Node** API
- **React + Tailwind** client

## Prerequisites

- Node.js 18+ (recommended 20+)
- MongoDB (local or Atlas)

## Setup

1) Create `server/.env` (copy from `.env.example`):

```bash
cp server/.env.example server/.env
```

2) Create `client/.env`:

```bash
cp client/.env.example client/.env
```

2) Install deps:

```bash
npm install
```

3) Seed the database:

```bash
npm run seed
```

4) Run dev:

```bash
npm run dev
```

- Client: `http://localhost:5173`
- API: `http://localhost:4000/api/health`

## Admin panel (no customer login)

- Admin URL: `http://localhost:5173/admin`
- Set `ADMIN_KEY` in `server/.env`
- When the admin page asks, paste the same `ADMIN_KEY`
- Admin requests send it as `x-admin-key` header

## Payments (Razorpay)

1) Set these in `server/.env`:
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`

2) Checkout page uses Razorpay modal and then verifies signature via the server.

## Scripts

- `npm run dev`: runs client + server
- `npm run seed`: seeds products/collections to MongoDB

