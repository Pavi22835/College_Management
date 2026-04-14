const loginUrl = 'http://localhost:3003/api/auth/login';
const statsUrl = 'http://localhost:3003/api/attendance/admin/stats';

const run = async () => {
  try {
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' })
    });

    const loginData = await loginRes.json();
    const token = loginData?.data?.token || loginData?.token || loginData?.accessToken || loginData?.data?.accessToken;
    console.log('token:', token ? token.slice(0, 20) + '...' : 'NO TOKEN');

    const statsRes = await fetch(statsUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const statsData = await statsRes.json();
    console.log('stats response:');
    console.log(JSON.stringify(statsData, null, 2));
  } catch (err) {
    console.error('ERROR', err.message || err);
  }
};

run();
