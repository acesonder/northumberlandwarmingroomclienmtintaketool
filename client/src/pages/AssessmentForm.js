import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AssessmentForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    assessment_type: 'intake',
    client_id: '',
  });

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>New Assessment</h2>

      <div className="form-container">
        <p>Assessment form builder coming soon. This will include:</p>
        <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
          <li>Dynamic form fields based on assessment type</li>
          <li>Conditional logic for smart questioning</li>
          <li>Automatic risk scoring</li>
          <li>Service recommendations based on needs</li>
        </ul>
        
        <button 
          className="btn btn-secondary" 
          style={{ marginTop: '2rem' }}
          onClick={() => navigate('/assessments')}
        >
          Back to Assessments
        </button>
      </div>
    </div>
  );
}

export default AssessmentForm;
