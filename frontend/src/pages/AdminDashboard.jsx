import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders'

  // Products State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  // Product Form Modal State (for Create & Edit)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    stock: '',
    imageUrl: '',
    description: '',
  });
  const [formError, setFormError] = useState(null);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Product Delete Confirmation Modal State
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Fetch Products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductError(null);
    try {
      const response = await axiosInstance.get('/products');
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setProductError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    setOrderError(null);
    try {
      const response = await axiosInstance.get('/orders/admin/all');
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
    } else {
      fetchOrders();
    }
  }, [activeTab]);

  // Product Form Handlers
  const handleOpenCreate = () => {
    setEditingProductId(null);
    setFormData({
      name: '',
      category: '',
      price: '',
      stock: '',
      imageUrl: '',
      description: '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProductId(prod._id);
    setFormData({
      name: prod.name || '',
      category: prod.category || '',
      price: prod.price !== undefined ? String(prod.price) : '',
      stock: prod.stock !== undefined ? String(prod.stock) : '',
      imageUrl: prod.imageUrl || '',
      description: prod.description || '',
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setFormError(null);

    const priceNum = Number(formData.price);
    const stockNum = Number(formData.stock);

    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setFormError('Price must be a valid number greater than or equal to 0.');
      return;
    }
    if (!Number.isInteger(stockNum) || stockNum < 0) {
      setFormError('Stock must be a valid integer greater than or equal to 0.');
      return;
    }

    setSubmittingProduct(true);
    try {
      const payload = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        price: priceNum,
        stock: stockNum,
        imageUrl: formData.imageUrl.trim(),
        description: formData.description.trim(),
      };

      if (editingProductId) {
        await axiosInstance.put(`/products/${editingProductId}`, payload);
      } else {
        await axiosInstance.post('/products', payload);
      }

      setIsFormOpen(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await axiosInstance.delete(`/products/${deletingProduct._id}`);
      setDeletingProduct(null);
      fetchProducts();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  // Order Status Update Handler
  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    setOrderError(null);
    try {
      await axiosInstance.put(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      setOrderError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <div className="admin-dashboard-page stride-container" style={{ paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-64)' }}>
      <header className="admin-header">
        <div>
          <h1 className="page-title" style={{ margin: 0 }}>Admin Control Panel</h1>
          <p className="text-meta" style={{ marginTop: 'var(--space-8)' }}>
            Manage product inventory and monitor order fulfillment.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="admin-tabs">
          <button
            className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products Catalog
          </button>
          <button
            className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Store Orders
          </button>
        </div>
      </header>

      {/* PRODUCTS TAB */}
      {activeTab === 'products' && (
        <section className="admin-section">
          <div className="admin-action-bar">
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              Products ({products.length})
            </h2>
            <button onClick={handleOpenCreate} className="btn btn-primary btn-sm">
              + Add New Product
            </button>
          </div>

          {productError && (
            <div className="state-banner error-banner">
              <p>{productError}</p>
            </div>
          )}

          {loadingProducts ? (
            <div className="state-banner empty-banner">
              <p>Loading products catalog...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="state-banner empty-banner">
              <p>No products found in database.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod._id}>
                      <td>
                        <div className="admin-prod-cell">
                          <img
                            src={prod.imageUrl || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23f7f7f5"/></svg>'}
                            alt={prod.name}
                            className="admin-prod-thumb"
                          />
                          <div>
                            <span className="admin-prod-name">{prod.name}</span>
                            <span className="admin-prod-id">ID: {prod._id}</span>
                          </div>
                        </div>
                      </td>
                      <td>{prod.category || 'Uncategorized'}</td>
                      <td>₹{typeof prod.price === 'number' ? prod.price.toLocaleString('en-IN') : prod.price}</td>
                      <td>
                        <span className={`admin-stock-badge ${prod.stock <= 0 ? 'out' : ''}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div className="admin-actions-cell">
                          <button
                            onClick={() => handleOpenEdit(prod)}
                            className="btn btn-secondary btn-xs"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeletingProduct(prod)}
                            className="btn btn-danger btn-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <section className="admin-section">
          <div className="admin-action-bar">
            <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>
              Store Orders ({orders.length})
            </h2>
          </div>

          {orderError && (
            <div className="state-banner error-banner">
              <p>{orderError}</p>
            </div>
          )}

          {loadingOrders ? (
            <div className="state-banner empty-banner">
              <p>Loading store orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="state-banner empty-banner">
              <p>No orders placed yet.</p>
            </div>
          ) : (
            <div className="admin-orders-list">
              {orders.map((ord) => (
                <div key={ord._id} className="admin-order-card">
                  <div className="admin-order-header">
                    <div>
                      <span className="admin-order-id">Order #{ord._id}</span>
                      <span className="admin-order-user">
                        Customer: {ord.userId?.name || 'Guest'} ({ord.userId?.email || 'N/A'})
                      </span>
                      <span className="admin-order-date">
                        Date: {new Date(ord.createdAt).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="admin-status-control">
                      <label htmlFor={`status-${ord._id}`} className="sr-only">Update Status</label>
                      <select
                        id={`status-${ord._id}`}
                        value={ord.status || 'pending'}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        disabled={updatingOrderId === ord._id}
                        className="admin-status-select"
                      >
                        <option value="pending">Pending (Unpaid Demo)</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>
                  </div>

                  <div className="admin-order-body">
                    <div className="admin-order-items">
                      {ord.items?.map((it, idx) => (
                        <div key={idx} className="admin-order-item-chip">
                          <span>{it.productId?.name || 'Product'} × {it.quantity}</span>
                          <span style={{ fontWeight: '600' }}>
                            ₹{((it.priceAtPurchase || 0) * it.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="admin-order-summary-col">
                      <span className="admin-order-total">
                        Total: ₹{typeof ord.totalAmount === 'number' ? ord.totalAmount.toLocaleString('en-IN') : ord.totalAmount}
                      </span>
                      {ord.shippingAddress && (
                        <span className="admin-order-address">
                          Ship to: {ord.shippingAddress.fullName}, {ord.shippingAddress.city} ({ord.shippingAddress.phone})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Product Create/Edit Modal */}
      {isFormOpen && (
        <div className="modal-backdrop" onClick={() => setIsFormOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              {editingProductId ? 'Edit Product' : 'Create New Product'}
            </h3>

            {formError && (
              <div className="state-banner error-banner">
                <p>{formError}</p>
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="admin-modal-form">
              <div className="form-group">
                <label htmlFor="prod-name">Product Name *</label>
                <input
                  id="prod-name"
                  type="text"
                  placeholder="e.g. Stride Pace"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="prod-category">Category</label>
                  <input
                    id="prod-category"
                    type="text"
                    placeholder="e.g. running, sandals, casual"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="prod-price">Price (₹) *</label>
                  <input
                    id="prod-price"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 4999"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="prod-stock">Available Stock *</label>
                  <input
                    id="prod-stock"
                    type="number"
                    min="0"
                    placeholder="e.g. 15"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="prod-image">Image URL</label>
                  <input
                    id="prod-image"
                    type="text"
                    placeholder="https://... or /hero-shoe.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prod-desc">Description</label>
                <textarea
                  id="prod-desc"
                  rows="3"
                  placeholder="Product description and specs..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="btn btn-secondary"
                  disabled={submittingProduct}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingProduct}
                >
                  {submittingProduct ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="modal-backdrop" onClick={() => setDeletingProduct(null)}>
          <div className="modal-card modal-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Confirm Delete</h3>
            <p style={{ color: 'var(--stride-text-muted)', fontSize: '15px' }}>
              Are you sure you want to delete <strong>{deletingProduct.name}</strong>? This action cannot be undone.
            </p>

            {deleteError && (
              <div className="state-banner error-banner">
                <p>{deleteError}</p>
              </div>
            )}

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                className="btn btn-secondary"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="btn btn-danger"
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
