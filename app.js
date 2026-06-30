require('dotenv').config();
const express        = require('express');
const helmet         = require('helmet');
const path           = require('path');
const errorHandler   = require('./middleware/errorHandler');

// Routes
const indexRoutes    = require('./routes/index');
const serviceRoutes  = require('./routes/serviceRoutes');
const bookingRoutes  = require('./routes/bookingRoutes');
const providerRoutes = require('./routes/providerRoutes');
const analyticsRoutes= require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------
// Security middleware
// -------------------------------------------------------
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc:  ["'self'"],
                scriptSrc:   ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdnjs.cloudflare.com"],
                styleSrc:    ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "fonts.googleapis.com"],
                fontSrc:     ["'self'", "fonts.gstatic.com"],
                imgSrc:      ["'self'", "data:"],
                connectSrc:  ["'self'"],
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

// Routes

app.use('/',          indexRoutes);
app.use('/services',  serviceRoutes);
app.use('/',          bookingRoutes);
app.use('/provider',  providerRoutes);
app.use('/analytics', analyticsRoutes);


// 404 handler
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`\n HomeServe is running at http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Database:    ${process.env.DB_NAME}@${process.env.DB_HOST}:${process.env.DB_PORT}\n`);
});

module.exports = app;
