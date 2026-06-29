
-- HOME SERVICE BOOKING PLATFORM — STORED PROCEDURES & FUNCTIONS

-------------------------------------------------------
-- FUNCTION 1: fn_calculate_booking_amount
-- Calculates total from backend (never trust frontend)
-- Returns: final_amount NUMERIC
-------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_calculate_booking_amount(
    p_service_id  INTEGER,
    p_variant_id  INTEGER,
    p_coupon_code VARCHAR DEFAULT NULL
)
RETURNS NUMERIC AS $$
DECLARE
    v_price         NUMERIC(10,2);
    v_discount_pct  NUMERIC(5,2) := 0;
    v_coupon_id     INTEGER;
    v_min_order     NUMERIC(10,2);
    v_final         NUMERIC(10,2);
BEGIN
    -- Get base or variant price
    IF p_variant_id IS NOT NULL THEN
        SELECT price INTO v_price
        FROM ServiceVariant
        WHERE variant_id = p_variant_id AND service_id = p_service_id;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Invalid variant for this service.';
        END IF;
    ELSE
        SELECT base_price INTO v_price
        FROM Service
        WHERE service_id = p_service_id AND is_active = TRUE;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Service not found or inactive.';
        END IF;
    END IF;

    -- Apply coupon if provided
    IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
        SELECT coupon_id, discount_pct, min_order
        INTO v_coupon_id, v_discount_pct, v_min_order
        FROM Coupon
        WHERE code = UPPER(p_coupon_code)
          AND is_active = TRUE
          AND CURRENT_DATE BETWEEN valid_from AND valid_to
          AND times_used < usage_limit;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Coupon is invalid, expired, or usage limit reached.';
        END IF;

        IF v_price < v_min_order THEN
            RAISE EXCEPTION 'Order amount does not meet minimum order requirement of ₹%.', v_min_order;
        END IF;
    END IF;

    -- Calculate final amount
    v_final := v_price - (v_price * v_discount_pct / 100);

    -- Ensure non-negative
    IF v_final < 0 THEN
        v_final := 0;
    END IF;

    RETURN v_final;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- FUNCTION 2: fn_create_booking
-- Full transactional booking creation
-- Returns: booking_id INTEGER
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_create_booking(
    p_customer_id  INTEGER,
    p_provider_id  INTEGER,
    p_service_id   INTEGER,
    p_variant_id   INTEGER,
    p_address_id   INTEGER,
    p_date         DATE,
    p_time         TIME,
    p_notes        TEXT,
    p_coupon_code  VARCHAR DEFAULT NULL,
    p_payment_method payment_method_enum DEFAULT 'Cash'
)
RETURNS INTEGER AS $$
DECLARE
    v_booking_id  INTEGER;
    v_amount      NUMERIC(10,2);
    v_coupon_id   INTEGER := NULL;
