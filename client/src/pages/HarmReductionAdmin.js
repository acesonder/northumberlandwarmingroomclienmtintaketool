import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import './HarmReductionAdmin.css';

function HarmReductionAdmin({ user }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: 'needles',
    icon: '📦',
    usage_guide: '',
    safety_info: '',
    quantity_in_stock: 0,
    reorder_level: 10
  });

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/harm-reduction/products');
      setProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load products:', err);
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/harm-reduction/orders');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/harm-reduction/products/${editingProduct.id}`, {
          ...productForm,
          is_active: 1
        });
      } else {
        await api.post('/harm-reduction/products', productForm);
      }
      
      setShowProductForm(false);
      setEditingProduct(null);
      resetProductForm();
      fetchProducts();
    } catch (err) {
      alert('Failed to save product: ' + (err.response?.data?.error || err.message));
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      description: '',
      category: 'needles',
      icon: '📦',
      usage_guide: '',
      safety_info: '',
      quantity_in_stock: 0,
      reorder_level: 10
    });
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      category: product.category,
      icon: product.icon,
      usage_guide: product.usage_guide || '',
      safety_info: product.safety_info || '',
      quantity_in_stock: product.quantity_in_stock,
      reorder_level: product.reorder_level
    });
    setShowProductForm(true);
  };

  const handleInventoryUpdate = async (productId, changeType) => {
    const quantity = prompt(`Enter quantity to ${changeType}:`);
    if (!quantity) return;

    const quantityChange = changeType === 'add' ? parseInt(quantity) : -parseInt(quantity);
    const notes = prompt('Notes (optional):') || '';

    try {
      await api.post(`/harm-reduction/products/${productId}/inventory`, {
        change_type: changeType === 'add' ? 'restock' : 'adjustment',
        quantity_change: quantityChange,
        notes
      });
      fetchProducts();
    } catch (err) {
      alert('Failed to update inventory: ' + (err.response?.data?.error || err.message));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pending', color: '#ed8936' },
      confirmed: { label: 'Confirmed', color: '#4299e1' },
      ready: { label: 'Ready', color: '#9f7aea' },
      in_transit: { label: 'In Transit', color: '#667eea' },
      completed: { label: 'Completed', color: '#48bb78' },
      cancelled: { label: 'Cancelled', color: '#f56565' }
    };
    const badge = badges[status] || badges.pending;
    return <span className="status-badge" style={{ background: badge.color }}>{badge.label}</span>;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="harm-reduction-admin">
      <div className="admin-header">
        <h1>🏥 Harm Reduction Management</h1>
        <p>Manage products, inventory, and orders</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          📦 Products & Inventory
        </button>
        <button
          className={`tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Orders ({orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length})
        </button>
        <button
          className={`tab ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Schedule
        </button>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Products & Inventory</h2>
            <button className="btn-primary" onClick={() => {
              resetProductForm();
              setEditingProduct(null);
              setShowProductForm(true);
            }}>
              + Add Product
            </button>
          </div>

          {showProductForm && (
            <div className="product-form-modal">
              <div className="modal-content">
                <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                <form onSubmit={handleCreateProduct}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Product Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={productForm.name}
                        onChange={handleProductFormChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Icon *</label>
                      <input
                        type="text"
                        name="icon"
                        value={productForm.icon}
                        onChange={handleProductFormChange}
                        placeholder="Emoji icon"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      name="category"
                      value={productForm.category}
                      onChange={handleProductFormChange}
                      required
                    >
                      <option value="needles">Needles</option>
                      <option value="safe_injection">Safe Injection</option>
                      <option value="safer_sex">Safer Sex</option>
                      <option value="overdose_prevention">Overdose Prevention</option>
                      <option value="wound_care">Wound Care</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={productForm.description}
                      onChange={handleProductFormChange}
                      rows="2"
                    />
                  </div>

                  <div className="form-group">
                    <label>Usage Guide</label>
                    <textarea
                      name="usage_guide"
                      value={productForm.usage_guide}
                      onChange={handleProductFormChange}
                      rows="4"
                      placeholder="Step-by-step usage instructions (one per line)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Safety Information</label>
                    <textarea
                      name="safety_info"
                      value={productForm.safety_info}
                      onChange={handleProductFormChange}
                      rows="2"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Initial Stock</label>
                      <input
                        type="number"
                        name="quantity_in_stock"
                        value={productForm.quantity_in_stock}
                        onChange={handleProductFormChange}
                        min="0"
                      />
                    </div>
                    <div className="form-group">
                      <label>Reorder Level</label>
                      <input
                        type="number"
                        name="reorder_level"
                        value={productForm.reorder_level}
                        onChange={handleProductFormChange}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => {
                      setShowProductForm(false);
                      setEditingProduct(null);
                    }}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      {editingProduct ? 'Update Product' : 'Create Product'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Stock</th>
                  <th>Reorder Level</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className={product.quantity_in_stock <= product.reorder_level ? 'low-stock' : ''}>
                    <td>
                      <div className="product-cell">
                        <span className="product-icon">{product.icon}</span>
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category.replace('_', ' ')}</td>
                    <td>
                      <span className={product.quantity_in_stock === 0 ? 'out-of-stock' : ''}>
                        {product.quantity_in_stock}
                      </span>
                    </td>
                    <td>{product.reorder_level}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-small" onClick={() => handleEditProduct(product)}>
                          Edit
                        </button>
                        <button className="btn-small btn-success" onClick={() => handleInventoryUpdate(product.id, 'add')}>
                          + Stock
                        </button>
                        <button className="btn-small btn-warning" onClick={() => handleInventoryUpdate(product.id, 'remove')}>
                          - Stock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Order Management</h2>
          </div>

          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div>
                    <strong>Order #{order.id.slice(0, 8)}</strong>
                    {getStatusBadge(order.status)}
                    <span className="order-type">{order.order_type === 'pickup' ? '🏪 Pickup' : '🚗 Delivery'}</span>
                  </div>
                  <div className="order-date">
                    {new Date(order.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="order-details">
                  {order.first_name && (
                    <p>Client: {order.first_name} {order.last_name}</p>
                  )}
                  <p>Items: {order.total_items}</p>
                  {order.fulfillment_date && (
                    <p>Scheduled: {new Date(order.fulfillment_date).toLocaleDateString()} {order.fulfillment_time_slot}</p>
                  )}
                  {order.delivery_address && (
                    <p>Address: {order.delivery_address}</p>
                  )}
                </div>
                <div className="order-actions">
                  <button className="btn-small" onClick={() => navigate(`/harm-reduction/orders/${order.id}`)}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="no-data">No orders yet</div>
            )}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="tab-content">
          <div className="content-header">
            <h2>Staff Availability</h2>
            <button className="btn-primary" onClick={() => navigate('/harm-reduction/schedule')}>
              Manage Schedule
            </button>
          </div>
          <div className="schedule-info">
            <p>Current schedule: Wednesday and Friday, 5:00 PM - 9:00 PM</p>
            <p>Location: Cobourg, Ontario, Canada</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default HarmReductionAdmin;
