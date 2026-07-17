const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

// Mock database query pool
jest.mock('../config/db', () => ({
    query: jest.fn(),
    on: jest.fn()
}));

describe('GET / - Home Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should load home page with services, categories, and featured provider', async () => {
        // Setup database mock returns
        db.query.mockImplementation((sql, params) => {
            if (sql.includes('vw_service_details')) {
                return Promise.resolve({
                    rows: [
                        { service_id: 1, service_name: 'Pipe Leak Repair', base_price: 350.00, duration_min: 60, category_name: 'Plumbing', icon_name: 'wrench' }
                    ]
                });
            }
            if (sql.includes('FROM Category')) {
                return Promise.resolve({
                    rows: [
                        { category_id: 1, name: 'Plumbing', icon_name: 'wrench' }
                    ]
                });
            }
            if (sql.includes('FROM Provider')) {
                return Promise.resolve({
                    rows: [
                        { provider_id: 1, name: 'Suresh Kumar', avg_rating: '4.80', experience_yrs: 8 }
                    ]
                });
            }
            return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
            .get('/')
            .expect(200);

        expect(response.text).toContain('HomeServe');
        expect(response.text).toContain('Pipe Leak Repair');
        expect(response.text).toContain('Plumbing');
        expect(response.text).toContain('Suresh Kumar');
    });

    it('should render 500 error if service query fails', async () => {
        db.query.mockRejectedValue(new Error('Database query failure'));

        const response = await request(app)
            .get('/')
            .expect(500);

        expect(response.text).toContain('Error');
    });
});
