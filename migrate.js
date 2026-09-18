const db = require('./config/db');

async function runMigration() {
    try {
        await db.initializeDatabase();
        console.log('Running DB Migration...');
        // Alter visitors table
        try {
            await db.query('ALTER TABLE visitors ADD COLUMN photo_data LONGTEXT DEFAULT NULL;');
            console.log('Added photo_data to visitors table.');
        } catch(e) {
            console.log('photo_data might already exist:', e.message);
        }
        
        // Alter residents table
        try {
            await db.query("ALTER TABLE residents MODIFY COLUMN status ENUM('Active', 'Inactive') DEFAULT 'Inactive';");
            console.log('Modified status default on residents table to Inactive.');
        } catch(e) {
            console.log('Failed to modify residents table:', e.message);
        }

        console.log('Migration completed.');
        process.exit(0);
    } catch(err) {
        console.error(err);
        process.exit(1);
    }
}

runMigration();
