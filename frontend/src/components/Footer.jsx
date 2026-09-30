import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="stride-container">
        {/* Main Footer Layout */}
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-logo">
              Stride
            </Link>
            <p className="footer-tagline">
              For wherever your next move takes you.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="footer-nav-cols">
            {/* Shop Column */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Shop</h4>
              <ul className="footer-link-list">
                <li><Link to="/products">All Footwear</Link></li>
                <li><Link to="/products">New Arrivals</Link></li>
                <li><Link to="/products">Collections</Link></li>
              </ul>
            </div>

            {/* Account Column */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Account</h4>
              <ul className="footer-link-list">
                {user ? (
                  <>
                    <li><Link to="/orders">Orders</Link></li>
                    {user.role === 'admin' && (
                      <li><Link to="/admin">Admin Dashboard</Link></li>
                    )}
                  </>
                ) : (
                  <>
                    <li><Link to="/login">Sign In</Link></li>
                    <li><Link to="/signup">Create Account</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* Help Column */}
            <div className="footer-col">
              <h4 className="footer-col-heading">Help</h4>
              <ul className="footer-link-list">
                <li><Link to="/products">FAQs</Link></li>
                <li><Link to="/products">Shipping</Link></li>
                <li><Link to="/products">Returns</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <span className="copyright-text">&copy; {currentYear} Stride. All rights reserved.</span>
          <div className="footer-legal-links">
            <span className="legal-link">Terms</span>
            <span className="legal-link">Privacy</span>
            <span className="legal-link">Cookies</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
