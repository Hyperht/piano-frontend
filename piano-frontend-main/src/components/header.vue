<template>
  <header class="main-header">
    <div class="header-top">
      <!-- NEW: Hamburger Button for Mobile -->
      <button class="hamburger-btn" @click="isMobileMenuOpen = true">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      <div class="logo-container">
        <router-link to="/" class="logo">
          <img :src="logo" :alt="$t('header.logo_alt')" />
        </router-link>
      </div>

      <form @submit.prevent="performSearch" class="search-bar">
        <input
          type="text"
          v-model="searchQuery"
          @input="onSearchInput"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          :placeholder="$t('header.search_placeholder')"
          autocomplete="off"
        />
        <button type="submit" :aria-label="$t('header.search')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>

        <!-- Live suggestions dropdown -->
        <ul
          v-if="showSuggestions && suggestions.length && searchQuery"
          class="search-suggestions"
        >
          <li
            v-for="(s, idx) in suggestions"
            :key="idx"
            @mousedown.prevent="applySuggestion(s)"
          >
            {{ s }}
          </li>
        </ul>
      </form>

      <div class="user-actions">
        <router-link v-if="!isLoggedIn" to="/login" class="login-button">
          {{ $t("header.login") }}
        </router-link>

        <div v-if="isLoggedIn" class="user-profile">
          <svg
            @click="isProfileSidebarOpen = true"
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span @click="isProfileSidebarOpen = true">{{ userName }}</span>
        </div>

        <div class="language-selector" @click="toggleLang">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
            />
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
          <span>{{ langLabel }}</span>
        </div>
        <!-- Use programmatic navigation to ensure clicks register reliably -->
        <a
          href="/favorites"
          class="favorites-link"
          :aria-label="$t('header.favorites')"
          @click.prevent="goFavorites"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            />
          </svg>
        </a>
        <button
          class="cart-link"
          :aria-label="$t('header.cart')"
          @click="toggleCart"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path
              d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"
            />
          </svg>
          <span v-if="cartCount > 0" class="cart-count-badge">{{
            cartCount
          }}</span>
        </button>
      </div>
    </div>

    <div class="header-bottom-wrapper">
      <nav class="header-bottom">
        <ul class="categories-list">
          <li
            v-for="category in categories"
            :key="category.id"
            class="category-item"
          >
            <router-link
              :to="{
                name: 'CategoryPage',
                params: { categoryName: category.name.toLowerCase() },
              }"
            >
              {{ localizedName(category) }}
            </router-link>
            <div class="dropdown-menu">
              <ul
                v-if="
                  category.subcategories && category.subcategories.length > 0
                "
              >
                <li
                  v-for="subcategory in category.subcategories"
                  :key="subcategory.id"
                >
                  <router-link
                    :to="{
                      name: 'SubCategoryPage',
                      params: {
                        categoryName: category.name.toLowerCase(),
                        subCategoryName: subcategory.name.toLowerCase(),
                      },
                    }"
                  >
                    {{ localizedName(subcategory) }}
                  </router-link>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </nav>
    </div>
  </header>

  <ProfileSidebar v-model:isVisible="isProfileSidebarOpen" />

  <CartSidebar :isOpen="isCartOpen" @close="isCartOpen = false" />

  <!-- NEW: Mobile Menu Drawer -->
  <div class="mobile-menu-overlay" v-if="isMobileMenuOpen" @click="isMobileMenuOpen = false"></div>
  <aside class="mobile-menu" :class="{ open: isMobileMenuOpen }">
    <div class="mobile-menu-header">
      <h3>{{ $t('header.menu') || 'Menu' }}</h3>
      <button class="close-menu-btn" @click="isMobileMenuOpen = false">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>
    </div>
    <div class="mobile-menu-content">
      <ul class="mobile-categories-list">
        <li v-for="category in categories" :key="category.id" class="mobile-category-item">
            <div class="mobile-category-header">
                <router-link
                :to="{
                    name: 'CategoryPage',
                    params: { categoryName: category.name.toLowerCase() },
                }"
                @click="isMobileMenuOpen = false"
                >
                {{ localizedName(category) }}
                </router-link>
            </div>
            <!-- Subcategories -->
            <ul v-if="category.subcategories && category.subcategories.length > 0" class="mobile-subcategories">
                <li v-for="sub in category.subcategories" :key="sub.id">
                    <router-link
                    :to="{
                        name: 'SubCategoryPage',
                        params: {
                            categoryName: category.name.toLowerCase(),
                            subCategoryName: sub.name.toLowerCase(),
                        },
                    }"
                    @click="isMobileMenuOpen = false"
                    >
                    - {{ localizedName(sub) }}
                    </router-link>
                </li>
            </ul>
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import axios from "axios";
import logo from "../assets/Group 44.png";
import { useAuthStore } from "@/stores/auth";
import { jwtDecode } from "jwt-decode";
import { getApiUrl } from "@/config/api";
import CartSidebar from "./CartSidebar.vue";
import ProfileSidebar from "./ProfileSidebar.vue";

