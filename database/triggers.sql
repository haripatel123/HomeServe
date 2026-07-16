-- TRIGGER 1: Auto-insert initial 'Pending' status log
--            after every new Booking
CREATE OR REPLACE FUNCTION fn_trg_auto_status_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO BookingStatusLog (booking_id, old_status, new_status, notes)
    VALUES (NEW.booking_id, NULL, 'Pending', 'Booking created');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_booking_insert ON Booking;
CREATE TRIGGER trg_after_booking_insert
    AFTER INSERT ON Booking
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_auto_status_log();

-- TRIGGER 2: Recalculate provider avg_rating after review
CREATE OR REPLACE FUNCTION fn_trg_update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE Provider
    SET
        avg_rating    = (
            SELECT ROUND(AVG(rating)::NUMERIC, 2)
            FROM ProviderReview
            WHERE provider_id = NEW.provider_id
        ),
        total_reviews = (
            SELECT COUNT(*)
            FROM ProviderReview
            WHERE provider_id = NEW.provider_id
        )
    WHERE provider_id = NEW.provider_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_after_review_insert ON ProviderReview;
CREATE TRIGGER trg_after_review_insert
    AFTER INSERT OR UPDATE ON ProviderReview
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_update_provider_rating();

-- TRIGGER 3: Prevent double booking (same provider/date/time)
CREATE OR REPLACE FUNCTION fn_trg_prevent_double_booking()
RETURNS TRIGGER AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO conflict_count
    FROM Booking
    WHERE provider_id  = NEW.provider_id
      AND booking_date = NEW.booking_date
      AND booking_time = NEW.booking_time
      AND status NOT IN ('Cancelled')
      AND booking_id  != COALESCE(NEW.booking_id, -1);

    IF conflict_count > 0 THEN
        RAISE EXCEPTION 'Provider is already booked at this date and time. Please choose a different slot.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_double_booking ON Booking;
CREATE TRIGGER trg_prevent_double_booking
    BEFORE INSERT OR UPDATE ON Booking
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_prevent_double_booking();

-- TRIGGER 4: Increment coupon usage count when booking
--            uses a coupon
CREATE OR REPLACE FUNCTION fn_trg_increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.coupon_id IS NOT NULL THEN
        UPDATE Coupon
        SET times_used = times_used + 1
        WHERE coupon_id = NEW.coupon_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_coupon_usage ON Booking;
CREATE TRIGGER trg_update_coupon_usage
    AFTER INSERT ON Booking
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_increment_coupon_usage();

-- TRIGGER 5: Auto-set payment paid_at timestamp
--            when payment status changes to 'Paid'
CREATE OR REPLACE FUNCTION fn_trg_set_paid_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'Paid' AND OLD.status != 'Paid' THEN
        NEW.paid_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_paid_timestamp ON Payment;
CREATE TRIGGER trg_set_paid_timestamp
    BEFORE UPDATE ON Payment
    FOR EACH ROW
    EXECUTE FUNCTION fn_trg_set_paid_timestamp();
