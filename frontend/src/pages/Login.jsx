import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const getSafeReturnPath = (target) => {
  if (typeof target === 'string' && target.startsWith('/') && !target.startsWith('//')) {
    return target;
  }
  return '/products';
};

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnPath = getSafeReturnPath(location.state?.from);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both email address and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: email.trim(),
        password,
      });
      const { user, token } = response.data;
      login(user, token);
      navigate(returnPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stride-container" style={{ paddingTop: 'var(--space-48)', paddingBottom: 'var(--space-64)', maxWidth: '440px' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Welcome Back</h1>
      <p style={{ textAlign: 'center', marginBottom: 'var(--space-32)' }}>
        Log in to continue shopping on Stride.
      </p>

      {error && (
        <div className="state-banner error-banner" style={{ marginBottom: 'var(--space-24)' }}>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
        <div>
          <label htmlFor="email-input">Email Address</label>
          <input
            id="email-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password-input">Password</label>
          <input
            id="password-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: 'var(--space-8)' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 'var(--space-24)', fontSize: '14px' }}>
        Don't have an account?{' '}
        <Link to="/signup" state={{ from: returnPath }} style={{ fontWeight: '600', textDecoration: 'underline' }}>
          Create one
        </Link>
      </p>
    </div>
  );
};

export default Login;
