-- ============================================================
-- HOME SERVICE BOOKING PLATFORM — VIEWS
-- ============================================================

-- -------------------------------------------------------
-- VIEW 1: vw_service_details
-- Full service info with category name and active status
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_service_details AS
SELECT
    s.service_id,
    s.name            AS service_name,
    s.description,
    s.base_price,
    s.duration_min,
    s.is_active,
    c.category_id,
    c.name            AS category_name,
    c.icon_name,
    COUNT(sv.variant_id) AS variant_count,
    MIN(sv.price)        AS min_price,
    MAX(sv.price)        AS max_price
FROM Service s
JOIN Category c ON s.category_id = c.category_id
LEFT JOIN ServiceVariant sv ON s.service_id = sv.service_id
WHERE s.is_active = TRUE
GROUP BY s.service_id, s.name, s.description, s.base_price, s.duration_min,
         s.is_active, c.category_id, c.name, c.icon_name;

-- -------------------------------------------------------
-- VIEW 2: vw_booking_summary
-- Booking with customer, provider, service, status
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_booking_summary AS
SELECT
    b.booking_id,
    b.booking_date,
    b.booking_time,
    b.status,
    b.total_amount,
    b.notes,
    b.created_at,
    cu.customer_id,
    cu.name           AS customer_name,
    cu.phone          AS customer_phone,
    pr.provider_id,
    pr.name           AS provider_name,
    pr.phone          AS provider_phone,
    a.line1           AS address_line1,
    a.city,
    a.pincode,
    p.status          AS payment_status,
    p.method          AS payment_method,
    co.code           AS coupon_code
FROM Booking b
JOIN Customer cu  ON b.customer_id = cu.customer_id
JOIN Provider pr  ON b.provider_id = pr.provider_id
JOIN Address  a   ON b.address_id  = a.address_id
LEFT JOIN Payment p   ON b.booking_id  = p.booking_id
LEFT JOIN Coupon  co  ON b.coupon_id   = co.coupon_id;

-- -------------------------------------------------------
-- VIEW 3: vw_provider_analytics
-- Per-provider: total bookings, revenue, avg rating
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_provider_analytics AS
SELECT
    pr.provider_id,
    pr.name                                     AS provider_name,
    pr.avg_rating,
    pr.total_reviews,
    pr.experience_yrs,
    COUNT(DISTINCT b.booking_id)                AS total_bookings,
    COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'Completed'), 0) AS total_revenue,
    COUNT(DISTINCT b.booking_id)
        FILTER (WHERE b.status = 'Completed')   AS completed_bookings
FROM Provider pr
LEFT JOIN Booking b ON pr.provider_id = b.provider_id
WHERE pr.is_active = TRUE
GROUP BY pr.provider_id, pr.name, pr.avg_rating, pr.total_reviews, pr.experience_yrs;

-- -------------------------------------------------------
-- VIEW 4: vw_top_services
-- Most booked services with booking count and revenue
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_top_services AS
SELECT
    s.service_id,
    s.name                              AS service_name,
    c.name                              AS category_name,
    COUNT(bi.item_id)                   AS booking_count,
    COALESCE(SUM(bi.unit_price * bi.quantity), 0) AS total_revenue,
    ROUND(AVG(bi.unit_price), 2)        AS avg_price
FROM Service s
JOIN Category c       ON s.category_id  = c.category_id
LEFT JOIN BookingItem bi ON s.service_id = bi.service_id
GROUP BY s.service_id, s.name, c.name
ORDER BY booking_count DESC;

-- -------------------------------------------------------
-- VIEW 5: vw_revenue_by_month
-- Monthly revenue aggregated from payments
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_revenue_by_month AS
SELECT
    TO_CHAR(b.booking_date, 'YYYY-MM')  AS month,
    TO_CHAR(b.booking_date, 'Mon YYYY') AS month_label,
    COUNT(b.booking_id) FILTER (WHERE b.status = 'Completed') AS total_bookings,
    COALESCE(SUM(b.total_amount) FILTER (WHERE b.status = 'Completed'), 0) AS total_revenue
FROM Booking b
WHERE b.status = 'Completed'
GROUP BY TO_CHAR(b.booking_date, 'YYYY-MM'), TO_CHAR(b.booking_date, 'Mon YYYY')
ORDER BY month;

-- -------------------------------------------------------
-- VIEW 6: vw_provider_schedule
-- Provider bookings with full details for dashboard
-- -------------------------------------------------------
CREATE OR REPLACE VIEW vw_provider_schedule AS
SELECT
    b.booking_id,
    b.booking_date,
    b.booking_time,
    b.status,
    b.total_amount,
    b.provider_id,
    cu.name         AS customer_name,
    cu.phone        AS customer_phone,
    a.line1         AS address,
    a.city,
    STRING_AGG(s.name, ', ') AS services
FROM Booking b
JOIN Customer cu ON b.customer_id = cu.customer_id
JOIN Address   a  ON b.address_id  = a.address_id
JOIN BookingItem bi ON b.booking_id = bi.booking_id
JOIN Service s      ON bi.service_id = s.service_id
GROUP BY b.booking_id, b.booking_date, b.booking_time, b.status,
         b.total_amount, b.provider_id, cu.name, cu.phone, a.line1, a.city;
