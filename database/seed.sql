-- ============================================================
-- HOME SERVICE BOOKING PLATFORM — SEED DATA
-- Rich demo data: 5 customers, 6 providers, 20 services
-- ============================================================

-- -------------------------------------------------------
-- CATEGORIES
-- -------------------------------------------------------
INSERT INTO Category (name, icon_name, description) VALUES
('Plumbing',        'wrench',       'Pipe repairs, leaks, installations'),
('Electrical',      'zap',          'Wiring, switches, appliance repair'),
('Cleaning',        'sparkles',     'Home and office deep cleaning'),
('Carpentry',       'hammer',       'Furniture repair and assembly'),
('Painting',        'paintbrush',   'Interior and exterior painting'),
('AC & Appliances', 'thermometer',  'AC service, refrigerator, washing machine'),
('Pest Control',    'shield',       'Termite, cockroach, rodent control'),
('Gardening',       'leaf',         'Lawn care, plant care, trimming');


-- CUSTOMERS (5 demo customers)

INSERT INTO Customer (name, email, phone) VALUES
('Raj Patel',       'raj.patel@demo.com',     '9876543210'),
('Priya Sharma',    'priya.sharma@demo.com',  '9876543211'),
('Arjun Mehta',     'arjun.mehta@demo.com',   '9876543212'),
('Sneha Gupta',     'sneha.gupta@demo.com',   '9876543213'),
('Vikram Singh',    'vikram.singh@demo.com',  '9876543214');

-- -------------------------------------------------------
-- ADDRESSES
-- -------------------------------------------------------
INSERT INTO Address (customer_id, line1, line2, city, state, pincode, is_default) VALUES
(1, '12 Andheri West', 'Near Station', 'Mumbai',    'Maharashtra', '400053', TRUE),
(1, '5 Bandra Road',   NULL,           'Mumbai',    'Maharashtra', '400050', FALSE),
(2, '34 Koregaon Park',NULL,           'Pune',      'Maharashtra', '411001', TRUE),
(3, '78 Indiranagar',  'Block 2',      'Bangalore', 'Karnataka',   '560008', TRUE),
(4, '22 Connaught Place', NULL,        'Delhi',     'Delhi',       '110001', TRUE),
(5, '9 Anna Nagar',    NULL,           'Chennai',   'Tamil Nadu',  '600040', TRUE);

-- -------------------------------------------------------
-- PROVIDERS (6 demo providers)
-- -------------------------------------------------------
INSERT INTO Provider (name, email, phone, bio, experience_yrs, avg_rating, total_reviews) VALUES
('Suresh Kumar',    'suresh@demo.com',    '9811112222', 'Expert plumber with 8 years experience in residential plumbing.', 8,  4.80, 0),
('Ravi Electricals','ravi@demo.com',      '9822223333', 'Certified electrician handling all household wiring needs.', 6,  4.60, 0),
('CleanPro Team',   'clean@demo.com',     '9833334444', 'Professional home cleaning with eco-friendly products.', 4,  4.70, 0),
('Amit Carpenter',  'amit@demo.com',      '9844445555', 'Skilled carpenter for furniture repair and custom woodwork.', 10, 4.90, 0),
('CoolAir Services','coolair@demo.com',   '9855556666', 'AC repair, servicing, and installation specialists.', 5,  4.50, 0),
('GreenThumb',      'green@demo.com',     '9866667777', 'Garden maintenance, lawn care, and plant consultancy.', 3,  4.40, 0);

