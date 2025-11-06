import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css'; // Your global styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* Provides routing to the whole app */}
    <BrowserRouter>
      {/* Provides auth state to the whole app */}
      <AuthProvider>
        <App />
        {/* Provides pop-up notifications */}
        <Toaster position="bottom-right" />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);