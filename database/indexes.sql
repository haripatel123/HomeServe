
-- HOME SERVICE BOOKING PLATFORM — INDEXES

-- Booking table indexes (most queried table)
CREATE INDEX IF NOT EXISTS idx_booking_customer    ON Booking(customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_provider    ON Booking(provider_id);
CREATE INDEX IF NOT EXISTS idx_booking_date        ON Booking(booking_date);
CREATE INDEX IF NOT EXISTS idx_booking_status      ON Booking(status);

-- BookingItem index
CREATE INDEX IF NOT EXISTS idx_bookingitem_booking ON BookingItem(booking_id);
CREATE INDEX IF NOT EXISTS idx_bookingitem_service ON BookingItem(service_id);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_review_provider     ON ProviderReview(provider_id);
CREATE INDEX IF NOT EXISTS idx_review_customer     ON ProviderReview(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_booking      ON ProviderReview(booking_id);

-- Service / Category
CREATE INDEX IF NOT EXISTS idx_service_category    ON Service(category_id);
CREATE INDEX IF NOT EXISTS idx_service_active      ON Service(is_active);

-- Payment
CREATE INDEX IF NOT EXISTS idx_payment_status      ON Payment(status);
CREATE INDEX IF NOT EXISTS idx_payment_booking     ON Payment(booking_id);

-- Provider Availability
CREATE INDEX IF NOT EXISTS idx_avail_provider      ON ProviderAvailability(provider_id);
CREATE INDEX IF NOT EXISTS idx_avail_day           ON ProviderAvailability(day_of_week);

-- Status Log
CREATE INDEX IF NOT EXISTS idx_statuslog_booking   ON BookingStatusLog(booking_id);

-- Coupon lookup
CREATE INDEX IF NOT EXISTS idx_coupon_code         ON Coupon(code);
