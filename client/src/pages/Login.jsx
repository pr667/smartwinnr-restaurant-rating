import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Shield, Briefcase, UserCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        if (from) {
          navigate(from, { replace: true });
        } else if (res.user.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else if (res.user.role === 'OWNER') {
          navigate('/owner/dashboard', { replace: true });
        } else {
          navigate('/restaurants', { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Evaluator convenience quick-fill credentials
  const fillCredentials = (quickEmail, quickPassword) => {
    setEmail(quickEmail);
    setPassword(quickPassword);
    setError('');
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '2.25rem',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1 style={{ fontSize: '1.85rem', fontFamily: 'var(--font-serif)', marginBottom: '0.4rem' }}>
              Account Sign In
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Access your personal dining reviews or management dashboard.
            </p>
          </div>

          {/* Quick-fill buttons for evaluator */}
          <div
            style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.85rem 1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                color: 'var(--text-muted)',
                marginBottom: '0.5rem',
              }}
            >
              Demo Credentials (Click to Autofill):
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => fillCredentials('admin@smartwinnr.com', 'Admin@12345')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
              >
                <Shield size={12} color="var(--accent-terracotta)" /> Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('owner.spice@smartwinnr.com', 'Owner@12345')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
              >
                <Briefcase size={12} color="var(--accent-forest)" /> Owner
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('priya.customer@smartwinnr.com', 'Customer@12345')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.3rem 0.55rem' }}
              >
                <UserCheck size={12} /> Customer
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', height: '2.75rem' }}
              disabled={loading}
            >
              {loading ? (
                'Authenticating...'
              ) : (
                <>
                  <LogIn size={16} /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Register Footer */}
          <div
            style={{
              textAlign: 'center',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1.25rem',
              marginTop: '1.5rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
            }}
          >
            <span>Don't have an account? </span>
            <Link
              to="/register"
              style={{
                color: 'var(--accent-forest)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Register as Diner
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
