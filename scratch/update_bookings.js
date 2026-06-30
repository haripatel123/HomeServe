const pool = require('../config/db');

async function updateBookings() {
    console.log('🔄 Seeding today\'s bookings for verification...');
    try {
        // Update only booking 37 (Confirmed) to today's date to avoid conflict
        await pool.query(
            `UPDATE Booking 
             SET booking_date = CURRENT_DATE 
             WHERE booking_id = 37`
        );
        console.log('✅ Successfully updated booking 37 to CURRENT_DATE!');
    } catch (err) {
        console.error('❌ Failed to update bookings:', err.message);
    } finally {
        await pool.end();
    }
}

updateBookings();
