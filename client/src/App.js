import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import ClientDetail from './pages/ClientDetail';
import Assessments from './pages/Assessments';
import AssessmentForm from './pages/AssessmentForm';
import Cases from './pages/Cases';
import CaseDetail from './pages/CaseDetail';
import Services from './pages/Services';
import Messages from './pages/Messages';
import Header from './components/Header';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Header user={user} onLogout={handleLogout} />}
        
        <Routes>
          <Route 
            path="/login" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Login onLogin={handleLogin} />
            } 
          />
          
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? 
              <Dashboard user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/clients"
            element={
              isAuthenticated ? 
              <Clients user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/clients/new"
            element={
              isAuthenticated ? 
              <ClientForm user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/clients/:id"
            element={
              isAuthenticated ? 
              <ClientDetail user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/assessments"
            element={
              isAuthenticated ? 
              <Assessments user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/assessments/new"
            element={
              isAuthenticated ? 
              <AssessmentForm user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/cases"
            element={
              isAuthenticated ? 
              <Cases user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/cases/:id"
            element={
              isAuthenticated ? 
              <CaseDetail user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/services"
            element={
              isAuthenticated ? 
              <Services user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route
            path="/messages"
            element={
              isAuthenticated ? 
              <Messages user={user} /> : 
              <Navigate to="/login" />
            }
          />
          
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <Navigate to="/login" />
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
