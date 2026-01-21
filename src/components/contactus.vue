<template>
  <div id="contact-layout">
    <Header />

    <section class="contact-main-content">
      <div class="form-container">
        <h1>Get in touch !</h1>

        <div class="contact-details">
          <div class="detail-card">
            <h4>Phone Number</h4>
            <span class="info-box">01027004457</span>
          </div>
          <div class="detail-card">
            <h4>Email</h4>
            <span class="info-box info-email">hello@PiAno.com</span>
          </div>
          <div class="detail-card">
            <h4>Head office</h4>
            <span class="info-box info-address">58155 Dare Road</span>
          </div>
        </div>

        <h2>Send Us a Message</h2>
        <form @submit.prevent="handleSubmit" class="contact-form">
          <input v-model="form.fullName" type="text" placeholder="Full name" required>
          <input v-model="form.phone" type="tel" placeholder="Phone number">
          <input v-model="form.email" type="email" placeholder="Email" required>
          <textarea v-model="form.message" placeholder="Message" rows="5" required></textarea>
          <button type="submit" class="send-button">Send</button>
        </form>
      </div>

      <div class="illustration-area">
        <div class="illustration-placeholder">
          <i class="clock-icon">⌚</i>
          <i class="info-icon">ℹ️</i>
          <i class="pencil-icon">✏️</i>
          <i class="mail-icon">✉️</i>
        </div>
      </div>
    </section>

    <Footer />
  </div>
</template>

<script setup>
import { reactive } from 'vue';
// Assuming Header.vue and Footer.vue are in the same directory or accessible path
import Header from './header.vue'; 
import Footer from './Footer.vue';

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  message: '',
});

const handleSubmit = async () => {
  try {
    const response = await fetch('/api/contact/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.fullName,
        email: form.email,
        message: form.message,
        subject: 'New message from website', // Default subject
      }),
    });

    if (response.ok) {
      console.log('Contact Form Submitted:', form);
      alert('Thank you for your message!');
      // Reset form
      form.fullName = '';
      form.phone = '';
      form.email = '';
      form.message = '';
    } else {
      const errorData = await response.json();
      console.error('Failed to send message:', errorData);
      alert('Failed to send message. Please try again later.');
    }
  } catch (error) {
    console.error('An error occurred:', error);
    alert('An error occurred. Please check your connection and try again.');
  }
};
</script>

<style scoped>
/* Scoped styles specific to the contact page content, adapted from the original single-page file */

/* General Layout */
.contact-main-content {
  display: flex;
  padding: 50px 10%;
  gap: 50px;
  min-height: 500px;
  background-color: #f7f7f7; /* Light background for the content area */
}
.form-container {
  flex: 1.2;
  max-width: 600px;
}
.illustration-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Contact Details */
.contact-details {
  display: flex;
  gap: 20px;
  margin: 20px 0 40px;
}
.detail-card h4 {
  font-weight: 500;
  margin-bottom: 5px;
}
.info-box {
  display: inline-block;
  background-color: #e0f2f1; /* Light teal background */
  color: #388e89; /* Teal text color */
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 0.9em;
}

/* Contact Form */
.contact-form input,
.contact-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}
.send-button {
  background-color: #388e89; /* Teal color from the design */
  color: white;
  padding: 12px 25px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
}

/* Illustration Placeholder (simplified) */
.illustration-placeholder {
  width: 100%;
  max-width: 400px;
  height: 350px;
  background-color: #f0f0f0;
  border-radius: 10px;
  display: grid;
  place-items: center;
  font-size: 3em;
  color: #388e89; 
}
</style>