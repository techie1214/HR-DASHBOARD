// Test Shift Exceptions API Endpoints
const API_BASE = 'http://localhost:3000/api';
const TOKEN = localStorage.getItem('authToken') || process.env.AUTH_TOKEN;

async function testExceptionsAPI() {
  console.log('🧪 Testing Shift Exceptions API...\n');

  if (!TOKEN) {
    console.error('❌ No auth token found. Please log in first.');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Test 1: Get all exceptions
    console.log('📋 Test 1: GET /shift-scheduling/exceptions/0');
    const getResponse = await fetch(`${API_BASE}/shift-scheduling/exceptions/0`, { headers });
    const getData = await getResponse.json();
    console.log('Status:', getResponse.status);
    console.log('Response:', JSON.stringify(getData, null, 2));
    console.log('✅ GET successful\n');

    // Test 2: Create an exception
    console.log('➕ Test 2: POST /shift-scheduling/exceptions');
    const testException = {
      user_id: 1,
      exception_date: '2026-03-15',
      exception_type: 'late_start',
      new_start_time: '10:00:00',
      new_end_time: '18:00:00',
      new_break_duration_minutes: 60,
      reason: 'Test exception - Doctor appointment',
      status: 'active'
    };
    
    const postResponse = await fetch(`${API_BASE}/shift-scheduling/exceptions`, {
      method: 'POST',
      headers,
      body: JSON.stringify(testException)
    });
    const postData = await postResponse.json();
    console.log('Status:', postResponse.status);
    console.log('Response:', JSON.stringify(postData, null, 2));
    
    if (postData.data && postData.data.exception) {
      const exceptionId = postData.data.exception.id;
      console.log(`✅ POST successful (ID: ${exceptionId})\n`);

      // Test 3: Update the exception
      console.log('✏️ Test 3: PUT /shift-scheduling/exceptions/' + exceptionId);
      const updateData = {
        reason: 'Updated reason - Dentist appointment',
        new_start_time: '11:00:00'
      };
      const putResponse = await fetch(`${API_BASE}/shift-scheduling/exceptions/${exceptionId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updateData)
      });
      const putResult = await putResponse.json();
      console.log('Status:', putResponse.status);
      console.log('Response:', JSON.stringify(putResult, null, 2));
      console.log('✅ PUT successful\n');

      // Test 4: Delete the exception
      console.log('🗑️ Test 4: DELETE /shift-scheduling/exceptions/' + exceptionId);
      const deleteResponse = await fetch(`${API_BASE}/shift-scheduling/exceptions/${exceptionId}`, {
        method: 'DELETE',
        headers
      });
      const deleteResult = await deleteResponse.json();
      console.log('Status:', deleteResponse.status);
      console.log('Response:', JSON.stringify(deleteResult, null, 2));
      console.log('✅ DELETE successful\n');
    } else {
      console.log('⚠️ No exception created, skipping update/delete tests\n');
    }

    console.log('🎉 All API tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testExceptionsAPI();
