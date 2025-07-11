const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
  },
  colors: {
    error: 'darkred',
    warn: 'yellow',
    info: 'green',
    http: 'lightblue',
    debug: 'magenta'
  }
};

// Add colors to winston
winston.addColors(customLevels.colors);

// Custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += ` | Meta: ${JSON.stringify(meta)}`;
    }
    
    if (stack) {
      log += `\n${stack}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        customFormat
      )
    }),
    
    // Daily rotate file for all logs
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    
    // Separate file for errors
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d'
    }),
    
    // HTTP requests log
    new DailyRotateFile({
      filename: 'logs/http-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d'
    })
  ]
});

// Express middleware function
const expressMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log incoming request
  logger.http('Incoming Request', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    timestamp: new Date().toISOString()
  });
  
  // Capture response details
  const originalSend = res.send;
  res.send = function(data) {
    const duration = Date.now() - start;
    
    logger.http('Outgoing Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: data ? data.length : 0
    });
    
    originalSend.call(this, data);
  };
  
  next();
};

// Helper functions for different log levels
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

const logError = (message, error = null, meta = {}) => {
  if (error) {
    logger.error(message, { error: error.message, stack: error.stack, ...meta });
  } else {
    logger.error(message, meta);
  }
};

const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

const logHttp = (message, meta = {}) => {
  logger.http(message, meta);
};

// URL Shortener specific logging functions
const logUrlCreated = (originalUrl, shortCode, expiresAt, meta = {}) => {
  logInfo('URL shortened successfully', {
    action: 'URL_CREATED',
    originalUrl,
    shortCode,
    expiresAt,
    ...meta
  });
};

const logUrlAccessed = (shortCode, originalUrl, userAgent, ip, referrer, meta = {}) => {
  logInfo('Short URL accessed', {
    action: 'URL_ACCESSED',
    shortCode,
    originalUrl,
    userAgent,
    ip,
    referrer,
    timestamp: new Date().toISOString(),
    ...meta
  });
};

const logUrlNotFound = (shortCode, meta = {}) => {
  logWarn('Short URL not found', {
    action: 'URL_NOT_FOUND',
    shortCode,
    ...meta
  });
};

const logUrlExpired = (shortCode, meta = {}) => {
  logWarn('Short URL expired', {
    action: 'URL_EXPIRED',
    shortCode,
    ...meta
  });
};

const logShortCodeCollision = (shortCode, meta = {}) => {
  logWarn('Short code collision detected', {
    action: 'SHORTCODE_COLLISION',
    shortCode,
    ...meta
  });
};

const logValidationError = (field, value, reason, meta = {}) => {
  logWarn('Validation error', {
    action: 'VALIDATION_ERROR',
    field,
    value,
    reason,
    ...meta
  });
};

module.exports = {
  logger,
  expressMiddleware,
  logInfo,
  logError,
  logWarn,
  logDebug,
  logHttp,
  logUrlCreated,
  logUrlAccessed,
  logUrlNotFound,
  logUrlExpired,
  logShortCodeCollision,
  logValidationError
};
