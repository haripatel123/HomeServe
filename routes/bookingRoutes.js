const express = require('express');
const router  = express.Router();
const bookingController = require('../controllers/bookingController');

// Booking form
router.get('/book/:serviceId', bookingController.showForm);

// Create booking
router.post('/book', bookingController.createBooking);

// Booking history
router.get('/bookings', bookingController.history);

// Add review
router.post('/bookings/:id/review', bookingController.addReview);

// Update status
router.post('/bookings/:id/status', bookingController.updateStatus);

// AJAX price calculation
router.get('/api/calculate-amount', bookingController.calculateAmount);

module.exports = router;
