const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config();

let isSqlite = false;
let mysqlPool = null;
let sqliteDb = null;

// Helper to wrap sqlite3 queries in Promise
function sqliteQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        let transformedSql = sql
            .replace(/CURDATE\(\)\s*-\s*INTERVAL\s*1\s*DAY/gi, "date('now', '-1 day')")
            .replace(/CURDATE\(\)\s*-\s*INTERVAL\s*2\s*DAY/gi, "date('now', '-2 day')")
            .replace(/CURDATE\(\)\s*-\s*INTERVAL\s*4\s*DAY/gi, "date('now', '-4 day')")
            .replace(/CURDATE\(\)/gi, "date('now')")
            .replace(/ON UPDATE CURRENT_TIMESTAMP/gi, "");

        const isSelect = transformedSql.trim().toUpperCase().startsWith('SELECT') || transformedSql.trim().toUpperCase().startsWith('PRAGMA') || transformedSql.trim().toUpperCase().startsWith('SHOW');

        if (isSelect) {
            sqliteDb.all(transformedSql, params, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        } else {
            sqliteDb.run(transformedSql, params, function(err) {
                if (err) return reject(err);
                resolve({ insertId: this.lastID, affectedRows: this.changes });
            });
        }
    });
}
async function initializeDatabase() {
    try {
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || 'root',
            multipleStatements: true
        };

        console.log("===== DB CONFIG =====");
        console.log(dbConfig);
        console.log("DB_NAME:", process.env.DB_NAME);
        console.log("=====================");

        const tempConnection = await mysql.createConnection(dbConfig);
        await tempConnection.query(
            `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'society_db'}\`;`
        );
        await tempConnection.end();

        mysqlPool = mysql.createPool({
            ...dbConfig,
            database: process.env.DB_NAME || 'society_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        const conn = await mysqlPool.getConnection();
        await conn.query(`USE \`${process.env.DB_NAME || 'society_db'}\``);
        console.log(`[DB SUCCESS] Connected to MySQL database '${process.env.DB_NAME || 'society_db'}'.`);

        const [tables] = await conn.query("SHOW TABLES LIKE 'admins'");

       if (tables.length === 0) {
    console.log("[DB] First time MySQL setup: Initializing Schema & Seed Data...");

    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const seedPath = path.join(__dirname, "../database/seed.sql");

    if (fs.existsSync(schemaPath)) {
        console.log("Running schema.sql...");
        await conn.query(fs.readFileSync(schemaPath, "utf8"));
        console.log("schema.sql completed.");
    }

    if (fs.existsSync(seedPath)) {
        console.log("Running seed.sql...");
        const seedSql = fs.readFileSync(seedPath, "utf8");
try {
    await conn.query(seedSql);
} catch (err) {
    console.error("Seed Error:");
    console.error(err.sqlMessage);
    console.error(err.sql);
    throw err;
}        console.log("seed.sql completed.");
    }
}

        conn.release();
        isSqlite = false;
        return;
} catch (mysqlErr) {
    console.error("========== MYSQL ERROR ==========");
    console.error(mysqlErr.sqlMessage);
    console.error("SQL State:", mysqlErr.sqlState);
    console.error("Error Code:", mysqlErr.code);
    console.error("Failed SQL:");
    console.error(mysqlErr.sql);
    console.error(mysqlErr);
    console.error("=================================");

console.log("[DB] Switching to SQLite...");
isSqlite = true;}

    // 2. SQLite Fallback Initialization
    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    const sqlitePath = path.join(dbDir, 'society_db.sqlite');
    
    return new Promise((resolve, reject) => {
        sqliteDb = new sqlite3.Database(sqlitePath, async (err) => {
            if (err) {
                console.error('[DB ERROR] SQLite Init Failed:', err);
                return reject(err);
            }
            console.log('[DB SUCCESS] Connected to embedded SQLite database at:', sqlitePath);

            try {
                // Enable foreign keys
                await sqliteQuery('PRAGMA foreign_keys = ON;');

                // Check if tables exist
                const tables = await sqliteQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='admins';");
                if (tables.length === 0) {
                    console.log('[DB] Initializing SQLite Schema and Seed Data...');
                    await createSqliteSchemaAndSeed();
                }
                resolve();
            } catch (initErr) {
                reject(initErr);
            }
        });
    });
}


async function createSqliteSchemaAndSeed() {
    const defaultPasswordHash = await bcrypt.hash('admin123', 10);
    const residentPasswordHash = await bcrypt.hash('resident123', 10);
    const securityPasswordHash = await bcrypt.hash('security123', 10);

    const schemaSql = `
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS residents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            flat_number TEXT NOT NULL,
            wing TEXT NOT NULL,
            occupation TEXT DEFAULT 'Resident',
            status TEXT DEFAULT 'Active',
            role TEXT DEFAULT 'resident',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS security (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            phone TEXT NOT NULL,
            badge_number TEXT NOT NULL UNIQUE,
            shift TEXT DEFAULT 'Morning',
            status TEXT DEFAULT 'Active',
            role TEXT DEFAULT 'security',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS visitors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            visitor_name TEXT NOT NULL,
            mobile_number TEXT NOT NULL,
            flat_number TEXT NOT NULL,
            resident_name TEXT NOT NULL,
            purpose TEXT NOT NULL,
            date DATE NOT NULL,
            entry_time TIME NOT NULL,
            exit_time TIME DEFAULT NULL,
            status TEXT DEFAULT 'Inside',
            recorded_by_security_id INTEGER DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS complaints (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resident_id INTEGER NOT NULL,
            flat_number TEXT NOT NULL,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT NOT NULL,
            priority TEXT DEFAULT 'Medium',
            status TEXT DEFAULT 'Pending',
            admin_remarks TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS maintenance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resident_id INTEGER NOT NULL,
            flat_number TEXT NOT NULL,
            month_year TEXT NOT NULL,
            amount REAL NOT NULL,
            due_date DATE NOT NULL,
            status TEXT DEFAULT 'Unpaid',
            payment_date DATE DEFAULT NULL,
            payment_method TEXT DEFAULT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (resident_id) REFERENCES residents(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS notices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'General',
            content TEXT NOT NULL,
            priority TEXT DEFAULT 'General',
            posted_by TEXT DEFAULT 'Society Management',
            date_posted DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS emergency_contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            designation TEXT NOT NULL,
            phone TEXT NOT NULL,
            category TEXT DEFAULT 'Essential',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // Execute schema statements
    const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    for (const stmt of statements) {
        await sqliteQuery(stmt);
    }

    // Seed Admin
    await sqliteQuery(`INSERT INTO admins (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'admin');`,
        ['Society Administrator', 'admin@society.com', defaultPasswordHash, '9876543210']);

    // Seed Residents
    await sqliteQuery(`INSERT INTO residents (name, email, password, phone, flat_number, wing, occupation, status, role) VALUES 
        ('Rahul Sharma', 'resident@society.com', ?, '9812345678', 'A-101', 'A Wing', 'Software Engineer', 'Active', 'resident'),
        ('Priya Verma', 'priya@society.com', ?, '9823456789', 'B-204', 'B Wing', 'Architect', 'Active', 'resident'),
        ('Amitabh Patel', 'amitabh@society.com', ?, '9834567890', 'C-302', 'C Wing', 'Chartered Accountant', 'Active', 'resident');`,
        [residentPasswordHash, residentPasswordHash, residentPasswordHash]);

    // Seed Security
    await sqliteQuery(`INSERT INTO security (name, email, password, phone, badge_number, shift, status, role) VALUES 
        ('Rajesh Kumar', 'security@society.com', ?, '9711223344', 'SEC-001', 'Morning', 'On Duty', 'security'),
        ('Vikram Singh', 'vikram@society.com', ?, '9722334455', 'SEC-002', 'Night', 'Active', 'security');`,
        [securityPasswordHash, securityPasswordHash]);

    // Seed Visitors
    await sqliteQuery(`INSERT INTO visitors (visitor_name, mobile_number, flat_number, resident_name, purpose, date, entry_time, exit_time, status, recorded_by_security_id) VALUES 
        ('Sunil Mehta', '9988776655', 'A-101', 'Rahul Sharma', 'Delivery (Amazon)', date('now'), '09:30:00', '09:45:00', 'Left', 1),
        ('Kiran Rao', '9977665544', 'B-204', 'Priya Verma', 'Personal Visit', date('now'), '10:15:00', NULL, 'Inside', 1),
        ('Deepak Joshi', '9966554433', 'C-302', 'Amitabh Patel', 'AC Maintenance', date('now'), '11:00:00', NULL, 'Inside', 1);`);

    // Seed Complaints
    await sqliteQuery(`INSERT INTO complaints (resident_id, flat_number, title, category, description, priority, status, admin_remarks) VALUES 
        (1, 'A-101', 'Water Leakage in Main Washroom', 'Plumbing', 'Water seepage coming from upper floor in master bedroom washroom.', 'High', 'In Progress', 'Plumber assigned for inspection today at 4 PM.'),
        (2, 'B-204', 'Elevator B-Wing Making Noise', 'Maintenance', 'The lift in B wing produces a squeaky sound while moving between 2nd and 3rd floors.', 'Medium', 'Pending', NULL);`);

    // Seed Maintenance
    await sqliteQuery(`INSERT INTO maintenance (resident_id, flat_number, month_year, amount, due_date, status, payment_date, payment_method) VALUES 
        (1, 'A-101', 'August 2026', 3500.00, '2026-08-15', 'Unpaid', NULL, NULL),
        (2, 'B-204', 'August 2026', 3500.00, '2026-08-15', 'Paid', '2026-08-01', 'UPI / Online');`);

    // Seed Notices
    await sqliteQuery(`INSERT INTO notices (title, category, content, priority, posted_by, date_posted) VALUES 
        ('Annual General Body Meeting (AGM)', 'Event', 'All residents are invited to attend the Annual General Meeting on Sunday, 10th August at 5:00 PM in the Society Clubhouse.', 'Urgent', 'Society Secretary', date('now')),
        ('Water Tank Cleaning Schedule', 'Maintenance', 'Water supply will be temporarily shut down on Thursday from 10 AM to 2 PM for overhead tank cleaning.', 'Important', 'Estate Manager', date('now', '-2 day'));`);

    // Seed Emergency Contacts
    await sqliteQuery(`INSERT INTO emergency_contacts (name, designation, phone, category) VALUES 
        ('Main Security Gate Desk', 'Chief Security Officer', '022-28490011 / 9711223344', 'Security'),
        ('Society Office Administrator', 'Property Manager', '022-28490000', 'Essential'),
        ('City Emergency Ambulance', 'Medical Helpline', '108 / 9820011223', 'Medical'),
        ('On-Call Electrician (Suresh)', 'Electrical Specialist', '9819001122', 'Maintenance'),
        ('On-Call Plumber (Ramesh)', 'Plumbing Specialist', '9819003344', 'Maintenance');`);

    console.log('[DB] SQLite Schema and Seed Data populated successfully!');
}

async function query(sql, params = []) {
    if (!isSqlite && mysqlPool) {
        try {
            const [results] = await mysqlPool.execute(sql, params);
            return results;
        } catch (err) {
            try {
                const [results] = await mysqlPool.query(sql, params);
                return results;
            } catch (innerErr) {
                console.error('[MYSQL QUERY ERROR]:', innerErr.message, 'SQL:', sql);
                throw innerErr;
            }
        }
    } else if (sqliteDb) {
        return await sqliteQuery(sql, params);
    } else {
        throw new Error('Database connection not initialized');
    }
}

module.exports = {
    initializeDatabase,
    query,
    getPool: () => mysqlPool
};
