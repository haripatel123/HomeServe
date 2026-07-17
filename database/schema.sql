
-- HOME SERVICE BOOKING PLATFORM — SCHEMA

-- Drop in reverse dependency order
DROP TABLE IF EXISTS Account CASCADE;
DROP TABLE IF EXISTS "session" CASCADE;
DROP TABLE IF EXISTS ProviderReview CASCADE;
DROP TABLE IF EXISTS BookingStatusLog CASCADE;
DROP TABLE IF EXISTS Payment CASCADE;
DROP TABLE IF EXISTS BookingItem CASCADE;
DROP TABLE IF EXISTS Booking CASCADE;
DROP TABLE IF EXISTS Coupon CASCADE;
DROP TABLE IF EXISTS ProviderAvailability CASCADE;
DROP TABLE IF EXISTS ProviderService CASCADE;
DROP TABLE IF EXISTS ServiceVariant CASCADE;
DROP TABLE IF EXISTS Service CASCADE;
DROP TABLE IF EXISTS Category CASCADE;
DROP TABLE IF EXISTS Address CASCADE;
DROP TABLE IF EXISTS Provider CASCADE;
DROP TABLE IF EXISTS Customer CASCADE;

-- Drop types if exist
DROP TYPE IF EXISTS booking_status_enum CASCADE;
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS payment_method_enum CASCADE;
DROP TYPE IF EXISTS day_of_week_enum CASCADE;

-- ENUMS

CREATE TYPE booking_status_enum AS ENUM ('Pending','Confirmed','InProgress','Completed','Cancelled');
CREATE TYPE payment_status_enum AS ENUM ('Pending','Paid','Refunded','Failed');
CREATE TYPE payment_method_enum AS ENUM ('Cash','Card','UPI','Wallet');
CREATE TYPE day_of_week_enum AS ENUM ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday');

-- CUSTOMER

CREATE TABLE Customer (
    customer_id   SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
    email         VARCHAR(150) UNIQUE NOT NULL,
    phone         CHAR(10) NOT NULL CHECK (phone ~ '^\d{10}$'),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- PROVIDER

CREATE TABLE Provider (
    provider_id     SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL CHECK (char_length(name) >= 2),
    email           VARCHAR(150) UNIQUE NOT NULL,
    phone           CHAR(10) NOT NULL CHECK (phone ~ '^\d{10}$'),
    bio             TEXT,
    experience_yrs  SMALLINT DEFAULT 0 CHECK (experience_yrs >= 0),
    avg_rating      NUMERIC(3,2) DEFAULT 0.00 CHECK (avg_rating >= 0 AND avg_rating <= 5),
    total_reviews   INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
    is_active       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW()
);


-- ACCOUNT

CREATE TABLE Account (
    account_id    SERIAL PRIMARY KEY,
    email         VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20) NOT NULL CHECK (role IN ('customer', 'provider', 'admin')),
    customer_id   INTEGER REFERENCES Customer(customer_id) ON DELETE CASCADE,
    provider_id   INTEGER REFERENCES Provider(provider_id) ON DELETE CASCADE,
    created_at    TIMESTAMP DEFAULT NOW(),
    CONSTRAINT chk_profile CHECK (
        (role = 'customer' AND customer_id IS NOT NULL AND provider_id IS NULL) OR
        (role = 'provider' AND provider_id IS NOT NULL AND customer_id IS NULL) OR
        (role = 'admin' AND customer_id IS NULL AND provider_id IS NULL)
    )
);


-- ADDRESS

CREATE TABLE Address (
    address_id   SERIAL PRIMARY KEY,
    customer_id  INTEGER NOT NULL REFERENCES Customer(customer_id) ON DELETE CASCADE,
    line1        VARCHAR(200) NOT NULL,
    line2        VARCHAR(200),
    city         VARCHAR(100) NOT NULL,
    state        VARCHAR(100) NOT NULL,
    pincode      CHAR(6) NOT NULL CHECK (pincode ~ '^\d{6}$'),
    is_default   BOOLEAN DEFAULT FALSE,
    address_type VARCHAR(50) DEFAULT 'Home'
);

-- CATEGORY

CREATE TABLE Category (
    category_id   SERIAL PRIMARY KEY,
    name          VARCHAR(100) UNIQUE NOT NULL,
    icon_name     VARCHAR(50),
    description   TEXT
);

-- SERVICE

CREATE TABLE Service (
    service_id    SERIAL PRIMARY KEY,
    category_id   INTEGER NOT NULL REFERENCES Category(category_id),
    name          VARCHAR(150) NOT NULL,
    description   TEXT,
    base_price    NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    duration_min  SMALLINT NOT NULL CHECK (duration_min > 0),
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT NOW()
);