const router = useRouter();

const categories = ref([]);
const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isAuthenticated);
const userName = computed(() => {
  // Prefer an explicit user object returned by the store. Handle both
  // the unwrapped and ref-wrapped forms (Pinia sometimes unwraps refs).
  const u = authStore.user;
  const nameFromUser = u && (u.name || (u.value && u.value.name));
  if (nameFromUser) return nameFromUser;

  // Next, prefer the username computed getter from the store
  if (authStore.username && authStore.username !== "Guest")
    return authStore.username;

  // Finally, decode the access token as a fallback
  const token =
    (authStore.token && authStore.token.value) ||
    localStorage.getItem("access_token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      return decoded.name || decoded.username || decoded.email || "Account";
    } catch (e) {
      // ignore decode errors
    }
  }

  return "Account";
});

const isCartOpen = ref(false);
const isProfileSidebarOpen = ref(false);
const isMobileMenuOpen = ref(false); // NEW: Mobile menu state
const cartCount = ref(0);

// Language / translate support
const { locale, t } = useI18n();
const lang = ref(localStorage.getItem("lang") || locale.value || "en");
const langLabel = computed(() => (lang.value === "ar" ? "AR" : "EN"));
const applyLang = (l) => {
  try {
    document.documentElement.lang = l;
    document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  } catch (e) {}
};
const toggleLang = () => {
  lang.value = lang.value === "en" ? "ar" : "en";
  localStorage.setItem("lang", lang.value);
  locale.value = lang.value;
  applyLang(lang.value);
};

// Translate category/subcategory names when backend doesn't provide localized fields
const slugify = (s) =>
  (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

const localizedName = (obj, field = "name") => {
  if (!obj) return "";
  const value = obj[field];
  if (value && typeof value === "object") {
    return value[locale.value] || value.en || Object.values(value)[0] || "";
  }

  // support name_en / name_ar fields
  const short = locale.value ? locale.value.split("-")[0] : "en";
  const candidate = `${field}_${short}`;
  if (obj[candidate]) return obj[candidate];

  const base = (obj[field] || obj.name || "").toString().trim();
  const slug = slugify(base);

  // Try multiple key variants to handle minor differences/typos from backend
  const variants = [
    `categories.${slug}`,
    `categories.${slug.replace(/_and_/g, "_&_")}`,
    `categories.${slug.replace(/_/g, "-")}`,
    `categories.${base
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "")}`,
  ];

  for (const key of variants) {
    const translated = t(key);
    if (translated && translated !== key) return translated;
  }

  return obj[field] || obj.name || "";
};

const searchQuery = ref("");
const suggestions = ref([]);
const showSuggestions = ref(false);
let suggestTimeout = null;

const onSearchFocus = () => {
  showSuggestions.value = suggestions.value.length > 0;
};

const onSearchBlur = () => {
  // Delay hiding to allow click on suggestion
  setTimeout(() => (showSuggestions.value = false), 100);
};

const applySuggestion = (text) => {
  searchQuery.value = text;
  showSuggestions.value = false;
  performSearch();
};

const fetchSuggestions = async (q) => {
  try {
    // Backend suggestions from products name/description
    const url = getApiUrl(
      `products/?search=${encodeURIComponent(q)}&page_size=8`
    );
    const response = await axios.get(url);
    const items = Array.isArray(response.data)
      ? response.data
      : response.data.results || response.data.data || [];
    
    //-------------------------------------------------------------------
    // YOUR code
    //const names = items.map((p) => p.name)
    // MY code
    const names = items.map((p) => localizedName(p)).filter(Boolean).slice(0, 8);
    //-------------------------------------------------------------------

    //-------------------------------------------------------------------
    // YOUR code
    // Also include category names that match as hints
    //const categoryHints = categories.value
    // .map((c) => c.name)
     // .filter((n) => n && n.toLowerCase().startsWith(q.toLowerCase()));
    // MY code
    const categoryHints = categories.value
      .map((c) => localizedName(c))
      .filter((n) => n && n.toLowerCase().includes(q.toLowerCase()));
    //-------------------------------------------------------------------
    
    const unique = Array.from(new Set([...names, ...categoryHints]));
    suggestions.value = unique;
    showSuggestions.value = unique.length > 0;
  } catch (err) {
    console.error("suggestions error", err);
    suggestions.value = [];
    showSuggestions.value = false;
  }
};

const onSearchInput = () => {
  const q = searchQuery.value.trim();
  clearTimeout(suggestTimeout);
  if (!q) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }
  // debounce 200ms
  suggestTimeout = setTimeout(() => fetchSuggestions(q), 200);
};

