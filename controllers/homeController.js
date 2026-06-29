const serviceModel  = require('../models/serviceModel');
const bookingModel  = require('../models/bookingModel');
const providerModel = require('../models/providerModel');

// GET /  — Home page with all services
exports.index = async (req, res, next) => {
    try {
        const categoryId = req.query.category ? parseInt(req.query.category) : null;
        if (categoryId !== null && (!Number.isInteger(categoryId) || categoryId <= 0)) {
            return res.status(400).render('500', { message: 'Invalid category ID' });
        }

        const [services, categories, providers] = await Promise.all([
            serviceModel.getAllServices(categoryId),
            serviceModel.getAllCategories(),
            providerModel.getAllProviders(),
        ]);

        // Find top rated provider dynamically
        let featuredProvider = null;
        if (providers && providers.length > 0) {
            featuredProvider = [...providers].sort((a, b) => parseFloat(b.avg_rating) - parseFloat(a.avg_rating))[0];
        }

        res.render('index', {
            title: 'HomeServe — Book Home Services',
            services,
            categories,
            selectedCategory: categoryId,
            searchQuery: req.query.search || '',
            featuredProvider,
        });
    } catch (err) {
        next(err);
    }
};
