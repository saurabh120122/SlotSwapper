import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';

// --- Import all your pages ---
// (We will create placeholder files for these next)
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MarketplacePage from './pages/MarketplacePage';
import RequestsPage from './pages/RequestsPage';
import NotFoundPage from './pages/NotFoundPage'; // A 404 page

function App() {
  return (
    <Routes>
      {/* All routes are nested inside the Layout (which has the navbar) */}
      <Route path="/" element={<Layout />}>
        
        {/* --- Public Routes --- */}
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        
        {/* --- Protected Routes --- */}
        {/* Routes inside here are "guarded" by ProtectedRoute */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardPage />} /> {/* Default page after login */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="requests" element={<RequestsPage />} />
          {/* Add more private routes here */}
        </Route>

        {/* --- 404 Catch-all --- */}
        <Route path="*" element={<NotFoundPage />} />

      </Route>
    </Routes>
  );
}

export default App;