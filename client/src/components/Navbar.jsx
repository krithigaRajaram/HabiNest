import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">HabiNest</span>
        <div className="navbar-right">
          {user && (
            <span className="navbar-username">
              Hey, <span>{user.username}</span>
            </span>
          )}
          <button className="navbar-logout-btn" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;