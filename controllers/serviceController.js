const serviceModel = require('../models/serviceModel');

// GET /services/:id
exports.detail = async (req, res, next) => {
    try {
        const serviceId = parseInt(req.params.id);
        if (!Number.isInteger(serviceId) || serviceId <= 0) {
            return res.status(400).render('404', { title: 'Invalid Service ID' });
        }

        const service = await serviceModel.getServiceById(serviceId);
        if (!service) {
            return res.status(404).render('404', { title: 'Service Not Found' });
        }

        res.render('service-detail', {
            title: `${service.service_name} — HomeServe`,
            service,
        });
    } catch (err) {
        next(err);
    }
};
