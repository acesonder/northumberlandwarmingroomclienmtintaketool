import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './HarmReductionOrderSuccess.css';

function HarmReductionOrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderId = location.state?.orderId;

  return (
    <div className="order-success-page">
      <div className="success-card">
        <div className="success-icon">✓</div>
        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Your harm reduction supply order has been received and will be processed soon.
        </p>

        {orderId && (
          <div className="order-info">
            <p className="order-id">Order ID: <strong>#{orderId.slice(0, 8)}</strong></p>
          </div>
        )}

        <div className="next-steps">
          <h2>What Happens Next?</h2>
          <div className="steps-list">
            <div className="step">
              <span className="step-number">1</span>
              <div className="step-content">
                <h3>Order Confirmation</h3>
                <p>Our staff will review and confirm your order within 24 hours</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <div className="step-content">
                <h3>Preparation</h3>
                <p>Your supplies will be prepared for pickup or delivery</p>
              </div>
            </div>
            <div className="step">
              <span className="step-number">3</span>
              <div className="step-content">
                <h3>Pickup/Delivery</h3>
                <p>You'll be notified when your order is ready according to your selected time slot</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-info">
          <h3>Need Help?</h3>
          <p>If you have questions about your order, please contact us:</p>
          <div className="contact-details">
            <p>📞 Emergency: Call 911</p>
            <p>☎️ Support: Available Wednesday & Friday, 5-9 PM</p>
            <p>📍 Location: Cobourg, Ontario, Canada</p>
          </div>
        </div>

        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/harm-reduction')}>
            Browse More Products
          </button>
          <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default HarmReductionOrderSuccess;
