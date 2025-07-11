import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { LinkOutlined, BarChart } from '@mui/icons-material';
import { useLogging } from '../context/LoggingContext';

const Navbar = () => {
  const location = useLocation();
  const { logUserInteraction } = useLogging();

  const handleNavigation = (page) => {
    logUserInteraction('click', 'navigation', { destination: page });
  };

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <LinkOutlined sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            onClick={() => handleNavigation('shortener')}
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            startIcon={<LinkOutlined />}
          >
            Shorten URLs
          </Button>
          <Button
            color="inherit"
            component={RouterLink}
            to="/statistics"
            onClick={() => handleNavigation('statistics')}
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            startIcon={<BarChart />}
          >
            Statistics
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
