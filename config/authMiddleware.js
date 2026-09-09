// Authentication & Role Authorization Middlewares

function isAuth(req, res, next) {
    if (req.session && req.session.user) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    res.redirect('/login?error=' + encodeURIComponent('Please login to access the system.'));
}

function isAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Access Denied: Admin privileges required.',
        user: req.session ? req.session.user : null 
    });
}

function isSecurity(req, res, next) {
    if (req.session && req.session.user && (req.session.user.role === 'security' || req.session.user.role === 'admin')) {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Access Denied: Security Staff privileges required.',
        user: req.session ? req.session.user : null 
    });
}

function isResident(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'resident') {
        return next();
    }
    res.status(403).render('error', { 
        message: 'Access Denied: Resident privileges required.',
        user: req.session ? req.session.user : null 
    });
}

function redirectIfLoggedIn(req, res, next) {
    if (req.session && req.session.user) {
        const role = req.session.user.role;
        if (role === 'admin') return res.redirect('/admin/dashboard');
        if (role === 'security') return res.redirect('/security/dashboard');
        if (role === 'resident') return res.redirect('/resident/dashboard');
    }
    next();
}

module.exports = {
    isAuth,
    isAdmin,
    isSecurity,
    isResident,
    redirectIfLoggedIn
};
