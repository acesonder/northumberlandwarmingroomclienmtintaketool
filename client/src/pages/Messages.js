import React, { useState, useEffect } from 'react';
import { messagesAPI } from '../services/api';

function Messages({ user }) {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const [inboxRes, countRes] = await Promise.all([
        messagesAPI.getInbox(),
        messagesAPI.getUnreadCount()
      ]);
      
      setMessages(inboxRes.data.messages || []);
      setUnreadCount(countRes.data.unread_count || 0);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container"><div className="loading">Loading messages...</div></div>;
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '2rem' }}>
        Messages
        {unreadCount > 0 && (
          <span className="badge badge-danger" style={{ marginLeft: '1rem' }}>
            {unreadCount} unread
          </span>
        )}
      </h2>

      <div className="card">
        <div className="card-header">Communication System</div>
        <div className="card-body">
          <p>Secure messaging platform for communication between:</p>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Outreach staff and case managers</li>
            <li>Service providers and coordinators</li>
            <li>Team members working on shared cases</li>
          </ul>
          
          <div style={{ marginTop: '2rem' }}>
            {messages.length > 0 ? (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>From</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {messages.map(msg => (
                    <tr key={msg.id} style={{ fontWeight: msg.is_read ? 'normal' : 'bold' }}>
                      <td>{msg.sender_name}</td>
                      <td>{msg.subject || '(No subject)'}</td>
                      <td>{new Date(msg.sent_at).toLocaleString()}</td>
                      <td>
                        {msg.is_read ? (
                          <span className="badge badge-success">Read</span>
                        ) : (
                          <span className="badge badge-warning">Unread</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No messages yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Messages;
