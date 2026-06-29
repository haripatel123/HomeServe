const analyticsModel = require('../models/analyticsModel');

// GET /analytics  — Analytics dashboard
exports.dashboard = async (req, res, next) => {
    try {
        const [kpis, topServices, revenueByMonth, topProviders, statusDist, revenueByCategory] =
            await Promise.all([
                analyticsModel.getAnalyticsKPIs(),
                analyticsModel.getTopServices(8),
                analyticsModel.getRevenueByMonth(12),
                analyticsModel.getTopProviders(6),
                analyticsModel.getBookingStatusDistribution(),
                analyticsModel.getRevenueByCategory(),
            ]);

        res.render('analytics', {
            title: 'Analytics Dashboard — HomeServe',
            kpis,
            topServices,
            revenueByMonth,
            topProviders,
            statusDist,
            revenueByCategory,
        });
    } catch (err) {
        next(err);
    }
};
