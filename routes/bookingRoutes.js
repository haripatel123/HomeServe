const express = require('express');
const router  = express.Router();
const bookingController = require('../controllers/bookingController');
const { ensureAuthenticated, ensureRole } = require('../middleware/auth');

// Booking form — customers only
router.get('/book/:serviceId', ensureRole('customer'), bookingController.showForm);

// Create booking — customers only
router.post('/book', ensureRole('customer'), bookingController.createBooking);

// Booking history — customers see own, admin sees all
router.get('/bookings', ensureRole('customer', 'admin'), bookingController.history);

// Add review — customers only
router.post('/bookings/:id/review', ensureRole('customer'), bookingController.addReview);

// Update status — providers and admin
router.post('/bookings/:id/status', ensureRole('provider', 'admin'), bookingController.updateStatus);

// AJAX price calculation — any authenticated user
router.get('/api/calculate-amount', ensureAuthenticated, bookingController.calculateAmount);

module.exports = router;

