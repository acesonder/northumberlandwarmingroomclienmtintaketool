import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { casesAPI } from '../services/api';

function Cases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadCases();
  }, [statusFilter]);

  const loadCases = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      
      const response = await casesAPI.getAll(params);
      setCases(response.data.cases || []);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading cases...</div></div>;
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Case Management</h2>

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <div className="form-group" style={{ marginBottom: 0, maxWidth: '300px' }}>
          <label htmlFor="status">Filter by Status</label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        {cases.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Client</th>
                <th>Case Manager</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Opened</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map(caseItem => (
                <tr key={caseItem.id}>
                  <td>
                    <Link to={`/cases/${caseItem.id}`} style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                      {caseItem.title}
                    </Link>
                  </td>
                  <td>{caseItem.first_name} {caseItem.last_name}</td>
                  <td>{caseItem.case_manager_name}</td>
                  <td>
                    <span className={`badge badge-${
                      caseItem.priority === 'urgent' ? 'danger' : 
                      caseItem.priority === 'high' ? 'warning' : 'info'
                    }`}>
                      {caseItem.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${
                      caseItem.status === 'open' ? 'info' : 
                      caseItem.status === 'closed' ? 'success' : 'warning'
                    }`}>
                      {caseItem.status}
                    </span>
                  </td>
                  <td>{new Date(caseItem.opened_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/cases/${caseItem.id}`} style={{ color: '#667eea' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No cases found.</p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
        Total: {cases.length} case(s)
      </div>
    </div>
  );
}

export default Cases;
