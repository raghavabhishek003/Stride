import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
  const [imageError, setImageError] = useState(false);

  if (!product) return null;

  const fallbackImage =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="%23f7f7f5"/><text x="50%" y="50%" fill="%23666666" font-family="sans-serif" font-size="14" text-anchor="middle" dominant-baseline="middle">Image Unavailable</text></svg>';

  const isOutOfStock = typeof product.stock === 'number' && product.stock <= 0;

  return (
    <article className="product-card">
      <Link
        to={`/products/${product._id}`}
        className="product-card-link"
        aria-label={`View details for ${product.name}`}
      >
        <div className="product-image-container">
          <img
            src={imageError || !product.imageUrl ? fallbackImage : product.imageUrl}
            alt={product.name}
            className="product-card-image"
            onError={() => setImageError(true)}
            loading="lazy"
          />
          {isOutOfStock && <span className="stock-badge out-of-stock-badge">Sold Out</span>}
        </div>
        <div className="product-card-info">
          {product.category && (
            <span className="product-card-category">{product.category}</span>
          )}
          <h3 className="product-card-title">{product.name}</h3>
          <p className="product-card-price">
            ₹{typeof product.price === 'number' ? product.price.toLocaleString('en-IN') : product.price}
          </p>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
