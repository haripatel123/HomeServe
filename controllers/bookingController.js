const bookingModel = require('../models/bookingModel');
const serviceModel = require('../models/serviceModel');

// GET /book/:serviceId  — Booking form
exports.showForm = async (req, res, next) => {
    try {
        const serviceId = parseInt(req.params.serviceId);
        if (!Number.isInteger(serviceId) || serviceId <= 0) {
            return res.status(400).render('404', { title: 'Invalid Service ID' });
        }

        const service = await serviceModel.getServiceById(serviceId);
        if (!service) {
            return res.status(404).render('404', { title: 'Service Not Found' });
        }

        const customers = await bookingModel.getAllCustomers();

        res.render('booking-form', {
            title: `Book ${service.service_name} — HomeServe`,
            service,
            customers,
            error: null,
            formData: {},
        });
    } catch (err) {
        next(err);
    }
};

// POST /book  — Process booking
exports.createBooking = async (req, res, next) => {
    try {
        const {
            customer_id, provider_id, service_id, variant_id,
            booking_date, booking_time, notes, coupon_code, payment_method
        } = req.body;

        // --- Server-side validation ---
        const errors = [];

        const customerId = parseInt(customer_id);
        const providerId = parseInt(provider_id);
        const serviceId  = parseInt(service_id);
        const variantId  = variant_id ? parseInt(variant_id) : null;

        if (!Number.isInteger(customerId) || customerId <= 0) errors.push('Invalid customer.');
        if (!Number.isInteger(providerId) || providerId <= 0) errors.push('Invalid provider.');
        if (!Number.isInteger(serviceId)  || serviceId <= 0)  errors.push('Invalid service.');
        if (variantId !== null && (!Number.isInteger(variantId) || variantId <= 0)) errors.push('Invalid variant.');

        if (!booking_date) {
            errors.push('Booking date is required.');
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const chosen = new Date(booking_date);
            if (isNaN(chosen.getTime())) errors.push('Invalid date format.');
            else if (chosen < today) errors.push('Booking date cannot be in the past.');
        }

        if (!booking_time) {
            errors.push('Booking time is required.');
        } else if (!/^\d{2}:\d{2}$/.test(booking_time)) {
            errors.push('Invalid time format.');
        }

        if (notes && notes.length > 500) errors.push('Notes cannot exceed 500 characters.');

        if (coupon_code && coupon_code.length > 30) errors.push('Invalid coupon code.');

        const validMethods = ['Cash', 'Card', 'UPI', 'Wallet'];
        if (payment_method && !validMethods.includes(payment_method)) {
            errors.push('Invalid payment method.');
        }

        if (errors.length > 0) {
            const service   = await serviceModel.getServiceById(serviceId);
            const customers = await bookingModel.getAllCustomers();
            return res.status(400).render('booking-form', {
                title: `Book Service — HomeServe`,
                service,
                customers,
                error: errors.join(' '),
                formData: req.body,
            });
        }

        // Get customer addresses
        const addresses = await bookingModel.getCustomerAddresses(customerId);
        if (addresses.length === 0) {
            const service   = await serviceModel.getServiceById(serviceId);
            const customers = await bookingModel.getAllCustomers();
            return res.status(400).render('booking-form', {
                title: `Book Service — HomeServe`,
                service,
                customers,
                error: 'No address found for this customer.',
                formData: req.body,
            });
        }
        const addressId = addresses.find(a => a.is_default)?.address_id || addresses[0].address_id;

        // Call stored function (transactional)
        const bookingId = await bookingModel.createBooking({
            customerId, providerId, serviceId, variantId,
            addressId,
            date: booking_date,
            time: booking_time,
            notes: notes || null,
            couponCode: coupon_code || null,
            paymentMethod: payment_method || 'Cash',
        });

        res.redirect(`/bookings?success=true&id=${bookingId}&customer_id=${customerId}`);
    } catch (err) {
        // Handle known DB errors gracefully
        const knownErrors = [
            'already booked', 'invalid', 'expired', 'usage limit',
            'minimum order', 'past', 'inactive', 'not found',
            'available', 'availability',
        ];
        const isKnown = knownErrors.some(k => err.message?.toLowerCase().includes(k));

        if (isKnown) {
            try {
                const serviceId = parseInt(req.body.service_id);
                const service   = await serviceModel.getServiceById(serviceId);
                const customers = await bookingModel.getAllCustomers();
                return res.status(400).render('booking-form', {
                    title: 'Book Service — HomeServe',
                    service,
                    customers,
                    error: err.message,
                    formData: req.body,
                });
            } catch (_) { /* fall through to global handler */ }
        }
        next(err);
    }
};

