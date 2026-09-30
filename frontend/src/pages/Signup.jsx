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

const Signup = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const returnPath = getSafeReturnPath(location.state?.from);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/auth/signup', {
        name: name.trim(),
        email: email.trim(),
        password,
      });
      const { user, token } = response.data;
      login(user, token);
      navigate(returnPath, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stride-container" style={{ paddingTop: 'var(--space-48)', paddingBottom: 'var(--space-64)', maxWidth: '440px' }}>
      <h1 className="page-title" style={{ textAlign: 'center' }}>Create Account</h1>
      <p style={{ textAlign: 'center', marginBottom: 'var(--space-32)' }}>
        Join Stride to enjoy smooth shopping and order tracking.
      </p>

      {error && (
        <div className="state-banner error-banner" style={{ marginBottom: 'var(--space-24)' }}>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-20)' }}>
        <div>
          <label htmlFor="signup-name">Full Name</label>
          <input
            id="signup-name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            required
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="signup-email">Email Address</label>
          <input
            id="signup-email"
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
          <label htmlFor="signup-password">Password</label>
          <input
            id="signup-password"
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
          style={{ width: '100%', marginTop: 'var(--space-8)' }}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: 'var(--space-24)', fontSize: '14px' }}>
        Already have an account?{' '}
        <Link to="/login" state={{ from: returnPath }} style={{ fontWeight: '600', textDecoration: 'underline' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Signup;
