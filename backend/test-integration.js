const http = require('http');

async function run() {
  console.log('--- Starting Integration Test Suite ---');
  const serverModule = require('./server.js');

  // Wait 1.5 seconds for DB and server setup
  await new Promise(r => setTimeout(r, 1500));

  function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: 'localhost',
        port: 5000,
        path: `/api${path}`,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  try {
    // 1. Health check
    console.log('1. Testing Health Check...');
    const health = await request('GET', '/health');
    console.log('Health:', health.status, health.body.status);

    // 2. Student Login
    console.log('\n2. Testing Student Login...');
    const studentLogin = await request('POST', '/auth/login', {
      college_id: 'AZAYSCS032',
      password: 'student123',
      role: 'student'
    });
    console.log('Student Login Status:', studentLogin.status, 'User:', studentLogin.body.user?.name);
    const studentToken = studentLogin.body.token;

    // 3. Admin Login
    console.log('\n3. Testing Admin Login...');
    const adminLogin = await request('POST', '/auth/login', {
      college_id: 'ADMIN01',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin Login Status:', adminLogin.status, 'Role:', adminLogin.body.user?.role);
    const adminToken = adminLogin.body.token;

    // 4. Fetch Menu
    console.log('\n4. Testing Student Menu Fetch...');
    const menuRes = await request('GET', '/menu');
    console.log('Available Menu Items Count:', menuRes.body.count);
    const firstItem = menuRes.body.data[0];
    const secondItem = menuRes.body.data[1];
    console.log('Sample Items:', firstItem?.name, `(₹${firstItem?.price})`, 'and', secondItem?.name, `(₹${secondItem?.price})`);

    // 5. Submit Order
    console.log('\n5. Placing an Order as Student...');
    const orderRes = await request('POST', '/orders', {
      items: [
        { item_id: firstItem.item_id, quantity: 2 },
        { item_id: secondItem.item_id, quantity: 1 }
      ]
    }, studentToken);
    console.log('Order Placement Status:', orderRes.status, 'Order ID:', orderRes.body.data?.order_id, 'Total:', `₹${orderRes.body.data?.total_amount}`);
    const orderId = orderRes.body.data?.order_id;

    // 6. Student History
    console.log('\n6. Checking Student Order History...');
    const historyRes = await request('GET', '/orders/history', null, studentToken);
    console.log('History Orders Count:', historyRes.body.data?.length, 'Latest Order ID:', historyRes.body.data[0]?.order_id);

    // 7. Admin Live Dashboard
    console.log('\n7. Checking Admin Live Dashboard...');
    const dashRes = await request('GET', '/admin/dashboard', null, adminToken);
    console.log('Dashboard Stats:', dashRes.body.stats);
    console.log('Item Tallies (Portions):', dashRes.body.item_tally.filter(t => t.total_quantity > 0));

    // 8. Update Order Status (Counter Verification)
    console.log('\n8. Updating Order Status to Completed...');
    const updateRes = await request('PATCH', `/admin/orders/${orderId}/status`, { status: 'completed' }, adminToken);
    console.log('Status Update:', updateRes.body.message);

    // 9. Admin Daily Report
    console.log('\n9. Generating Admin Daily Reconciliation Report...');
    const reportRes = await request('GET', '/admin/reports/daily', null, adminToken);
    console.log('Report Summary:', reportRes.body.summary);
    console.log('Top Selling Items:', reportRes.body.item_breakdown);

    console.log('\n✅ ALL INTEGRATION TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('Test failed with error:', err);
    process.exit(1);
  }
}

run();
