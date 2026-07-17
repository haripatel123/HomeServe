const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

// Mock database query pool
jest.mock('../config/db', () => ({
    query: jest.fn(),
    on: jest.fn()
}));

describe('GET /services/:id - Service Details Route', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 404 for non-integer service ID', async () => {
        const response = await request(app)
            .get('/services/abc')
            .expect(400);

        expect(response.text).toContain('Invalid Service ID');
    });

    it('should return 404 if service does not exist in database', async () => {
        db.query.mockResolvedValue({ rows: [] }); // No service found

        const response = await request(app)
            .get('/services/999')
            .expect(404);

        expect(response.text).toContain('Service Not Found');
    });

    it('should return 200 and render service detail with variants and providers', async () => {
        db.query.mockImplementation((sql, params) => {
            if (sql.includes('vw_service_details')) {
                return Promise.resolve({
                    rows: [{ service_id: 1, service_name: 'Fan Installation', category_name: 'Electrical', base_price: 350.00 }]
                });
            }
            if (sql.includes('ServiceVariant')) {
                return Promise.resolve({
                    rows: [{ variant_id: 10, variant_name: 'Ceiling Fan', price: 350.00 }]
                });
            }
            if (sql.includes('Provider')) {
                return Promise.resolve({
                    rows: [{ provider_id: 2, name: 'Ravi Electricals', avg_rating: '4.60' }]
                });
            }
            return Promise.resolve({ rows: [] });
        });

        const response = await request(app)
            .get('/services/1')
            .expect(200);

        expect(response.text).toContain('Fan Installation');
        expect(response.text).toContain('Ceiling Fan');
        expect(response.text).toContain('Ravi Electricals');
    });
});
