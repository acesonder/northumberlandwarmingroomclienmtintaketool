import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header({ user, onLogout }) {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div>
          <h1 className="app-title">HWRCIT</h1>
          <p className="app-subtitle">Warming Room Client Intake Tool</p>
        </div>
        
        <nav>
          <ul className="nav-menu">
            <li>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/clients" className={`nav-link ${isActive('/clients')}`}>
                Clients
              </Link>
            </li>
            <li>
              <Link to="/assessments" className={`nav-link ${isActive('/assessments')}`}>
                Assessments
              </Link>
            </li>
            <li>
              <Link to="/cases" className={`nav-link ${isActive('/cases')}`}>
                Cases
              </Link>
            </li>
            <li>
              <Link to="/services" className={`nav-link ${isActive('/services')}`}>
                Services
              </Link>
            </li>
            <li>
              <Link to="/messages" className={`nav-link ${isActive('/messages')}`}>
                Messages
              </Link>
            </li>
          </ul>
        </nav>
        
        <div>
          <span style={{ marginRight: '1rem' }}>
            {user?.full_name} ({user?.role})
          </span>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
