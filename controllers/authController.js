const User = require('../models/User');
const db = require('../config/db');

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Login - Mahabank Colony Management System',
        error: req.query.error || null,
        success: req.query.success || null,
        user: null
    });
};

exports.getRegister = (req, res) => {
    res.render('auth/register', {
        title: 'Register - Mahabank Colony Management System',
        error: null,
        user: null
    });
};

exports.postRegister = async (req, res) => {
    const { name, email, phone, occupation, flat_number, wing } = req.body;
    try {
        const Resident = require('../models/Resident');
        await Resident.create({
            name, email, phone, occupation, flat_number, wing, status: 'Inactive', password: 'pending_approval'
        });
        res.redirect('/login?success=' + encodeURIComponent('Registration successful! Please wait for admin approval.'));
    } catch(err) {
        console.error('[REGISTER ERROR]:', err);
        res.render('auth/register', {
            title: 'Register - Mahabank Colony Management System',
            error: 'Registration failed. Email might already exist.',
            user: null
        });
    }
};

exports.postLogin = async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
        return res.render('auth/login', {
            title: 'Login - Mahabank Colony Management System',
            error: 'All fields (Email, Password, and Role) are required.',
            success: null,
            user: null
        });
    }

    try {
        const user = await User.authenticate(email, password, role);
        if (!user) {
            return res.render('auth/login', {
                title: 'Login - Mahabank Colony Management System',
                error: 'Invalid credentials or wrong role selected. Please try again.',
                success: null,
                user: null
            });
        }

        // Store user info in session
        if (role === 'resident' && user.status === 'Inactive') {
            return res.render('auth/login', {
                title: 'Login - Mahabank Colony Management System',
                error: 'Your account is pending admin approval.',
                success: null,
                user: null
            });
        }

        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            flat_number: user.flat_number || null,
            wing: user.wing || null,
            badge_number: user.badge_number || null
        };

        // Redirect based on user role
        if (role === 'admin') return res.redirect('/admin/dashboard');
        if (role === 'security') return res.redirect('/security/dashboard');
        if (role === 'resident') return res.redirect('/resident/dashboard');

        res.redirect('/login');
    } catch (err) {
        console.error('[AUTH CONTROLLER ERROR]:', err);
        res.render('auth/login', {
            title: 'Login - Mahabank Colony Management System',
            error: 'An unexpected database error occurred. Ensure MySQL is running.',
            success: null,
            user: null
        });
    }
};

exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) console.error('[LOGOUT ERROR]:', err);
        res.redirect('/login?success=' + encodeURIComponent('You have logged out successfully.'));
    });
};

// Temporary fix route — visit /fix-passwords in browser to reset all demo passwords
exports.fixPasswords = async (req, res) => {
    try {
        await db.query(`UPDATE admins SET password = ? WHERE email = ?`, ['admin123', 'admin@society.com']);
        await db.query(`UPDATE residents SET password = ? WHERE email IN (?, ?, ?, ?)`,
            ['resident123', 'resident@society.com', 'priya@society.com', 'amitabh@society.com', 'neha@society.com']);
        await db.query(`UPDATE security SET password = ? WHERE email IN (?, ?)`,
            ['security123', 'security@society.com', 'vikram@society.com']);

        res.redirect('/login?success=' + encodeURIComponent(
            '✅ Passwords fixed! Admin: admin123 | Resident: resident123 | Security: security123'
        ));
    } catch (err) {
        console.error('[FIX PASSWORDS ERROR]:', err);
        res.send('❌ Error: ' + err.message);
    }
};
