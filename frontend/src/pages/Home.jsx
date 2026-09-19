import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <section className="hero-section" aria-label="Hero">
      {/* Mobile Text Layer (displayed above photo on mobile < 768px) */}
      <div className="hero-mobile-header">
        <div className="stride-container">
          <div className="hero-content">
            <h1 className="hero-headline">Move Without Limits.</h1>
            <p className="hero-subtext">
              Find your stride. Make every day your own.
            </p>
            <Link to="/products" className="btn btn-primary">
              Shop Collection
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Banner Layer (Desktop photo with overlay copy / Mobile full-width photo) */}
      <div className="hero-banner">
        <img
          src="/hero-lifestyle.png"
          alt="White chunky lifestyle sneakers stepping up architectural concrete stairs"
          className="hero-banner-image"
          width="1920"
          height="640"
          loading="eager"
        />
        {/* Desktop Overlay Content (displayed over left clear area on desktop >= 768px) */}
        <div className="hero-desktop-overlay">
          <div className="stride-container">
            <div className="hero-content">
              <h1 className="hero-headline">Move Without Limits.</h1>
              <p className="hero-subtext">
                Find your stride. Make every day your own.
              </p>
              <Link to="/products" className="btn btn-primary">
                Shop Collection
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Home;


