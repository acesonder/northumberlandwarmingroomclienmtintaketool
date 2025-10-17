import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './HarmReductionCatalog.css';

function HarmReductionCatalog({ user }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const categories = [
    { value: 'all', label: 'All Products', icon: '🛍️' },
    { value: 'needles', label: 'Needles', icon: '💉' },
    { value: 'safe_injection', label: 'Safe Injection', icon: '🧼' },
    { value: 'safer_sex', label: 'Safer Sex', icon: '🛡️' },
    { value: 'overdose_prevention', label: 'Overdose Prevention', icon: '🚑' },
    { value: 'wound_care', label: 'Wound Care', icon: '🩹' },
    { value: 'other', label: 'Other', icon: '📦' }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/harm-reduction/products?active_only=true');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  };

  const addToCart = (product) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product_id: product.id, product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setCart(cart.filter(item => item.product_id !== productId));
    } else {
      setCart(cart.map(item =>
        item.product_id === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }
    navigate('/harm-reduction/checkout', { state: { cart } });
  };

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  return (
    <div className="harm-reduction-catalog">
      <div className="catalog-header">
        <h1>🌟 Harm Reduction Supplies</h1>
        <p className="subtitle">Safe, confidential, and free supplies for the community</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Category Filter */}
      <div className="category-filter">
        {categories.map(cat => (
          <button
            key={cat.value}
            className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
            onClick={() => setSelectedCategory(cat.value)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-label">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-icon">{product.icon}</div>
            <h3 className="product-name">{product.name}</h3>
            <p className="product-description">{product.description}</p>
            
            <div className="product-stock">
              {product.quantity_in_stock > 0 ? (
                <span className="in-stock">✓ In Stock ({product.quantity_in_stock})</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            <div className="product-actions">
              <button 
                className="btn-details"
                onClick={() => navigate(`/harm-reduction/products/${product.id}`)}
              >
                View Details
              </button>
              <button
                className="btn-add-cart"
                onClick={() => addToCart(product)}
                disabled={product.quantity_in_stock === 0}
              >
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <p>No products found in this category.</p>
        </div>
      )}

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="floating-cart">
          <button className="cart-button" onClick={proceedToCheckout}>
            <span className="cart-icon">🛒</span>
            <span className="cart-count">{getTotalItems()}</span>
            <span className="cart-text">View Order</span>
          </button>
        </div>
      )}

      {/* Cart Preview */}
      {cart.length > 0 && (
        <div className="cart-preview">
          <h3>Your Order</h3>
          {cart.map(item => (
            <div key={item.product_id} className="cart-item">
              <span className="cart-item-icon">{item.product.icon}</span>
              <span className="cart-item-name">{item.product.name}</span>
              <div className="cart-item-controls">
                <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
              </div>
            </div>
          ))}
          <button className="btn-checkout" onClick={proceedToCheckout}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  );
}

export default HarmReductionCatalog;
