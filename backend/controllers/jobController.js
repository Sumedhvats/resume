const Job = require('../models/Job');
const Joi = require('joi');
const jobSchema = Joi.object({
  title: Joi.string().required().trim().max(200),
  company: Joi.string().required().trim().max(200),
  description: Joi.string().required().max(5000),
  requirements: Joi.string().required().max(3000),
  location: Joi.string().trim().max(200),
  salaryRange: Joi.object({
    min: Joi.number().min(0),
    max: Joi.number().min(0),
    currency: Joi.string().default('USD')
  }),
  jobType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance'),
  keywords: Joi.array().items(Joi.string().trim().lowercase()),
  requiredSkills: Joi.array().items(Joi.string().trim().lowercase()),
  preferredSkills: Joi.array().items(Joi.string().trim().lowercase()),
  experienceLevel: Joi.string().valid('entry', 'mid', 'senior', 'lead', 'executive'),
  applicationUrl: Joi.string().uri(),
  contactEmail: Joi.string().email(),
  expiresAt: Joi.date().greater('now')
});

const jobController = {
  async createJob(req, res) {
    try {
      const { error, value } = jobSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message)
        });
      }
      const job = new Job(value);
      await job.save();
      res.status(201).json({ message: 'Job created successfully', job });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create job' });
    }
  },

  async getAllJobs(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 2000;
      const skip = (page - 1) * limit;
      const filters = { isActive: true };
      
      if (req.query.jobType) filters.jobType = req.query.jobType;
      if (req.query.experienceLevel) filters.experienceLevel = req.query.experienceLevel;
      if (req.query.location) filters.location = new RegExp(req.query.location, 'i');
      if (req.query.company) filters.company = new RegExp(req.query.company, 'i');
      if (req.query.search) filters.$text = { $search: req.query.search };

      const jobs = await Job.find(filters).sort({ postedAt: -1 }).skip(skip).limit(limit);
      const total = await Job.countDocuments(filters);

      res.json({
        jobs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
        filters: req.query,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  },

  async getJob(req, res) {
    try {
      const job = await Job.findById(req.params.id);
      if (!job) return res.status(404).json({ error: 'Job not found' });
      res.json(job);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  },

  async updateJob(req, res) {
    try {
      const { error, value } = jobSchema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.details.map(d => d.message)
        });
      }
      const job = await Job.findByIdAndUpdate(req.params.id, value, { new: true, runValidators: true });
      if (!job) return res.status(404).json({ error: 'Job not found' });
      res.json({ message: 'Job updated successfully', job });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update job' });
    }
  },

  async deleteJob(req, res) {
    try {
      const job = await Job.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
      if (!job) return res.status(404).json({ error: 'Job not found' });
      res.json({ message: 'Job deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete job' });
    }
  },

  async getJobStats(req, res) {
    try {
      const stats = await Job.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalJobs: { $sum: 1 },
            byJobType: { $push: '$jobType' },
            byExperienceLevel: { $push: '$experienceLevel' },
            avgSalaryMin: { $avg: '$salaryRange.min' },
            avgSalaryMax: { $avg: '$salaryRange.max' }
          }
        }
      ]);
      if (stats.length === 0) {
        return res.json({ totalJobs: 0, jobTypes: {}, experienceLevels: {}, averageSalary: null });
      }
      const stat = stats[0];
      const jobTypeCounts = stat.byJobType.reduce((acc, type) => { acc[type] = (acc[type] || 0) + 1; return acc; }, {});
      const experienceCounts = stat.byExperienceLevel.reduce((acc, level) => { acc[level] = (acc[level] || 0) + 1; return acc; }, {});
      res.json({
        totalJobs: stat.totalJobs,
        jobTypes: jobTypeCounts,
        experienceLevels: experienceCounts,
        averageSalary: {
          min: Math.round(stat.avgSalaryMin || 0),
          max: Math.round(stat.avgSalaryMax || 0),
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job statistics' });
    }
  }
};

module.exports = jobController;
