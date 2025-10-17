import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './HarmReductionProductDetail.css';

function HarmReductionProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/harm-reduction/products/${id}`);
      setProduct(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load product details');
      setLoading(false);
    }
  };

  const addToOrder = () => {
    // Store in sessionStorage and redirect to catalog
    const cart = JSON.parse(sessionStorage.getItem('hrCart') || '[]');
    const existing = cart.find(item => item.product_id === product.id);
    
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ product_id: product.id, product, quantity: 1 });
    }
    
    sessionStorage.setItem('hrCart', JSON.stringify(cart));
    navigate('/harm-reduction');
  };

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <p>{error || 'Product not found'}</p>
        <button onClick={() => navigate('/harm-reduction')}>Back to Catalog</button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <button className="btn-back" onClick={() => navigate('/harm-reduction')}>
        ← Back to Catalog
      </button>

      <div className="product-detail-card">
        <div className="product-header">
          <div className="product-icon-large">{product.icon}</div>
          <div className="product-info">
            <h1>{product.name}</h1>
            <p className="product-category">
              Category: {product.category.replace('_', ' ').toUpperCase()}
            </p>
            <div className="product-stock-status">
              {product.quantity_in_stock > 0 ? (
                <span className="in-stock">✓ Available ({product.quantity_in_stock} in stock)</span>
              ) : (
                <span className="out-of-stock">✗ Currently Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        <div className="product-description-section">
          <h2>Description</h2>
          <p>{product.description}</p>
        </div>

        {product.usage_guide && (
          <div className="product-guide-section">
            <h2>📋 Usage Guide</h2>
            <div className="guide-content">
              {product.usage_guide.split('\n').map((line, index) => (
                <p key={index} className="guide-step">{line}</p>
              ))}
            </div>
          </div>
        )}

        {product.safety_info && (
          <div className="product-safety-section">
            <h2>⚠️ Safety Information</h2>
            <div className="safety-content">
              <p>{product.safety_info}</p>
            </div>
          </div>
        )}

        <div className="product-actions">
          <button
            className="btn-add-to-order"
            onClick={addToOrder}
            disabled={product.quantity_in_stock === 0}
          >
            {product.quantity_in_stock > 0 ? 'Add to Order' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <div className="help-section">
        <h3>Need Help?</h3>
        <p>If you have questions about this product or need assistance, please contact our outreach team.</p>
        <div className="help-info">
          <p>📞 Emergency: Call 911</p>
          <p>☎️ Support Line: Available Wednesday & Friday 5-9 PM</p>
          <p>📍 Location: Cobourg, Ontario, Canada</p>
        </div>
      </div>
    </div>
  );
}

export default HarmReductionProductDetail;