const checkLoginStatus = () => {
  // Ensure Pinia auth state is initialized from localStorage
  authStore.refreshAuth();
  if (authStore.isAuthenticated) {
    fetchCartCount();
  }
};

const logout = () => {
  authStore.clearAuth();
  cartCount.value = 0;
  router.push("/login");
};

const fetchCategories = async () => {
  try {
    const response = await axios.get(getApiUrl("categories/"));
    categories.value = response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const fetchCartCount = async () => {
  const token = localStorage.getItem("access_token");
  if (!token) {
    cartCount.value = 0;
    return;
  }
  try {
    const response = await axios.get(getApiUrl("cart/"), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data && response.data.items) {
      // CHANGED: Check for .items
      cartCount.value = response.data.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
    } else {
      cartCount.value = 0;
    }
  } catch (error) {
    console.error("Error fetching cart count:", error);
    cartCount.value = 0;
  }
};

const toggleCart = () => {
  isCartOpen.value = !isCartOpen.value;
  if (isCartOpen.value && isLoggedIn.value) {
    fetchCartCount();
  }
};

const performSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      name: "Search",
      query: { q: searchQuery.value.trim() },
    });
  }
};

// Programmatic navigation helper for Favorites link with debug + fallback
const goFavorites = () => {
  try {
    console.debug("Favorites link clicked");
    router.push({ name: "Favorites" }).catch((err) => {
      console.debug("router.push failed for Favorites:", err);
      // fallback to full navigation if SPA navigation fails
      window.location.href = "/favorites";
    });
  } catch (err) {
    console.debug("goFavorites error:", err);
    window.location.href = "/favorites";
  }
};

onMounted(() => {
  checkLoginStatus();
  fetchCategories();
  locale.value = lang.value;
  applyLang(lang.value);
  // Debugging: print auth-related storage and store values
  try {
    console.debug("DEBUG authStore:", {
      token: authStore.token,
      user: authStore.user,
      isAuthenticated: authStore.isAuthenticated,
      localStorage_access_token: localStorage.getItem("access_token"),
      localStorage_user: localStorage.getItem("user"),
    });
  } catch (e) {
    console.debug("DEBUG authStore error:", e);
  }
});
</script>

<style scoped>
/* Your existing styles... */
.main-header {
  background-color: #fff;
}
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  border-bottom: 1px solid #e0e0e0;
}
.logo-container .logo {
  display: block;
}
.logo-container img {
  max-height: 40px;
}
.search-bar {
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 500px;
  margin: 0 2rem;
  border: 1px solid #ccc;
  border-radius: 20px;
  overflow: visible; /* allow dropdown to escape container */
  position: relative;
}
.search-bar input {
  border: none;
  padding: 10px 15px;
  width: 100%;
  font-size: 1rem;
  outline: none;
}
.search-bar button {
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
}
.search-bar svg {
  color: #888;
}

