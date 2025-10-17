import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './HarmReductionOrderDetail.css';

function HarmReductionOrderDetail({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/harm-reduction/orders/${id}`);
      setOrder(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load order details');
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      await api.patch(`/harm-reduction/orders/${id}/status`, {
        status: newStatus,
        assigned_to: user.id
      });
      fetchOrder();
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.error || err.message));
    }
  };

  const fulfillItem = async (itemId, fulfilledQuantity) => {
    try {
      await api.patch(`/harm-reduction/orders/${id}/items/${itemId}/fulfill`, {
        fulfilled_quantity: fulfilledQuantity
      });
      fetchOrder();
    } catch (err) {
      alert('Failed to fulfill item: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ed8936',
      confirmed: '#4299e1',
      ready: '#9f7aea',
      in_transit: '#667eea',
      completed: '#48bb78',
      cancelled: '#f56565'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (error || !order) {
    return (
      <div className="error-container">
        <p>{error || 'Order not found'}</p>
        <button onClick={() => navigate('/harm-reduction/admin')}>Back to Admin</button>
      </div>
    );
  }

  const canManageOrder = user && (user.role === 'admin' || user.role === 'staff');

  return (
    <div className="order-detail-page">
      <button className="btn-back" onClick={() => navigate('/harm-reduction/admin')}>
        ← Back to Admin
      </button>

      <div className="order-detail-card">
        <div className="order-header">
          <div>
            <h1>Order #{order.id.slice(0, 8)}</h1>
            <div className="order-meta">
              <span className="status-badge" style={{ background: getStatusColor(order.status) }}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className="order-type">
                {order.order_type === 'pickup' ? '🏪 Pickup' : '🚗 Delivery'}
              </span>
              <span className="order-date">
                Created: {new Date(order.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="info-section">
          <h2>Client Information</h2>
          {order.first_name ? (
            <div className="info-grid">
              <div className="info-item">
                <label>Name</label>
                <p>{order.first_name} {order.last_name}</p>
              </div>
              {order.phone && (
                <div className="info-item">
                  <label>Phone</label>
                  <p>{order.phone}</p>
                </div>
              )}
              {order.email && (
                <div className="info-item">
                  <label>Email</label>
                  <p>{order.email}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="anonymous">Anonymous / Walk-in client</p>
          )}
        </div>

        {/* Fulfillment Details */}
        <div className="info-section">
          <h2>Fulfillment Details</h2>
          <div className="info-grid">
            {order.fulfillment_date && (
              <div className="info-item">
                <label>Scheduled Date</label>
                <p>{new Date(order.fulfillment_date).toLocaleDateString()}</p>
              </div>
            )}
            {order.fulfillment_time_slot && (
              <div className="info-item">
                <label>Time Slot</label>
                <p>{order.fulfillment_time_slot}</p>
              </div>
            )}
            {order.delivery_address && (
              <div className="info-item full-width">
                <label>Delivery Address</label>
                <p>{order.delivery_address}</p>
              </div>
            )}
            {order.delivery_notes && (
              <div className="info-item full-width">
                <label>Delivery Notes</label>
                <p>{order.delivery_notes}</p>
              </div>
            )}
            {order.assigned_to_name && (
              <div className="info-item">
                <label>Assigned To</label>
                <p>{order.assigned_to_name}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="info-section">
          <h2>Order Items</h2>
          <div className="items-list">
            {order.items && order.items.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <span className="item-icon">{item.icon}</span>
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>Requested: {item.quantity} | Fulfilled: {item.fulfilled_quantity || 0}</p>
                  </div>
                </div>
                {canManageOrder && order.status !== 'completed' && order.status !== 'cancelled' && (
                  <div className="item-actions">
                    <button
                      className="btn-small btn-success"
                      onClick={() => {
                        const qty = prompt(`Fulfill how many items? (Max: ${item.quantity})`);
                        if (qty && parseInt(qty) > 0) {
                          fulfillItem(item.id, parseInt(qty));
                        }
                      }}
                    >
                      Fulfill
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Status Management */}
        {canManageOrder && order.status !== 'completed' && order.status !== 'cancelled' && (
          <div className="info-section">
            <h2>Order Management</h2>
            <div className="status-actions">
              {order.status === 'pending' && (
                <button className="btn-action" onClick={() => updateOrderStatus('confirmed')}>
                  ✓ Confirm Order
                </button>
              )}
              {order.status === 'confirmed' && (
                <button className="btn-action" onClick={() => updateOrderStatus('ready')}>
                  📦 Mark as Ready
                </button>
              )}
              {order.status === 'ready' && order.order_type === 'delivery' && (
                <button className="btn-action" onClick={() => updateOrderStatus('in_transit')}>
                  🚗 Start Delivery
                </button>
              )}
              {(order.status === 'ready' || order.status === 'in_transit') && (
                <button className="btn-action btn-success" onClick={() => updateOrderStatus('completed')}>
                  ✓ Complete Order
                </button>
              )}
              <button className="btn-action btn-danger" onClick={() => {
                const reason = prompt('Reason for cancellation:');
                if (reason) {
                  api.patch(`/harm-reduction/orders/${id}/status`, {
                    status: 'cancelled',
                    cancelled_reason: reason
                  }).then(() => fetchOrder());
                }
              }}>
                ✗ Cancel Order
              </button>
            </div>
          </div>
        )}

        {order.cancelled_reason && (
          <div className="info-section">
            <h2>Cancellation Reason</h2>
            <p className="cancellation-reason">{order.cancelled_reason}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HarmReductionOrderDetail;
