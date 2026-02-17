<template>
  <div id="return-policy-page">
    <Header />
    <section class="policy-main-content">
      <div class="policy-text-area">
        <h1>{{ $t("policy.return.header") }}</h1>
        
        <p class="intro-paragraph">
          {{ $t("policy.return.intro") }}
        </p>

        <div class="policy-section">
          <h2>{{ $t("policy.return.eligibility.title") }}</h2>
          <ul>
            <li>{{ $t("policy.return.eligibility.point_1") }}</li>
            <li>{{ $t("policy.return.eligibility.point_2") }}</li>
            <li>{{ $t("policy.return.eligibility.point_3") }}</li>
          </ul>
        </div>

        <div class="policy-section">
          <h2>{{ $t("policy.return.initiation.title") }}</h2>
          <ol>
            <li>
              <strong>{{ $t("policy.return.initiation.step_1_strong") }}</strong>
              {{ $t("policy.return.initiation.step_1_text") }}
            </li>
            <li>
              <strong>{{ $t("policy.return.initiation.step_2_strong") }}</strong>
              {{ $t("policy.return.initiation.step_2_text") }}
            </li>
            <li>
              <strong>{{ $t("policy.return.initiation.step_3_strong") }}</strong>
              {{ $t("policy.return.initiation.step_3_text") }}
            </li>
          </ol>
        </div>

        <div class="policy-section">
          <h2>{{ $t("policy.return.refunds.title") }}</h2>
          <p>
            {{ $t("policy.return.refunds.text") }}
          </p>
        </div>

        <div class="policy-section">
          <h2>{{ $t("policy.return.damaged.title") }}</h2>
          <p>
            {{ $t("policy.return.damaged.text") }}
          </p>
        </div>

        <div class="policy-section">
          <h2>{{ $t("policy.return.exchanges.title") }}</h2>
          <p>
            {{ $t("policy.return.exchanges.text") }}
          </p>
        </div>

      </div>
      
   
    </section>
    <Footer />
  </div>
</template>

<script setup>
import Header from './header.vue';
import Footer from './Footer.vue';
</script>

<style scoped>
/* Scoped styles for the Return Policy page content */
#return-policy-page {
  font-family: Arial, sans-serif;
  color: #333;
}

/* Main Content Area Layout */
.policy-main-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 10%;
  gap: 50px;
  background-color: white; /* Matches the white background of the policy text in the image */
}

.policy-text-area {
  flex: 1.5; /* Prioritize space for the text */
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

/* List Styling (UL and OL) */
.policy-section ul,
.policy-section ol {
  padding-left: 20px;
  font-size: 0.95em;
}

.policy-section ul {
  list-style: disc;
}

.policy-section ol {
  list-style: decimal;
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
  align-items: flex-start;
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
</style>