/* Suggestions dropdown */
.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e0e0e0;
  border-top: none;
  z-index: 2000;
  list-style: none;
  margin: 0;
  padding: 6px 0;
  max-height: 260px;
  overflow-y: auto;
}
.search-suggestions li {
  padding: 8px 12px;
  cursor: pointer;
}
.search-suggestions li:hover {
  background: #f6f6f6;
}
.user-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}
.user-actions > div,
.user-actions > a,
.user-actions > button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  white-space: nowrap;
}
.user-profile {
  cursor: pointer;
}
.user-profile svg,
.user-profile span {
  cursor: pointer;
}
.language-selector {
  cursor: pointer;
}
.favorites-link {
  color: #333;
}
.cart-link {
  color: #333;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-decoration: none;
  display: flex;
  align-items: center;
  position: relative;
}
.login-button {
  background-color: #007bff;
  color: white;
  padding: 8px 16px;
  border-radius: 999px;
  font-weight: bold;
  text-decoration: none;
  transition: background-color 0.2s ease;
}
.login-button:hover {
  background-color: #0056b3;
}
.logout-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: #e74c3c;
  font-weight: 500;
}
.header-bottom-wrapper {
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;
}
.header-bottom {
  display: flex;
  justify-content: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  position: relative;
  z-index: 100;
}
.categories-list {
  display: flex;
  justify-content: center;
  list-style-type: none;
  padding: 0;
  margin: 0;
  gap: 1.5rem;
}
.category-item {
  position: relative;
}
.category-item > a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
  transition: color 0.2s ease;
  display: block;
}
.category-item:hover > a {
  color: #007bff;
}
.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  min-width: 400px;
}

.category-item:hover .dropdown-menu {
  display: block;
}

.dropdown-menu ul {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  list-style-type: none;
  padding: 0;
  margin: 0;
}
.dropdown-menu li {
  white-space: nowrap;
}
.dropdown-menu li a {
  padding: 0.5rem 1rem;
  display: block;
  color: #555;
  font-weight: 400;
  text-decoration: none;
}
.dropdown-menu li a:hover {
  background-color: #f5f5f5;
  color: #007bff;
}
.cart-count-badge {
  position: absolute;
  top: -12px;
  right: -12px;
  background-color: #f2994a;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  font-weight: bold;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* --- Responsive Styles --- */
.hamburger-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  margin-right: 1rem;
}

[dir="rtl"] .hamburger-btn {
  margin-right: 0;
  margin-left: 1rem;
}

.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2000;
}

.mobile-menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background: #fff;
  z-index: 2001;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

[dir="rtl"] .mobile-menu {
  left: auto;
  right: 0;
  transform: translateX(100%);
}

.mobile-menu.open {
  transform: translateX(0);
}

.mobile-menu-header {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.mobile-menu-header h3 {
  margin: 0;
  font-size: 1.2rem;
}

.close-menu-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.mobile-categories-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-category-item {
  margin-bottom: 1rem;
}

.mobile-category-header a {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
  text-decoration: none;
  display: block;
  margin-bottom: 0.5rem;
}

.mobile-subcategories {
  list-style: none;
  padding-left: 1rem;
  margin: 0;
}

[dir="rtl"] .mobile-subcategories {
  padding-left: 0;
  padding-right: 1rem;
}

.mobile-subcategories li a {
  color: #666;
  text-decoration: none;
  display: block;
  padding: 0.2rem 0;
  font-size: 0.95rem;
}

@media (max-width: 992px) {
  .hamburger-btn {
    display: block;
  }

  .header-bottom-wrapper {
    display: none; /* Hide desktop nav */
  }
  
  .header-top {
    padding: 0.5rem 1rem;
    flex-wrap: wrap;
    gap: 1rem;
  }
  
  .search-bar {
    order: 3; /* Move search to bottom row on mobile */
    width: 100%;
    margin: 0;
    max-width: none;
  }
  
  .logo-container {
    margin-right: auto; 
  }
  
  [dir="rtl"] .logo-container {
    margin-right: 0;
    margin-left: auto;
  }
  
  .user-actions {
    gap: 0.8rem;
  }
  
  .user-actions span {
    display: none; /* Hide text labels in user actions on mobile, show only icons if desired */
  }
  
  .cart-count-badge {
    top: -8px;
    right: -8px;
    width: 18px;
    height: 18px;
    font-size: 0.8rem;
  }
}
</style>
