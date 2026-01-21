import { createApp, watch } from "vue";
import { createPinia } from "pinia"; 
import App from "./App.vue";
import router from "./router";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
import i18n from "./i18n";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// --- Debugging: Router navigation hooks to capture problematic navigations ---
router.beforeEach((to, from, next) => {
	try {
		console.debug("[NAV] beforeEach", { from: from.fullPath, to: to.fullPath, params: to.params, matched: to.matched.map(m=>m.name) });
	} catch (e) {
		console.debug("[NAV] beforeEach (error reading route):", e);
	}
	next();
});

router.afterEach((to, from) => {
	console.debug("[NAV] afterEach", { from: from.fullPath, to: to.fullPath });
});

router.onError((err) => {
	console.error("[ROUTER ERROR]", err);
});

// i18n is configured in `src/i18n.js` and registered below
const initialLocale =
  localStorage.getItem("lang") ||
  (navigator && navigator.language && navigator.language.split("-")[0]) ||
  "en";

// Determine if we need RTL initially
const isRTL = initialLocale === 'ar'; 

app.use(i18n);
// Ensure <html> has the correct `lang` and `dir` on startup and when locale changes
try {
  document.documentElement.lang = i18n.global.locale.value;
  document.documentElement.dir = i18n.global.locale.value === 'ar' ? 'rtl' : 'ltr';
} catch (e) {
  console.debug('[i18n] initial lang/dir set failed', e);
}

watch(() => i18n.global.locale.value, (newLocale) => {
  try {
    document.documentElement.lang = newLocale;
    document.documentElement.dir = newLocale === 'ar' ? 'rtl' : 'ltr';
  } catch (e) {
    console.debug('[i18n] watch failed to update lang/dir', e);
  }
});
app.use(Toast, {
  // Global options for all toast notifications
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  // Set initial RTL state dynamically based on the loaded language
  rtl: isRTL, // <--- CORRECTED: Now dynamic for initial load
});

// Global Vue error handlers to surface runtime/unmount issues
app.config.errorHandler = (err, vm, info) => {
	try {
		console.error("[VUE ERROR]", err, { info, vm });
	} catch (e) {
		console.error("[VUE ERROR] handler crashed", e);
	}
};

app.config.warnHandler = (msg, vm, trace) => {
	try {
		console.warn("[VUE WARN]", msg, { trace, vm });
	} catch (e) {
		console.warn("[VUE WARN] handler crashed", e);
	}
};

// Catch unhandled promise rejections in the browser
window.addEventListener('unhandledrejection', (ev) => {
	console.error('[UNHANDLED REJECTION]', ev.reason);
});

// Optional: Catch uncaught errors
window.addEventListener('error', (ev) => {
	console.error('[WINDOW ERROR]', ev.error || ev.message, ev);
});
app.mount("#app");