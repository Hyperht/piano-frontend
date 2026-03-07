export const adminRoutes = {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
        {
            path: '',
            name: 'AdminDashboard',
            component: () => import('../views/Dashboard.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: 'crud/:model',
            name: 'AdminCRUD',
            component: () => import('../views/CRUDView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: 'customers',
            name: 'AdminCustomers',
            component: () => import('../views/Customers.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: 'orders',
            name: 'AdminOrders',
            component: () => import('../views/OrdersList.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: 'analytics/top-products',
            name: 'AdminTopProducts',
            component: () => import('../views/analytics/TopProductsView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: 'analytics/most-watched',
            name: 'AdminMostWatched',
            component: () => import('../views/analytics/TopWatchedView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: 'analytics/most-wishlisted',
            name: 'AdminMostWishlisted',
            component: () => import('../views/analytics/TopWishlistedView.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: 'inventory/stock-needed',
            name: 'AdminStockNeeded',
            component: () => import('../views/inventory/StockNeededView.vue'),
            meta: { requiresAuth: true }
        }
    ]
};
