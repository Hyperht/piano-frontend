import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAdminStore = defineStore('adminCustomizer', () => {
    // Theme settings
    const actTheme = ref(localStorage.getItem('adminTheme') || 'lightTheme');
    const isRTL = ref(localStorage.getItem('adminDirection') === 'rtl');
    const miniSidebar = ref(false);
    const sidebarDrawer = ref(true);

    // Initial theme setup (Bootstrap support)
    if (actTheme.value === 'darkTheme') {
        document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-bs-theme', 'light');
    }

    // Initial direction set
    if (isRTL.value) {
        document.documentElement.dir = 'rtl';
        document.documentElement.lang = 'ar';
    } else {
        document.documentElement.dir = 'ltr';
        document.documentElement.lang = 'en';
    }

    // Toggle theme
    const toggleTheme = () => {
        actTheme.value = actTheme.value === 'lightTheme' ? 'darkTheme' : 'lightTheme';
        localStorage.setItem('adminTheme', actTheme.value);

        // Sync Bootstrap theme
        if (actTheme.value === 'darkTheme') {
            document.documentElement.setAttribute('data-bs-theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-bs-theme', 'light');
        }
    };

    // Toggle RTL
    const toggleRTL = () => {
        isRTL.value = !isRTL.value;
        const dir = isRTL.value ? 'rtl' : 'ltr';
        const lang = isRTL.value ? 'ar' : 'en';

        document.documentElement.setAttribute('dir', dir);
        document.documentElement.setAttribute('lang', lang);
        localStorage.setItem('adminDirection', dir);
    };

    // Database tables configuration for CRUD operations
    const databaseTables = ref([
        {
            name: 'Users',
            icon: 'mdiAccount',
            model: 'CustomUser',
            endpoint: '/dashboard/users/',
            fields: [
                'username', 'email', 'name', 'phone_number',
                { name: 'is_staff', type: 'boolean' },
                { name: 'is_active', type: 'boolean' },
                'date_joined'
            ]
        },
        {
            name: 'Vendors',
            icon: 'mdiStore',
            model: 'Vendor',
            endpoint: '/dashboard/vendors/',
            fields: ['name', 'commission_rate', { name: 'is_active', type: 'boolean' }]
        },
        {
            name: 'Products',
            icon: 'mdiPackageVariantClosed',
            model: 'Product',
            endpoint: '/dashboard/products/',
            fields: [
                'name',
                { name: 'description', type: 'textarea' },
                'original_price', 'sale_price',
                { name: 'is_on_sale', type: 'boolean' },
                { name: 'rating', placeholder: '0.0 – 5.0' },
                { name: 'quantity', type: 'number', placeholder: 'Stock count' },
                { name: 'image', type: 'image' },
                { name: 'is_active', type: 'boolean' },
                { name: 'vendor', type: 'select', endpoint: '/dashboard/vendors/' },
                { name: 'category', type: 'select', endpoint: '/dashboard/categories/' },
                { name: 'subcategory', type: 'select', endpoint: '/dashboard/subcategories/' },
                'dimensions',
                { name: 'colors', type: 'select', endpoint: '/dashboard/colors/', multiple: true },
                { name: 'rooms', type: 'select', endpoint: '/dashboard/rooms/', multiple: true },
                { name: 'styles', type: 'select', endpoint: '/dashboard/styles/', multiple: true },
            ],
            // Columns shown in the data table (separate from edit form fields)
            tableColumns: ['name', 'vendor_name', 'category_name', 'original_price', 'is_active']
        },
        {
            name: 'Inventory',
            icon: 'mdiWarehouse',
            model: 'StockMovement',
            endpoint: '/dashboard/inventory/',
            fields: [
                { name: 'product', type: 'select', endpoint: '/dashboard/products/' },
                'change_amount',
                {
                    name: 'reason',
                    type: 'select',
                    options: [
                        { id: 'ORDER', name: 'Order' },
                        { id: 'RETURN', name: 'Return' },
                        { id: 'DAMAGE', name: 'Damage' },
                        { id: 'THEFT', name: 'Theft' },
                        { id: 'MANUAL', name: 'Manual Adjustment' },
                        { id: 'OTHER', name: 'Other' }
                    ]
                },
                { name: 'created_at', type: 'datetime' }
            ]
        },
        {
            name: 'Categories',
            icon: 'mdiShape',
            model: 'Category',
            endpoint: '/dashboard/categories/',
            fields: ['name', { name: 'image', type: 'image' }]
        },
        {
            name: 'Subcategories',
            icon: 'mdiShapeOutline',
            model: 'Subcategory',
            endpoint: '/dashboard/subcategories/',
            fields: [
                'name',
                { name: 'parent_category', type: 'select', endpoint: '/dashboard/categories/' },
                { name: 'image', type: 'image' },
                { name: 'slug', type: 'text' }
            ],
            tableColumns: ['name', 'category_name', 'slug']
        },
        {
            name: 'Colors',
            icon: 'mdiPalette',
            model: 'Color',
            endpoint: '/dashboard/colors/',
            fields: ['name', 'hex_code']
        },
        {
            name: 'Rooms',
            icon: 'mdiFloorPlan',
            model: 'Room',
            endpoint: '/dashboard/rooms/',
            fields: ['name', { name: 'image', type: 'image' }]
        },
        {
            name: 'Styles',
            icon: 'mdiAutoFix',
            model: 'Style',
            endpoint: '/dashboard/styles/',
            fields: ['name', { name: 'image', type: 'image' }]
        },
        {
            name: 'Orders',
            icon: 'mdiCartOutline',
            model: 'Order',
            endpoint: '/dashboard/orders/',
            fields: [
                { name: 'user', type: 'select', endpoint: '/dashboard/users/' },
                {
                    name: 'status',
                    type: 'select',
                    options: [
                        { id: 'NEW', name: 'New' },
                        { id: 'PENDING', name: 'Pending' },
                        { id: 'PROCESSING', name: 'Processing' },
                        { id: 'SHIPPED', name: 'Shipped' },
                        { id: 'DELIVERED', name: 'Delivered' },
                        { id: 'CANCELLED', name: 'Cancelled' }
                    ]
                },
                'total_amount',
                'cart_subtotal',
                { name: 'created_at', type: 'datetime' }
            ]
        },
        {
            name: 'Coupons',
            icon: 'mdiTicketPercent',
            model: 'Coupon',
            endpoint: '/dashboard/coupons/',
            fields: [
                'code', 'discount_value',
                { name: 'valid_from', type: 'datetime' },
                { name: 'expires_at', type: 'datetime' },
                { name: 'is_active', type: 'boolean' }
            ]
        },
        {
            name: 'Hero Slides',
            icon: 'mdiViewCarousel',
            model: 'HeroSlide',
            endpoint: '/dashboard/hero-slides/',
            fields: [
                'name', 'title', 'subtitle', 
                { name: 'description', type: 'textarea' },
                'short_description',
                { name: 'image', type: 'image' }, 
                'button_text', 'button_link',
                { name: 'is_active', type: 'boolean' }, 
                { name: 'order', type: 'number' }
            ]
        },
        {
            name: 'Promo Banners',
            icon: 'mdiBullhorn',
            model: 'PromoBanner',
            endpoint: '/dashboard/promo-banners/',
            fields: [
                'name',
                { name: 'background_image', type: 'image' },
                { name: 'left_image', type: 'image' },
                { name: 'right_image', type: 'image' },
                { name: 'end_date', type: 'datetime' },
                { name: 'is_active', type: 'boolean' }
            ]
        },
        {
            name: 'Promo Grid',
            icon: 'mdiGrid',
            model: 'PromoGridCategory',
            endpoint: '/dashboard/promo-grid/',
            fields: [
                'title', 'subtitle', 
                { name: 'image', type: 'image' }, 
                'background_color', 
                { name: 'is_active', type: 'boolean' }, 
                'order'
            ]
        },
        {
            name: 'Governorates',
            icon: 'mdiMapMarker',
            model: 'Governorate',
            endpoint: '/dashboard/governorates/',
            fields: ['name']
        },
        {
            name: 'Areas',
            icon: 'mdiMapMarkerRadius',
            model: 'Area',
            endpoint: '/dashboard/areas/',
            fields: [
                'name',
                { name: 'governorate', type: 'select', endpoint: '/dashboard/governorates/' },
                'shipping_cost'
            ],
            tableColumns: ['name', 'governorate_name', 'shipping_cost']
        },
        {
            name: 'Addresses',
            icon: 'mdiHomeCity',
            model: 'Address',
            endpoint: '/dashboard/addresses/',
            fields: [
                { name: 'user', type: 'select', endpoint: '/dashboard/users/' },
                'first_name', 'last_name', 'phone_number', 'street_address', 'apartment_details',
                { name: 'area', type: 'select', endpoint: '/dashboard/areas/' }
            ],
            tableColumns: ['user_email', 'first_name', 'last_name', 'area_name', 'governorate_name']
        },
        {
            name: 'Carts',
            icon: 'mdiCart',
            model: 'Cart',
            endpoint: '/dashboard/cart/',
            fields: [{ name: 'user', type: 'select', endpoint: '/dashboard/users/' }, { name: 'is_active', type: 'boolean' }, { name: 'updated_at', type: 'datetime' }]
        },
        {
            name: 'Contact Messages',
            icon: 'mdiEmailOutline',
            model: 'ContactMessage',
            endpoint: '/dashboard/contact/',
            fields: ['name', 'email', 'subject', 'message', { name: 'created_at', type: 'datetime' }]
        },
        {
            name: 'Product Images',
            icon: 'mdiImage',
            model: 'ProductImage',
            endpoint: '/dashboard/products/images/',
            fields: [
                { name: 'product', type: 'select', endpoint: '/dashboard/products/' }, 
                { name: 'image', type: 'image' }, 
                'alt_text',
                { name: 'color', type: 'select', endpoint: '/dashboard/colors/' },
                { name: 'is_primary', type: 'boolean' }
            ]
        }
    ]);




    // Toggle sidebar
    const toggleSidebar = () => {
        sidebarDrawer.value = !sidebarDrawer.value;
    };

    // Toggle mini sidebar
    const toggleMiniSidebar = () => {
        miniSidebar.value = !miniSidebar.value;
    };

    // Analytics State
    const analyticsData = ref({
        total_revenue: 0,
        orders_metrics: {
            today: 0,
            last_30_days: 0,
            last_3_months: 0,
            last_year: 0
        },
        most_watched: [],
        most_wishlisted: [],
        low_stock: [],
        top_selling: [],
        recent_orders: []
    });

    const revenueChartData = ref([]);
    const ordersChartData = ref([]);
    const isLoading = ref(false);

    // Fetch Analytics Data
    const fetchAnalytics = async () => {
        try {
            isLoading.value = true;
            const response = await import('../services/dashboardApi').then(m => m.default.getAnalytics());
            if (response.data) {
                analyticsData.value = response.data;
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const fetchRevenueChart = async (period) => {
        try {
            const response = await import('../services/dashboardApi').then(m => m.default.getRevenueChart(period));
            return response.data;
        } catch (error) {
            console.error('Failed to fetch revenue chart:', error);
            return {};
        }
    };

    const fetchOrdersChart = async (period) => {
        try {
            const response = await import('../services/dashboardApi').then(m => m.default.getOrdersChart(period));
            return response.data;
        } catch (error) {
            console.error('Failed to fetch orders chart:', error);
            return {};
        }
    };

    return {
        actTheme,
        isRTL,
        miniSidebar,
        sidebarDrawer,
        databaseTables,
        analyticsData,
        revenueChartData,
        ordersChartData,
        isLoading,
        toggleTheme,
        toggleRTL,
        toggleSidebar,
        toggleMiniSidebar,
        fetchAnalytics,
        fetchRevenueChart,
        fetchOrdersChart
    };
});

