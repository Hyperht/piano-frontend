<template>
  <div id="terms-and-condition-page">
    <Header />
    <section class="policy-main-content">
      <div class="policy-text-area">
        <h1>{{ $t('legal.terms.title') }}</h1>
        
        <p class="intro-paragraph">
          {{ $t('legal.terms.intro') }}
        </p>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_1.header') }}</h2>
          <p>{{ $t('legal.terms.section_1.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_2.header') }}</h2>
          <p>{{ $t('legal.terms.section_2.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_3.header') }}</h2>
          <p>{{ $t('legal.terms.section_3.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_4.header') }}</h2>
          <p>{{ $t('legal.terms.section_4.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_5.header') }}</h2>
          <p>{{ $t('legal.terms.section_5.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_6.header') }}</h2>
          <p>{{ $t('legal.terms.section_6.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_7.header') }}</h2>
          <p>{{ $t('legal.terms.section_7.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_8.header') }}</h2>
          <p>{{ $t('legal.terms.section_8.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_9.header') }}</h2>
          <p>{{ $t('legal.terms.section_9.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_10.header') }}</h2>
          <p>{{ $t('legal.terms.section_10.body') }}</p>
        </div>

        <div class="policy-section">
          <h2>{{ $t('legal.terms.section_11.header') }}</h2>
          <p>{{ $t('legal.terms.section_11.body') }}</p>
        </div>

      </div>
      
      <div class="illustration-area">
        <div class="illustration-placeholder">
            </div>
      </div>
    </section>
    <Footer />
  </div>
</template>

<script setup>
 import Header from './header.vue';
 import Footer from './Footer.vue';
 import { useI18n } from 'vue-i18n'; // Added i18n

 const { t } = useI18n();
</script>

<style scoped>
/* Scoped styles for the Terms and Condition page content */
#terms-and-condition-page {
  font-family: Arial, sans-serif;
  color: #333;
}

/* Main Content Area Layout */
.policy-main-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 10%;
  gap: 50px;
  background-color: white; 
}

.policy-text-area {
  flex: 1.5; 
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
}
</style>