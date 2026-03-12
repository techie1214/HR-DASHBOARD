// Test script to check attendance API
import axios from 'axios';

const API_ENDPOINT = process.env.VITE_API_Endpoint || 'http://localhost:3000/api';
const TOKEN = localStorage.getItem('authToken') || '';

async function testAttendanceAPI() {
  const year = 2026;
  const month = 2; // March (0-indexed)
  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

  console.log('Testing Attendance API...');
  console.log('Date range:', startDate, 'to', endDate);
  console.log('Token:', TOKEN ? 'Present' : 'Missing!');

  try {
    // Test 1: Get attendance records
    console.log('\n--- Test 1: GET /attendance/records ---');
    const attendanceRes = await axios.get(`${API_ENDPOINT}/attendance/records`, {
      params: {
        startDate,
        endDate,
        limit: 100,
        page: 1
      },
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', attendanceRes.status);
    console.log('Success:', attendanceRes.data.success);
    console.log('Records count:', attendanceRes.data.data?.attendance?.length || 0);
    if (attendanceRes.data.data?.attendance?.length > 0) {
      console.log('Sample record:', attendanceRes.data.data.attendance[0]);
    }

    // Test 2: Get staff
    console.log('\n--- Test 2: GET /staff ---');
    const staffRes = await axios.get(`${API_ENDPOINT}/staff`, {
      params: {
        page: 1,
        limit: 100
      },
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Status:', staffRes.status);
    console.log('Success:', staffRes.data.success);
    console.log('Staff count:', staffRes.data.data?.staff?.length || 0);
    console.log('Active staff:', staffRes.data.data?.staff?.filter((s: any) => s.status === 'active').length || 0);

  } catch (error: any) {
    console.error('API Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
  }
}

testAttendanceAPI();
