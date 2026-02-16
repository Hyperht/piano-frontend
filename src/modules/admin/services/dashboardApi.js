import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const dashboardApi = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}/dashboard`,
    withCredentials: true, // Important for Django Session/CSRF
});

// Add auth token if your backend uses token auth
dashboardApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('token'); // Adjust key if necessary
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default {
    defaults: dashboardApi.defaults,
    getAnalytics() {
        return dashboardApi.get('/analytics/');
    },
    getRevenueChart(period) {
        return dashboardApi.get(`/revenue-chart/?period=${period}`);
    },
    getOrdersChart(period) {
        return dashboardApi.get(`/orders-chart/?period=${period}`);
    },
    getTopProducts(category) {
        return dashboardApi.get(`/top-products/?category=${category || ''}`);
    },
    getProfile() {
        return dashboardApi.get('/profile/');
    }
};
