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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  ContentCopy as CopyIcon,
  Search as SearchIcon,
  Timeline as TimelineIcon,
  Language as LanguageIcon,
  Computer as ComputerIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useLogging } from '../context/LoggingContext';
import { getUrlStatistics } from '../services/apiService';
import { formatDate, getTimeAgo, copyToClipboard, extractDomain, getExpiryStatus } from '../utils/helpers';

const Statistics = () => {
  const { logPageView, logApiCall, logUserInteraction } = useLogging();
  
  const [shortcode, setShortcode] = useState('');
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    logPageView('statistics');
    
    // Load search history from sessionStorage
    const savedHistory = JSON.parse(sessionStorage.getItem('searchHistory') || '[]');
    setSearchHistory(savedHistory);
  }, [logPageView]);

  const fetchStatistics = async () => {
    if (!shortcode.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a shortcode',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    setError(null);
    
    logUserInteraction('click', 'fetch-statistics', { shortcode });

    try {
      const startTime = Date.now();
      const result = await getUrlStatistics(shortcode.trim());
      const responseTime = Date.now() - startTime;

      logApiCall('GET', `/shorturls/${shortcode}`, result.success ? 200 : 'error', responseTime);

      if (result.success) {
        setStatistics(result.data);
        
        // Add to search history
        const newHistoryItem = {
          shortcode: shortcode.trim(),
          timestamp: new Date().toISOString(),
          totalClicks: result.data.totalClicks
        };
        
        const updatedHistory = [newHistoryItem, ...searchHistory.filter(item => item.shortcode !== shortcode.trim())].slice(0, 10);
        setSearchHistory(updatedHistory);
        sessionStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
        
        setSnackbar({
          open: true,
          message: 'Statistics loaded successfully',
          severity: 'success'
        });
      } else {
        setError(result.error.message || 'Failed to fetch statistics');
        setStatistics(null);
        setSnackbar({
          open: true,
          message: result.error.message || 'Failed to fetch statistics',
          severity: 'error'
        });
      }
    } catch (error) {
      setError('Network error occurred');
      setStatistics(null);
      setSnackbar({
        open: true,
        message: 'Network error occurred',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (link) => {
    const success = await copyToClipboard(link);
    setSnackbar({
      open: true,
      message: success ? 'Link copied to clipboard!' : 'Failed to copy link',
      severity: success ? 'success' : 'error'
    });
    
    logUserInteraction('click', 'copy-link', { link, success });
  };

  const loadFromHistory = (historyShortcode) => {
    setShortcode(historyShortcode);
    logUserInteraction('click', 'load-from-history', { shortcode: historyShortcode });
  };

  const clearHistory = () => {
    setSearchHistory([]);
    sessionStorage.removeItem('searchHistory');
    logUserInteraction('click', 'clear-search-history');
    setSnackbar({
      open: true,
      message: 'Search history cleared',
      severity: 'info'
    });
  };

  // Get top referrers
  const getTopReferrers = (clicks) => {
    const referrerCounts = {};
    clicks.forEach(click => {
      const referrer = click.referrer === 'Direct' ? 'Direct Access' : extractDomain(click.referrer);
      referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
    });
    
    return Object.entries(referrerCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([referrer, count]) => ({ referrer, count }));
  };

  // Get location distribution
  const getLocationDistribution = (clicks) => {
    const locationCounts = {};
    clicks.forEach(click => {
      const location = click.location || 'Unknown';
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    return Object.entries(locationCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([location, count]) => ({ location, count }));
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <BarChartIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1">
            URL Statistics
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Enter a shortcode to view detailed analytics including click counts, referrer information, and geographic data.
        </Typography>

        <Box display="flex" gap={2} mb={3}>
          <TextField
            fullWidth
            label="Shortcode"
            placeholder="Enter shortcode (e.g., abc123)"
            value={shortcode}
            onChange={(e) => setShortcode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchStatistics()}
            disabled={loading}
          />
          <Button
            variant="contained"
            onClick={fetchStatistics}
            disabled={loading || !shortcode.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
            sx={{ minWidth: 140 }}
          >
            {loading ? 'Loading...' : 'Get Stats'}
          </Button>
        </Box>

        {searchHistory.length > 0 && (
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Recent Searches</Typography>
                <Button size="small" onClick={clearHistory}>Clear History</Button>
              </Box>
              <Box display="flex" gap={1} flexWrap="wrap">
                {searchHistory.map((item, index) => (
                  <Chip
                    key={index}
                    label={`${item.shortcode} (${item.totalClicks} clicks)`}
                    onClick={() => loadFromHistory(item.shortcode)}
                    variant="outlined"
                    size="small"
                    clickable
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {statistics && (
        <Grid container spacing={3}>
          {/* Overview Card */}
          <Grid item xs={12}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  Overview - {statistics.shortcode}
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Original URL
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Typography variant="body1" sx={{ wordBreak: 'break-all', flexGrow: 1 }}>
                          {statistics.originalUrl}
                        </Typography>
                        <Tooltip title="Copy URL">
                          <IconButton size="small" onClick={() => handleCopyLink(statistics.originalUrl)}>
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Short URL
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Typography variant="body1" sx={{ fontFamily: 'monospace', flexGrow: 1 }}>
                          http://localhost:3100/{statistics.shortcode}
                        </Typography>
                        <Tooltip title="Copy short URL">
                          <IconButton size="small" onClick={() => handleCopyLink(`http://localhost:3100/${statistics.shortcode}`)}>
                            <CopyIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h3" color="primary.main">
                            {statistics.totalClicks}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Total Clicks
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center">
                          <Typography variant="h6" color="text.primary">
                            {formatDate(statistics.createdAt)}
                          </Typography>
                          <Typography variant="subtitle2" color="text.secondary">
                            Created
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Box textAlign="center">
                          <Chip 
                            {...getExpiryStatus(statistics.expiresAt)}
                            label={getExpiryStatus(statistics.expiresAt).status}
                            color={getExpiryStatus(statistics.expiresAt).color}
                            variant="outlined"
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {statistics.clicks.length > 0 && (
            <>
              {/* Analytics Summary */}
              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Top Referrers</Typography>
                    </Box>
                    <List dense>
                      {getTopReferrers(statistics.clicks).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="body2" color="primary.main">
                              {index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.referrer}
                            secondary={`${item.count} clicks`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <LanguageIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Locations</Typography>
                    </Box>
                    <List dense>
                      {getLocationDistribution(statistics.clicks).slice(0, 5).map((item, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Typography variant="body2" color="primary.main">
                              {index + 1}
                            </Typography>
                          </ListItemIcon>
                          <ListItemText
                            primary={item.location}
                            secondary={`${item.count} clicks`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card elevation={2}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6">Recent Activity</Typography>
                    </Box>
                    <List dense>
                      {statistics.clicks.slice(-5).reverse().map((click, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText
                            primary={getTimeAgo(click.timestamp)}
                            secondary={`${click.location} • ${extractDomain(click.referrer)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* Detailed Click Data */}
              <Grid item xs={12}>
                <Card elevation={2}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Detailed Click Data
                    </Typography>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Referrer</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>User Agent</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {statistics.clicks.slice().reverse().map((click, index) => (
                            <TableRow key={index} hover>
                              <TableCell>
                                <Box>
                                  <Typography variant="body2">
                                    {formatDate(click.timestamp)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {getTimeAgo(click.timestamp)}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                {click.referrer === 'Direct' ? (
                                  <Chip label="Direct Access" size="small" variant="outlined" />
                                ) : (
                                  <Typography variant="body2">
                                    {extractDomain(click.referrer)}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <LanguageIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {click.location || 'Unknown'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center">
                                  <ComputerIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                                  <Typography variant="body2">
                                    {click.userAgent || 'Unknown'}
                                  </Typography>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {statistics.clicks.length === 0 && (
            <Grid item xs={12}>
              <Alert severity="info">
                No clicks recorded for this short URL yet.
              </Alert>
            </Grid>
          )}
        </Grid>
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

export default Statistics;
