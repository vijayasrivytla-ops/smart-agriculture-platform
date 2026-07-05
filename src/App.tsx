import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DiseaseDetection from './pages/DiseaseDetection';
import YieldPrediction from './pages/YieldPrediction';
import SoilAnalysis from './pages/SoilAnalysis';
import FarmerChat from './pages/FarmerChat';
import Navigation from './components/Navigation';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/disease-detection" element={<DiseaseDetection />} />
        <Route path="/yield-prediction" element={<YieldPrediction />} />
        <Route path="/soil-analysis" element={<SoilAnalysis />} />
        <Route path="/farmer-chat" element={<FarmerChat />} />
      </Routes>
    </Router>
  );
}

export default App;