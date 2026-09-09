const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const Notice = require('../models/Notice');
const Emergency = require('../models/Emergency');

exports.getDashboard = async (req, res) => {
    try {
        const residentId = req.session.user.id;
        const myComplaints = await Complaint.getByResidentId(residentId);
        const myBills = await Maintenance.getByResidentId(residentId);
        const notices = await Notice.getAll();
        const emergencyContacts = await Emergency.getAll();

        const pendingBills = myBills.filter(b => b.status === 'Unpaid');
        const totalDue = pendingBills.reduce((sum, b) => sum + parseFloat(b.amount), 0);

        res.render('resident/dashboard', {
            title: 'Resident Portal - Dashboard',
            user: req.session.user,
            myComplaints: myComplaints.slice(0, 3),
            myBills: myBills.slice(0, 3),
            notices: notices.slice(0, 4),
            emergencyContacts: emergencyContacts.slice(0, 4),
            totalDue,
            pendingComplaintsCount: myComplaints.filter(c => c.status !== 'Resolved').length
        });
    } catch (err) {
        console.error('[RESIDENT DASHBOARD ERROR]:', err);
        res.status(500).send(err.message);
    }
};

exports.getComplaints = async (req, res) => {
    try {
        const residentId = req.session.user.id;
        const complaints = await Complaint.getByResidentId(residentId);
        res.render('resident/complaints', {
            title: 'My Complaints & Service Requests',
            user: req.session.user,
            complaints,
            msg: req.query.msg || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.submitComplaint = async (req, res) => {
    try {
        const data = {
            resident_id: req.session.user.id,
            flat_number: req.session.user.flat_number || 'A-101',
            title: req.body.title,
            category: req.body.category,
            description: req.body.description,
            priority: req.body.priority || 'Medium'
        };
        await Complaint.create(data);
        res.redirect('/resident/complaints?msg=' + encodeURIComponent('Complaint registered successfully! Administration will review it shortly.'));
    } catch (err) {
        res.redirect('/resident/complaints?error=' + encodeURIComponent(err.message));
    }
};

exports.getMaintenance = async (req, res) => {
    try {
        const residentId = req.session.user.id;
        const bills = await Maintenance.getByResidentId(residentId);
        res.render('resident/maintenance', {
            title: 'Maintenance Dues & Statements',
            user: req.session.user,
            bills,
            msg: req.query.msg || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.payBill = async (req, res) => {
    try {
        const { payment_method } = req.body;
        await Maintenance.markAsPaid(req.params.id, payment_method || 'Online Payment');
        res.redirect('/resident/maintenance?msg=' + encodeURIComponent('Payment processed successfully! Receipt generated.'));
    } catch (err) {
        res.redirect('/resident/maintenance?error=' + encodeURIComponent(err.message));
    }
};

exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.getAll();
        res.render('resident/notices', {
            title: 'Society Notice Board',
            user: req.session.user,
            notices
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.getEmergency = async (req, res) => {
    try {
        const contacts = await Emergency.getAll();
        res.render('resident/emergency', {
            title: 'Emergency Contacts Directory',
            user: req.session.user,
            contacts
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};
