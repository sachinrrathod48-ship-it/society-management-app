const mysql = require('mysql2/promise');

async function testConn(pass) {
    try {
        console.log(`Testing MySQL connection with user 'root' and password '${pass}'...`);
        const conn = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: pass
        });
        console.log(`SUCCESS with password '${pass}'!`);
        await conn.end();
        return true;
    } catch (err) {
        console.log(`Failed with password '${pass}': ${err.message}`);
        return false;
    }
}

async function run() {
    await testConn('');
    await testConn('root');
    await testConn('123456');
    await testConn('admin');
}

run();
