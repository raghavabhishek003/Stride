import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useCart } from '../context/CartContext';

const Checkout = () => {
  const { cartItems, fetchCart } = useCart();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [completedOrder, setCompletedOrder] = useState(null);

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  const handleChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setError(null);

    const { fullName, address, city, postalCode, phone } = shippingAddress;
    if (!fullName.trim() || !address.trim() || !city.trim() || !postalCode.trim() || !phone.trim()) {
      setError('Please fill in all shipping details.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty. Please add items before checking out.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await axiosInstance.post('orders', {
        shippingAddress: {
          fullName: fullName.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          phone: phone.trim(),
        },
      });

      const orderData = response.data;
      setCompletedOrder(orderData);
      await fetchCart(); // Synchronize cart with backend
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Order Confirmation View
  if (completedOrder) {
    return (
      <div className="stride-container" style={{ paddingTop: 'var(--space-48)', paddingBottom: 'var(--space-64)', maxWidth: '640px' }}>
        <div className="state-banner success-banner" style={{ textAlign: 'center', padding: 'var(--space-48) var(--space-24)' }}>
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-16)' }}>✓</div>
          <h1 className="page-title" style={{ color: '#166534', marginBottom: 'var(--space-8)' }}>
            Order Placed Successfully!
          </h1>
          <p style={{ color: '#15803d', fontSize: '16px', marginBottom: 'var(--space-24)' }}>
            Thank you for your order. Your order ID is <strong>#{completedOrder._id}</strong>.
          </p>

          <div className="demo-notice-box" style={{ marginBottom: 'var(--space-24)' }}>
            <span className="demo-notice-tag">Demo Mode</span>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--stride-text-muted)' }}>
              Demo checkout — no payment collected. Your order status is set to <strong>Pending</strong>.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-16)', justifyContent: 'center' }}>
            <Link to="/orders" className="btn btn-primary">
              View My Orders
            </Link>
            <Link to="/products" className="btn btn-secondary">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to cart if empty and not completed
  if (cartItems.length === 0 && !completedOrder) {
    return (
      <div className="stride-container" style={{ paddingTop: 'var(--space-48)', paddingBottom: 'var(--space-64)' }}>
        <div className="state-banner empty-banner">
          <h3>Your cart is empty</h3>
          <p>Please add products to your cart before proceeding to checkout.</p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-16)' }}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="stride-container" style={{ paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-64)' }}>
      <h1 className="page-title">Checkout</h1>

      {/* Demo Checkout Banner Notice */}
      <div className="demo-notice-banner">
        <span className="demo-notice-badge">Demo Checkout</span>
        <p className="demo-notice-text">
          Demo checkout — no payment collected. Placing an order creates an unpaid pending order.
        </p>
      </div>

      {error && (
        <div className="state-banner error-banner" style={{ marginBottom: 'var(--space-24)' }}>
          <p>{error}</p>
        </div>
      )}

      <div className="checkout-layout">
        {/* Left Column: Shipping Form */}
        <form onSubmit={handleSubmitOrder} className="checkout-form">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--space-20)' }}>
            Shipping Address
          </h2>

          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={shippingAddress.fullName}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Street Address</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="124 Main Street, Apt 4B"
              value={shippingAddress.address}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="city">City</label>
              <input
                id="city"
                name="city"
                type="text"
                placeholder="Mumbai"
                value={shippingAddress.city}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>

            <div className="form-group flex-1">
              <label htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                name="postalCode"
                type="text"
                placeholder="400001"
                value={shippingAddress.postalCode}
                onChange={handleChange}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={shippingAddress.phone}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: '100%', marginTop: 'var(--space-24)', minHeight: '52px' }}
          >
            {submitting ? 'Processing Order...' : 'Place Order (Demo)'}
          </button>
        </form>

        {/* Right Column: Order Summary Preview */}
        <div className="checkout-summary-card">
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--space-20)' }}>
            Order Items ({cartItems.length})
          </h2>

          <div className="checkout-items-preview">
            {cartItems.map((item) => {
              const product = item.productId;
              if (!product) return null;
              return (
                <div key={product._id} className="checkout-item-row">
                  <div className="checkout-item-info">
                    <span className="checkout-item-name">{product.name}</span>
                    <span className="checkout-item-qty">Qty: {item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">
                    ₹{((product.price || 0) * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="summary-divider" style={{ margin: 'var(--space-20) 0' }} />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span style={{ color: '#16a34a', fontWeight: '600' }}>Free</span>
          </div>

          <div className="summary-divider" style={{ margin: 'var(--space-20) 0' }} />

          <div className="summary-row total-row">
            <span>Total</span>
            <span className="total-amount">₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
