const express = require('express');
const router = express.Router();
const Submission = require('../models/Submission');
const auth = require('../middleware/auth');

// Save a submission
router.post('/save', auth, async (req, res) => {
  try {
    const {
      languageId,
      languageName,
      sourceCode,
      stdin,
      stdout,
      stderr,
      compileOutput,
      status,
      executionTime,
      memory
    } = req.body;

    const newSubmission = new Submission({
      userId: req.user.id,
      languageId,
      languageName,
      sourceCode,
      stdin,
      stdout,
      stderr,
      compileOutput,
      status,
      executionTime,
      memory
    });

    await newSubmission.save();
    res.status(201).json(newSubmission);
  } catch (error) {
    res.status(500).json({ message: 'Error saving submission', error: error.message });
  }
});

// Get history
router.get('/history', auth, async (req, res) => {
  try {
    const submissions = await Submission.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching history', error: error.message });
  }
});

module.exports = router;
