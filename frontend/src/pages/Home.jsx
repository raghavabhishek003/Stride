import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import ProductCard from '../components/ProductCard';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/products');
      const data = Array.isArray(response.data) ? response.data : [];
      setProducts(data.slice(0, 4));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load featured products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section" aria-label="Hero">
        {/* Mobile Text Header (< 768px) */}
        <div className="hero-mobile-header">
          <div className="stride-container">
            <div className="hero-content">
              <span className="hero-category-tag">THE EVERYDAY COLLECTION</span>
              <h1 className="hero-headline">Move Without Limits.</h1>
              <p className="hero-subtext">
                Versatile footwear for wherever your day takes you.
              </p>
              <Link to="/products" className="btn btn-primary">
                Shop Collection &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Banner Image & Desktop Overlay */}
        <div className="hero-banner">
          <img
            src="/hero-lifestyle.png"
            alt="Person wearing white lifestyle sneakers sitting on concrete steps"
            className="hero-banner-image"
            width="1920"
            height="640"
            loading="eager"
          />
          <div className="hero-desktop-overlay">
            <div className="stride-container">
              <div className="hero-content">
                <span className="hero-category-tag">THE EVERYDAY COLLECTION</span>
                <h1 className="hero-headline">Move Without Limits.</h1>
                <p className="hero-subtext">
                  Versatile footwear for wherever your day takes you.
                </p>
                <Link to="/products" className="btn btn-primary">
                  Shop Collection &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Footwear Section */}
      <section className="featured-section" aria-label="Featured Footwear">
        <div className="stride-container">
          <div className="featured-header">
            <div>
              <span className="section-subhead">FEATURED FOOTWEAR</span>
              <h2 className="section-heading" style={{ margin: 0 }}>
                Made for your next move.
              </h2>
            </div>
            <Link to="/products" className="view-all-link">
              View all &rarr;
            </Link>
          </div>

          {loading && (
            <div className="product-grid">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="product-card-skeleton">
                  <div className="skeleton-img" />
                  <div className="skeleton-line short" />
                  <div className="skeleton-line medium" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="state-banner error-banner">
              <p>{error}</p>
              <button onClick={fetchFeaturedProducts} className="btn btn-secondary btn-sm">
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && products.length === 0 && (
            <div className="state-banner empty-banner">
              <p>No featured products available right now.</p>
            </div>
          )}

          {!loading && !error && products.length > 0 && (
            <div className="product-grid">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Photographic Category Tiles Section */}
      <section className="category-tiles-section" aria-label="Categories">
        <div className="stride-container">
          <div className="category-tiles-grid">
            <Link to="/products?category=lifestyle" className="category-tile-card">
              <img
                src="/hero-lifestyle.png"
                alt="Everyday lifestyle footwear"
                className="category-tile-img"
              />
              <div className="category-tile-overlay">
                <span className="category-tile-title">Everyday &rarr;</span>
              </div>
            </Link>

            <Link to="/products?category=running" className="category-tile-card">
              <img
                src="/hero-shoe.jpg"
                alt="Running performance footwear"
                className="category-tile-img"
              />
              <div className="category-tile-overlay">
                <span className="category-tile-title">Running &rarr;</span>
              </div>
            </Link>

            <Link to="/products?category=court" className="category-tile-card">
              <img
                src="/hero-lifestyle.png"
                alt="Court footwear"
                className="category-tile-img"
              />
              <div className="category-tile-overlay">
                <span className="category-tile-title">Court &rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Statement Section ("OUR APPROACH") */}
      <section className="brand-statement-section" aria-label="Our Approach">
        <div className="stride-container">
          <div className="brand-statement-layout">
            <div className="brand-statement-media">
              <img
                src="/hero-shoe.jpg"
                alt="Close-up detail of Stride white sneaker stepping up architectural stairs"
                className="brand-statement-img"
                loading="lazy"
              />
            </div>
            <div className="brand-statement-content">
              <span className="section-subhead">OUR APPROACH</span>
              <h2 className="brand-statement-headline">
                Good design.<br />Every day.
              </h2>
              <p className="brand-statement-copy">
                Thoughtfully designed footwear for real life. Clean style, lasting comfort, made to move with you.
              </p>
              <Link to="/products" className="view-all-link" style={{ marginTop: 'var(--space-16)' }}>
                Explore Stride &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
