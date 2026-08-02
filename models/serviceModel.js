const pool = require('../config/db');

// Get all services (from view) with optional category filter
async function getAllServices(categoryId = null) {
    if (categoryId !== null) {
        const result = await pool.query(
            `SELECT * FROM vw_service_details WHERE category_id = $1 ORDER BY service_name`,
            [categoryId]
        );
        return result.rows;
    }
    const result = await pool.query(
        `SELECT * FROM vw_service_details ORDER BY category_name, service_name`
    );
    return result.rows;
}

// Get one service by ID with its variants and providers
async function getServiceById(serviceId) {
    const serviceResult = await pool.query(
        `SELECT * FROM vw_service_details WHERE service_id = $1`,
        [serviceId]
    );
    if (serviceResult.rows.length === 0) return null;

    const variantsResult = await pool.query(
        `SELECT variant_id, variant_name, price, description
         FROM ServiceVariant
         WHERE service_id = $1
         ORDER BY price`,
        [serviceId]
    );

    const providersResult = await pool.query(
        `SELECT p.provider_id, p.name, p.avg_rating, p.total_reviews, p.experience_yrs, p.bio,
                COALESCE(
                  (SELECT json_agg(json_build_object(
                      'day', pa.day_of_week,
                      'start', TO_CHAR(pa.start_time, 'HH24:MI'),
                      'end', TO_CHAR(pa.end_time, 'HH24:MI')
                   ) ORDER BY CASE pa.day_of_week
                       WHEN 'Monday'    THEN 1
                       WHEN 'Tuesday'   THEN 2
                       WHEN 'Wednesday' THEN 3
                       WHEN 'Thursday'  THEN 4
                       WHEN 'Friday'    THEN 5
                       WHEN 'Saturday'  THEN 6
                       WHEN 'Sunday'    THEN 7
                   END)
                   FROM ProviderAvailability pa WHERE pa.provider_id = p.provider_id), '[]'::json
                ) AS schedule
         FROM Provider p
         JOIN ProviderService ps ON p.provider_id = ps.provider_id
         WHERE ps.service_id = $1 AND p.is_active = TRUE
         ORDER BY p.avg_rating DESC`,
        [serviceId]
    );

    return {
        ...serviceResult.rows[0],
        variants:  variantsResult.rows,
        providers: providersResult.rows,
    };
}

// Get all categories
async function getAllCategories() {
    const result = await pool.query(
        `SELECT category_id, name, icon_name, description FROM Category ORDER BY name`
    );
    return result.rows;
}

module.exports = { getAllServices, getServiceById, getAllCategories };
