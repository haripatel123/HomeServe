const rateLimit = require('express-rate-limit');

// Disable rate limiter when running tests to avoid failing Jest tests
const isTest = process.env.NODE_ENV === 'test';

// Global Rate Limiter: Apply to all incoming routes to limit abuse
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per window
    standardHeaders: 'draft-7', // Set standard RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    skip: () => isTest,
    message: 'Too many requests from this IP, please try again after 15 minutes.'
});

// Auth Rate Limiter: Strict limits for login/register to prevent brute force
const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute (for easier testing)
    limit: 5, // Limit each IP to 5 authentication requests per window (for testing)
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => isTest,
    message: 'Too many login or registration attempts, please try again after 15 minutes.',
    handler: (req, res, next, options) => {
        req.flash('error_msg', options.message);
        res.status(options.statusCode).redirect(req.path);
    }
});

module.exports = {
    globalLimiter,
    authLimiter
};
