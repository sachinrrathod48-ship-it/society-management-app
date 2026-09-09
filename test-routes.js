const http = require('http');

function request(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const cookies = res.headers['set-cookie'] ? res.headers['set-cookie'].map(c => c.split(';')[0]).join('; ') : '';
                resolve({ statusCode: res.statusCode, headers: res.headers, cookies, data });
            });
        });
        req.on('error', reject);
        if (postData) req.write(postData);
        req.end();
    });
}

async function runRouteTests() {
    console.log('=== STARTING END-TO-END HTTP ROUTE & SESSION TEST SUITE ===');
    let sessionCookie = '';

    try {
        // 1. GET /login
        console.log('\n[TEST 1] Testing GET /login...');
        let res = await request({ host: 'localhost', port: 3000, path: '/login', method: 'GET' });
        if (res.statusCode !== 200 || !res.data.includes('Smart Society')) {
            throw new Error(`GET /login failed with status ${res.statusCode}`);
        }
        console.log('✔ GET /login passed (200 OK)');

        // 2. POST /login (Admin)
        console.log('\n[TEST 2] Testing Admin Login...');
        const adminBody = 'email=admin%40society.com&password=admin123&role=admin';
        res = await request({
            host: 'localhost', port: 3000, path: '/login', method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(adminBody)
            }
        }, adminBody);
        
        if (res.statusCode !== 302 || !res.headers.location.includes('/admin/dashboard')) {
            throw new Error(`Admin Login failed with status ${res.statusCode}, location: ${res.headers.location}`);
        }
        sessionCookie = res.cookies;
        console.log('✔ Admin Login passed (302 Redirect to /admin/dashboard)');

        // 3. GET /admin/* pages with Admin session
        const adminPages = [
            '/admin/dashboard',
            '/admin/residents',
            '/admin/security',
            '/admin/visitors',
            '/admin/complaints',
            '/admin/maintenance',
            '/admin/notices',
            '/admin/emergency',
            '/admin/profile'
        ];

        for (const pagePath of adminPages) {
            console.log(`[TEST Admin Route] GET ${pagePath}...`);
            res = await request({
                host: 'localhost', port: 3000, path: pagePath, method: 'GET',
                headers: { 'Cookie': sessionCookie }
            });
            if (res.statusCode !== 200) {
                throw new Error(`GET ${pagePath} failed with status ${res.statusCode}`);
            }
            console.log(`  ✔ ${pagePath} rendered cleanly (200 OK)`);
        }

        // 4. Test Adding a Resident via Admin
        console.log('\n[TEST] Admin Add Resident POST...');
        const addResidentBody = 'name=Test+Resident&flat_number=D-505&wing=D+Wing&email=testres%40society.com&password=password123&phone=9998887776&occupation=Engineer';
        res = await request({
            host: 'localhost', port: 3000, path: '/admin/residents/add', method: 'POST',
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(addResidentBody)
            }
        }, addResidentBody);
        if (res.statusCode !== 302) throw new Error(`Add Resident failed: status ${res.statusCode}`);
        console.log('  ✔ Admin Add Resident passed!');

        // 5. Logout Admin
        console.log('\n[TEST] Logging out Admin...');
        res = await request({ host: 'localhost', port: 3000, path: '/logout', method: 'GET', headers: { 'Cookie': sessionCookie } });
        console.log('✔ Admin Logout passed!');

        // 6. Security Login & Routes
        console.log('\n[TEST] Testing Security Login...');
        const secBody = 'email=security%40society.com&password=security123&role=security';
        res = await request({
            host: 'localhost', port: 3000, path: '/login', method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(secBody)
            }
        }, secBody);
        if (res.statusCode !== 302 || !res.headers.location.includes('/security/dashboard')) {
            throw new Error(`Security Login failed`);
        }
        sessionCookie = res.cookies;
        console.log('✔ Security Login passed!');

        const secPages = ['/security/dashboard', '/security/visitors', '/security/history'];
        for (const pagePath of secPages) {
            console.log(`[TEST Security Route] GET ${pagePath}...`);
            res = await request({
                host: 'localhost', port: 3000, path: pagePath, method: 'GET',
                headers: { 'Cookie': sessionCookie }
            });
            if (res.statusCode !== 200) throw new Error(`GET ${pagePath} failed with status ${res.statusCode}`);
            console.log(`  ✔ ${pagePath} rendered cleanly (200 OK)`);
        }

        // 7. Security Add Visitor
        console.log('\n[TEST] Security Add Visitor POST...');
        const addVisitorBody = 'visitor_name=Rohan+Malhotra&mobile_number=9876000000&flat_number=A-101&resident_name=Rahul+Sharma&purpose=Guest+Visit';
        res = await request({
            host: 'localhost', port: 3000, path: '/security/visitors/add', method: 'POST',
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(addVisitorBody)
            }
        }, addVisitorBody);
        if (res.statusCode !== 302) throw new Error(`Security Add Visitor failed`);
        console.log('  ✔ Security Add Visitor passed!');

        // 8. Logout Security
        await request({ host: 'localhost', port: 3000, path: '/logout', method: 'GET', headers: { 'Cookie': sessionCookie } });

        // 9. Resident Login & Routes
        console.log('\n[TEST] Testing Resident Login...');
        const resBody = 'email=resident%40society.com&password=resident123&role=resident';
        res = await request({
            host: 'localhost', port: 3000, path: '/login', method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(resBody)
            }
        }, resBody);
        if (res.statusCode !== 302 || !res.headers.location.includes('/resident/dashboard')) {
            throw new Error(`Resident Login failed`);
        }
        sessionCookie = res.cookies;
        console.log('✔ Resident Login passed!');

        const residentPages = [
            '/resident/dashboard',
            '/resident/complaints',
            '/resident/maintenance',
            '/resident/notices',
            '/resident/emergency'
        ];
        for (const pagePath of residentPages) {
            console.log(`[TEST Resident Route] GET ${pagePath}...`);
            res = await request({
                host: 'localhost', port: 3000, path: pagePath, method: 'GET',
                headers: { 'Cookie': sessionCookie }
            });
            if (res.statusCode !== 200) throw new Error(`GET ${pagePath} failed with status ${res.statusCode}`);
            console.log(`  ✔ ${pagePath} rendered cleanly (200 OK)`);
        }

        // 10. Resident Submit Complaint
        console.log('\n[TEST] Resident Submit Complaint POST...');
        const complaintBody = 'title=Street+Light+Blinking&category=Electrical&priority=Medium&description=Outside+A+Wing+street+light+needs+bulb+replacement';
        res = await request({
            host: 'localhost', port: 3000, path: '/resident/complaints/add', method: 'POST',
            headers: {
                'Cookie': sessionCookie,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(complaintBody)
            }
        }, complaintBody);
        if (res.statusCode !== 302) throw new Error(`Resident Submit Complaint failed`);
        console.log('  ✔ Resident Submit Complaint passed!');

        // 11. Unauthorized Access Guard Test
        console.log('\n[TEST] Testing Role Access Protection (Resident accessing Admin page)...');
        res = await request({
            host: 'localhost', port: 3000, path: '/admin/dashboard', method: 'GET',
            headers: { 'Cookie': sessionCookie }
        });
        if (res.statusCode !== 403) {
            throw new Error(`Role protection failed, expected 403 Forbidden but got ${res.statusCode}`);
        }
        console.log('✔ Role Access Guard passed! (Returned 403 Access Denied for unauthorized role)');

        console.log('\n===================================================');
        console.log('🎉 ALL 27 ROUTE AND FUNCTIONALITY TESTS PASSED 100%! ');
        console.log('===================================================');
        process.exit(0);
    } catch (err) {
        console.error('\n❌ ROUTE TEST FAILED:', err.message);
        process.exit(1);
    }
}

runRouteTests();
