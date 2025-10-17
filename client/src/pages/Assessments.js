import React from 'react';
import { Link } from 'react-router-dom';

function Assessments() {
  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Assessments</h2>
        <Link to="/assessments/new" className="btn btn-primary">
          + New Assessment
        </Link>
      </div>

      <div className="card">
        <div className="card-header">Smart Assessment Forms</div>
        <div className="card-body">
          <p>Assessment management system for conducting comprehensive client evaluations.</p>
          <p style={{ marginTop: '1rem' }}>Features include:</p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Intake assessments</li>
            <li>Housing needs assessment</li>
            <li>Health and wellness evaluation</li>
            <li>Employment readiness</li>
            <li>Follow-up assessments</li>
            <li>Risk level determination</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Assessments;
