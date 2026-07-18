const express = require('express');
const router = express.Router();
const { submitCode, getSubmission } = require('../controllers/submissionController');

router.post('/run', submitCode);

module.exports = router;

router.get('/:id',getSubmission);

module.exports = router;