-- -------------------------------------------------------
-- SERVICES (20 services across categories)
-- -------------------------------------------------------
INSERT INTO Service (category_id, name, description, base_price, duration_min) VALUES
-- Plumbing (1)
(1, 'Pipe Leak Repair',       'Fix any pipe leaks in kitchen, bathroom or outdoor.',     350, 60),
(1, 'Tap / Faucet Installation', 'Install or replace taps, faucets, and mixers.',        250, 45),
(1, 'Drain Cleaning',         'Unblock and clean clogged drains.',                       300, 60),
-- Electrical (2)
(2, 'Switchboard Repair',     'Fix faulty switches, sockets, and MCBs.',                 200, 45),
(2, 'Fan Installation',       'Install ceiling fans with proper wiring.',                 350, 60),
(2, 'Inverter / UPS Setup',   'Install and configure home inverters.',                   500, 90),
-- Cleaning (3)
(3, 'Home Deep Cleaning',     'Full home deep clean including kitchen and bathrooms.',   1200, 240),
(3, 'Sofa / Carpet Cleaning', 'Professional upholstery and carpet cleaning.',             600, 120),
(3, 'Kitchen Cleaning',       'Deep clean for kitchen top, chimney, and appliances.',    800, 180),
-- Carpentry (4)
(4, 'Furniture Assembly',     'Assemble flat-pack or modular furniture.',                 400, 90),
(4, 'Door Repair / Fitting',  'Fix squeaky doors, broken hinges, or door locks.',        300, 60),
-- Painting (5)
(5, 'Wall Painting',          'Interior wall painting with premium paints.',             3500, 480),
(5, 'Touch-Up Painting',      'Quick wall touch-ups and small area painting.',            800, 120),
-- AC & Appliances (6)
(6, 'AC Service & Cleaning',  'Filter clean, gas check, and performance tuning.',        600, 90),
(6, 'Refrigerator Repair',    'Diagnose and fix cooling problems.',                       400, 60),
(6, 'Washing Machine Repair', 'Fix drum, motor, and electrical faults.',                 450, 75),
-- Pest Control (7)
(7, 'Cockroach Treatment',    'Gel-based treatment for complete cockroach control.',      799, 60),
(7, 'Termite Treatment',      'Drill and fill method for termite elimination.',          1499, 120),
-- Gardening (8)
(8, 'Lawn Mowing & Trimming', 'Mow, edge, and clean up your lawn.',                      350, 60),
(8, 'Plant Care Package',     'Repotting, fertilizing, and health check for plants.',    500, 90);

-- -------------------------------------------------------
-- SERVICE VARIANTS
-- -------------------------------------------------------
INSERT INTO ServiceVariant (service_id, variant_name, price, description) VALUES
-- Home Deep Cleaning (7) variants
(7, 'Standard (1BHK)',  800,  '1BHK apartment deep clean'),
(7, 'Standard (2BHK)', 1200, '2BHK apartment deep clean'),
(7, 'Premium (3BHK)',  1800, '3BHK full deep clean with sanitization'),
-- AC Service (14) variants
(14, 'AC Service Only',         600,  'Filter clean + check'),
(14, 'Service + Gas Refill',   1200,  'Full service with refrigerant top-up'),
-- Wall Painting (12) variants
(12, 'Per Room (Small)',  2500, 'Room up to 120 sq ft'),
(12, 'Per Room (Large)',  3500, 'Room 120–200 sq ft'),
(12, '2BHK Full',        12000, 'Complete 2BHK interior painting'),
-- Pest Control - Cockroach (17) variants
(17, '1BHK',  799,  'Cockroach control for 1BHK'),
(17, '2BHK', 1099,  'Cockroach control for 2BHK'),
(17, '3BHK', 1399,  'Cockroach control for 3BHK');

-- -------------------------------------------------------
-- PROVIDER-SERVICE MAPPING
-- -------------------------------------------------------
INSERT INTO ProviderService (provider_id, service_id) VALUES
-- Suresh (Plumbing)
(1, 1), (1, 2), (1, 3),
-- Ravi (Electrical)
(2, 4), (2, 5), (2, 6),
-- CleanPro (Cleaning)
(3, 7), (3, 8), (3, 9),
-- Amit (Carpentry + Painting)
(4, 10), (4, 11), (4, 12), (4, 13),
-- CoolAir (AC & Appliances)
(5, 14), (5, 15), (5, 16),
-- GreenThumb (Gardening + Pest Control)
(6, 17), (6, 18), (6, 19), (6, 20);

