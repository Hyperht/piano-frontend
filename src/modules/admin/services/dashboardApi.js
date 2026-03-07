import axios from 'axios';
import { API_CONFIG } from '@/config/api';

const dashboardApi = axios.create({
    baseURL: `${API_CONFIG.BASE_URL}/dashboard`,
    withCredentials: true,
});

dashboardApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default {
    defaults: dashboardApi.defaults,

    /**
     * Fetch main analytics summary.
     * @param {string} startDate - ISO date string e.g. '2025-01-01'
     * @param {string} endDate   - ISO date string e.g. '2025-12-31'
     */
    getAnalytics(startDate = '', endDate = '') {
        const params = {};
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        return dashboardApi.get('/analytics/', { params });
    },

    /**
     * Fetch revenue chart data.
     * @param {number} period    - Number of days (7, 30, 90, 365)
     * @param {string} startDate - Optional ISO date override
     * @param {string} endDate   - Optional ISO date override
     */
    getRevenueChart(period, startDate = '', endDate = '') {
        const params = { period };
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        return dashboardApi.get('/revenue-chart/', { params });
    },

    getOrdersChart(period) {
        return dashboardApi.get(`/orders-chart/?period=${period}`);
    },

    /**
     * Fetch top products, optionally filtered by category and dates.
     * @param {object|string} paramsOrCategory - Either a params object or a category string (legacy)
     */
    getTopProducts(paramsOrCategory = {}) {
        let params = {};
        if (typeof paramsOrCategory === 'string') {
            // Legacy string call: getTopProducts('Furniture')
            if (paramsOrCategory) params.category = paramsOrCategory;
        } else {
            params = paramsOrCategory;
        }
        return dashboardApi.get('/top-products/', { params });
    },

    getProfile() {
        return dashboardApi.get('/profile/');
    },

    getCategories() {
        return dashboardApi.get('/categories/');
    },

    getExport(type, period = 30) {
        return dashboardApi.get('/export/', {
            params: { type, period },
            responseType: 'blob',
        });
    }
};
