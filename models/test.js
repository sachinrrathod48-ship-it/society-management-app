require('dotenv').config();
const mysql = require('mysql2/promise');

(async () => {
    try {
        const conn = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("✅ Connected Successfully!");
        await conn.end();
    } catch (err) {
        console.error("❌ Connection Error:");
        console.error(err);
    }
})();