import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';

// Components
import Navigation from './components/Navigation';
import ScanPage from './pages/ScanPage';
import ProductsPage from './pages/ProductsPage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import AddProductPage from './pages/AddProductPage';
import PrintLabelPage from './pages/PrintLabelPage';

// Utils
import testApiConnection from './utils/apiTest';

function App() {
  useEffect(() => {
    // Test API connection on app load
    testApiConnection();
  }, []);
  return (
    <div className="App min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 pb-20">
            <Routes>
              <Route path="/" element={<Navigate to="/scan" replace />} />
              <Route path="/scan" element={<ScanPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/products/add" element={<AddProductPage />} />
              <Route path="/products/print/:code" element={<PrintLabelPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
        </div>
        <Toaster position="top-center" />
      </Router>
    </div>
  );
}

export default App;