-- -------------------------------------------------------
-- PROVIDER AVAILABILITY
-- -------------------------------------------------------
INSERT INTO ProviderAvailability (provider_id, day_of_week, start_time, end_time) VALUES
(1, 'Monday',    '08:00', '18:00'),
(1, 'Tuesday',   '08:00', '18:00'),
(1, 'Wednesday', '08:00', '18:00'),
(1, 'Thursday',  '08:00', '18:00'),
(1, 'Friday',    '08:00', '18:00'),
(1, 'Saturday',  '09:00', '15:00'),
(2, 'Monday',    '09:00', '19:00'),
(2, 'Tuesday',   '09:00', '19:00'),
(2, 'Wednesday', '09:00', '19:00'),
(2, 'Thursday',  '09:00', '19:00'),
(2, 'Friday',    '09:00', '19:00'),
(3, 'Monday',    '07:00', '17:00'),
(3, 'Tuesday',   '07:00', '17:00'),
(3, 'Wednesday', '07:00', '17:00'),
(3, 'Thursday',  '07:00', '17:00'),
(3, 'Friday',    '07:00', '17:00'),
(3, 'Saturday',  '08:00', '14:00'),
(3, 'Sunday',    '08:00', '14:00'),
(4, 'Monday',    '09:00', '18:00'),
(4, 'Wednesday', '09:00', '18:00'),
(4, 'Friday',    '09:00', '18:00'),
(4, 'Saturday',  '09:00', '16:00'),
(5, 'Monday',    '08:00', '20:00'),
(5, 'Tuesday',   '08:00', '20:00'),
(5, 'Wednesday', '08:00', '20:00'),
(5, 'Thursday',  '08:00', '20:00'),
(5, 'Friday',    '08:00', '20:00'),
(5, 'Saturday',  '09:00', '17:00'),
(6, 'Tuesday',   '06:00', '14:00'),
(6, 'Thursday',  '06:00', '14:00'),
(6, 'Saturday',  '06:00', '16:00'),
(6, 'Sunday',    '06:00', '16:00');

-- -------------------------------------------------------
-- COUPONS
-- -------------------------------------------------------
INSERT INTO Coupon (code, discount_pct, min_order, usage_limit, valid_from, valid_to) VALUES
('WELCOME10', 10, 200,  100, '2025-01-01', '2026-12-31'),
('CLEAN20',   20, 500,   50, '2025-01-01', '2026-12-31'),
('SAVE15',    15, 300,   75, '2025-06-01', '2026-12-31'),
('MEGA25',    25, 800,   20, '2025-01-01', '2026-06-30'),
('FIRST50',   50, 100,    5, '2025-01-01', '2026-12-31');

