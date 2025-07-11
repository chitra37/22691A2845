import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import UrlShortener from './pages/UrlShortener';
import Statistics from './pages/Statistics';
import { LoggingProvider } from './context/LoggingContext';

function App() {
  return (
    <LoggingProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Routes>
              <Route path="/" element={<UrlShortener />} />
              <Route path="/statistics" element={<Statistics />} />
            </Routes>
          </Container>
        </div>
      </Router>
    </LoggingProvider>
  );
}

export default App;
