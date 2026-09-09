const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const securityRoutes = require('./routes/securityRoutes');
const residentRoutes = require('./routes/residentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'society_secret_key_2026',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 Hours Session Persistence
    }
}));

// Expose user session to all views automatically
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Routes Configuration
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/security', securityRoutes);
app.use('/resident', residentRoutes);

// Home route redirect
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        const role = req.session.user.role;
        if (role === 'admin') return res.redirect('/admin/dashboard');
        if (role === 'security') return res.redirect('/security/dashboard');
        if (role === 'resident') return res.redirect('/resident/dashboard');
    }
    res.redirect('/login');
});

// 404 Page Handler
app.use((req, res) => {
    res.status(404).render('error', {
        title: '404 - Page Not Found',
        message: 'The page you requested could not be found.',
        user: req.session ? req.session.user : null
    });
});

// Start Server & Initialize Database
db.initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`===================================================`);
        console.log(`  Smart Society Management System Running!          `);
        console.log(`  Access Application at: http://localhost:${PORT}    `);
        console.log(`===================================================`);
    });
}).catch(err => {
    console.error('Server startup error:', err);
});