-- SERVICE VARIANT

CREATE TABLE ServiceVariant (
    variant_id    SERIAL PRIMARY KEY,
    service_id    INTEGER NOT NULL REFERENCES Service(service_id) ON DELETE CASCADE,
    variant_name  VARCHAR(100) NOT NULL,
    price         NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    description   TEXT
);

-- PROVIDER SERVICE (many-to-many)

CREATE TABLE ProviderService (
    ps_id        SERIAL PRIMARY KEY,
    provider_id  INTEGER NOT NULL REFERENCES Provider(provider_id) ON DELETE CASCADE,
    service_id   INTEGER NOT NULL REFERENCES Service(service_id) ON DELETE CASCADE,
    UNIQUE (provider_id, service_id)
);

-- PROVIDER AVAILABILITY

CREATE TABLE ProviderAvailability (
    avail_id    SERIAL PRIMARY KEY,
    provider_id INTEGER NOT NULL REFERENCES Provider(provider_id) ON DELETE CASCADE,
    day_of_week day_of_week_enum NOT NULL,
    start_time  TIME NOT NULL,
    end_time    TIME NOT NULL,
    CHECK (end_time > start_time),
    UNIQUE (provider_id, day_of_week, start_time)
);

-- COUPON

CREATE TABLE Coupon (
    coupon_id     SERIAL PRIMARY KEY,
    code          VARCHAR(30) UNIQUE NOT NULL,
    discount_pct  NUMERIC(5,2) NOT NULL CHECK (discount_pct > 0 AND discount_pct <= 100),
    min_order     NUMERIC(10,2) DEFAULT 0 CHECK (min_order >= 0),
    usage_limit   INTEGER DEFAULT 1 CHECK (usage_limit > 0),
    times_used    INTEGER DEFAULT 0 CHECK (times_used >= 0),
    valid_from    DATE NOT NULL,
    valid_to      DATE NOT NULL,
    is_active     BOOLEAN DEFAULT TRUE,
    CHECK (valid_to >= valid_from)
);

-- BOOKING

CREATE TABLE Booking (
    booking_id    SERIAL PRIMARY KEY,
    customer_id   INTEGER NOT NULL REFERENCES Customer(customer_id),
    provider_id   INTEGER NOT NULL REFERENCES Provider(provider_id),
    address_id    INTEGER NOT NULL REFERENCES Address(address_id),
    coupon_id     INTEGER REFERENCES Coupon(coupon_id),
    booking_date  DATE NOT NULL,
    booking_time  TIME NOT NULL,
    status        booking_status_enum DEFAULT 'Pending',
    notes         TEXT,
    total_amount  NUMERIC(10,2) NOT NULL CHECK (total_amount >= 0),
    created_at    TIMESTAMP DEFAULT NOW()
);

-- BOOKING ITEM

CREATE TABLE BookingItem (
    item_id     SERIAL PRIMARY KEY,
    booking_id  INTEGER NOT NULL REFERENCES Booking(booking_id) ON DELETE CASCADE,
    service_id  INTEGER NOT NULL REFERENCES Service(service_id),
    variant_id  INTEGER REFERENCES ServiceVariant(variant_id),
    quantity    SMALLINT DEFAULT 1 CHECK (quantity > 0),
    unit_price  NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0)
);

-- BOOKING STATUS LOG

CREATE TABLE BookingStatusLog (
    log_id      SERIAL PRIMARY KEY,
    booking_id  INTEGER NOT NULL REFERENCES Booking(booking_id) ON DELETE CASCADE,
    old_status  booking_status_enum,
    new_status  booking_status_enum NOT NULL,
    changed_at  TIMESTAMP DEFAULT NOW(),
    notes       TEXT
);

-- PAYMENT

CREATE TABLE Payment (
    payment_id    SERIAL PRIMARY KEY,
    booking_id    INTEGER UNIQUE NOT NULL REFERENCES Booking(booking_id) ON DELETE CASCADE,
    amount        NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    method        payment_method_enum DEFAULT 'Cash',
    status        payment_status_enum DEFAULT 'Pending',
    paid_at       TIMESTAMP,
    transaction_ref VARCHAR(100)
);

-- PROVIDER REVIEW

CREATE TABLE ProviderReview (
    review_id    SERIAL PRIMARY KEY,
    booking_id   INTEGER UNIQUE NOT NULL REFERENCES Booking(booking_id) ON DELETE CASCADE,
    provider_id  INTEGER NOT NULL REFERENCES Provider(provider_id),
    customer_id  INTEGER NOT NULL REFERENCES Customer(customer_id),
    rating       SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment      TEXT,
    created_at   TIMESTAMP DEFAULT NOW()
);

-- SESSION STORAGE (for connect-pg-simple)

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
