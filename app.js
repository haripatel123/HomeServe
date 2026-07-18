require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const path = require('path');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const flash = require('express-flash');
const pool = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Passport config
require('./config/passport')(passport);

// Routes
const indexRoutes = require('./routes/index');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const providerRoutes = require('./routes/providerRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy for secure session cookies on hosting platforms like Render
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}


// Security middleware

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
                styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
                fontSrc: ["'self'", "fonts.gstatic.com"],
                imgSrc: ["'self'", "data:"],
                connectSrc: ["'self'"],
            },
        },
    })
);

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Body parsing
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(express.json({ limit: '10kb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session (stored in PostgreSQL via connect-pg-simple)
app.use(
    session({
        store: new pgSession({
            pool: pool,
            tableName: 'session',
            createTableIfMissing: false,
        }),
        secret: process.env.SESSION_SECRET || 'homeserve-dev-secret-change-in-prod',
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        },
    })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Flash messages
app.use(flash());

// Global variables middleware — expose user & flash to all views
app.use((req, res, next) => {
    res.locals.currentUrl = req.path;
    res.locals.user = req.user || null;
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});

// Routes
app.use('/', indexRoutes);
app.use('/services', serviceRoutes);
app.use('/', bookingRoutes);
app.use('/provider', providerRoutes);
app.use('/analytics', analyticsRoutes);
app.use('/', userRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Global error handler
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`\n HomeServe is running at http://localhost:${PORT}`);
        console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`   Database:    ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
    });
}

module.exports = app;