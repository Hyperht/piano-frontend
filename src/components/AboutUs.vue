<template>
  <div id="about-us-page">
    <Header />
    <section class="about-main-content">
      <div class="about-text-area">
        <h1>{{ $t('about_us.title') }}</h1> 
        
        <p class="intro-paragraph">
          {{ $t('about_us.intro_welcome') }}
        </p>
        
        <p>
          {{ $t('about_us.paragraph_1') }}
        </p>

        <p>
          {{ $t('about_us.paragraph_2') }}
        </p>
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
// If used in a full layout, you would typically import Header and Footer here:
 import Header from './header.vue';
 import Footer from './Footer.vue';
</script>

<style scoped>
/* Scoped styles for the About Us page content */
#about-us-page {
  font-family: Arial, sans-serif;
  color: #333;
}

/* Main Content Area Layout */
.about-main-content {
  display: flex;
  justify-content: space-between;
  padding: 40px 10%;
  gap: 50px;
  background-color: white; /* Matches the white background in the image */
  min-height: 400px; /* Ensure visual space */
}

.about-text-area {
  flex: 1.5; /* Prioritize space for the text */
  max-width: 700px;
}

h1 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333;
}

.intro-paragraph {
  font-weight: bold;
  margin-bottom: 20px;
}

.about-text-area p {
  margin-bottom: 15px;
  line-height: 1.7;
  font-size: 1em;
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
  max-width: 400px;
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