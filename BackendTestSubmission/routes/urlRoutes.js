const express = require('express');
const router = express.Router();
const urlController = require('../controllers/urlController');

// Welcome route
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'URL Shortener API',
    version: '1.0.0',
    endpoints: {
      'POST /shorturls': 'Create a short URL',
      'GET /shorturls/:shortcode': 'Get URL statistics',
      'GET /:shortcode': 'Redirect to original URL',
      'GET /health': 'Health check'
    }
  });
});

// Create short URL
router.post('/shorturls', urlController.createShortUrl);

// Get URL statistics
router.get('/shorturls/:shortcode', urlController.getUrlStats);

// Redirect to original URL
router.get('/:shortcode', urlController.redirectToUrl);

module.exports = router;
