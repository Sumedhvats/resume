const Joi = require('joi');

const validationMiddleware = {
  validateObjectId: (paramName = 'id') => {
    return (req, res, next) => {
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      const id = req.params[paramName];
      
      if (!objectIdRegex.test(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      next();
    };
  },

  validatePagination: (req, res, next) => {
    const schema = Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    });

    const { error, value } = schema.validate({
      page: req.query.page,
      limit: req.query.limit
    });

    if (error) {
      return res.status(400).json({ 
        error: 'Invalid pagination parameters',
        details: error.details.map(d => d.message)
      });
    }

    req.query.page = value.page;
    req.query.limit = value.limit;
    next();
  },

  validateJobSearch: (req, res, next) => {
    const schema = Joi.object({
      search: Joi.string().max(200),
      jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance'),
      experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'lead', 'executive'),
      location: Joi.string().max(200),
      company: Joi.string().max(200),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(20)
    });

    const { error, value } = schema.validate(req.query);

    if (error) {
      return res.status(400).json({ 
        error: 'Invalid search parameters',
        details: error.details.map(d => d.message)
      });
    }

    req.query = value;
    next();
  }
};

module.exports = validationMiddleware;
