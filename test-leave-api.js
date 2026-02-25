// Test script to check leave API with authentication
// Run this in browser console to debug

console.log('=== Leave API Debug Test ===\n');

// 1. Check auth token
const token = localStorage.getItem('authToken');
console.log('1. Auth Token:', token ? 'Present ✓' : 'Missing ✗');
if (token) {
  console.log('   Token preview:', token.substring(0, 20) + '...');
}

// 2. Check user info
const userInfo = localStorage.getItem('userInfo');
console.log('\n2. User Info:', userInfo ? 'Present ✓' : 'Missing ✗');
if (userInfo) {
  try {
    console.log('   User:', JSON.parse(userInfo));
  } catch (e) {
    console.log('   Error parsing:', e);
  }
}

// 3. Test API call
console.log('\n3. Testing API call...');
fetch('http://localhost:3000/api/leave', {
  headers: {
    'Authorization': `Bearer ${token || ''}`,
    'Content-Type': 'application/json',
  }
})
.then(res => {
  console.log('   Response status:', res.status, res.ok ? '✓' : '✗');
  return res.json();
})
.then(data => {
  console.log('   Response data:', data);
  if (data?.leaveRequests || data?.data?.leaveRequests) {
    const requests = data.leaveRequests || data.data.leaveRequests;
    console.log('   ✓ Leave requests count:', requests.length);
  } else if (data?.message) {
    console.log('   ✗ Error message:', data.message);
  }
})
.catch(err => {
  console.log('   ✗ Fetch error:', err.message);
});

console.log('\n=== Test Complete ===');
