import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './HarmReductionCheckout.css';

function HarmReductionCheckout({ user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [cart, setCart] = useState(location.state?.cart || []);
  const [clients, setClients] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    client_id: '',
    order_type: 'pickup',
    fulfillment_date: '',
    fulfillment_time_slot: '',
    delivery_address: '',
    delivery_notes: ''
  });

  useEffect(() => {
    fetchClients();
    fetchAvailability();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      console.error('Failed to load clients:', err);
    }
  };

  const fetchAvailability = async () => {
    try {
      const response = await api.get('/harm-reduction/availability?active_only=true');
      setAvailability(response.data);
    } catch (err) {
      console.error('Failed to load availability:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getAvailableDays = () => {
    const days = [...new Set(availability.map(a => a.day_of_week))];
    return days;
  };

  const getTimeSlots = () => {
    if (!formData.fulfillment_date) return [];
    
    const date = new Date(formData.fulfillment_date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    return availability
      .filter(a => a.day_of_week === dayName)
      .map(a => `${a.start_time} - ${a.end_time}`);
  };

  const getNextAvailableDate = (dayOfWeek) => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDay = days.indexOf(dayOfWeek);
    const today = new Date();
    const currentDay = today.getDay();
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }
    
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + daysToAdd);
    return nextDate.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        ...formData,
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          notes: ''
        }))
      };

      const response = await api.post('/harm-reduction/orders', orderData);
      
      // Clear cart
      setCart([]);
      sessionStorage.removeItem('hrCart');
      
      // Navigate to success page
      navigate('/harm-reduction/order-success', { 
        state: { orderId: response.data.id } 
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order');
      setLoading(false);
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Your order is empty</h2>
          <p>Add products to your order to continue</p>
          <button onClick={() => navigate('/harm-reduction')}>
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Complete Your Order</h1>
        <p>Select pickup or delivery options</p>
      </div>

      <div className="checkout-content">
        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>
          <div className="summary-items">
            {cart.map(item => (
              <div key={item.product_id} className="summary-item">
                <span className="item-icon">{item.product.icon}</span>
                <span className="item-name">{item.product.name}</span>
                <span className="item-quantity">x{item.quantity}</span>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <strong>Total Items: {getTotalItems()}</strong>
          </div>
        </div>

        {/* Order Form */}
        <form className="order-form" onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {/* Client Selection */}
          <div className="form-group">
            <label>Client (Optional)</label>
            <select
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
            >
              <option value="">Anonymous / Walk-in</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.first_name} {client.last_name}
                </option>
              ))}
            </select>
            <small>Select a client if ordering on their behalf</small>
          </div>

          {/* Order Type */}
          <div className="form-group">
            <label>Fulfillment Method *</label>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="order_type"
                  value="pickup"
                  checked={formData.order_type === 'pickup'}
                  onChange={handleInputChange}
                  required
                />
                <div className="radio-content">
                  <span className="radio-icon">🏪</span>
                  <div>
                    <strong>Pickup</strong>
                    <p>Pick up your order at our location</p>
                  </div>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="order_type"
                  value="delivery"
                  checked={formData.order_type === 'delivery'}
                  onChange={handleInputChange}
                  required
                />
                <div className="radio-content">
                  <span className="radio-icon">🚗</span>
                  <div>
                    <strong>Delivery</strong>
                    <p>We'll deliver to your location</p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Available Days Info */}
          <div className="availability-info">
            <h3>📅 Available Days</h3>
            <div className="available-days">
              {getAvailableDays().map(day => (
                <span key={day} className="day-badge">
                  {day.charAt(0).toUpperCase() + day.slice(1)}
                </span>
              ))}
            </div>
            <p className="info-text">
              Services available on the days shown above, 5:00 PM - 9:00 PM in Cobourg, Ontario
            </p>
          </div>

          {/* Date Selection */}
          <div className="form-group">
            <label>Preferred Date *</label>
            <input
              type="date"
              name="fulfillment_date"
              value={formData.fulfillment_date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {getAvailableDays().length > 0 && (
              <div className="quick-dates">
                {getAvailableDays().map(day => (
                  <button
                    key={day}
                    type="button"
                    className="quick-date-btn"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      fulfillment_date: getNextAvailableDate(day)
                    }))}
                  >
                    Next {day.charAt(0).toUpperCase() + day.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Time Slot */}
          {formData.fulfillment_date && getTimeSlots().length > 0 && (
            <div className="form-group">
              <label>Time Slot *</label>
              <select
                name="fulfillment_time_slot"
                value={formData.fulfillment_time_slot}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a time</option>
                {getTimeSlots().map(slot => (
                  <option key={slot} value={slot}>{slot}</option>
                ))}
              </select>
            </div>
          )}

          {/* Delivery Address */}
          {formData.order_type === 'delivery' && (
            <>
              <div className="form-group">
                <label>Delivery Address *</label>
                <textarea
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleInputChange}
                  required={formData.order_type === 'delivery'}
                  rows="3"
                  placeholder="Enter your full delivery address"
                />
              </div>

              <div className="form-group">
                <label>Delivery Notes</label>
                <textarea
                  name="delivery_notes"
                  value={formData.delivery_notes}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Special instructions, buzzer code, etc."
                />
              </div>
            </>
          )}

          {/* Submit */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate('/harm-reduction')}
            >
              Back to Catalog
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HarmReductionCheckout;
