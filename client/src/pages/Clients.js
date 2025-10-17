import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clientsAPI } from '../services/api';

function Clients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadClients();
  }, [statusFilter]);

  const loadClients = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const response = await clientsAPI.getAll(params);
      setClients(response.data.clients || []);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadClients();
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading clients...</div></div>;
  }

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Client Management</h2>
        <Link to="/clients/new" className="btn btn-primary">
          + New Client
        </Link>
      </div>

      <div className="form-container" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="search">Search</label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or email..."
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <button onClick={handleSearch} className="btn btn-primary">
            Search
          </button>
        </div>
      </div>

      <div className="table-container">
        {clients.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Date of Birth</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(client => (
                <tr key={client.id}>
                  <td>
                    <Link to={`/clients/${client.id}`} style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                      {client.first_name} {client.last_name}
                    </Link>
                  </td>
                  <td>{client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'N/A'}</td>
                  <td>{client.phone || 'N/A'}</td>
                  <td>{client.email || 'N/A'}</td>
                  <td>
                    <span className={`badge badge-${
                      client.status === 'active' ? 'success' : 
                      client.status === 'inactive' ? 'warning' : 'info'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td>{new Date(client.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/clients/${client.id}`} style={{ color: '#667eea' }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No clients found.</p>
            <Link to="/clients/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              Add First Client
            </Link>
          </div>
        )}
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center', color: '#666' }}>
        Total: {clients.length} client(s)
      </div>
    </div>
  );
}

export default Clients;
