// Simple script to test the API endpoint
const axios = require('axios');

async function testApiEndpoint() {
  const apiEndpoint = process.env.VITE_API_Endpoint || 'http://localhost:3000/api';
  
  console.log(`Testing API endpoint: ${apiEndpoint}`);
  
  try {
    // Test the readiness endpoint first
    const response = await axios.get(`${apiEndpoint}/system-complete/readiness`);
    console.log('✅ System readiness check successful:', response.data);
  } catch (error) {
    console.log('❌ System readiness check failed:', error.message);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
    }
  }
  
  try {
    // Test the leave requests endpoint
    // Note: This will likely fail without authentication
    const token = localStorage ? localStorage.getItem('authToken') : null;
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios.get(`${apiEndpoint}/leave/requests`, { headers });
    console.log('✅ Leave requests endpoint accessible:', response.data);
  } catch (error) {
    console.log('⚠️ Leave requests endpoint error (expected without auth):', error.message);
  }
}

testApiEndpoint();