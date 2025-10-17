import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientsAPI } from '../services/api';

function ClientForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    phone: '',
    email: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    consent_to_share: false,
    notes: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await clientsAPI.create(formData);
      setSuccess('Client created successfully!');
      setTimeout(() => navigate('/clients'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>New Client Intake</h2>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <form onSubmit={handleSubmit} className="form-container">
        <h3 style={{ marginBottom: '1.5rem', color: '#555' }}>Personal Information</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="first_name">First Name *</label>
            <input
              type="text"
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name *</label>
            <input
              type="text"
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date_of_birth">Date of Birth</label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <h3 style={{ marginTop: '2rem', marginBottom: '1.5rem', color: '#555' }}>Emergency Contact</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="form-group">
            <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
            <input
              type="text"
              id="emergency_contact_name"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
            <input
              type="tel"
              id="emergency_contact_phone"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes about the client..."
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="consent_to_share"
              checked={formData.consent_to_share}
              onChange={handleChange}
              style={{ marginRight: '0.5rem', width: 'auto' }}
            />
            Client consents to share information with service providers
          </label>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/clients')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ClientForm;
