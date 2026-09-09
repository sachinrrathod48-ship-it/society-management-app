const Visitor = require('../models/Visitor');
const Resident = require('../models/Resident');

exports.getDashboard = async (req, res) => {
    try {
        const currentlyInside = await Visitor.getCurrentlyInside();
        const todayVisitors = await Visitor.getTodayVisitors();
        const insideCount = await Visitor.countInsideNow();
        const todayCount = await Visitor.countToday();
        const residents = await Resident.getAll();

        res.render('security/dashboard', {
            title: 'Security Gate Desk Dashboard',
            user: req.session.user,
            currentlyInside,
            todayVisitors: todayVisitors.slice(0, 5),
            insideCount,
            todayCount,
            residents,
            msg: req.query.msg || null,
            error: req.query.error || null
        });
    } catch (err) {
        console.error('[SECURITY DASHBOARD ERROR]:', err);
        res.status(500).send(err.message);
    }
};

exports.getVisitors = async (req, res) => {
    try {
        const currentlyInside = await Visitor.getCurrentlyInside();
        const residents = await Resident.getAll();
        res.render('security/visitors', {
            title: 'Live Visitor Log & Entry Desk',
            user: req.session.user,
            currentlyInside,
            residents,
            msg: req.query.msg || null,
            error: req.query.error || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};

exports.addVisitor = async (req, res) => {
    try {
        await Visitor.create(req.body, req.session.user.id);
        const redirectUrl = req.body.redirect || '/security/visitors';
        res.redirect(redirectUrl + '?msg=' + encodeURIComponent('Visitor entry recorded successfully!'));
    } catch (err) {
        const redirectUrl = req.body.redirect || '/security/visitors';
        res.redirect(redirectUrl + '?error=' + encodeURIComponent('Error recording entry: ' + err.message));
    }
};

exports.markExit = async (req, res) => {
    try {
        await Visitor.markExit(req.params.id);
        const redirectUrl = req.headers.referer || '/security/visitors';
        res.redirect(redirectUrl + '?msg=' + encodeURIComponent('Visitor exit recorded!'));
    } catch (err) {
        res.redirect('/security/visitors?error=' + encodeURIComponent(err.message));
    }
};

exports.getHistory = async (req, res) => {
    try {
        const visitors = await Visitor.getAll();
        res.render('security/history', {
            title: 'Complete Visitor Entry Log',
            user: req.session.user,
            visitors,
            msg: req.query.msg || null
        });
    } catch (err) {
        res.status(500).send(err.message);
    }
};
