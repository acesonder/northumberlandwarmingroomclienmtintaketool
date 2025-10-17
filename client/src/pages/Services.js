import React from 'react';

function Services() {
  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>Service Directory</h2>

      <div className="card">
        <div className="card-header">Available Services</div>
        <div className="card-body">
          <p>Comprehensive service directory for connecting clients with needed resources.</p>
          <p style={{ marginTop: '1rem' }}>Service categories include:</p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Housing assistance and emergency shelter</li>
            <li>Food banks and meal programs</li>
            <li>Health and medical services</li>
            <li>Employment and training programs</li>
            <li>Counseling and mental health support</li>
            <li>Legal aid services</li>
            <li>Other community resources</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            Features include service matching, referral tracking, and outcome monitoring.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Services;
