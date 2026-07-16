const pool = require('../config/db');

// Get all providers (for dashboard selection)
async function getAllProviders() {
    const result = await pool.query(
        `SELECT provider_id, name, email, phone, avg_rating, total_reviews, experience_yrs, bio
         FROM Provider WHERE is_active = TRUE ORDER BY name`
    );
    return result.rows;
}

// Get provider dashboard data (using analytics view)
async function getProviderDashboard(providerId) {
    const providerResult = await pool.query(
        `SELECT * FROM vw_provider_analytics WHERE provider_id = $1`,
        [providerId]
    );
    if (providerResult.rows.length === 0) return null;

    const scheduleResult = await pool.query(
        `SELECT * FROM vw_provider_schedule
         WHERE provider_id = $1
         ORDER BY booking_date DESC, booking_time DESC
         LIMIT 20`,
        [providerId]
    );

    const availResult = await pool.query(
        `SELECT avail_id, day_of_week,
                TO_CHAR(start_time, 'HH24:MI') AS start_time,
                TO_CHAR(end_time,   'HH24:MI') AS end_time
         FROM ProviderAvailability
         WHERE provider_id = $1
         ORDER BY
             CASE day_of_week
                 WHEN 'Monday'    THEN 1
                 WHEN 'Tuesday'   THEN 2
                 WHEN 'Wednesday' THEN 3
                 WHEN 'Thursday'  THEN 4
                 WHEN 'Friday'    THEN 5
                 WHEN 'Saturday'  THEN 6
                 WHEN 'Sunday'    THEN 7
             END`,
        [providerId]
    );

    const revenueResult = await pool.query(
        `SELECT TO_CHAR(b.booking_date, 'Mon') AS month,
                SUM(b.total_amount) AS revenue
         FROM Booking b
         WHERE b.provider_id = $1 AND b.status = 'Completed'
         GROUP BY TO_CHAR(b.booking_date, 'Mon'), TO_CHAR(b.booking_date, 'YYYY-MM')
         ORDER BY TO_CHAR(b.booking_date, 'YYYY-MM')
         LIMIT 6`,
        [providerId]
    );

    const todayScheduleResult = await pool.query(
        `SELECT * FROM vw_provider_schedule
         WHERE provider_id = $1 AND booking_date = CURRENT_DATE
         ORDER BY booking_time ASC`,
        [providerId]
    );

    return {
        provider:      providerResult.rows[0],
        schedule:      scheduleResult.rows,
        availability:  availResult.rows,
        revenue:       revenueResult.rows,
        todaySchedule: todayScheduleResult.rows,
    };
}

// Add availability slot (calls stored procedure)
async function addAvailability(providerId, dayOfWeek, startTime, endTime) {
    await pool.query(
        `CALL proc_add_provider_availability($1, $2::day_of_week_enum, $3::TIME, $4::TIME)`,
        [providerId, dayOfWeek, startTime, endTime]
    );
}

// Delete availability slot
async function deleteAvailability(availId, providerId) {
    const result = await pool.query(
        `DELETE FROM ProviderAvailability
         WHERE avail_id = $1 AND provider_id = $2
         RETURNING avail_id`,
        [availId, providerId]
    );
    if (result.rows.length === 0) throw new Error('Availability slot not found.');
}

// Get provider reviews
async function getProviderReviews(providerId, limit = 10) {
    const result = await pool.query(
        `SELECT pr.rating, pr.comment, pr.created_at,
                cu.name AS customer_name
         FROM ProviderReview pr
         JOIN Customer cu ON pr.customer_id = cu.customer_id
         WHERE pr.provider_id = $1
         ORDER BY pr.created_at DESC
         LIMIT $2`,
        [providerId, limit]
    );
    return result.rows;
}

module.exports = {
    getAllProviders,
    getProviderDashboard,
    addAvailability,
    deleteAvailability,
    getProviderReviews,
};
