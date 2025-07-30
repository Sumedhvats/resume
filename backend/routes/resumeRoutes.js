const express = require('express');
const resumeController = require('../controllers/resumeController');
const { uploadSingle, handleUploadError } = require('../middleware/upload');
const { validateObjectId, validatePagination } = require('../middleware/validation');

const router = express.Router();

router.post('/upload', uploadSingle, handleUploadError, resumeController.uploadResume);
router.get('/', validatePagination, resumeController.getAllResumes);
router.get('/:id', validateObjectId(), resumeController.getResume);
router.delete('/:id', validateObjectId(), resumeController.deleteResume);
router.post('/:id/match', validateObjectId(), resumeController.matchJobs);

module.exports = router;
