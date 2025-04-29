import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RedirectPage from './pages/RedirectPage';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/r/:shortCode" element={<RedirectPage />} />
      </Routes>
    </Router>
  );
}

export default App;