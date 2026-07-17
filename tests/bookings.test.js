// Mock database query pool
jest.mock('../config/db', () => ({
    query: jest.fn(),
    on: jest.fn()
}));

// Mock authentication middleware
jest.mock('../middleware/auth', () => ({
    ensureAuthenticated: (req, res, next) => {
        req.user = { customer_id: 1, role: 'customer', name: 'Raj Patel', email: 'raj@demo.com' };
        res.locals.user = req.user;
        req.isAuthenticated = () => true;
        next();
    },
    ensureRole: (...roles) => (req, res, next) => {
        req.user = { customer_id: 1, role: 'customer', name: 'Raj Patel', email: 'raj@demo.com' };
        res.locals.user = req.user;
        req.isAuthenticated = () => true;
        next();
    },
    forwardAuthenticated: (req, res, next) => next()
}));

const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('Booking API & Action Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/calculate-amount', () => {
        it('should return 400 if service_id is missing', async () => {
            const response = await request(app)
                .get('/api/calculate-amount')
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Invalid service ID.');
        });

        it('should calculate amount correctly on success', async () => {
            db.query.mockResolvedValue({
                rows: [{ amount: '350.00' }]
            });

            const response = await request(app)
                .get('/api/calculate-amount')
                .query({ service_id: 1 })
                .expect(200);

            expect(response.body).toHaveProperty('amount', '350.00');
        });
    });

    describe('POST /book - Create Booking', () => {
        it('should fail validation with invalid inputs', async () => {
            // Mock getServiceById and getAllCustomers for the error render fallback
            db.query.mockImplementation((sql, params) => {
                if (sql.includes('vw_service_details')) {
                    return Promise.resolve({
                        rows: [{ service_id: 1, service_name: 'Pipe Leak Repair' }]
                    });
                }
                if (sql.includes('FROM Customer')) {
                    return Promise.resolve({
                        rows: [{ customer_id: 1, name: 'Raj Patel' }]
                    });
                }
                if (sql.includes('FROM Address')) {
                    return Promise.resolve({
                        rows: [{ address_id: 5, customer_id: 1, line1: '12 Andheri West', is_default: true, address_type: 'Home' }]
                    });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .post('/book')
                .send({
                    provider_id: -1, // invalid
                    service_id: 1,
                    booking_date: '2020-01-01', // past date
                    booking_time: '12:00',
                    address_id: -1 // invalid
                })
                .expect(400);

            expect(response.text).toContain('Invalid provider');
            expect(response.text).toContain('Booking date cannot be in the past');
        });

        it('should fail if customer has no address registered', async () => {
            db.query.mockImplementation((sql, params) => {
                if (sql.includes('vw_service_details')) {
                    return Promise.resolve({
                        rows: [{ service_id: 1, service_name: 'Pipe Leak Repair' }]
                    });
                }
                if (sql.includes('FROM Customer')) {
                    return Promise.resolve({
                        rows: [{ customer_id: 1, name: 'Raj Patel' }]
                    });
                }
                if (sql.includes('FROM Address')) {
                    return Promise.resolve({ rows: [] }); // No addresses
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .post('/book')
                .send({
                    provider_id: 1,
                    service_id: 1,
                    booking_date: '2029-12-31', // far future
                    booking_time: '12:00',
                    payment_method: 'Card',
                    address_id: 5
                })
                .expect(400);

            expect(response.text).toContain('No address found for your account');
        });

        it('should successfully create booking and redirect to history page', async () => {
            db.query.mockImplementation((sql, params) => {
                if (sql.includes('FROM Address')) {
                    return Promise.resolve({
                        rows: [{ address_id: 5, customer_id: 1, line1: '12 Andheri West', is_default: true, address_type: 'Home' }]
                    });
                }
                if (sql.includes('fn_create_booking')) {
                    return Promise.resolve({
                        rows: [{ booking_id: 42 }]
                    });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .post('/book')
                .send({
                    provider_id: 2,
                    service_id: 1,
                    booking_date: '2029-12-31',
                    booking_time: '12:00',
                    payment_method: 'Card',
                    address_id: 5
                })
                .expect(302);

            expect(response.header.location).toContain('/bookings?success=true&id=42');
        });
    });
});
