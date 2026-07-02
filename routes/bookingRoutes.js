const express = require('express');
const router  = express.Router();
const bookingController = require('../controllers/bookingController');

// Booking form
router.get('/book/:serviceId', bookingController.showForm);

// Create booking
router.post('/book', bookingController.createBooking);

// Booking history
router.get('/bookings', bookingController.history);

// Booking UI showcase comparison page
router.get('/bookings-demo', (req, res) => {
    const mockBookings = [
        {
            booking_id: 41,
            services: 'Washing Machine Repair',
            city: 'Mumbai',
            provider_id: 1,
            provider_name: 'CoolAir Services',
            booking_date: '2026-06-30',
            booking_time: '14:00:00',
            total_amount: '405.00',
            payment_status: 'Paid',
            status: 'Completed'
        },
        {
            booking_id: 36,
            services: 'Home Deep Cleaning',
            city: 'Mumbai',
            provider_id: 3,
            provider_name: 'CleanPro Team',
            booking_date: '2026-06-01',
            booking_time: '09:00:00',
            total_amount: '1200.00',
            payment_status: 'Pending',
            status: 'Cancelled'
        },
        {
            booking_id: 31,
            services: 'Pipe Leak Repair',
            city: 'Mumbai',
            provider_id: 2,
            provider_name: 'Suresh Kumar',
            booking_date: '2026-05-02',
            booking_time: '11:30:00',
            total_amount: '350.00',
            payment_status: 'Paid',
            status: 'Completed'
        },
        {
            booking_id: 26,
            services: 'Lawn Mowing & Trimming',
            city: 'Mumbai',
            provider_id: 4,
            provider_name: 'GreenThumb',
            booking_date: '2026-04-01',
            booking_time: '16:00:00',
            total_amount: '350.00',
            payment_status: 'Paid',
            status: 'Completed'
        },
        {
            booking_id: 21,
            services: 'Switchboard Repair',
            city: 'Mumbai',
            provider_id: 2,
            provider_name: 'Ravi Electricals',
            booking_date: '2026-03-02',
            booking_time: '10:00:00',
            total_amount: '200.00',
            payment_status: 'Paid',
            status: 'Completed'
        },
        {
            booking_id: 16,
            services: 'Washing Machine Repair',
            city: 'Mumbai',
            provider_id: 1,
            provider_name: 'CoolAir Services',
            booking_date: '2026-02-03',
            booking_time: '15:30:00',
            total_amount: '450.00',
            payment_status: 'Paid',
            status: 'Completed'
        },
        {
            booking_id: 11,
            services: 'Wall Painting',
            city: 'Mumbai',
            provider_id: 5,
            provider_name: 'Amit Carpenter',
            booking_date: '2026-01-05',
            booking_time: '08:00:00',
            total_amount: '3500.00',
            payment_status: 'Paid',
            status: 'Completed'
        }
    ];

    res.render('booking-demo', {
        title: 'Booking UI Comparison Playground',
        bookings: mockBookings,
        activeTab: req.query.tab || 'option1'
    });
});

// Add review
router.post('/bookings/:id/review', bookingController.addReview);

// Update status
router.post('/bookings/:id/status', bookingController.updateStatus);

// AJAX price calculation
router.get('/api/calculate-amount', bookingController.calculateAmount);

module.exports = router;
