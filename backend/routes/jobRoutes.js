const express = require('express');
const jobController = require('../controllers/jobController');
const { validateObjectId, validateJobSearch } = require('../middleware/validation');

const router = express.Router();

router.post('/', jobController.createJob);
router.get('/', validateJobSearch, jobController.getAllJobs);
router.get('/stats', jobController.getJobStats);
router.get('/:id', validateObjectId(), jobController.getJob);
router.put('/:id', validateObjectId(), jobController.updateJob);
router.delete('/:id', validateObjectId(), jobController.deleteJob);

module.exports = router;
