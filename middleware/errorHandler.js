// Global error handler — never expose stack traces
module.exports = (err, req, res, next) => {
    console.error('[ERROR]', err.message);

    const status = err.status || 500;

    // PostgreSQL specific error codes
    if (err.code === '23505') {
        // Unique constraint violation
        return res.status(400).render('500', {
            title: 'Duplicate Entry',
            message: 'This record already exists. Please check your input.',
        });
    }
    if (err.code === '23503') {
        // Foreign key violation
        return res.status(400).render('500', {
            title: 'Reference Error',
            message: 'One or more references are invalid. Please check your input.',
        });
    }
    if (err.code === 'P0001') {
        // RAISE EXCEPTION from PL/pgSQL
        return res.status(400).render('500', {
            title: 'Validation Error',
            message: err.message,
        });
    }

    if (status === 404) {
        return res.status(404).render('404', { title: 'Page Not Found' });
    }

    res.status(status).render('500', {
        title: 'Server Error',
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'Something went wrong. Please try again.',
    });
};