-- -------------------------------------------------------
-- DEMO BOOKINGS (rich historical data)
-- -------------------------------------------------------
INSERT INTO Booking (customer_id, provider_id, address_id, booking_date, booking_time, status, total_amount, created_at) VALUES
(1, 1, 1, '2025-11-10', '10:00', 'Completed', 350.00, '2025-11-09 10:00:00'),
(2, 2, 3, '2025-11-12', '11:00', 'Completed', 200.00, '2025-11-11 09:00:00'),
(3, 3, 4, '2025-11-15', '09:00', 'Completed', 1200.00,'2025-11-14 08:00:00'),
(4, 4, 5, '2025-11-18', '14:00', 'Completed', 400.00, '2025-11-17 14:00:00'),
(5, 5, 6, '2025-11-20', '10:00', 'Completed', 600.00, '2025-11-19 10:00:00'),
(1, 3, 1, '2025-12-01', '08:00', 'Completed', 800.00, '2025-11-30 08:00:00'),
(2, 1, 3, '2025-12-05', '10:00', 'Completed', 300.00, '2025-12-04 10:00:00'),
(3, 5, 4, '2025-12-10', '11:00', 'Completed', 1200.00,'2025-12-09 11:00:00'),
(4, 6, 5, '2025-12-15', '09:00', 'Completed', 350.00, '2025-12-14 09:00:00'),
(5, 2, 6, '2025-12-20', '13:00', 'Completed', 500.00, '2025-12-19 13:00:00'),
(1, 4, 1, '2026-01-05', '10:00', 'Completed', 3500.00,'2026-01-04 10:00:00'),
(2, 3, 3, '2026-01-10', '08:00', 'Completed', 600.00, '2026-01-09 08:00:00'),
(3, 1, 4, '2026-01-15', '11:00', 'Completed', 350.00, '2026-01-14 11:00:00'),
(4, 2, 5, '2026-01-20', '14:00', 'Completed', 350.00, '2026-01-19 14:00:00'),
(5, 4, 6, '2026-01-25', '10:00', 'Completed', 300.00, '2026-01-24 10:00:00'),
(1, 5, 1, '2026-02-03', '09:00', 'Completed', 450.00, '2026-02-02 09:00:00'),
(2, 6, 3, '2026-02-08', '07:00', 'Completed', 799.00, '2026-02-07 07:00:00'),
(3, 3, 4, '2026-02-14', '08:00', 'Completed', 1200.00,'2026-02-13 08:00:00'),
(4, 1, 5, '2026-02-20', '10:00', 'Completed', 250.00, '2026-02-19 10:00:00'),
(5, 5, 6, '2026-02-25', '10:00', 'Completed', 600.00, '2026-02-24 10:00:00'),
(1, 2, 1, '2026-03-02', '11:00', 'Completed', 200.00, '2026-03-01 11:00:00'),
(2, 4, 3, '2026-03-08', '09:00', 'Completed', 400.00, '2026-03-07 09:00:00'),
(3, 6, 4, '2026-03-12', '06:00', 'Completed', 500.00, '2026-03-11 06:00:00'),
(4, 3, 5, '2026-03-18', '08:00', 'Completed', 1200.00,'2026-03-17 08:00:00'),
(5, 1, 6, '2026-03-22', '10:00', 'Completed', 300.00, '2026-03-21 10:00:00'),
(1, 6, 1, '2026-04-01', '06:00', 'Completed', 350.00, '2026-03-31 06:00:00'),
(2, 5, 3, '2026-04-05', '09:00', 'Completed', 600.00, '2026-04-04 09:00:00'),
(3, 2, 4, '2026-04-10', '10:00', 'Completed', 500.00, '2026-04-09 10:00:00'),
(4, 4, 5, '2026-04-15', '14:00', 'Completed', 3500.00,'2026-04-14 14:00:00'),
(5, 3, 6, '2026-04-20', '08:00', 'Completed', 800.00, '2026-04-19 08:00:00'),
(1, 1, 1, '2026-05-02', '10:00', 'Completed', 350.00, '2026-05-01 10:00:00'),
(2, 2, 3, '2026-05-08', '11:00', 'Completed', 200.00, '2026-05-07 11:00:00'),
(3, 3, 4, '2026-05-12', '09:00', 'Completed', 600.00, '2026-05-11 09:00:00'),
(4, 5, 5, '2026-05-18', '10:00', 'Completed', 1200.00,'2026-05-17 10:00:00'),
(5, 4, 6, '2026-05-22', '14:00', 'Completed', 400.00, '2026-05-21 14:00:00'),
(1, 3, 1, '2026-06-01', '08:00', 'Confirmed', 1200.00,'2026-05-31 08:00:00'),
(2, 1, 3, '2026-06-03', '10:00', 'Confirmed', 300.00, '2026-06-02 10:00:00'),
(3, 5, 4, '2026-06-05', '11:00', 'Pending',   600.00, '2026-06-04 11:00:00'),
(4, 6, 5, '2026-06-08', '07:00', 'Pending',   350.00, '2026-06-07 07:00:00'),
(5, 2, 6, '2026-06-10', '13:00', 'Cancelled', 500.00, '2026-06-09 13:00:00');

