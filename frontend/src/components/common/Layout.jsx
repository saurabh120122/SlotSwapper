import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// This is a basic "shell" for your app (e.g., Navbar + Page Content)
const Layout = () => {
  const { isLoggedIn, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="app-container">
      <nav style={{ padding: '1rem', background: '#eee', display: 'flex', gap: '1rem' }}>
        <Link to={isLoggedIn ? "/dashboard" : "/"}>Home</Link>
        {isLoggedIn ? (
          <>
            <Link to="/marketplace">Marketplace</Link>
            <Link to="/requests">My Requests</Link>
            <span>Hi, {user.name}!</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
      <main>
        {/* <Outlet> is where React Router will render the current page */}
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;