BEGIN
    -- Validate future date
    IF p_date < CURRENT_DATE THEN
        RAISE EXCEPTION 'Booking date cannot be in the past.';
    END IF;

    -- Validate customer exists
    PERFORM 1 FROM Customer WHERE customer_id = p_customer_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Customer not found.'; END IF;

    -- Validate provider exists and is active
    PERFORM 1 FROM Provider WHERE provider_id = p_provider_id AND is_active = TRUE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Provider not found or inactive.'; END IF;

    -- Validate service exists
    PERFORM 1 FROM Service WHERE service_id = p_service_id AND is_active = TRUE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Service not found or inactive.'; END IF;

    -- Validate address belongs to customer
    PERFORM 1 FROM Address WHERE address_id = p_address_id AND customer_id = p_customer_id;
    IF NOT FOUND THEN RAISE EXCEPTION 'Address not found for this customer.'; END IF;

    -- Get coupon ID if provided
    IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
        SELECT coupon_id INTO v_coupon_id
        FROM Coupon
        WHERE code = UPPER(p_coupon_code)
          AND is_active = TRUE
          AND CURRENT_DATE BETWEEN valid_from AND valid_to
          AND times_used < usage_limit;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Coupon is invalid, expired, or usage limit reached.';
        END IF;
    END IF;

    -- Calculate amount (backend-only, never trust frontend)
    v_amount := fn_calculate_booking_amount(p_service_id, p_variant_id, p_coupon_code);

    -- Insert booking (triggers fire automatically)
    INSERT INTO Booking (
        customer_id, provider_id, address_id, coupon_id,
        booking_date, booking_time, notes, total_amount
    ) VALUES (
        p_customer_id, p_provider_id, p_address_id, v_coupon_id,
        p_date, p_time, p_notes, v_amount
    ) RETURNING booking_id INTO v_booking_id;

    -- Insert booking item
    INSERT INTO BookingItem (booking_id, service_id, variant_id, quantity, unit_price)
    VALUES (
        v_booking_id,
        p_service_id,
        NULLIF(p_variant_id, 0),
        1,
        v_amount
    );

    -- Insert payment record
    INSERT INTO Payment (booking_id, amount, method, status)
    VALUES (v_booking_id, v_amount, p_payment_method, 'Pending');

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- FUNCTION 3: fn_update_booking_status
-- Updates booking status and logs the change
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_update_booking_status(
    p_booking_id  INTEGER,
    p_new_status  booking_status_enum,
    p_notes       TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_old_status booking_status_enum;
BEGIN
    SELECT status INTO v_old_status
    FROM Booking
    WHERE booking_id = p_booking_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Booking not found.';
    END IF;

    UPDATE Booking
    SET status = p_new_status
    WHERE booking_id = p_booking_id;

    INSERT INTO BookingStatusLog (booking_id, old_status, new_status, notes)
    VALUES (p_booking_id, v_old_status, p_new_status, p_notes);

    -- If completed, update payment to Paid
    IF p_new_status = 'Completed' THEN
        UPDATE Payment
        SET status = 'Paid', paid_at = NOW()
        WHERE booking_id = p_booking_id;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- FUNCTION 4: fn_get_analytics
-- Returns platform-wide analytics as JSON
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_get_analytics()
RETURNS TABLE (
    metric_key   TEXT,
    metric_value NUMERIC
) AS $$
BEGIN
    -- Total customers
    RETURN QUERY SELECT 'total_customers'::TEXT, COUNT(*)::NUMERIC FROM Customer;
    -- Total providers
    RETURN QUERY SELECT 'total_providers'::TEXT, COUNT(*)::NUMERIC FROM Provider WHERE is_active = TRUE;
    -- Total bookings
    RETURN QUERY SELECT 'total_bookings'::TEXT, COUNT(*)::NUMERIC FROM Booking;
    -- Completed bookings
    RETURN QUERY SELECT 'completed_bookings'::TEXT, COUNT(*)::NUMERIC FROM Booking WHERE status = 'Completed';
    -- Total revenue (paid)
    RETURN QUERY SELECT 'total_revenue'::TEXT, COALESCE(SUM(amount), 0)::NUMERIC FROM Payment WHERE status = 'Paid';
    -- Pending bookings
    RETURN QUERY SELECT 'pending_bookings'::TEXT, COUNT(*)::NUMERIC FROM Booking WHERE status = 'Pending';
    -- Total reviews
    RETURN QUERY SELECT 'total_reviews'::TEXT, COUNT(*)::NUMERIC FROM ProviderReview;
    -- Average rating across all providers
    RETURN QUERY SELECT 'avg_platform_rating'::TEXT, ROUND(COALESCE(AVG(avg_rating), 0), 2)::NUMERIC FROM Provider WHERE total_reviews > 0;
END;
$$ LANGUAGE plpgsql;

-- -------------------------------------------------------
-- PROCEDURE 5: proc_add_provider_availability
-- Adds availability with overlap validation
-- -------------------------------------------------------
CREATE OR REPLACE PROCEDURE proc_add_provider_availability(
    p_provider_id  INTEGER,
    p_day          day_of_week_enum,
    p_start        TIME,
    p_end          TIME
)
LANGUAGE plpgsql AS $$
DECLARE
    v_overlap INTEGER;
BEGIN
    -- Validate time range
    IF p_end <= p_start THEN
        RAISE EXCEPTION 'End time must be after start time.';
    END IF;

    -- Check for overlapping slots
    SELECT COUNT(*) INTO v_overlap
    FROM ProviderAvailability
    WHERE provider_id  = p_provider_id
      AND day_of_week  = p_day
      AND (
          (p_start >= start_time AND p_start < end_time) OR
          (p_end   >  start_time AND p_end  <= end_time) OR
          (p_start <= start_time AND p_end  >= end_time)
      );

    IF v_overlap > 0 THEN
        RAISE EXCEPTION 'This time slot overlaps with an existing availability slot.';
    END IF;

    INSERT INTO ProviderAvailability (provider_id, day_of_week, start_time, end_time)
    VALUES (p_provider_id, p_day, p_start, p_end);
END;
$$;