-- -------------------------------------------------------
-- BOOKING ITEMS for seeded bookings
-- -------------------------------------------------------
INSERT INTO BookingItem (booking_id, service_id, variant_id, quantity, unit_price) VALUES
(1, 1, NULL, 1, 350.00),
(2, 4, NULL, 1, 200.00),
(3, 7, 2,    1, 1200.00),
(4, 10,NULL, 1, 400.00),
(5, 14,4,    1, 600.00),
(6, 9, NULL, 1, 800.00),
(7, 3, NULL, 1, 300.00),
(8, 14,5,    1, 1200.00),
(9, 19,NULL, 1, 350.00),
(10,6, NULL, 1, 500.00),
(11,12,7,    1, 3500.00),
(12,8, NULL, 1, 600.00),
(13,1, NULL, 1, 350.00),
(14,5, NULL, 1, 350.00),
(15,11,NULL, 1, 300.00),
(16,16,NULL, 1, 450.00),
(17,17,9,    1, 799.00),
(18,7, 2,    1, 1200.00),
(19,2, NULL, 1, 250.00),
(20,14,4,    1, 600.00),
(21,4, NULL, 1, 200.00),
(22,10,NULL, 1, 400.00),
(23,20,NULL, 1, 500.00),
(24,7, 2,    1, 1200.00),
(25,3, NULL, 1, 300.00),
(26,19,NULL, 1, 350.00),
(27,14,4,    1, 600.00),
(28,6, NULL, 1, 500.00),
(29,12,7,    1, 3500.00),
(30,8, NULL, 1, 800.00),
(31,1, NULL, 1, 350.00),
(32,4, NULL, 1, 200.00),
(33,8, NULL, 1, 600.00),
(34,14,5,    1, 1200.00),
(35,10,NULL, 1, 400.00),
(36,7, 2,    1, 1200.00),
(37,3, NULL, 1, 300.00),
(38,14,4,    1, 600.00),
(39,19,NULL, 1, 350.00),
(40,6, NULL, 1, 500.00);

-- -------------------------------------------------------
-- BOOKING STATUS LOGS (for all completed bookings)
-- -------------------------------------------------------
INSERT INTO BookingStatusLog (booking_id, old_status, new_status, notes, changed_at) VALUES
(1, NULL,        'Pending',    'Booking created',    '2025-11-09 10:01:00'),
(1, 'Pending',   'Confirmed',  'Provider confirmed', '2025-11-09 12:00:00'),
(1, 'Confirmed', 'Completed',  'Job done',           '2025-11-10 11:30:00'),
(2, NULL,        'Pending',    'Booking created',    '2025-11-11 09:01:00'),
(2, 'Pending',   'Confirmed',  'Provider confirmed', '2025-11-11 10:00:00'),
(2, 'Confirmed', 'Completed',  'Job done',           '2025-11-12 12:00:00'),
(3, NULL,        'Pending',    'Booking created',    '2025-11-14 08:01:00'),
(3, 'Pending',   'Confirmed',  'Provider confirmed', '2025-11-14 09:00:00'),
(3, 'Confirmed', 'Completed',  'Job done',           '2025-11-15 13:00:00');