// GET /bookings  — Booking history for a customer
exports.history = async (req, res, next) => {
    try {
        const customerId = parseInt(req.query.customer_id) || 1;
        if (!Number.isInteger(customerId) || customerId <= 0) {
            return res.status(400).render('404', { title: 'Invalid Customer ID' });
        }

        const page   = Math.max(1, parseInt(req.query.page) || 1);
        const limit  = 10;
        const offset = (page - 1) * limit;

        const { bookings, total } = await bookingModel.getCustomerBookings(customerId, limit, offset);
        const customers = await bookingModel.getAllCustomers();

        res.render('booking-history', {
            title: 'My Bookings — HomeServe',
            bookings,
            customers,
            currentCustomer: customerId,
            success: req.query.success === 'true',
            reviewSuccess: req.query.review === 'true',
            newBookingId: req.query.id || null,
            page,
            totalPages: Math.ceil(total / limit),
            total,
        });
    } catch (err) {
        next(err);
    }
};

// POST /bookings/:id/review  — Submit review
exports.addReview = async (req, res, next) => {
    try {
        const bookingId  = parseInt(req.params.id);
        const customerId = parseInt(req.body.customer_id);
        const providerId = parseInt(req.body.provider_id);
        const rating     = parseInt(req.body.rating);
        const comment    = req.body.comment || '';

        // Validate
        if (!Number.isInteger(bookingId)  || bookingId <= 0)  return res.status(400).json({ error: 'Invalid booking ID.' });
        if (!Number.isInteger(customerId) || customerId <= 0)  return res.status(400).json({ error: 'Invalid customer.' });
        if (!Number.isInteger(providerId) || providerId <= 0)  return res.status(400).json({ error: 'Invalid provider.' });
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        if (comment.length > 500) return res.status(400).json({ error: 'Comment too long (max 500 chars).' });

        await bookingModel.addReview(bookingId, providerId, customerId, rating, comment);
        res.redirect(`/bookings?customer_id=${customerId}&review=true`);
    } catch (err) {
        const knownErrors = ['completed', 'review already', 'not found'];
        const isKnown = knownErrors.some(k => err.message?.toLowerCase().includes(k));
        if (isKnown) {
            return res.status(400).redirect(`/bookings?customer_id=${req.body.customer_id}&review_error=true`);
        }
        next(err);
    }
};

// POST /bookings/:id/status  — Update status
exports.updateStatus = async (req, res, next) => {
    try {
        const bookingId = parseInt(req.params.id);
        const { new_status, notes, redirect_to } = req.body;

        if (!Number.isInteger(bookingId) || bookingId <= 0) {
            return res.status(400).json({ error: 'Invalid booking ID.' });
        }

        const validStatuses = ['Pending', 'Confirmed', 'InProgress', 'Completed', 'Cancelled'];
        if (!validStatuses.includes(new_status)) {
            return res.status(400).json({ error: 'Invalid status.' });
        }

        await bookingModel.updateBookingStatus(bookingId, new_status, notes || null);
        res.redirect(redirect_to || '/provider');
    } catch (err) {
        next(err);
    }
};

// GET /api/calculate-amount  — AJAX price calculation
exports.calculateAmount = async (req, res) => {
    try {
        const serviceId  = parseInt(req.query.service_id);
        const variantId  = req.query.variant_id ? parseInt(req.query.variant_id) : null;
        const couponCode = req.query.coupon_code || null;

        if (!Number.isInteger(serviceId) || serviceId <= 0) {
            return res.status(400).json({ error: 'Invalid service ID.' });
        }
        if (variantId !== null && (!Number.isInteger(variantId) || variantId <= 0)) {
            return res.status(400).json({ error: 'Invalid variant ID.' });
        }
        if (couponCode && couponCode.length > 30) {
            return res.status(400).json({ error: 'Invalid coupon code.' });
        }

        const amount = await bookingModel.calculateAmount(serviceId, variantId, couponCode);
        res.json({ amount: amount.toFixed(2) });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
