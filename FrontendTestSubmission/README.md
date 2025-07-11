# URL Shortener Frontend

A modern React frontend for the URL Shortener microservice, built with Material-UI and integrated with custom logging middleware.

## Features

- 🎨 Modern UI with Material-UI components
- 📱 Responsive design  
- 🚀 Fast development with Create React App
- ✅ **URL Shortening Page**: Shorten up to 5 URLs concurrently
- ✅ **Statistics Page**: View detailed analytics for shortened URLs
- ✅ **Material-UI Design**: Modern, responsive interface
- ✅ **Client-side Validation**: Input validation before API calls
- 📊 URL statistics and analytics
- 🔍 Real-time logging integration
- 🛡️ Error handling and validation
- 🔄 Automatic API retries

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend server running on port 3100

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
# Copy the example environment file
cp .env .env.local
```

3. Configure the API URL in `.env.local`:
```env
REACT_APP_API_URL=http://localhost:3100
REACT_APP_DEBUG=true
```

## Available Scripts

### `npm start`
Runs the app in development mode on [http://localhost:3000](http://localhost:3000).

### `npm run start:dev`
Runs the app with debug mode enabled.

### `npm run build`
Builds the app for production to the `build` folder.

### `npm run build:prod`
Builds the app for production with production API settings.

### `npm test`
Launches the test runner in interactive watch mode.

## Quick Start

1. **Start the backend server first:**
```bash
cd ../BackendTestSubmission
npm start
```

2. **Start the frontend development server:**
```bash
npm start
```

3. **Or use the provided startup scripts:**
   - Windows Batch: Double-click `start-app.bat`
   - PowerShell: Run `.\start-app.ps1`
- ✅ **Comprehensive Logging**: Integration with custom logging middleware
- ✅ **Copy to Clipboard**: Easy sharing of shortened links
- ✅ **Analytics Visualization**: Click tracking, referrer analysis, geographic data
- ✅ **Search History**: Quick access to previously searched shortcodes
- ✅ **Mobile Responsive**: Optimized for both desktop and mobile devices

## Pages

### URL Shortener Page (`/`)
- Allows users to shorten up to 5 URLs simultaneously
- Input fields for:
  - Original long URL (required)
  - Validity period in minutes (optional, default: 30)
  - Custom shortcode (optional, 4-10 alphanumeric characters)
- Client-side validation with descriptive error messages
- Real-time results display with copy-to-clipboard functionality
- Expiry status indicators

### Statistics Page (`/statistics`)
- Search for statistics by shortcode
- Comprehensive analytics display:
  - Total click count
  - Creation and expiry dates
  - Top referrers analysis
  - Geographic location distribution
  - Detailed click history with timestamps
  - Recent activity overview
- Search history for quick access to previous lookups
- Export capabilities for analytics data

## Technology Stack

- **React 18**: Frontend framework
- **Material-UI (MUI) 5**: Component library and styling
- **React Router 6**: Client-side routing
- **Axios**: HTTP client for API requests
- **Custom Logging**: Integration with backend logging middleware

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The application will run on `http://localhost:3000`

## Configuration

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:8080)

### API Integration
The frontend integrates with the backend API endpoints:
- `POST /shorturls` - Create shortened URLs
- `GET /shorturls/:shortcode` - Get URL statistics
- `GET /:shortcode` - Redirect to original URL (handled by backend)

## Validation Rules

### URL Validation
- Must be a valid URL format
- Must include http:// or https:// protocol
- Cannot be empty

### Shortcode Validation
- Optional field
- 4-10 characters long
- Alphanumeric characters only (a-z, A-Z, 0-9)
- Cannot use reserved words (api, admin, www, shorturls, health, stats)
- Must be unique (checked by backend)

### Validity Validation
- Optional field (defaults to 30 minutes)
- Must be an integer
- Range: 1 to 43200 minutes (30 days)

## Features

### Logging Integration
The application extensively uses the custom logging middleware to track:
- Page views and navigation
- User interactions (button clicks, form submissions)
- API calls with response times
- Validation errors
- URL shortening activities
- Copy-to-clipboard actions

### Responsive Design
- Mobile-first approach
- Responsive grid layout
- Touch-friendly interface
- Optimized for various screen sizes

### User Experience
- Real-time validation feedback
- Loading states and progress indicators
- Success/error notifications with Snackbar
- Intuitive navigation between pages
- Search history for quick access
- Copy-to-clipboard functionality

### Error Handling
- Comprehensive client-side validation
- API error handling with user-friendly messages
- Network error detection and reporting
- Graceful fallbacks for failed operations

## Component Architecture

```
src/
├── components/
│   └── Navbar.js              # Navigation component
├── context/
│   └── LoggingContext.js      # Logging context provider
├── pages/
│   ├── UrlShortener.js        # URL shortening page
│   └── Statistics.js          # Analytics page
├── services/
│   └── apiService.js          # API integration
├── utils/
│   ├── validation.js          # Input validation
│   └── helpers.js             # Utility functions
├── App.js                     # Main application component
└── index.js                   # Application entry point
```

## Styling

The application uses Material-UI for consistent, modern styling:
- Primary color: Blue (#1976d2)
- Secondary color: Pink (#dc004e)
- Typography: Roboto font family
- Consistent spacing and elevation
- Dark/light theme support (via MUI)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Lazy loading of components
- Efficient re-rendering with React hooks
- Optimized bundle size
- Debounced input validation
- Memoized calculations for analytics

## Security Features

- Input sanitization
- XSS prevention
- CORS handling
- Secure clipboard API usage with fallbacks