-- -------------------------------------------------------
-- PAYMENTS (for all bookings)
-- -------------------------------------------------------
INSERT INTO Payment (booking_id, amount, method, status, paid_at) VALUES
(1,  350.00,  'UPI',    'Paid',    '2025-11-10 11:30:00'),
(2,  200.00,  'Cash',   'Paid',    '2025-11-12 12:00:00'),
(3,  1200.00, 'Card',   'Paid',    '2025-11-15 13:00:00'),
(4,  400.00,  'UPI',    'Paid',    '2025-11-18 15:30:00'),
(5,  600.00,  'Cash',   'Paid',    '2025-11-20 11:00:00'),
(6,  800.00,  'Card',   'Paid',    '2025-12-01 12:00:00'),
(7,  300.00,  'UPI',    'Paid',    '2025-12-05 11:30:00'),
(8,  1200.00, 'Cash',   'Paid',    '2025-12-10 13:00:00'),
(9,  350.00,  'Card',   'Paid',    '2025-12-15 11:00:00'),
(10, 500.00,  'UPI',    'Paid',    '2025-12-20 14:30:00'),
(11, 3500.00, 'Card',   'Paid',    '2026-01-05 18:00:00'),
(12, 600.00,  'Cash',   'Paid',    '2026-01-10 12:00:00'),
(13, 350.00,  'UPI',    'Paid',    '2026-01-15 12:30:00'),
(14, 350.00,  'Cash',   'Paid',    '2026-01-20 15:30:00'),
(15, 300.00,  'UPI',    'Paid',    '2026-01-25 11:30:00'),
(16, 450.00,  'Card',   'Paid',    '2026-02-03 10:30:00'),
(17, 799.00,  'UPI',    'Paid',    '2026-02-08 08:30:00'),
(18, 1200.00, 'Cash',   'Paid',    '2026-02-14 12:00:00'),
(19, 250.00,  'UPI',    'Paid',    '2026-02-20 11:00:00'),
(20, 600.00,  'Card',   'Paid',    '2026-02-25 11:30:00'),
(21, 200.00,  'Cash',   'Paid',    '2026-03-02 12:00:00'),
(22, 400.00,  'UPI',    'Paid',    '2026-03-08 10:30:00'),
(23, 500.00,  'Card',   'Paid',    '2026-03-12 08:00:00'),
(24, 1200.00, 'Cash',   'Paid',    '2026-03-18 12:00:00'),
(25, 300.00,  'UPI',    'Paid',    '2026-03-22 11:30:00'),
(26, 350.00,  'Card',   'Paid',    '2026-04-01 08:30:00'),
(27, 600.00,  'Cash',   'Paid',    '2026-04-05 11:00:00'),
(28, 500.00,  'UPI',    'Paid',    '2026-04-10 12:00:00'),
(29, 3500.00, 'Card',   'Paid',    '2026-04-15 18:00:00'),
(30, 800.00,  'UPI',    'Paid',    '2026-04-20 12:00:00'),
(31, 350.00,  'Cash',   'Paid',    '2026-05-02 11:30:00'),
(32, 200.00,  'UPI',    'Paid',    '2026-05-08 12:00:00'),
(33, 600.00,  'Card',   'Paid',    '2026-05-12 11:00:00'),
(34, 1200.00, 'Cash',   'Paid',    '2026-05-18 13:00:00'),
(35, 400.00,  'UPI',    'Paid',    '2026-05-22 15:30:00'),
(36, 1200.00, 'Card',   'Pending', NULL),
(37, 300.00,  'Cash',   'Pending', NULL),
(38, 600.00,  'UPI',    'Pending', NULL),
(39, 350.00,  'Card',   'Pending', NULL),
(40, 500.00,  'Cash',   'Refunded','2026-06-10 14:00:00');

