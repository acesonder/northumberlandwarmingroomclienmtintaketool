import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { clientsAPI, assessmentsAPI, casesAPI } from '../services/api';

function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      const [clientRes, assessmentsRes, casesRes] = await Promise.all([
        clientsAPI.getById(id),
        assessmentsAPI.getAll({ client_id: id }),
        casesAPI.getAll({ client_id: id })
      ]);

      setClient(clientRes.data.client);
      setAssessments(assessmentsRes.data.assessments || []);
      setCases(casesRes.data.cases || []);
    } catch (error) {
      console.error('Error loading client data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading client details...</div></div>;
  }

  if (!client) {
    return <div className="container"><div className="error">Client not found</div></div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/clients" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Back to Clients
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          {client.first_name} {client.last_name}
          <span className={`badge badge-${client.status === 'active' ? 'success' : 'warning'}`} style={{ marginLeft: '1rem' }}>
            {client.status}
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p><strong>Date of Birth:</strong> {client.date_of_birth ? new Date(client.date_of_birth).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Phone:</strong> {client.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {client.email || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Emergency Contact:</strong> {client.emergency_contact_name || 'N/A'}</p>
              <p><strong>Emergency Phone:</strong> {client.emergency_contact_phone || 'N/A'}</p>
              <p><strong>Consent to Share:</strong> {client.consent_to_share ? 'Yes' : 'No'}</p>
            </div>
          </div>
          {client.notes && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Notes:</strong></p>
              <p style={{ color: '#666' }}>{client.notes}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
        <div className="card">
          <div className="card-header">Assessments ({assessments.length})</div>
          <div className="card-body">
            {assessments.length > 0 ? (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map(assessment => (
                    <tr key={assessment.id}>
                      <td>{assessment.assessment_type}</td>
                      <td>
                        <span className={`badge badge-${assessment.status === 'completed' ? 'success' : 'warning'}`}>
                          {assessment.status}
                        </span>
                      </td>
                      <td>{new Date(assessment.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No assessments yet.</p>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">Cases ({cases.length})</div>
          <div className="card-body">
            {cases.length > 0 ? (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map(caseItem => (
                    <tr key={caseItem.id}>
                      <td>
                        <Link to={`/cases/${caseItem.id}`} style={{ color: '#667eea', textDecoration: 'none' }}>
                          {caseItem.title}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge badge-${caseItem.status === 'open' ? 'info' : 'success'}`}>
                          {caseItem.status}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${caseItem.priority === 'urgent' ? 'danger' : 'warning'}`}>
                          {caseItem.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No cases yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDetail;
