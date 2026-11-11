import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password criteria check
  const hasMinLength = password.length >= 8 && password.length <= 16;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;
  const passwordsMatch = password && confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!isPasswordValid) {
      setError('Password must satisfy all security requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(name, email, password, confirmPassword);
      if (res.success) {
        navigate('/restaurants', { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Registration could not be completed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 0 5rem' }}>
      <div className="container" style={{ maxWidth: '520px' }}>
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
              Create Diner Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Join to discover curated restaurants and share verified reviews.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <AlertCircle size={16} />
              <div>{error}</div>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                id="reg-name"
                type="text"
                className="form-input"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email Address <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">
                Password <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                id="reg-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />

              {/* Security requirements checklist */}
              <div
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  marginTop: '0.5rem',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                }}
              >
                <div style={{ color: hasMinLength ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {hasMinLength ? '✓' : '•'} 8–16 characters
                </div>
                <div style={{ color: hasUpper ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {hasUpper ? '✓' : '•'} At least one uppercase letter
                </div>
                <div style={{ color: hasLower ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {hasLower ? '✓' : '•'} At least one lowercase letter
                </div>
                <div style={{ color: hasNumber ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {hasNumber ? '✓' : '•'} At least one number
                </div>
                <div style={{ color: hasSpecial ? 'var(--status-success)' : 'var(--text-muted)' }}>
                  {hasSpecial ? '✓' : '•'} At least one special symbol (!@#$%^&*...)
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                Confirm Password <span style={{ color: 'var(--status-danger)' }}>*</span>
              </label>
              <input
                id="reg-confirm"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {confirmPassword && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    marginTop: '0.35rem',
                    color: passwordsMatch ? 'var(--status-success)' : 'var(--status-danger)',
                  }}
                >
                  {passwordsMatch ? '✓ Passwords match' : '✕ Passwords do not match'}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', height: '2.75rem' }}
              disabled={loading}
            >
              {loading ? (
                'Creating Account...'
              ) : (
                <>
                  <UserPlus size={16} /> Complete Registration
                </>
              )}
            </button>
          </form>

          {/* Login Footer */}
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
            <span>Already have an account? </span>
            <Link
              to="/login"
              style={{
                color: 'var(--accent-forest)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
