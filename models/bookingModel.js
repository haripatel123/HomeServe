const pool = require('../config/db');

// Create booking using stored function (transactional)
async function createBooking(data) {
    const {
        customerId, providerId, serviceId, variantId,
        addressId, date, time, notes, couponCode, paymentMethod
    } = data;

    const result = await pool.query(
        `SELECT fn_create_booking($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) AS booking_id`,
        [
            customerId, providerId, serviceId,
            variantId || null,
            addressId, date, time,
            notes || null,
            couponCode || null,
            paymentMethod || 'Cash'
        ]
    );
    return result.rows[0].booking_id;
}

// Get bookings for a customer (paginated, via view)
async function getCustomerBookings(customerId, limit = 10, offset = 0) {
    const result = await pool.query(
        `SELECT bs.*,
                STRING_AGG(DISTINCT s.name, ', ') AS services,
                EXISTS(
                    SELECT 1 FROM ProviderReview pr WHERE pr.booking_id = bs.booking_id
                ) AS has_review
         FROM vw_booking_summary bs
         LEFT JOIN BookingItem bi ON bi.booking_id = bs.booking_id
         LEFT JOIN Service s      ON s.service_id  = bi.service_id
         WHERE bs.customer_id = $1
         GROUP BY bs.booking_id, bs.booking_date, bs.booking_time, bs.status,
                  bs.total_amount, bs.notes, bs.created_at, bs.customer_id,
                  bs.customer_name, bs.customer_phone, bs.provider_id,
                  bs.provider_name, bs.provider_phone, bs.address_line1,
                  bs.city, bs.pincode, bs.payment_status, bs.payment_method,
                  bs.coupon_code
         ORDER BY bs.booking_date DESC, bs.booking_time DESC
         LIMIT $2 OFFSET $3`,
        [customerId, limit, offset]
    );

    const countResult = await pool.query(
        `SELECT COUNT(*) FROM Booking WHERE customer_id = $1`,
        [customerId]
    );

    return {
        bookings: result.rows,
        total: parseInt(countResult.rows[0].count),
    };
}

// Get single booking by ID (with ownership check)
async function getBookingById(bookingId, customerId = null) {
    let query = `SELECT * FROM vw_booking_summary WHERE booking_id = $1`;
    const params = [bookingId];
    if (customerId !== null) {
        query += ` AND customer_id = $2`;
        params.push(customerId);
    }
    const result = await pool.query(query, params);
    return result.rows[0] || null;
}

// Calculate amount via backend function
async function calculateAmount(serviceId, variantId, couponCode) {
    const result = await pool.query(
        `SELECT fn_calculate_booking_amount($1, $2, $3) AS amount`,
        [serviceId, variantId || null, couponCode || null]
    );
    return parseFloat(result.rows[0].amount);
}

// Update booking status via stored procedure
async function updateBookingStatus(bookingId, newStatus, notes = null) {
    await pool.query(
        `SELECT fn_update_booking_status($1, $2::booking_status_enum, $3)`,
        [bookingId, newStatus, notes]
    );
}

// Add review (only for completed, no duplicate)
async function addReview(bookingId, providerId, customerId, rating, comment) {
    // Verify booking is completed
    const booking = await pool.query(
        `SELECT status FROM Booking WHERE booking_id = $1 AND customer_id = $2`,
        [bookingId, customerId]
    );
    if (!booking.rows[0]) throw new Error('Booking not found.');
    if (booking.rows[0].status !== 'Completed') throw new Error('Reviews can only be added for completed bookings.');

    // Check no existing review (unique constraint on booking_id already enforces this)
    const result = await pool.query(
        `INSERT INTO ProviderReview (booking_id, provider_id, customer_id, rating, comment)
         VALUES ($1, $2, $3, $4, $5) RETURNING review_id`,
        [bookingId, providerId, customerId, rating, comment || null]
    );
    return result.rows[0].review_id;
}

// Get customer addresses
async function getCustomerAddresses(customerId) {
    const result = await pool.query(
        `SELECT * FROM Address WHERE customer_id = $1 ORDER BY is_default DESC, address_id`,
        [customerId]
    );
    return result.rows;
}

// Get all customers (for demo selection)
async function getAllCustomers() {
    const result = await pool.query(
        `SELECT customer_id, name, email, phone FROM Customer ORDER BY customer_id`
    );
    return result.rows;
}

module.exports = {
    createBooking,
    getCustomerBookings,
    getBookingById,
    calculateAmount,
    updateBookingStatus,
    addReview,
    getCustomerAddresses,
    getAllCustomers,
};
