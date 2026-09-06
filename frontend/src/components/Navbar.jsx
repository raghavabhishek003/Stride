import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartItems, clearCartState } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCartState();
    navigate('/login');
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 0), 0);

  return (
    <nav style={{ padding: '1rem 2rem', backgroundColor: '#111827', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#38bdf8', textDecoration: 'none' }}>
          STRIDE
        </Link>
        <Link to="/" style={{ color: '#e5e7eb', textDecoration: 'none' }}>Home</Link>
        <Link to="/products" style={{ color: '#e5e7eb', textDecoration: 'none' }}>Products</Link>
        <Link to="/cart" style={{ color: '#e5e7eb', textDecoration: 'none' }}>
          Cart ({totalCartCount})
        </Link>
        {user && (
          <Link to="/orders" style={{ color: '#e5e7eb', textDecoration: 'none' }}>My Orders</Link>
        )}
        {user && user.role === 'admin' && (
          <Link to="/admin" style={{ color: '#f43f5e', fontWeight: 'bold', textDecoration: 'none' }}>Admin Dashboard</Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              style={{ padding: '0.4rem 0.8rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ padding: '0.4rem 0.8rem', backgroundColor: '#3b82f6', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
              Login
            </Link>
            <Link to="/signup" style={{ padding: '0.4rem 0.8rem', backgroundColor: '#10b981', color: '#fff', borderRadius: '4px', textDecoration: 'none' }}>
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
