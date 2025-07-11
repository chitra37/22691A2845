const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Import custom logging middleware
const {
  expressMiddleware,
  logInfo,
  logError,
  logWarn
} = require('../LoggingMiddleware');

// Import routes
const urlRoutes = require('./routes/urlRoutes');

const app = express();
const PORT = process.env.PORT || 3100;

// Trust proxy setting - be more specific for development
// In production, you would configure this more restrictively
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  // For development, use a simple key generator to avoid trust proxy issues
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || 'unknown';
  }
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom logging middleware
app.use(expressMiddleware);

// Health check endpoint (before other routes)
app.get('/health', (req, res) => {
  logInfo('Health check requested');
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/', urlRoutes);

// 404 handler
app.use('*', (req, res) => {
  logWarn('Route not found', { url: req.originalUrl, method: req.method });
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  logError('Unhandled error', err, {
    url: req.originalUrl,
    method: req.method,
    body: req.body
  });
  
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  logInfo(`Backend started on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
