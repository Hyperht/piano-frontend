// Simple test script to verify backend connection
// Run this with: node test-connection.js

import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8080/api';

async function testConnection() {
  console.log('Testing backend connection...');
  console.log(`Backend URL: ${API_BASE_URL}`);
  
  try {
    // Test basic connectivity
    const response = await axios.get(`${API_BASE_URL}/`, {
      timeout: 5000
    });
    console.log('✅ Backend is reachable!');
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.log('❌ Backend connection failed!');
    console.log('Error details:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Possible solutions:');
      console.log('1. Make sure your backend server is running');
      console.log('2. Check if the backend is running on port 8080');
      console.log('3. Verify the backend URL in src/config/api.js');
    }
  }
}

testConnection();
