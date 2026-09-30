# Stride - Modern Footwear E-Commerce Storefront

Stride is a modern, high-performance MERN (MongoDB, Express, React, Node.js) e-commerce application designed with a minimalist black-and-white editorial aesthetic, responsive layouts, and robust customer shopping workflows.

## Features

- **Storefront & Catalog**: Photographic hero section, featured footwear grid, category filtering, instant client search, and price sorting.
- **Product Detail View**: Image zoom preview, INR pricing (`₹`), real-time stock indicator, integer quantity validation, out-of-stock disabling, and error feedback.
- **Shopping Cart**: Real-time server-backed cart state, item removal, quantity updates, subtotal calculation, and instant Navbar cart badge count synchronization.
- **Customer Authentication**: Secure JWT authentication, login/signup forms, automatic 401 token cleanup, and safe internal return path navigation (e.g. returning to product detail page post-login).
- **Demo Checkout & Orders**: Server-calculated authoritative totals, shipping address collection, unpaid pending demo order placement, and personal order history (`/orders`).
- **Admin Dashboard**: Protected management panel (`/admin`) for product inventory CRUD (create, edit, delete with confirmation, stock adjustments) and order fulfillment status updates (`pending`, `shipped`, `delivered`).

---

## Environment Variables

Create a `.env` file in the project root (for Node backend) and inside `frontend/.env` (for Vite frontend):

### Root `.env` (Backend)
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stride
PORT=5001
JWT_SECRET=your_secure_jwt_secret_key_here
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env` (Frontend)
```env
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## Getting Started

### 1. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
npm --prefix frontend install
```

### 2. Run Locally
```bash
# Start backend server (Port 5001)
npm start

# In a separate terminal, start frontend dev server (Vite)
npm --prefix frontend run dev
```

---

## Building for Production

```bash
# Build Vite production assets
npm --prefix frontend run build
```

---

## Deployment Setup & SPA Route Fallback

1. **Backend Server**: Deploy `server.js` to any Node.js hosting platform (e.g., Render, Railway, Heroku). Ensure `MONGODB_URI`, `JWT_SECRET`, `PORT`, and `FRONTEND_URL` environment variables are configured.
2. **Frontend SPA Hosting**: Deploy the `frontend/dist` directory to static hosting (Netlify, Vercel, Cloudflare Pages).
   - **Netlify/Cloudflare**: A `public/_redirects` file (`/* /index.html 200`) is included to handle client-side React Router navigation.
   - **Vercel**: Configure `vercel.json` rewrites mapping `/(.*)` to `/index.html`.

---

## Demo Limitations

- **Demo Checkout**: Order placement creates unpaid `pending` orders. No real payment gateways or credit card processing are attached.
- **Database Connection**: Ensure the server IP is whitelisted in your MongoDB Atlas cluster Network Access settings.
