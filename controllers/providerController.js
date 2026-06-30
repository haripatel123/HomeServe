const providerModel = require('../models/providerModel');

const VALID_DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

// GET /provider  — Provider dashboard
exports.dashboard = async (req, res, next) => {
    try {
        const providerId = parseInt(req.query.provider_id) || 1;
        if (!Number.isInteger(providerId) || providerId <= 0) {
            return res.status(400).render('404', { title: 'Invalid Provider ID' });
        }

        const [dashData, reviews, providers] = await Promise.all([
            providerModel.getProviderDashboard(providerId),
            providerModel.getProviderReviews(providerId, 5),
            providerModel.getAllProviders(),
        ]);

        if (!dashData) {
            return res.status(404).render('404', { title: 'Provider Not Found' });
        }

        res.render('provider-dashboard', {
            title: `${dashData.provider.provider_name} — Provider Dashboard`,
            dashData,
            reviews,
            providers,
            currentProvider: providerId,
            error: req.query.error || null,
            success: req.query.success || null,
        });
    } catch (err) {
        next(err);
    }
};

// POST /provider/availability  — Add availability
exports.addAvailability = async (req, res, next) => {
    try {
        const providerId = parseInt(req.body.provider_id);
        const { day_of_week, start_time, end_time } = req.body;

        if (!Number.isInteger(providerId) || providerId <= 0) {
            return res.redirect('/provider?error=Invalid+provider+ID');
        }
        if (!VALID_DAYS.includes(day_of_week)) {
            return res.redirect(`/provider?provider_id=${providerId}&error=Invalid+day+of+week`);
        }
        if (!start_time || !end_time) {
            return res.redirect(`/provider?provider_id=${providerId}&error=Start+and+end+times+are+required`);
        }
        if (!/^\d{2}:\d{2}$/.test(start_time) || !/^\d{2}:\d{2}$/.test(end_time)) {
            return res.redirect(`/provider?provider_id=${providerId}&error=Invalid+time+format`);
        }
        if (start_time >= end_time) {
            return res.redirect(`/provider?provider_id=${providerId}&error=End+time+must+be+after+start+time`);
        }

        await providerModel.addAvailability(providerId, day_of_week, start_time, end_time);
        res.redirect(`/provider?provider_id=${providerId}&success=Availability+slot+added`);
    } catch (err) {
        const providerId = req.body.provider_id || 1;
        const msg = encodeURIComponent(err.message || 'Failed to add availability');
        res.redirect(`/provider?provider_id=${providerId}&error=${msg}`);
    }
};

// POST /provider/availability/:id/delete  — Remove availability
exports.deleteAvailability = async (req, res, next) => {
    try {
        const availId    = parseInt(req.params.id);
        const providerId = parseInt(req.body.provider_id);

        if (!Number.isInteger(availId) || availId <= 0) {
            return res.redirect(`/provider?provider_id=${providerId}&error=Invalid+slot+ID`);
        }
        if (!Number.isInteger(providerId) || providerId <= 0) {
            return res.redirect('/provider?error=Invalid+provider+ID');
        }

        await providerModel.deleteAvailability(availId, providerId);
        res.redirect(`/provider?provider_id=${providerId}&success=Availability+slot+removed`);
    } catch (err) {
        const providerId = req.body.provider_id || 1;
        const msg = encodeURIComponent(err.message || 'Failed to delete slot');
        res.redirect(`/provider?provider_id=${providerId}&error=${msg}`);
    }
};
