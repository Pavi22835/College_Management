import http from 'http';

// First, login to get token
const loginOptions = {
  hostname: 'localhost',
  port: 3003,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const loginData = JSON.stringify({
  email: 'admin@example.com',
  password: 'admin123'
});

const req = http.request(loginOptions, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    const response = JSON.parse(data);
    console.log('Login Response:', response);
    
    if (response.token) {
      const token = response.token;
      
      // Now test attendance API
      const attendanceOptions = {
        hostname: 'localhost',
        port: 3003,
        path: '/api/attendance/admin',
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      const attendanceReq = http.request(attendanceOptions, (res) => {
        let attData = '';
        
        res.on('data', (chunk) => {
          attData += chunk;
        });
        
        res.on('end', () => {
          const attendanceResponse = JSON.parse(attData);
          console.log('\n\nAttendance API Response:');
          console.log('Success:', attendanceResponse.success);
          console.log('Data count:', attendanceResponse.data?.length || 0);
          if (attendanceResponse.data && attendanceResponse.data.length > 0) {
            console.log('First record:', JSON.stringify(attendanceResponse.data[0], null, 2));
          }
        });
      });
      
      attendanceReq.on('error', (e) => {
        console.error(`Problem with attendance request: ${e.message}`);
      });
      
      attendanceReq.end();
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with login request: ${e.message}`);
});

req.write(loginData);
req.end();
