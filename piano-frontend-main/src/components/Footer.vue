<template>
  <footer class="main-footer">
    <div class="footer-top">
      <div class="footer-column logo-column">
        <div class="logo-container">
          <img :src="logoImage" alt="Piano Logo" class="logo-image" />
        </div>
        <div class="contact-info"></div>
      </div>

      <div class="footer-column">
        <h4>{{ $t("footer.company") }}</h4>
        <ul>
          <li>
            <router-link to="/about-us">{{ $t("footer.about") }}</router-link>
          </li>
          <li>
            <router-link to="/contact">{{ $t("footer.contact") }}</router-link>
          </li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>{{ $t("footer.important_links") }}</h4>
        <ul>
          <li>
            <router-link to="/return-policy">{{
              $t("footer.return_policy")
            }}</router-link>
          </li>
          <li>
            <router-link to="/privacy-policy">{{
              $t("footer.privacy_policy")
            }}</router-link>
          </li>
          <li>
            <router-link to="/terms-and-condition">{{
              $t("footer.terms")
            }}</router-link>
          </li>
        </ul>
      </div>

      <div class="footer-column">
        <h4>{{ $t("footer.need_help") }}</h4>
        <a href="mailto:pianohomefurniture@gmail.com" class="email-link"
          >pianohomefurniture@gmail.com</a
        >
        <br /><br />
        <h4>{{ $t("footer.location") }}</h4>
        <ul>
          <li>{{ $t("footer.city_new_cairo") }}</li>
          <li>{{ $t("footer.city_october") }}</li>
          <li>{{ $t("footer.city_alexandria") }}</li>
        </ul>
      </div>
    </div>

    <hr class="footer-divider" />

    <div class="footer-bottom">
      <div class="payment-methods">
        <h4>{{ $t("footer.payment_methods") }}</h4>
        <div class="payment-icons">
          <img
            src="../assets/visa.png"
            alt="Visa"
            class="payment-icon-visa"
          />
          <img
            src="../assets/master-card.png"
            alt="Mastercard"
            class="payment-icon-mastercard"
          />
        </div>
      </div>

      <div class="shop-on-the-go">
        <h4>{{ $t("footer.shop_on_the_go") }}</h4>
        <div class="app-links">
          <a
            href="https://play.google.com/store/apps"
            target="_blank"
            rel="noopener noreferrer"
            class="app-link-google"
          >
            <img
              src="../assets/google-play.png"
              alt="Google Play"
            />
          </a>
          <a
            href="https://www.apple.com/app-store/"
            target="_blank"
            rel="noopener noreferrer"
            class="app-link-apple"
          >
            <img
              src="../assets/app-store.png"
              alt="Apple Store"
            />
          </a>
        </div>
      </div>

      <div class="social-media">
        <h4>{{ $t("footer.follow_us") }}</h4>
        <div class="social-icons">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-twitter"
            >
              <path
                d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
              ></path>
            </svg>
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-linkedin"
            >
              <path
                d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
              ></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-facebook"
            >
              <path
                d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
              ></path>
            </svg>
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="feather feather-instagram"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
          </a>
        </div>
      </div>
    </div>

    <div class="footer-copyright">
      <p>{{ $t("footer.copyright", { year: new Date().getFullYear() }) }}</p>
    </div>
  </footer>
</template>

<script setup>
import logoImage from "@/assets/0 15.png";
</script>

<style scoped>
.main-footer {
  background-color: #3b827e;
  color: white;
  padding: 4rem 2rem;
  font-family: Arial, sans-serif;
}

@media (max-width: 768px) {
  .main-footer {
    padding: 2rem 1rem;
  }
}

.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  padding-bottom: 2rem;
  gap: 2rem;
}

.footer-column {
  flex: 1;
  min-width: 150px;
  margin-bottom: 2rem;
}

.logo-column {
  flex: 2;
  min-width: 200px;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  /* Shift the logo container to the right */
  margin-left: 1rem;
}

.logo-image {
  /* Make the image bigger */
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-right: 1rem;
}

h4 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  font-weight: bold;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul li {
  margin-bottom: 0.5rem;
}

a {
  color: white;
  text-decoration: none;
  transition: text-decoration 0.3s ease;
}

a:hover {
  text-decoration: underline;
}
.app-link-google{
  width: 37px;
  height: 36px;
}
.app-link-apple{
  width: 37px;
  height: 36px;
}
.payment-icon-mastercard{
  width: 37px;
  height: 36px;
}
.payment-icon-visa{
  width: 37px;
  height: 36px;
}
.email-link {
  font-weight: bold;
}

.footer-divider {
  border: 0;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.3);
  margin-bottom: 2rem;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  text-align: center;
  gap: 2rem;
}

.payment-methods,
.shop-on-the-go,
.social-media {
  flex: 1;
  min-width: 150px;
  margin-bottom: 2rem;
}

.payment-icons,
.app-links,
.social-icons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.app-links a img {
  width: 100%;
  height: auto;
  display: block;
}

.social-icons a {
  color: white;
  transition: transform 0.3s ease;
}

.social-icons a:hover {
  transform: scale(1.1);
}

.footer-copyright {
  text-align: center;
  width: 100%;
  font-size: 0.9rem;
  padding-top: 1rem;
}

@media (max-width: 768px) {
  .footer-top,
  .footer-bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
</style>
