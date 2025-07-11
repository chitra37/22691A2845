/**
 * Validate shortcode format and constraints
 */
const validateShortcode = (shortcode) => {
  // Check if shortcode is provided
  if (!shortcode) {
    return {
      isValid: false,
      error: 'Shortcode cannot be empty'
    };
  }

  // Check length (4-10 characters)
  if (shortcode.length < 4 || shortcode.length > 10) {
    return {
      isValid: false,
      error: 'Shortcode must be between 4 and 10 characters long'
    };
  }

  // Check alphanumeric characters only
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  if (!alphanumericRegex.test(shortcode)) {
    return {
      isValid: false,
      error: 'Shortcode can only contain alphanumeric characters (a-z, A-Z, 0-9)'
    };
  }

  // Check for reserved words/patterns
  const reservedWords = ['api', 'admin', 'www', 'shorturls', 'health', 'stats'];
  if (reservedWords.includes(shortcode.toLowerCase())) {
    return {
      isValid: false,
      error: 'Shortcode uses a reserved word. Please choose a different shortcode.'
    };
  }

  return {
    isValid: true,
    error: null
  };
};

/**
 * Validate URL format
 */
const validateUrl = (url) => {
  if (!url) {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  // Trim whitespace and normalize the URL
  const trimmedUrl = url.trim();
  
  // Check for spaces in the URL (which are invalid)
  if (trimmedUrl.includes(' ')) {
    return {
      isValid: false,
      error: 'URL cannot contain spaces'
    };
  }

  // Basic URL format validation
  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check if protocol is http or https
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return {
        isValid: false,
        error: 'URL must use http:// or https:// protocol'
      };
    }

    // Check if hostname exists
    if (!urlObj.hostname) {
      return {
        isValid: false,
        error: 'URL must have a valid hostname'
      };
    }

    // Additional validation for hostname format - more permissive for subdomains
    // Allow long subdomains with hyphens and multiple levels
    const hostnameRegex = /^[a-zA-Z0-9.-]+$/;
    if (!hostnameRegex.test(urlObj.hostname) || !urlObj.hostname.includes('.')) {
      return {
        isValid: false,
        error: 'URL must have a valid domain name'
      };
    }

    // Check that hostname doesn't start or end with hyphen or dot
    if (urlObj.hostname.startsWith('-') || urlObj.hostname.endsWith('-') || 
        urlObj.hostname.startsWith('.') || urlObj.hostname.endsWith('.')) {
      return {
        isValid: false,
        error: 'URL domain name format is invalid'
      };
    }

    return {
      isValid: true,
      error: null,
      normalizedUrl: trimmedUrl
    };
  } catch (error) {
    return {
      isValid: false,
      error: 'Invalid URL format'
    };
  }
};

/**
 * Validate validity period
 */
const validateValidity = (validity) => {
  if (validity === undefined || validity === null) {
    return {
      isValid: true,
      error: null,
      value: 30 // Default value
    };
  }

  // Check if it's a number
  if (!Number.isInteger(validity)) {
    return {
      isValid: false,
      error: 'Validity must be an integer'
    };
  }

  // Check range (1 minute to 30 days)
  if (validity < 1 || validity > 43200) {
    return {
      isValid: false,
      error: 'Validity must be between 1 and 43200 minutes (30 days)'
    };
  }

  return {
    isValid: true,
    error: null,
    value: validity
  };
};

module.exports = {
  validateShortcode,
  validateUrl,
  validateValidity
};
