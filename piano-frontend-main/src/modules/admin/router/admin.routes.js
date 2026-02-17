export const adminRoutes = {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
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
        }
    ]
};