-- -------------------------------------------------------
-- REVIEWS (for completed bookings)
-- -------------------------------------------------------
INSERT INTO ProviderReview (booking_id, provider_id, customer_id, rating, comment, created_at) VALUES
(1,  1, 1, 5, 'Suresh fixed the leak perfectly. Very professional!',       '2025-11-10 14:00:00'),
(2,  2, 2, 4, 'Good work on the switchboard. Quick and clean.',            '2025-11-12 15:00:00'),
(3,  3, 3, 5, 'Amazing deep clean! House looks brand new.',                '2025-11-15 17:00:00'),
(4,  4, 4, 5, 'Excellent carpentry work. Very satisfied.',                 '2025-11-18 18:00:00'),
(5,  5, 5, 4, 'AC works great after service. On time arrival.',            '2025-11-20 13:00:00'),
(6,  3, 1, 5, 'Kitchen sparkles! Highly recommend CleanPro.',              '2025-12-01 16:00:00'),
(7,  1, 2, 4, 'Drain unclogged quickly. Professional service.',            '2025-12-05 14:00:00'),
(8,  5, 3, 5, 'Gas refill done perfectly. Very knowledgeable team.',       '2025-12-10 15:00:00'),
(9,  6, 4, 4, 'Lawn looks great! Will book again.',                        '2025-12-15 12:00:00'),
(10, 2, 5, 4, 'Inverter works perfectly. Very helpful.',                   '2025-12-20 16:00:00'),
(11, 4, 1, 5, 'Painting is flawless! Exceeded expectations.',              '2026-01-05 20:00:00'),
(12, 3, 2, 5, 'Sofa looks brand new. Great service!',                      '2026-01-10 15:00:00'),
(13, 1, 3, 5, 'Pipe fixed in no time. Very skilled plumber.',              '2026-01-15 15:00:00'),
(14, 2, 4, 4, 'Fan installed correctly. Good service.',                    '2026-01-20 17:00:00'),
(15, 4, 5, 5, 'Door fixed perfectly. No more squeaking!',                  '2026-01-25 14:00:00'),
(16, 5, 1, 4, 'Washing machine working fine now.',                         '2026-02-03 13:00:00'),
(17, 6, 2, 5, 'Completely cockroach-free now. Excellent!',                 '2026-02-08 11:00:00'),
(18, 3, 3, 5, 'Deep clean was thorough. Great team!',                      '2026-02-14 16:00:00'),
(19, 1, 4, 4, 'Tap installed neatly. Good work.',                          '2026-02-20 14:00:00'),
(20, 5, 5, 5, 'AC runs like new. Very satisfied with service.',            '2026-02-25 14:00:00'),
(21, 2, 1, 4, 'Switchboard repaired quickly. Reasonable pricing.',        '2026-03-02 15:00:00'),
(22, 4, 2, 5, 'Furniture assembled perfectly in record time.',             '2026-03-08 13:00:00'),
(23, 6, 3, 4, 'Plants are thriving! Great plant care advice.',             '2026-03-12 11:00:00'),
(24, 3, 4, 5, 'Spotless clean. Best cleaning service in town.',            '2026-03-18 16:00:00'),
(25, 1, 5, 5, 'Drain flowing perfectly. Expert work!',                     '2026-03-22 14:00:00'),
(26, 6, 1, 4, 'Lawn trimmed beautifully. Will book monthly.',              '2026-04-01 11:00:00'),
(27, 5, 2, 5, 'AC service done perfectly. Very thorough.',                 '2026-04-05 14:00:00'),
(28, 2, 3, 4, 'Inverter works great. Professional installation.',          '2026-04-10 15:00:00'),
(29, 4, 4, 5, 'Painting looks stunning. Best decision ever!',              '2026-04-15 21:00:00'),
(30, 3, 5, 5, 'Sofa restored to original glory. Amazing!',                '2026-04-20 16:00:00'),
(31, 1, 1, 5, 'Quick repair. Suresh is always reliable!',                  '2026-05-02 14:00:00'),
(32, 2, 2, 4, 'Switchboard working perfectly now.',                        '2026-05-08 15:00:00'),
(33, 3, 3, 5, 'Sofa looks brand new after cleaning!',                      '2026-05-12 14:00:00'),
(34, 5, 4, 5, 'AC Service + Gas refill done to perfection.',               '2026-05-18 16:00:00'),
(35, 4, 5, 4, 'Furniture assembled on time. Good job.',                    '2026-05-22 17:00:00');
