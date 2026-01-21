# Backend Connection Guide

## What I've Done

I've successfully updated your frontend to properly connect with your backend after modifications. Here's what was changed:

### 1. Created Centralized API Configuration
- **File**: `src/config/api.js`
- **Purpose**: Single source of truth for all API endpoints
- **Current URL**: `http://127.0.0.1:8080/api`

### 2. Updated All Components
Updated the following files to use the centralized configuration:
- `src/stores/auth.js`
- `src/stores/Cart.js`
- `src/stores/Location.js`
- `src/components/LoginPage.vue`
- `src/components/SignUp.vue`
- `src/components/ProductGrid.vue`
- `src/components/ProductDetail.vue`
- `src/components/FilterSidebar.vue`
- `src/components/ProductListPage.vue`
- `src/components/SearchPage.vue`
- `src/components/CategorySlider.vue`
- `src/components/StyleSlider.vue`
- `src/components/CartSidebar.vue`
- `src/components/CartPage.vue`

### 3. Added Vite Proxy Configuration
- **File**: `vite.config.js`
- **Purpose**: Handles CORS and proxies API requests
- **Frontend runs on**: `http://localhost:3000`
- **Backend proxy**: `http://127.0.0.1:8080`

## How to Connect Your Backend

### Step 1: Update Backend URL (if needed)
If your backend runs on a different port or URL, update `src/config/api.js`:

```javascript
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8080/api', // Change this if needed
  // Examples:
  // BASE_URL: 'http://localhost:8080/api',
  // BASE_URL: 'http://127.0.0.1:8000/api',
};
```

### Step 2: Start Your Backend
Make sure your backend server is running on the configured URL.

### Step 3: Start Your Frontend
```bash
npm run dev
```

The frontend will start on `http://localhost:3000` and automatically proxy API requests to your backend.

### Step 4: Test the Connection
Run the test script to verify everything is working:

```bash
node test-connection.js
```

## Troubleshooting

### If you get CORS errors:
1. Make sure your backend has CORS configured for `http://localhost:3000`
2. Check that the Vite proxy is working (requests should go through the proxy)

### If you get connection refused:
1. Verify your backend is running
2. Check the port number in `src/config/api.js`
3. Make sure the backend URL is correct

### If you get 404 errors:
1. Check that your backend API endpoints match what the frontend expects
2. Verify the API routes in your backend

## Backend Requirements

Your backend should have these endpoints (based on the frontend code):
- `POST /api/login/` - User login
- `POST /api/register/` - User registration
- `GET /api/products/` - Get products
- `GET /api/categories/` - Get categories
- `GET /api/subcategories/` - Get subcategories
- `GET /api/cart/` - Get user cart
- `POST /api/cart/add_item/` - Add item to cart
- `GET /api/favorites/` - Get user favorites
- `POST /api/favorites/add_or_remove/` - Toggle favorite
- `GET /api/governorates/` - Get shipping locations
- And more...

## Next Steps

1. Start your backend server
2. Run `npm run dev` to start the frontend
3. Test the connection with `node test-connection.js`
4. If everything works, you're all set!

The frontend is now properly configured to work with your modified backend.
