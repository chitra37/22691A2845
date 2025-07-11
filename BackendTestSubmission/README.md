# URL Shortener Backend

A robust HTTP URL Shortener Microservice built with Node.js and Express.js.

## Features

- ✅ RESTful API for URL shortening
- ✅ Custom shortcode support
- ✅ Configurable link expiration
- ✅ Click analytics and statistics
- ✅ Comprehensive logging with custom middleware
- ✅ Input validation and error handling
- ✅ Rate limiting and security headers
- ✅ Geographic location tracking
- ✅ User agent parsing

## API Endpoints

### Create Short URL
- **POST** `/shorturls`
- Creates a new shortened URL

**Request Body:**
```json
{
  "url": "https://example.com/very-long-url",
  "validity": 30,
  "shortcode": "custom123"
}
```

**Response (201 Created):**
```json
{
  "shortLink": "http://localhost:8080/custom123",
  "expiry": "2025-07-11T12:30:00.000Z"
}
```

### Redirect to Original URL
- **GET** `/:shortcode`
- Redirects to the original URL and tracks analytics

### Get URL Statistics
- **GET** `/shorturls/:shortcode`
- Retrieves detailed analytics for a shortened URL

**Response (200 OK):**
```json
{
  "shortcode": "custom123",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2025-07-11T12:00:00.000Z",
  "expiresAt": "2025-07-11T12:30:00.000Z",
  "totalClicks": 5,
  "clicks": [
    {
      "timestamp": "2025-07-11T12:05:00.000Z",
      "referrer": "google.com",
      "location": "New York, US",
      "userAgent": "Chrome 91"
    }
  ]
}
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. For development with auto-reload:
```bash
npm run dev
```

## Configuration

- **Port**: Set `PORT` environment variable (default: 8080)
- **Log Level**: Set `LOG_LEVEL` environment variable (default: info)

## Validation Rules

### URL
- Must be a valid URL with http:// or https:// protocol
- Must have a valid hostname

### Shortcode (optional)
- 4-10 characters long
- Alphanumeric characters only (a-z, A-Z, 0-9)
- Cannot use reserved words

### Validity (optional)
- Integer between 1 and 43200 minutes (30 days)
- Defaults to 30 minutes if not specified

## Error Responses

The API returns appropriate HTTP status codes with descriptive error messages:

- `400 Bad Request` - Invalid input data
- `404 Not Found` - Shortcode not found
- `409 Conflict` - Shortcode already exists
- `410 Gone` - Link has expired
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Server error

## Security Features

- Rate limiting (100 requests per 15 minutes per IP)
- Helmet.js security headers
- Input validation and sanitization
- CORS configuration for frontend integration

## Logging

The application uses a custom logging middleware that provides:
- Structured logging with Winston
- Daily rotating log files
- HTTP request/response tracking
- URL shortener specific events
- Error tracking with stack traces

## Architecture

```
BackendTestSubmission/
├── controllers/
│   └── urlController.js      # Request handlers
├── services/
│   ├── urlService.js         # URL storage and management
│   └── validationService.js  # Input validation
├── routes/
│   └── urlRoutes.js          # Route definitions
├── package.json
├── server.js                 # Application entry point
└── README.md
```
