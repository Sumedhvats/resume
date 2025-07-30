const Resume = require('../models/Resume');
const ResumeParser = require('../utils/parser');
const JobMatcher = require('../utils/matcher');
const fs = require('fs').promises;

const resumeController = {
  async uploadResume(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const { originalname, filename, path: filePath, size, mimetype } = req.file;

      const parseResult = await ResumeParser.parseFile(filePath, mimetype);

      const resume = new Resume({
        originalName: originalname,
        filename,
        filePath,
        extractedText: parseResult.extractedText,
        keywords: parseResult.keywords,
        skills: parseResult.skills,
        experience: parseResult.experience,
        education: parseResult.education,
        contactInfo: parseResult.contactInfo,
        fileSize: size,
        mimeType: mimetype,
      });

      await resume.save();

      res.status(201).json({
        message: 'Resume uploaded and parsed successfully',
        resume: {
          id: resume._id,
          originalName: resume.originalName,
          keywords: resume.keywords,
          skills: resume.skills,
          contactInfo: resume.contactInfo,
          uploadedAt: resume.uploadedAt,
        },
      });
    } catch (error) {
      if (req.file) {
        try { await fs.unlink(req.file.path); } catch (_) {}
      }
      res.status(500).json({
        error: 'Failed to process resume',
        message: error.message,
      });
    }
  },

  async getAllResumes(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 100;
      const skip = (page - 1) * limit;

      const resumes = await Resume.find().select('-extractedText -filePath').sort({ uploadedAt: -1 }).skip(skip).limit(limit);
      const total = await Resume.countDocuments();

      res.json({
        resumes,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch resumes' });
    }
  },

  async getResume(req, res) {
    try {
      const resume = await Resume.findById(req.params.id).populate('matchHistory.jobId', 'title company');
      if (!resume) return res.status(404).json({ error: 'Resume not found' });
      res.json(resume);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch resume' });
    }
  },

  async deleteResume(req, res) {
    try {
      const resume = await Resume.findById(req.params.id);
      if (!resume) return res.status(404).json({ error: 'Resume not found' });
      try { await fs.unlink(resume.filePath); } catch (_) {}
      await Resume.findByIdAndDelete(req.params.id);
      res.json({ message: 'Resume deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete resume' });
    }
  },

  async matchJobs(req, res) {
    try {
      const resumeId = req.params.id;
      const limit = parseInt(req.query.limit) || 10;
      const matches = await JobMatcher.findMatchingJobs(resumeId, limit);

      // Save matching history
      const resume = await Resume.findById(resumeId);
      if (resume && matches.length > 0) {
        const matchHistory = matches.map(match => ({
          jobId: match.job._id,
          score: match.score,
          matchedKeywords: match.matchedKeywords,
        }));

        resume.matchHistory = [...matchHistory, ...resume.matchHistory].slice(0, 50);
        await resume.save();
      }

      res.json({
        resumeId,
        matches: matches.map(match => ({
          job: {
            id: match.job._id,
            title: match.job.title,
            company: match.job.company,
            location: match.job.location,
            jobType: match.job.jobType,
            experienceLevel: match.job.experienceLevel,
            postedAt: match.job.postedAt,
          },
          score: match.score,
          matchedKeywords: match.matchedKeywords,
          breakdown: match.breakdown,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to match jobs' });
    }
  }
};

module.exports = resumeController;
