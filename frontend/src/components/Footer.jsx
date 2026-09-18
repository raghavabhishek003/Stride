import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: '#0b0b0b',
        color: '#ffffff',
        paddingTop: 'var(--space-48)',
        paddingBottom: 'var(--space-32)',
        borderTop: '1px solid #1a1a1a',
        marginTop: 'auto',
      }}
    >
      <div className="stride-container">
        {/* Main Footer Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-32)',
            paddingBottom: 'var(--space-32)',
            borderBottom: '1px solid #1f1f1f',
          }}
        >
          {/* Brand Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            <Link
              to="/"
              style={{
                fontSize: '1.35rem',
                fontWeight: '800',
                letterSpacing: '-0.04em',
                color: '#ffffff',
                textDecoration: 'none',
                textTransform: 'uppercase',
              }}
            >
              Stride
            </Link>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af' }}>
              Move Better. Live Bolder.
            </p>
          </div>

          {/* Column 2: Shop Navigation */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ffffff',
                marginBottom: 'var(--space-12)',
              }}
            >
              Shop
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              <Link to="/" style={{ fontSize: '14px', color: '#9ca3af' }}>
                Home
              </Link>
              <Link to="/products" style={{ fontSize: '14px', color: '#9ca3af' }}>
                Products
              </Link>
              <Link to="/cart" style={{ fontSize: '14px', color: '#9ca3af' }}>
                Cart
              </Link>
            </div>
          </div>

          {/* Column 3: Account Navigation */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ffffff',
                marginBottom: 'var(--space-12)',
              }}
            >
              Account
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
              {user ? (
                <>
                  <Link to="/orders" style={{ fontSize: '14px', color: '#9ca3af' }}>
                    My Orders
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" style={{ fontSize: '14px', color: '#9ca3af' }}>
                      Admin Dashboard
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" style={{ fontSize: '14px', color: '#9ca3af' }}>
                    Login
                  </Link>
                  <Link to="/signup" style={{ fontSize: '14px', color: '#9ca3af' }}>
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Column 4: Brand Philosophy */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#ffffff',
                marginBottom: 'var(--space-12)',
              }}
            >
              About Stride
            </h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#9ca3af', lineHeight: '1.5' }}>
              Designed for Movement. Made for Every Day.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: 'var(--space-24)',
            gap: 'var(--space-12)',
            fontSize: '13px',
            color: '#9ca3af',
          }}
        >
          <div>&copy; {currentYear} Stride. All rights reserved.</div>
          <div>Premium Footwear</div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
