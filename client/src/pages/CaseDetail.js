import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { casesAPI } from '../services/api';

function CaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    loadCaseData();
  }, [id]);

  const loadCaseData = async () => {
    try {
      const response = await casesAPI.getById(id);
      setCaseData(response.data.case);
      setNotes(response.data.notes || []);
    } catch (error) {
      console.error('Error loading case data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      await casesAPI.addNote(id, { note: newNote });
      setNewNote('');
      loadCaseData();
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading case details...</div></div>;
  }

  if (!caseData) {
    return <div className="container"><div className="error">Case not found</div></div>;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/cases" style={{ color: '#667eea', textDecoration: 'none' }}>
          ← Back to Cases
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          {caseData.title}
          <span className={`badge badge-${caseData.status === 'open' ? 'info' : 'success'}`} style={{ marginLeft: '1rem' }}>
            {caseData.status}
          </span>
          <span className={`badge badge-${caseData.priority === 'urgent' ? 'danger' : 'warning'}`} style={{ marginLeft: '0.5rem' }}>
            {caseData.priority}
          </span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <p><strong>Client:</strong> {caseData.first_name} {caseData.last_name}</p>
              <p><strong>Phone:</strong> {caseData.phone || 'N/A'}</p>
              <p><strong>Email:</strong> {caseData.email || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Case Manager:</strong> {caseData.case_manager_name}</p>
              <p><strong>Opened:</strong> {new Date(caseData.opened_at).toLocaleDateString()}</p>
              {caseData.closed_at && (
                <p><strong>Closed:</strong> {new Date(caseData.closed_at).toLocaleDateString()}</p>
              )}
            </div>
          </div>
          {caseData.description && (
            <div style={{ marginTop: '1rem' }}>
              <p><strong>Description:</strong></p>
              <p style={{ color: '#666' }}>{caseData.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-header">Case Notes</div>
        <div className="card-body">
          <form onSubmit={handleAddNote} style={{ marginBottom: '2rem' }}>
            <div className="form-group">
              <label htmlFor="newNote">Add Note</label>
              <textarea
                id="newNote"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter case note..."
                rows="3"
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={addingNote}>
              {addingNote ? 'Adding...' : 'Add Note'}
            </button>
          </form>

          {notes.length > 0 ? (
            notes.map(note => (
              <div key={note.id} style={{ 
                padding: '1rem', 
                background: '#f8f9fa', 
                borderRadius: '5px', 
                marginBottom: '1rem' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <strong>{note.author_name}</strong>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
                <p style={{ color: '#555' }}>{note.note}</p>
              </div>
            ))
          ) : (
            <p>No notes yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CaseDetail;
