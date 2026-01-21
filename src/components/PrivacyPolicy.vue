<template>
  <div id="privacy-policy-page">
    <Header />
    <section class="policy-main-content">
      <div class="policy-text-area">
        <h1>{{ $t("privacy.title") }}</h1>

        <p class="intro-paragraph">
          {{ $t("privacy.intro_paragraph") }}
        </p>

        <div class="policy-section">
          <h2>{{ $t("privacy.section_collect") }}</h2>
          <p>{{ $t("privacy.collect_intro") }}</p>
          <ul>
            <li>
              <strong>{{ $t("privacy.collect_personal_info_title") }}</strong>
              {{ $t("privacy.collect_personal_info_desc") }}
            </li>
            <li>
              <strong>{{ $t("privacy.collect_browsing_info_title") }}</strong>
              {{ $t("privacy.collect_browsing_info_desc") }}
            </li>
            <li>
              <strong>{{ $t("privacy.collect_communication_title") }}</strong>
              {{ $t("privacy.collect_communication_desc") }}
            </li>
          </ul>
        </div>

        <div class="policy-section">
          <h2>{{ $t("privacy.section_use") }}</h2>
          <p>{{ $t("privacy.use_intro") }}</p>
          <ul>
            <li>
              <strong>{{ $t("privacy.use_orders_title") }}</strong>
              {{ $t("privacy.use_orders_desc") }}
            </li>
            <li>
              <strong>{{ $t("privacy.use_improve_title") }}</strong>
              {{ $t("privacy.use_improve_desc") }}
            </li>
            <li>
              <strong>{{ $t("privacy.use_marketing_title") }}</strong>
              {{ $t("privacy.use_marketing_desc") }}
            </li>
            <li>
              <strong>{{ $t("privacy.use_legal_title") }}</strong>
              {{ $t("privacy.use_legal_desc") }}
            </li>
          </ul>
        </div>

        <div class="policy-section">
          <h2>{{ $t("privacy.section_protect") }}</h2>
          <p>
            {{ $t("privacy.protect_desc") }}
          </p>
        </div>

        <div class="policy-section">
          <h2>{{ $t("privacy.section_sharing") }}</h2>
          <p>
            {{ $t("privacy.sharing_intro") }}
          </p>
          <ul>
            <li>
              <strong>{{ $t("privacy.sharing_service_providers_title") }}</strong>
              {{ $t("privacy.sharing_service_providers_desc") }}
            </li>
            <li>
              <strong>{{ $t("privacy.sharing_legal_title") }}</strong>
              {{ $t("privacy.sharing_legal_desc") }}
            </li>
          </ul>
        </div>

        <div class="policy-section">
          <h2>{{ $t("privacy.section_cookies") }}</h2>
          <p>
            {{ $t("privacy.cookies_desc") }}
          </p>
        </div>

        <div class="policy-section">
          <h2>{{ $t("privacy.section_rights") }}</h2>
          <p>{{ $t("privacy.rights_intro") }}</p>
          <ul>
            <li>{{ $t("privacy.rights_access") }}</li>
            <li>{{ $t("privacy.rights_update") }}</li>
            <li>{{ $t("privacy.rights_opt_out") }}</li>
          </ul>
        </div>

        <div class="policy-section">
          <h2>{{ $t("privacy.section_changes") }}</h2>
          <p>
            {{ $t("privacy.changes_desc") }}
          </p>
        </div>
      </div>

    
    </section>
    <Footer />
  </div>
</template>

<script setup>
// If you are using this as a standalone component, you may need to import Header and Footer:
import Header from "./header.vue";
import Footer from "./Footer.vue";
</script>

<style scoped>
/* Scoped styles for the Privacy Policy page */
#privacy-policy-page {
  font-family: Arial, sans-serif;
  color: #333;
}

/* Main Content Area */
.policy-main-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 10%;
  gap: 50px;
  background-color: white;
}

.policy-text-area {
  flex: 1.5; /* Takes up more space for the text */
  max-width: 700px;
}

h1 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333;
}

.intro-paragraph {
  margin-bottom: 40px;
  line-height: 1.6;
}

.policy-section {
  margin-bottom: 30px;
}

.policy-section h2 {
  font-size: 1.25em;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.policy-section p {
  margin-bottom: 10px;
  line-height: 1.6;
  font-size: 0.95em;
}

.policy-section ul {
  list-style: disc;
  margin-left: 20px;
  padding-left: 0;
  font-size: 0.95em;
}

.policy-section li {
  margin-bottom: 10px;
  line-height: 1.6;
}

.policy-section li strong {
  font-weight: bold;
}

/* Illustration Styling */
.illustration-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Align illustration near the top of the text */
  padding-top: 30px;
}

.illustration-placeholder {
  /* Simplified placeholder for the image */
  width: 100%;
  max-width: 350px;
  height: 350px;
  background-color: #f0f0f0;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
  color: #388e89; /* Teal color */
  /* In a real app, this would be an SVG or image tag */
}

/* You would need to include the actual Footer component CSS, 
      but since it's an imported component, its styles should be self-contained. */
</style>