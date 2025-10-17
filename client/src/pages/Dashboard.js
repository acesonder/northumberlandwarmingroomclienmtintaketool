import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI, casesAPI, assessmentsAPI, messagesAPI } from '../services/api';

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalClients: 0,
    activeClients: 0,
    openCases: 0,
    pendingAssessments: 0,
    unreadMessages: 0
  });
  const [recentClients, setRecentClients] = useState([]);
  const [recentCases, setRecentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [clientsRes, casesRes, assessmentsRes, messagesRes] = await Promise.all([
        clientsAPI.getAll(),
        casesAPI.getAll({ status: 'open' }),
        assessmentsAPI.getAll({ status: 'draft' }),
        messagesAPI.getUnreadCount()
      ]);

      const allClients = clientsRes.data.clients || [];
      const activeClients = allClients.filter(c => c.status === 'active');

      setStats({
        totalClients: allClients.length,
        activeClients: activeClients.length,
        openCases: casesRes.data.count || 0,
        pendingAssessments: assessmentsRes.data.count || 0,
        unreadMessages: messagesRes.data.unread_count || 0
      });

      setRecentClients(allClients.slice(0, 5));
      setRecentCases((casesRes.data.cases || []).slice(0, 5));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading dashboard...</div></div>;
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem', color: '#333' }}>
        Welcome back, {user.full_name}
      </h2>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-label">Total Clients</div>
          <div className="stat-value">{stats.totalClients}</div>
          <Link to="/clients" style={{ color: '#667eea', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-label">Active Clients</div>
          <div className="stat-value">{stats.activeClients}</div>
          <Link to="/clients?status=active" style={{ color: '#667eea', textDecoration: 'none' }}>
            View Active →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-label">Open Cases</div>
          <div className="stat-value">{stats.openCases}</div>
          <Link to="/cases?status=open" style={{ color: '#667eea', textDecoration: 'none' }}>
            View Cases →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Assessments</div>
          <div className="stat-value">{stats.pendingAssessments}</div>
          <Link to="/assessments?status=draft" style={{ color: '#667eea', textDecoration: 'none' }}>
            View Assessments →
          </Link>
        </div>

        <div className="stat-card">
          <div className="stat-label">Unread Messages</div>
          <div className="stat-value">{stats.unreadMessages}</div>
          <Link to="/messages" style={{ color: '#667eea', textDecoration: 'none' }}>
            View Messages →
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div className="card">
          <div className="card-header">Recent Clients</div>
          <div className="card-body">
            {recentClients.length > 0 ? (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentClients.map(client => (
                    <tr key={client.id}>
                      <td>
                        <Link to={`/clients/${client.id}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                          {client.first_name} {client.last_name}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-${client.status === 'active' ? 'success' : 'warning'}`}>
                          {client.status}
                        </span>
                      </td>
                      <td>{new Date(client.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No clients yet. <Link to="/clients/new">Add your first client</Link></p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Recent Cases</div>
          <div className="card-body">
            {recentCases.length > 0 ? (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Client</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCases.map(caseItem => (
                    <tr key={caseItem.id}>
                      <td>
                        <Link to={`/cases/${caseItem.id}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                          {caseItem.title}
                        </Link>
                      </td>
                      <td>{caseItem.first_name} {caseItem.last_name}</td>
                      <td>
                        <span className={`badge badge-${
                          caseItem.priority === 'urgent' ? 'danger' : 
                          caseItem.priority === 'high' ? 'warning' : 'info'
                        }`}>
                          {caseItem.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No cases yet. <Link to="/cases">Create a case</Link></p>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }} className="card">
        <div className="card-header">Quick Actions</div>
        <div className="card-body" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/clients/new" className="btn btn-primary">
            + New Client
          </Link>
          <Link to="/assessments/new" className="btn btn-primary">
            + New Assessment
          </Link>
          <Link to="/services" className="btn btn-secondary">
            View Services
          </Link>
          <Link to="/messages" className="btn btn-secondary">
            Messages
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
