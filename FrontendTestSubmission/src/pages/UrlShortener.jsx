import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  Snackbar,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  Link as LinkIcon,
  Clear as ClearIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useLogging } from '../context/LoggingContext';
import { createMultipleShortUrls } from '../services/apiService';
import { validateMultipleEntries } from '../utils/validation';
import { formatDate, copyToClipboard, getExpiryStatus, generateShortcodeSuggestion } from '../utils/helpers';

const UrlShortener = () => {
  const { logPageView, logUrlSubmitted, logUrlShortened, logValidationError, logApiCall, logUserInteraction } = useLogging();
  
  const [urlEntries, setUrlEntries] = useState([
    { url: '', validity: '', shortcode: '' }
  ]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    logPageView('url-shortener');
  }, [logPageView]);

  const addUrlEntry = () => {
    if (urlEntries.length < 5) {
      setUrlEntries([...urlEntries, { url: '', validity: '', shortcode: '' }]);
      logUserInteraction('click', 'add-url-entry');
    }
  };

  const removeUrlEntry = (index) => {
    if (urlEntries.length > 1) {
      const newEntries = urlEntries.filter((_, i) => i !== index);
      setUrlEntries(newEntries);
      
      // Clear errors for removed entry
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
      
      logUserInteraction('click', 'remove-url-entry', { index });
    }
  };

  const updateUrlEntry = (index, field, value) => {
    const newEntries = [...urlEntries];
    newEntries[index][field] = value;
    setUrlEntries(newEntries);

    // Clear error for this field when user starts typing
    if (errors[index]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[index][field];
      setErrors(newErrors);
    }
  };

  const handleUrlBlur = (index, value) => {
    // Trim and clean URL field when user finishes typing
    const trimmedValue = value.trim();
    if (trimmedValue !== value) {
      updateUrlEntry(index, 'url', trimmedValue);
    }
  };

  const generateSuggestion = (index) => {
    const suggestion = generateShortcodeSuggestion();
    updateUrlEntry(index, 'shortcode', suggestion);
    logUserInteraction('click', 'generate-shortcode-suggestion', { index, suggestion });
  };

  const clearForm = () => {
    setUrlEntries([{ url: '', validity: '', shortcode: '' }]);
    setResults([]);
    setErrors({});
    logUserInteraction('click', 'clear-form');
  };

  const handleSubmit = async () => {
    logUserInteraction('click', 'submit-urls');
    
    // Filter out empty entries
    const nonEmptyEntries = urlEntries.filter(entry => entry.url.trim() !== '');
    
    if (nonEmptyEntries.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please enter at least one URL',
        severity: 'warning'
      });
      return;
    }

    // Validate all entries
    const validationResults = validateMultipleEntries(nonEmptyEntries);
    const hasErrors = validationResults.some(result => !result.isValid);

    if (hasErrors) {
      const errorMap = {};
      validationResults.forEach(result => {
        if (!result.isValid) {
          errorMap[result.index] = result.errors;
          Object.keys(result.errors).forEach(field => {
            logValidationError(field, result.validatedData[field], result.errors[field], {
              entryIndex: result.index
            });
          });
        }
      });
      setErrors(errorMap);
      setSnackbar({
        open: true,
        message: 'Please fix the validation errors',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const validEntries = validationResults.map(result => result.validatedData);
      
      logUrlSubmitted(validEntries);

      const startTime = Date.now();
      const apiResults = await createMultipleShortUrls(validEntries);
      const totalTime = Date.now() - startTime;

      logApiCall('POST', '/shorturls (batch)', 'mixed', totalTime, {
        batchSize: validEntries.length,
        results: apiResults.map(r => ({ success: r.success, status: r.error?.status }))
      });

      const successfulResults = [];
      const failedResults = [];

      apiResults.forEach((result, index) => {
        if (result.success) {
          successfulResults.push({
            ...result.data,
            originalUrl: result.originalData.url,
            index
          });
          
          logUrlShortened(
            result.originalData.url,
            result.data.shortLink,
            result.data.expiry
          );
        } else {
          failedResults.push({
            error: result.error.message,
            originalUrl: result.originalData.url,
            index
          });
        }
      });

      setResults(apiResults);

      if (successfulResults.length > 0) {
        setSnackbar({
          open: true,
          message: `Successfully shortened ${successfulResults.length} URL(s)`,
          severity: 'success'
        });
      }

      if (failedResults.length > 0) {
        setSnackbar({
          open: true,
          message: `${failedResults.length} URL(s) failed to shorten`,
          severity: 'error'
        });
      }

    } catch (error) {
      console.error('Batch URL shortening failed:', error);
      setSnackbar({
        open: true,
        message: 'Failed to shorten URLs. Please try again.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (shortLink) => {
    const success = await copyToClipboard(shortLink);
    setSnackbar({
      open: true,
      message: success ? 'Link copied to clipboard!' : 'Failed to copy link',
      severity: success ? 'success' : 'error'
    });
    
    logUserInteraction('click', 'copy-short-link', { shortLink, success });
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <LinkIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" gutterBottom>
            URL Shortener
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Shorten up to 5 URLs simultaneously. Each URL can have a custom shortcode and validity period.
        </Typography>

        <Grid container spacing={3}>
          {urlEntries.map((entry, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    URL #{index + 1}
                  </Typography>
                  {urlEntries.length > 1 && (
                    <IconButton
                      onClick={() => removeUrlEntry(index)}
                      color="error"
                      size="small"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Long URL"
                      placeholder="https://example.com/very-long-url"
                      value={entry.url}
                      onChange={(e) => updateUrlEntry(index, 'url', e.target.value)}
                      onBlur={(e) => handleUrlBlur(index, e.target.value)}
                      error={!!errors[index]?.url}
                      helperText={errors[index]?.url || 'Enter the URL you want to shorten'}
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Validity (minutes)"
                      placeholder="30"
                      type="number"
                      value={entry.validity}
                      onChange={(e) => updateUrlEntry(index, 'validity', e.target.value)}
                      error={!!errors[index]?.validity}
                      helperText={errors[index]?.validity || 'Default: 30 minutes'}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={3}>
                    <Box display="flex" gap={1}>
                      <TextField
                        fullWidth
                        label="Custom Shortcode"
                        placeholder="mylink"
                        value={entry.shortcode}
                        onChange={(e) => updateUrlEntry(index, 'shortcode', e.target.value)}
                        error={!!errors[index]?.shortcode}
                        helperText={errors[index]?.shortcode || 'Optional: 4-10 chars'}
                      />
                      <Tooltip title="Generate suggestion">
                        <IconButton
                          onClick={() => generateSuggestion(index)}
                          color="primary"
                        >
                          <RefreshIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box display="flex" gap={2} mt={3}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addUrlEntry}
            disabled={urlEntries.length >= 5}
          >
            Add URL ({urlEntries.length}/5)
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={clearForm}
            disabled={loading}
          >
            Clear All
          </Button>
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <LinkIcon />}
            sx={{ ml: 'auto' }}
          >
            {loading ? 'Shortening...' : 'Shorten URLs'}
          </Button>
        </Box>
      </Paper>

      {results.length > 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Results
          </Typography>
          
          <Grid container spacing={2}>
            {results.map((result, index) => (
              <Grid item xs={12} key={index}>
                <Card variant="outlined">
                  <CardContent>
                    {result.success ? (
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={2}>
                          <Typography variant="h6" color="success.main">
                            ✓ Success
                          </Typography>
                          <Chip 
                            {...getExpiryStatus(result.data.expiry)} 
                            size="small" 
                            variant="outlined"
                            label={getExpiryStatus(result.data.expiry).status}
                            color={getExpiryStatus(result.data.expiry).color}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Original: {result.originalData.url}
                        </Typography>
                        
                        <Box display="flex" alignItems="center" gap={1} mb={1}>
                          <TextField
                            fullWidth
                            variant="outlined"
                            value={result.data.shortLink}
                            InputProps={{
                              readOnly: true,
                              sx: { fontFamily: 'monospace' }
                            }}
                            size="small"
                          />
                          <Tooltip title="Copy link">
                            <IconButton
                              onClick={() => handleCopyLink(result.data.shortLink)}
                              color="primary"
                            >
                              <CopyIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                        
                        <Typography variant="caption" color="text.secondary">
                          Expires: {formatDate(result.data.expiry)}
                        </Typography>
                      </Box>
                    ) : (
                      <Box>
                        <Typography variant="h6" color="error.main" gutterBottom>
                          ✗ Failed
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Original: {result.originalData.url}
                        </Typography>
                        <Alert severity="error">
                          {result.error.message || 'Unknown error occurred'}
                        </Alert>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UrlShortener;
