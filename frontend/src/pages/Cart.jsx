import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { cartItems, loading, error, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f7f7f5"/><text x="50%" y="50%" fill="%23666666" font-family="sans-serif" font-size="10" text-anchor="middle" dominant-baseline="middle">N/A</text></svg>';

  const handleQuantityChange = async (productId, currentQty, delta) => {
    const newQty = currentQty + delta;
    if (newQty < 1) return;

    setUpdatingId(productId);
    setActionError(null);
    try {
      await updateCartItem(productId, newQty);
    } catch (err) {
      setActionError(err.message || 'Failed to update quantity.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    setActionError(null);
    try {
      await removeFromCart(productId);
    } catch (err) {
      setActionError(err.message || 'Failed to remove item.');
    } finally {
      setUpdatingId(null);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.productId?.price || 0;
    return acc + price * (item.quantity || 1);
  }, 0);

  return (
    <div className="stride-container" style={{ paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-64)' }}>
      <h1 className="page-title">Shopping Cart</h1>

      {loading && (
        <div className="state-banner empty-banner">
          <p>Loading your cart...</p>
        </div>
      )}

      {error && !loading && (
        <div className="state-banner error-banner">
          <p>{error}</p>
        </div>
      )}

      {actionError && (
        <div className="state-banner error-banner" style={{ marginBottom: 'var(--space-24)' }}>
          <p>{actionError}</p>
        </div>
      )}

      {!loading && cartItems.length === 0 && (
        <div className="state-banner empty-banner" style={{ padding: 'var(--space-64) var(--space-24)' }}>
          <h3 style={{ fontSize: '20px', marginBottom: 'var(--space-12)' }}>Your cart is currently empty</h3>
          <p style={{ marginBottom: 'var(--space-24)' }}>Explore our premium footwear collection to add items to your cart.</p>
          <Link to="/products" className="btn btn-primary">
            Explore Collection
          </Link>
        </div>
      )}

      {!loading && cartItems.length > 0 && (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-list">
            {cartItems.map((item) => {
              const product = item.productId;
              if (!product) return null;

              const isUpdating = updatingId === product._id;
              const lineTotal = (product.price || 0) * (item.quantity || 1);

              return (
                <div key={product._id} className="cart-item-row">
                  <div className="cart-item-image-container">
                    <img
                      src={product.imageUrl || fallbackImage}
                      alt={product.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.src = fallbackImage;
                      }}
                    />
                  </div>

                  <div className="cart-item-details">
                    <Link to={`/products/${product._id}`} className="cart-item-title">
                      {product.name}
                    </Link>
                    <p className="cart-item-unit-price">
                      ₹{typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : product.price} each
                    </p>
                  </div>

                  <div className="cart-item-quantity">
                    <div className="quantity-controls">
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleQuantityChange(product._id, item.quantity, -1)}
                        disabled={item.quantity <= 1 || isUpdating}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn"
                        onClick={() => handleQuantityChange(product._id, item.quantity, 1)}
                        disabled={isUpdating || (typeof product.stock === 'number' && item.quantity >= product.stock)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="cart-item-subtotal">
                    <span className="line-total-price">
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(product._id)}
                      disabled={isUpdating}
                      className="remove-item-btn"
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart Summary Card */}
          <div className="cart-summary-card">
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: 'var(--space-20)' }}>
              Order Summary
            </h2>

            <div className="summary-row">
              <span>Subtotal ({cartItems.reduce((sum, i) => sum + i.quantity, 0)} items)</span>
              <span style={{ fontWeight: '700' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span style={{ color: '#16a34a', fontWeight: '600' }}>Free</span>
            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">
              <span>Estimated Total</span>
              <span className="total-amount">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 'var(--space-24)', minHeight: '50px' }}
            >
              Proceed to Checkout &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
