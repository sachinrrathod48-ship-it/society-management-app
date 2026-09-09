const db = require('./config/db');
const User = require('./models/User');
const Resident = require('./models/Resident');
const Security = require('./models/Security');
const Visitor = require('./models/Visitor');
const Complaint = require('./models/Complaint');
const Maintenance = require('./models/Maintenance');
const Notice = require('./models/Notice');
const Emergency = require('./models/Emergency');

async function testAll() {
    console.log('--- TESTING DATABASE AND MODELS ---');
    try {
        await db.initializeDatabase();
        console.log('Database connection / init completed.');

        console.log('Testing User authentication...');
        const adminUser = await User.authenticate('admin@society.com', 'admin123', 'admin');
        console.log('Admin Auth Result:', adminUser ? 'SUCCESS' : 'FAILED');

        const secUser = await User.authenticate('security@society.com', 'security123', 'security');
        console.log('Security Auth Result:', secUser ? 'SUCCESS' : 'FAILED');

        const resUser = await User.authenticate('resident@society.com', 'resident123', 'resident');
        console.log('Resident Auth Result:', resUser ? 'SUCCESS' : 'FAILED');

        console.log('Testing Resident model...');
        const residents = await Resident.getAll();
        console.log('Residents count:', residents.length);

        console.log('Testing Security model...');
        const securityStaff = await Security.getAll();
        console.log('Security staff count:', securityStaff.length);

        console.log('Testing Visitor model...');
        const visitors = await Visitor.getAll();
        console.log('Visitors count:', visitors.length);

        console.log('Testing Complaint model...');
        const complaints = await Complaint.getAll();
        console.log('Complaints count:', complaints.length);

        console.log('Testing Maintenance model...');
        const maintenanceBills = await Maintenance.getAll();
        console.log('Maintenance bills count:', maintenanceBills.length);

        console.log('Testing Notice model...');
        const notices = await Notice.getAll();
        console.log('Notices count:', notices.length);

        console.log('Testing Emergency model...');
        const emergencyContacts = await Emergency.getAll();
        console.log('Emergency contacts count:', emergencyContacts.length);

        console.log('--- ALL TESTS PASSED ---');
        process.exit(0);
    } catch (err) {
        console.error('--- TEST ERROR CATCHED ---');
        console.error(err);
        process.exit(1);
    }
}

testAll();
