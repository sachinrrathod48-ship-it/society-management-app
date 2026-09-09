/**
 * reset-passwords.js
 * Run once: node reset-passwords.js
 * Resets all user passwords so login works correctly.
 */
require('dotenv').config();
const db = require('./config/db');

async function resetPasswords() {
    console.log('\n🔧 Resetting passwords...\n');

    try {
        await db.initializeDatabase();

        // Admin: admin123
        await db.query(`UPDATE admins SET password = ? WHERE email = ?`, ['admin123', 'admin@society.com']);
        console.log('✅ Admin password set to: admin123');

        // Residents: resident123
        const residentEmails = ['resident@society.com', 'priya@society.com', 'amitabh@society.com', 'neha@society.com'];
        for (const email of residentEmails) {
            await db.query(`UPDATE residents SET password = ? WHERE email = ?`, ['resident123', email]);
            console.log(`✅ Resident [${email}] password set to: resident123`);
        }

        // Security: security123
        const securityEmails = ['security@society.com', 'vikram@society.com'];
        for (const email of securityEmails) {
            await db.query(`UPDATE security SET password = ? WHERE email = ?`, ['security123', email]);
            console.log(`✅ Security [${email}] password set to: security123`);
        }

        console.log('\n✅ All passwords reset successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('   Admin    → admin@society.com     / admin123');
        console.log('   Resident → resident@society.com  / resident123');
        console.log('   Security → security@society.com  / security123');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error resetting passwords:', err.message);
        process.exit(1);
    }
}

resetPasswords();
