const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

// Mock database query pool
jest.mock('../config/db', () => ({
    query: jest.fn(),
    on: jest.fn(),
    connect: jest.fn()
}));

describe('Authentication Routes', () => {
    let clientMock;

    beforeEach(() => {
        jest.clearAllMocks();
        
        clientMock = {
            query: jest.fn().mockResolvedValue({ rows: [] }),
            release: jest.fn()
        };
        
        db.connect.mockResolvedValue(clientMock);
    });

    describe('GET /login', () => {
        it('should render login page', async () => {
            const response = await request(app)
                .get('/login')
                .expect(200);
            expect(response.text).toContain('Welcome back! Enter your details to continue.');
        });
    });

    describe('GET /register', () => {
        it('should render registration page', async () => {
            const response = await request(app)
                .get('/register')
                .expect(200);
            expect(response.text).toContain('Create Account');
        });
    });

    describe('POST /register', () => {
        it('should fail registration if email already exists', async () => {
            // Mock SELECT * FROM Account to return an existing user row
            clientMock.query.mockImplementation((sql, params) => {
                if (sql.includes('SELECT * FROM Account')) {
                    return Promise.resolve({
                        rows: [{ account_id: 1, email: 'test@demo.com' }]
                    });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .post('/register')
                .send({
                    email: 'test@demo.com',
                    password: 'password123',
                    name: 'Test User',
                    phone: '9876543210',
                    role: 'customer'
                })
                .expect(200);

            expect(response.text).toContain('Email already registered');
        });

        it('should succeed with valid inputs and insert into DB', async () => {
            clientMock.query.mockImplementation((sql, params) => {
                if (sql.includes('SELECT * FROM Account')) {
                    return Promise.resolve({ rows: [] }); // Email free
                }
                if (sql.includes('INSERT INTO Customer')) {
                    return Promise.resolve({ rows: [{ customer_id: 42 }] });
                }
                if (sql.includes('INSERT INTO Account')) {
                    return Promise.resolve({ rows: [{ account_id: 100 }] });
                }
                return Promise.resolve({ rows: [] });
            });

            const response = await request(app)
                .post('/register')
                .send({
                    email: 'newuser@demo.com',
                    password: 'password123',
                    name: 'New User',
                    phone: '9876543210',
                    role: 'customer'
                })
                .expect(302);

            expect(response.header.location).toBe('/login');
        });
    });
});
