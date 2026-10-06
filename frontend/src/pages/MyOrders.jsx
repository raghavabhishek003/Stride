import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23f7f7f5"/><text x="50%" y="50%" fill="%23666666" font-family="sans-serif" font-size="10" text-anchor="middle" dominant-baseline="middle">N/A</text></svg>';

  const fetchMyOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/orders/my');
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return 'status-badge status-paid';
      case 'shipped':
        return 'status-badge status-shipped';
      case 'delivered':
        return 'status-badge status-delivered';
      case 'pending':
      default:
        return 'status-badge status-pending';
    }
  };

  return (
    <div className="stride-container" style={{ paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-64)' }}>
      <h1 className="page-title">My Orders</h1>
      <p className="text-meta" style={{ marginTop: 'var(--space-8)', marginBottom: 'var(--space-32)' }}>
        Track your recent purchases and view order details.
      </p>

      {loading && (
        <div className="orders-loading-list">
          {[1, 2, 3].map((n) => (
            <div key={n} className="order-card-skeleton">
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
              <div className="skeleton-line long" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="state-banner error-banner">
          <p>{error}</p>
          <button onClick={fetchMyOrders} className="btn btn-secondary btn-sm" style={{ marginTop: 'var(--space-12)' }}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="state-banner empty-banner" style={{ padding: 'var(--space-64) var(--space-24)' }}>
          <h3 style={{ fontSize: '20px', marginBottom: 'var(--space-12)' }}>No orders yet</h3>
          <p style={{ marginBottom: 'var(--space-24)' }}>You haven't placed any orders yet on Stride.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="orders-list">
          {orders.map((order) => {
            const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <article key={order._id} className="order-card">
                <header className="order-card-header">
                  <div className="order-meta-info">
                    <span className="order-id-text">Order #{order._id}</span>
                    <span className="order-date-text">Placed on {formattedDate}</span>
                  </div>
                  <span className={getStatusBadgeClass(order.status)}>
                    {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                  </span>
                </header>

                <div className="order-items-list">
                  {order.items?.map((item, idx) => {
                    const product = item.productId;
                    return (
                      <div key={idx} className="order-item-row">
                        <img
                          src={product?.imageUrl || fallbackImage}
                          alt={product?.name || 'Product'}
                          className="order-item-image"
                          onError={(e) => {
                            e.target.src = fallbackImage;
                          }}
                        />
                        <div className="order-item-info">
                          <span className="order-item-name">{product?.name || 'Product'}</span>
                          <span className="order-item-meta">
                            Qty: {item.quantity} × ₹{item.priceAtPurchase?.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <span className="order-item-total">
                          ₹{((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {order.shippingAddress && (
                  <div className="order-shipping-summary">
                    <span className="shipping-title">Shipping to:</span>
                    <span className="shipping-detail">
                      {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}
                    </span>
                  </div>
                )}

                <footer className="order-card-footer">
                  <span className="order-total-label">Total Amount:</span>
                  <span className="order-total-value">
                    ₹{typeof order.totalAmount === 'number' ? order.totalAmount.toLocaleString('en-IN') : order.totalAmount}
                  </span>
                </footer>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
