const pool = require('../config/db');

// Main analytics function (via stored function)
async function getAnalyticsKPIs() {
    const result = await pool.query(`SELECT metric_key, metric_value FROM fn_get_analytics()`);
    const kpis = {};
    result.rows.forEach(row => {
        kpis[row.metric_key] = parseFloat(row.metric_value);
    });
    return kpis;
}

// Top services by booking count (from view)
async function getTopServices(limit = 8) {
    const result = await pool.query(
        `SELECT service_name, category_name, booking_count, total_revenue, avg_price
         FROM vw_top_services
         WHERE booking_count > 0
         ORDER BY booking_count DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
}

// Revenue by month (from view)
async function getRevenueByMonth(limit = 12) {
    const result = await pool.query(
        `SELECT month_label, total_bookings, total_revenue
         FROM vw_revenue_by_month
         ORDER BY month
         LIMIT $1`,
        [limit]
    );
    return result.rows;
}

// Highest rated providers (from analytics view)
async function getTopProviders(limit = 6) {
    const result = await pool.query(
        `SELECT provider_name, avg_rating, total_reviews, total_bookings,
                total_revenue, completed_bookings, experience_yrs
         FROM vw_provider_analytics
         WHERE total_reviews > 0
         ORDER BY avg_rating DESC, total_reviews DESC
         LIMIT $1`,
        [limit]
    );
    return result.rows;
}

// Booking status distribution
async function getBookingStatusDistribution() {
    const result = await pool.query(
        `SELECT status, COUNT(*) AS count
         FROM Booking
         GROUP BY status
         ORDER BY count DESC`
    );
    return result.rows;
}

// Revenue by category
async function getRevenueByCategory() {
    const result = await pool.query(
        `SELECT c.name AS category_name,
                COUNT(bi.item_id)                          AS booking_count,
                COALESCE(SUM(bi.unit_price * bi.quantity), 0) AS total_revenue
         FROM Category c
         LEFT JOIN Service s       ON c.category_id = s.category_id
         LEFT JOIN BookingItem bi  ON s.service_id  = bi.service_id
         GROUP BY c.name
         ORDER BY total_revenue DESC`
    );
    return result.rows;
}

module.exports = {
    getAnalyticsKPIs,
    getTopServices,
    getRevenueByMonth,
    getTopProviders,
    getBookingStatusDistribution,
    getRevenueByCategory,
};
