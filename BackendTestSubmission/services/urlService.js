const { nanoid } = require('nanoid');

// In-memory storage (in production, use a database)
const urlStorage = new Map();

/**
 * Generate a unique shortcode
 */
const generateShortcode = () => {
  let shortcode;
  do {
    shortcode = nanoid(6); // Generate 6-character shortcode
  } while (urlStorage.has(shortcode));
  
  return shortcode;
};

/**
 * Check if shortcode exists
 */
const shortcodeExists = (shortcode) => {
  return urlStorage.has(shortcode);
};

/**
 * Store URL entry
 */
const storeUrl = (urlEntry) => {
  urlStorage.set(urlEntry.shortcode, urlEntry);
};

/**
 * Get URL entry by shortcode
 */
const getUrl = (shortcode) => {
  return urlStorage.get(shortcode);
};

/**
 * Record a click for analytics
 */
const recordClick = (shortcode, clickData) => {
  const urlEntry = urlStorage.get(shortcode);
  if (urlEntry) {
    urlEntry.clicks.push(clickData);
    urlStorage.set(shortcode, urlEntry);
  }
};

/**
 * Get all URLs (for frontend statistics page)
 */
const getAllUrls = () => {
  return Array.from(urlStorage.values());
};

/**
 * Clean up expired URLs (optional cleanup function)
 */
const cleanupExpiredUrls = () => {
  const now = new Date();
  const expiredShortcodes = [];
  
  for (const [shortcode, urlEntry] of urlStorage.entries()) {
    if (new Date(urlEntry.expiresAt) < now) {
      expiredShortcodes.push(shortcode);
    }
  }
  
  expiredShortcodes.forEach(shortcode => {
    urlStorage.delete(shortcode);
  });
  
  return expiredShortcodes.length;
};

module.exports = {
  generateShortcode,
  shortcodeExists,
  storeUrl,
  getUrl,
  recordClick,
  getAllUrls,
  cleanupExpiredUrls
};
