const Resident = require('../models/Resident');
const Security = require('../models/Security');
const Visitor = require('../models/Visitor');
const Complaint = require('../models/Complaint');
const Maintenance = require('../models/Maintenance');
const Notice = require('../models/Notice');
const Emergency = require('../models/Emergency');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const totalResidents = await Resident.count();
        const totalSecurity = await Security.count();
        const visitorsToday = await Visitor.countToday();
        const pendingComplaints = await Complaint.countPending();
        const pendingMaintenanceAmount = await Maintenance.countPendingAmount();
        const notices = await Notice.getAll();
        const recentVisitors = await Visitor.getTodayVisitors();
        const recentComplaints = await Complaint.getAll();

        res.render('admin/dashboard', {
            title: 'Admin Dashboard - Smart Society',
            user: req.session.user,
            stats: {
                totalResidents,
                totalSecurity,
                visitorsToday,
                pendingComplaints,
                pendingMaintenanceAmount
            },
            notices: notices.slice(0, 5),
            recentVisitors: recentVisitors.slice(0, 5),
            recentComplaints: recentComplaints.slice(0, 5)
        });
    } catch (err) {
        console.error('[ADMIN DASHBOARD ERROR]:', err);
        res.status(500).send('Internal Server Error');
    }
};

// Resident Management
exports.getResidents = async (req, res) => {
    try {
        const residents = await Resident.getAll();
        res.render('admin/residents', {
            title: 'Resident Management',
            user: req.session.user,
            residents,
            msg: req.query.msg || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.addResident = async (req, res) => {
    try {
        await Resident.create(req.body);
        res.redirect('/admin/residents?msg=' + encodeURIComponent('Resident added successfully!'));
    } catch (err) {
        res.redirect('/admin/residents?error=' + encodeURIComponent('Error adding resident: ' + err.message));
    }
};

exports.updateResident = async (req, res) => {
    try {
        await Resident.update(req.params.id, req.body);
        res.redirect('/admin/residents?msg=' + encodeURIComponent('Resident updated successfully!'));
    } catch (err) {
        res.redirect('/admin/residents?error=' + encodeURIComponent('Error updating resident: ' + err.message));
    }
};

exports.deleteResident = async (req, res) => {
    try {
        await Resident.delete(req.params.id);
        res.redirect('/admin/residents?msg=' + encodeURIComponent('Resident deleted successfully!'));
    } catch (err) {
        res.redirect('/admin/residents?error=' + encodeURIComponent('Error deleting resident: ' + err.message));
    }
};

// Security Management
exports.getSecurity = async (req, res) => {
    try {
        const securityStaff = await Security.getAll();
        res.render('admin/security', {
            title: 'Security Staff Management',
            user: req.session.user,
            securityStaff,
            msg: req.query.msg || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.addSecurity = async (req, res) => {
    try {
        await Security.create(req.body);
        res.redirect('/admin/security?msg=' + encodeURIComponent('Security account created successfully!'));
    } catch (err) {
        res.redirect('/admin/security?error=' + encodeURIComponent('Error adding security: ' + err.message));
    }
};

exports.updateSecurity = async (req, res) => {
    try {
        await Security.update(req.params.id, req.body);
        res.redirect('/admin/security?msg=' + encodeURIComponent('Security staff updated successfully!'));
    } catch (err) {
        res.redirect('/admin/security?error=' + encodeURIComponent('Error updating security: ' + err.message));
    }
};

exports.deleteSecurity = async (req, res) => {
    try {
        await Security.delete(req.params.id);
        res.redirect('/admin/security?msg=' + encodeURIComponent('Security staff removed!'));
    } catch (err) {
        res.redirect('/admin/security?error=' + encodeURIComponent('Error deleting security: ' + err.message));
    }
};

// Visitor Management
exports.getVisitors = async (req, res) => {
    try {
        const visitors = await Visitor.getAll();
        res.render('admin/visitors', {
            title: 'Visitor Records Master View',
            user: req.session.user,
            visitors,
            msg: req.query.msg || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.markVisitorExit = async (req, res) => {
    try {
        await Visitor.markExit(req.params.id);
        res.redirect('/admin/visitors?msg=' + encodeURIComponent('Visitor exit recorded!'));
    } catch (err) {
        res.redirect('/admin/visitors?error=' + encodeURIComponent(err.message));
    }
};

// Complaint Management
exports.getComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.getAll();
        res.render('admin/complaints', {
            title: 'Complaint Management',
            user: req.session.user,
            complaints,
            msg: req.query.msg || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.updateComplaintStatus = async (req, res) => {
    try {
        const { status, admin_remarks } = req.body;
        await Complaint.updateStatus(req.params.id, status, admin_remarks);
        res.redirect('/admin/complaints?msg=' + encodeURIComponent('Complaint status updated!'));
    } catch (err) {
        res.redirect('/admin/complaints?error=' + encodeURIComponent(err.message));
    }
};

// Maintenance Management
exports.getMaintenance = async (req, res) => {
    try {
        const bills = await Maintenance.getAll();
        const residents = await Resident.getAll();
        res.render('admin/maintenance', {
            title: 'Maintenance Dues & Bills',
            user: req.session.user,
            bills,
            residents,
            msg: req.query.msg || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.createSingleBill = async (req, res) => {
    try {
        const { resident_id, month_year, amount, due_date } = req.body;
        const resObj = await Resident.getById(resident_id);
        if (!resObj) throw new Error('Resident not found');

        await Maintenance.create({
            resident_id,
            flat_number: resObj.flat_number,
            month_year,
            amount,
            due_date
        });
        res.redirect('/admin/maintenance?msg=' + encodeURIComponent('Maintenance bill created!'));
    } catch (err) {
        res.redirect('/admin/maintenance?error=' + encodeURIComponent(err.message));
    }
};

exports.createBulkBills = async (req, res) => {
    try {
        const { month_year, amount, due_date } = req.body;
        const count = await Maintenance.createBulkForMonth(month_year, amount, due_date);
        res.redirect('/admin/maintenance?msg=' + encodeURIComponent(`Generated bills for ${count} active residents!`));
    } catch (err) {
        res.redirect('/admin/maintenance?error=' + encodeURIComponent(err.message));
    }
};

exports.markBillPaid = async (req, res) => {
    try {
        await Maintenance.markAsPaid(req.params.id, 'Cash / Manual Receipt');
        res.redirect('/admin/maintenance?msg=' + encodeURIComponent('Bill marked as Paid!'));
    } catch (err) {
        res.redirect('/admin/maintenance?error=' + encodeURIComponent(err.message));
    }
};

// Notice Management
exports.getNotices = async (req, res) => {
    try {
        const notices = await Notice.getAll();
        res.render('admin/notices', {
            title: 'Notice Board Management',
            user: req.session.user,
            notices,
            msg: req.query.msg || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.addNotice = async (req, res) => {
    try {
        await Notice.create(req.body);
        res.redirect('/admin/notices?msg=' + encodeURIComponent('Notice published!'));
    } catch (err) {
        res.redirect('/admin/notices?error=' + encodeURIComponent(err.message));
    }
};

exports.updateNotice = async (req, res) => {
    try {
        await Notice.update(req.params.id, req.body);
        res.redirect('/admin/notices?msg=' + encodeURIComponent('Notice updated!'));
    } catch (err) {
        res.redirect('/admin/notices?error=' + encodeURIComponent(err.message));
    }
};

exports.deleteNotice = async (req, res) => {
    try {
        await Notice.delete(req.params.id);
        res.redirect('/admin/notices?msg=' + encodeURIComponent('Notice removed!'));
    } catch (err) {
        res.redirect('/admin/notices?error=' + encodeURIComponent(err.message));
    }
};

// Emergency Contacts
exports.getEmergency = async (req, res) => {
    try {
        const contacts = await Emergency.getAll();
        res.render('admin/emergency', {
            title: 'Emergency Contacts Management',
            user: req.session.user,
            contacts,
            msg: req.query.msg || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.addEmergency = async (req, res) => {
    try {
        await Emergency.create(req.body);
        res.redirect('/admin/emergency?msg=' + encodeURIComponent('Emergency contact added!'));
    } catch (err) {
        res.redirect('/admin/emergency?error=' + encodeURIComponent(err.message));
    }
};

exports.updateEmergency = async (req, res) => {
    try {
        await Emergency.update(req.params.id, req.body);
        res.redirect('/admin/emergency?msg=' + encodeURIComponent('Emergency contact updated!'));
    } catch (err) {
        res.redirect('/admin/emergency?error=' + encodeURIComponent(err.message));
    }
};

exports.deleteEmergency = async (req, res) => {
    try {
        await Emergency.delete(req.params.id);
        res.redirect('/admin/emergency?msg=' + encodeURIComponent('Emergency contact deleted!'));
    } catch (err) {
        res.redirect('/admin/emergency?error=' + encodeURIComponent(err.message));
    }
};

// Profile & Settings
exports.getProfile = (req, res) => {
    res.render('admin/profile', {
        title: 'Admin Profile Settings',
        user: req.session.user,
        msg: req.query.msg || null,
        error: req.query.error || null
    });
};

exports.updateProfile = async (req, res) => {
    try {
        const { old_password, new_password } = req.body;
        if (old_password && new_password) {
            const updated = await User.updatePassword(req.session.user.id, 'admin', old_password, new_password);
            if (!updated) {
                return res.redirect('/admin/profile?error=' + encodeURIComponent('Incorrect current password!'));
            }
        }
        res.redirect('/admin/profile?msg=' + encodeURIComponent('Profile details updated successfully!'));
    } catch (err) {
        res.redirect('/admin/profile?error=' + encodeURIComponent(err.message));
    }
};
