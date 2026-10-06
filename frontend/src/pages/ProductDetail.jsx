import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // Cart submission state
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null); // { type: 'success' | 'error', message: string }
  const [validationError, setValidationError] = useState('');

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="600" fill="%23f7f7f5"/><text x="50%" y="50%" fill="%23666666" font-family="sans-serif" font-size="16" text-anchor="middle" dominant-baseline="middle">Image Unavailable</text></svg>';

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/products/${id}`);
      setProduct(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Product not found.');
      } else {
        setError(err.response?.data?.message || 'Failed to load product details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (val) => {
    setValidationError('');
    setSubmitFeedback(null);
    const num = Number(val);
    setQuantity(num);

    if (!Number.isInteger(num) || num <= 0) {
      setValidationError('Quantity must be a positive whole number.');
    } else if (product && typeof product.stock === 'number' && num > product.stock) {
      setValidationError(`Maximum available stock is ${product.stock}.`);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setSubmitFeedback(null);

    // If signed out, redirect to /login with internal return path
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Validate quantity
    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      setValidationError('Please enter a valid positive whole number quantity.');
      return;
    }

    if (product && typeof product.stock === 'number' && qty > product.stock) {
      setValidationError(`Cannot add more than available stock (${product.stock}).`);
      return;
    }

    setSubmitting(true);
    try {
      await addToCart(product._id, qty);
      setSubmitFeedback({
        type: 'success',
        message: `Successfully added ${qty} item${qty > 1 ? 's' : ''} to your cart!`,
      });
    } catch (err) {
      setSubmitFeedback({
        type: 'error',
        message: err.message || 'Failed to add item to cart. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isOutOfStock = product && typeof product.stock === 'number' && product.stock <= 0;
  const isSubmitDisabled =
    submitting ||
    isOutOfStock ||
    !!validationError ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) <= 0 ||
    (product && typeof product.stock === 'number' && Number(quantity) > product.stock);

  return (
    <div className="product-detail-page stride-container" style={{ paddingTop: 'var(--space-32)', paddingBottom: 'var(--space-64)' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="breadcrumb" style={{ marginBottom: 'var(--space-24)' }}>
        <Link to="/" style={{ color: 'var(--stride-text-muted)' }}>Home</Link>
        <span style={{ margin: '0 8px', color: 'var(--stride-text-muted)' }}>/</span>
        <Link to="/products" style={{ color: 'var(--stride-text-muted)' }}>Products</Link>
        <span style={{ margin: '0 8px', color: 'var(--stride-text-muted)' }}>/</span>
        <span style={{ color: 'var(--stride-text)', fontWeight: '500' }}>
          {loading ? 'Loading...' : product?.name || 'Details'}
        </span>
      </nav>

      {/* Loading Skeleton */}
      {loading && (
        <div className="product-detail-skeleton">
          <div className="skeleton-img-lg" />
          <div className="skeleton-details">
            <div className="skeleton-line short" />
            <div className="skeleton-line long" />
            <div className="skeleton-line medium" />
            <div className="skeleton-block" />
          </div>
        </div>
      )}

      {/* Error / Not Found State */}
      {error && (
        <div className="state-banner error-banner" style={{ textAlign: 'center', padding: 'var(--space-48)' }}>
          <h2 style={{ fontSize: '24px', marginBottom: 'var(--space-12)' }}>
            {error === 'Product not found.' ? 'Product Not Found' : 'Error Loading Product'}
          </h2>
          <p>{error}</p>
          <div style={{ marginTop: 'var(--space-24)', display: 'flex', gap: 'var(--space-16)', justifyContent: 'center' }}>
            <button onClick={fetchProduct} className="btn btn-secondary">
              Try Again
            </button>
            <Link to="/products" className="btn btn-primary">
              Back to Products
            </Link>
          </div>
        </div>
      )}

      {/* Product Main Section */}
      {!loading && !error && product && (
        <div className="product-detail-layout">
          {/* Left Column: Product Image */}
          <div className="product-detail-media">
            <div className="product-detail-image-wrapper">
              <img
                src={imageError || !product.imageUrl ? fallbackImage : product.imageUrl}
                alt={product.name}
                className="product-detail-image"
                onError={() => setImageError(true)}
              />
              {isOutOfStock && (
                <span className="stock-badge out-of-stock-badge lg">Sold Out</span>
              )}
            </div>
          </div>

          {/* Right Column: Product Information & Purchase Actions */}
          <div className="product-detail-info">
            {product.category && (
              <span className="product-detail-category">{product.category}</span>
            )}
            <h1 className="product-detail-title">{product.name}</h1>
            <div className="product-detail-price-row">
              <span className="product-detail-price">
                ₹{typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : product.price}
              </span>
              <span className={`stock-status ${isOutOfStock ? 'out-of-stock' : 'in-stock'}`}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.stock} available)`}
              </span>
            </div>

            {product.description && (
              <p className="product-detail-description">{product.description}</p>
            )}

            {/* Submission Feedback Messages */}
            {submitFeedback && (
              <div
                className={`state-banner ${
                  submitFeedback.type === 'success' ? 'success-banner' : 'error-banner'
                }`}
                style={{ marginBottom: 'var(--space-20)' }}
              >
                <p>{submitFeedback.message}</p>
              </div>
            )}

            {/* Add to Cart Form */}
            <form onSubmit={handleAddToCart} className="add-to-cart-form">
              <div className="quantity-group">
                <label htmlFor="quantity-input" className="quantity-label">
                  Quantity
                </label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={isOutOfStock || quantity <= 1 || submitting}
                    onClick={() => handleQuantityChange(quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <input
                    id="quantity-input"
                    type="number"
                    min="1"
                    max={product.stock || 99}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    disabled={isOutOfStock || submitting}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    className="qty-btn"
                    disabled={isOutOfStock || quantity >= (product.stock || 99) || submitting}
                    onClick={() => handleQuantityChange(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                {validationError && (
                  <p className="field-error-text">{validationError}</p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-add-to-cart"
                disabled={isSubmitDisabled}
              >
                {submitting
                  ? 'Adding to Cart...'
                  : isOutOfStock
                  ? 'Out of Stock'
                  : 'Add to Cart'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
