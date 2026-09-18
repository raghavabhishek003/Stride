import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, clearCartState } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    clearCartState();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const totalCartCount = cartItems.reduce(
    (acc, item) => acc + (item.quantity || 0),
    0
  );

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Handle Escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };
    if (mobileMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--stride-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        className="stride-container"
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Brand Logo / Wordmark matching reference */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-32)' }}>
          <Link
            to="/"
            style={{
              fontSize: '1.5rem',
              fontWeight: '800',
              letterSpacing: '-0.04em',
              color: '#111111',
              textDecoration: 'none',
            }}
          >
            Stride
          </Link>

          {/* Desktop Navigation */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-24)',
            }}
            className="desktop-nav"
            aria-label="Primary Navigation"
          >
            <Link
              to="/"
              style={{
                fontSize: '15px',
                fontWeight: '500',
                color:
                  location.pathname === '/'
                    ? '#111111'
                    : 'var(--stride-text-muted)',
              }}
            >
              Home
            </Link>
            <Link
              to="/products"
              style={{
                fontSize: '15px',
                fontWeight: '500',
                color: location.pathname.startsWith('/products')
                  ? '#111111'
                  : 'var(--stride-text-muted)',
              }}
            >
              Products
            </Link>
            <Link
              to="/cart"
              style={{
                fontSize: '15px',
                fontWeight: '500',
                color: location.pathname === '/cart'
                  ? '#111111'
                  : 'var(--stride-text-muted)',
              }}
            >
              Cart ({totalCartCount})
            </Link>
            {user && (
              <Link
                to="/orders"
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: location.pathname === '/orders'
                    ? '#111111'
                    : 'var(--stride-text-muted)',
                }}
              >
                My Orders
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: 'var(--stride-accent)',
                }}
              >
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Desktop Auth Actions */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-16)' }}
          className="desktop-auth"
        >
          {user ? (
            <>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'var(--stride-text-muted)',
                }}
              >
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ minHeight: '38px', padding: '0 14px', fontSize: '14px' }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  fontSize: '15px',
                  fontWeight: '500',
                  color: '#111111',
                  padding: '0 8px',
                }}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{ minHeight: '38px', padding: '0 16px', fontSize: '14px' }}
              >
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-hamburger"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            color: '#111111',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {mobileMenuOpen ? (
              <path d="M18 6L6 18M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: '72px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 99,
          }}
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              padding: 'var(--space-24)',
              borderBottom: '1px solid var(--stride-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-16)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              to="/"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111111',
              }}
            >
              Home
            </Link>
            <Link
              to="/products"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111111',
              }}
            >
              Products
            </Link>
            <Link
              to="/cart"
              style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#111111',
              }}
            >
              Cart ({totalCartCount})
            </Link>
            {user && (
              <Link
                to="/orders"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#111111',
                }}
              >
                My Orders
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: 'var(--stride-accent)',
                }}
              >
                Admin Dashboard
              </Link>
            )}

            <div
              style={{
                borderTop: '1px solid var(--stride-border)',
                paddingTop: 'var(--space-16)',
                marginTop: 'var(--space-8)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-12)',
              }}
            >
              {user ? (
                <>
                  <span
                    style={{
                      fontSize: '14px',
                      color: 'var(--stride-text-muted)',
                    }}
                  >
                    Logged in as <strong>{user.name}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn btn-secondary"
                    style={{ width: '100%' }}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                  >
                    Signup
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Responsive Breakpoints */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-auth {
            display: none !important;
          }
          .mobile-hamburger {
            display: flex !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
