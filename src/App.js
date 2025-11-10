import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppContent from './AppContent';
import './App.css';

function App() {
  return (
    <Router basename="/actividades/web">
      <AppContent />
    </Router>
  );
}

export default App;
