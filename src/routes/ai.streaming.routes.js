const express = require('express');
const streamingController = require('../controllers/ai.streaming.controller');

const router = express.Router();

// Streaming AI response route
router.post('/stream', streamingController.getStreamingResponse);

module.exports = router;