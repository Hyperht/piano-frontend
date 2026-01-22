import { createRouter, createWebHistory } from "vue-router";
import Home from "../components/Home.vue";
import LoginPage from "../components/LoginPage.vue";
import SignUpPage from "../components/SignUp.vue";
import CartPage from "../components/CartPage.vue";
import CheckoutPage from "../components/CheckoutPage.vue";
import SearchPage from "../components/SearchPage.vue";
import ProductPage from "../components/ProductDetail.vue";
import ProductListPage from "../components/ProductListPage.vue";
import ProfilePage from "../components/ProfilePage.vue";
import ContactLayout from "../components/contactus.vue";
import PrivacyPolicy from "../components/PrivacyPolicy.vue";
import ReturnPolicy from "../components/ReturnPolicy.vue";
import TermsAndCondition from "../components/TermsAndCondition.vue";
import AboutUs from "../components/AboutUs.vue";
// 1. New import for the Favorites Page
import FavPage from "../components/FavPage.vue";
import paymentPage from "../components/paymentPage.vue";
import Orders from "../components/Orders.vue";
import AddressesPage from "../components/AddressesPage.vue";
import AddressShow from "../components/addresshow.vue";

const routes = [
  {
    path: "/about-us",
    name: "AboutUs",
    component: AboutUs,
  },
  {
    path: "/terms-and-condition",
    name: "TermsAndCondition",
    component: TermsAndCondition,
  },
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
  },
  {
    path: "/Signup",
    name: "SignUp",
    component: SignUpPage,
  },
  {
    path: "/cart",
    name: "Cart",
    component: CartPage,
  },
  {
    path: "/checkout",
    name: "CheckoutPage",
    component: CheckoutPage,
  },
  {
    path: "/search",
    name: "Search",
    component: SearchPage,
  },
  {
    path: "/product/:id",
    name: "Product",
    component: ProductPage,
    props: true,
  },
  // Routes for category and subcategory pages
  {
    path: "/categories/:categoryName",
    name: "CategoryPage",
    component: ProductListPage,
  },
  {
    path: "/categories/:categoryName/:subCategoryName",
    name: "SubCategoryPage",
    component: ProductListPage,
  },
  // --- Profile Route (KEPT) ---
  {
    path: "/profile",
    name: "ProfileDetails",
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  // 2. Add the new Contact Us route
  {
    path: "/contact",
    name: "ContactUs",
    component: ContactLayout, // Use the imported component here
  },
  {
    path: "/privacy-policy",
    name: "PrivacyPolicy",
    component: PrivacyPolicy,
  },
  {
    path: "/payment", // <-- The path used in router.push()
    name: "payment",
    component: paymentPage, // <-- The component to load
  },
  {
    path: "/return-policy",
    name: "ReturnPolicy",
    component: ReturnPolicy,
  },
  // 3. New route for Favorites Page
  {
    path: "/favorites",
    name: "Favorites",
    component: FavPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "Orders",

    component: Orders,
    meta: { requiresAuth: true },
  },
  {
    path: "/addresses",
    name: "Addresses",
    component: AddressesPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/addresshow",
    name: "AddressShow",
    component: AddressShow,
    meta: { requiresAuth: true },
  },
  // 4. New route for Payment Page
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Authentication guard - redirect unauthenticated users to login
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("access_token");

  if (to.meta.requiresAuth && !token) {
    // Redirect to login with the intended destination
    next({ name: "Login", query: { redirect: to.fullPath } });
  } else {
    next();
  }
});

export default router;
