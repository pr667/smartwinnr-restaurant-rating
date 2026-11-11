import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import RatingDistribution from '../components/RatingDistribution';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Users,
  Building2,
  MessageSquareText,
  Star,
  UserPlus,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/admin/dashboard');
        if (response.success) {
          setData(response);
        }
      } catch (err) {
        console.error('Failed to load admin dashboard statistics:', err);
        setError('Unable to load platform statistics. Please check server logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingState message="Aggregating platform database metrics..." />;
  }

  if (error || !data) {
    return <ErrorState message={error || 'Failed to load administrator dashboard.'} />;
  }

  const { stats, recentReviews = [], recentRestaurants = [] } = data;
  const {
    totalUsers = 0,
    totalRestaurants = 0,
    totalReviews = 0,
    averagePlatformRating,
    ratingDistribution = {},
    roleBreakdown = {},
  } = stats || {};

  return (
    <div>
      {/* 4 Core Metrics Grid */}
      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-forest)' }}>
            <Users size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Users
            </span>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              marginTop: '0.4rem',
              color: 'var(--text-primary)',
            }}
          >
            {totalUsers}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {roleBreakdown.CUSTOMER || 0} Diners • {roleBreakdown.OWNER || 0} Owners • {roleBreakdown.ADMIN || 0} Admins
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-terracotta)' }}>
            <Building2 size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Restaurants
            </span>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              marginTop: '0.4rem',
              color: 'var(--text-primary)',
            }}
          >
            {totalRestaurants}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Active dining records in MongoDB
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-forest)' }}>
            <MessageSquareText size={18} />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Total Reviews
            </span>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              marginTop: '0.4rem',
              color: 'var(--text-primary)',
            }}
          >
            {totalReviews}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Verified customer ratings
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--rating-star)' }}>
            <Star size={18} fill="currentColor" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>
              Platform Average
            </span>
          </div>
          <div
            style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              marginTop: '0.4rem',
              color: 'var(--text-primary)',
            }}
          >
            {averagePlatformRating ? averagePlatformRating.toFixed(1) : '—'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Aggregated across all reviews
          </div>
        </div>
      </div>

      {/* Two Column Layout: Global Rating Distribution & Quick Administrative Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2.5rem' }} className="grid-2">
        {/* Global Distribution */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>
            Platform-Wide Rating Distribution
          </h3>
          <RatingDistribution
            distribution={ratingDistribution}
            totalReviews={totalReviews}
          />
        </div>

        {/* Administrative Quick Actions */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.75rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
            Administrative Operations
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            Perform platform maintenance, provision restaurant owners, or moderate reviews.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/admin/users"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={16} /> Manage User Accounts & Create Owners
              </span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/admin/restaurants"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} /> Manage Restaurants & Assign Proprietors
              </span>
              <ArrowRight size={15} />
            </Link>

            <Link
              to="/admin/reviews"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.75rem 1rem' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquareText size={16} /> Moderate Inappropriate Reviews
              </span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Reviews Activity */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem',
          }}
        >
          <h3 style={{ fontSize: '1.25rem' }}>Recent Platform Reviews</h3>
          <Link
            to="/admin/reviews"
            style={{ fontSize: '0.85rem', color: 'var(--accent-terracotta)', fontWeight: 600 }}
          >
            View all ({totalReviews})
          </Link>
        </div>

        {recentReviews.length > 0 ? (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Customer</th>
                  <th>Rating</th>
                  <th>Review Excerpt</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentReviews.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <strong>{r.restaurant?.name || '—'}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {r.restaurant?.location}
                      </div>
                    </td>
                    <td>{r.customer?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <RatingStars rating={r.rating} size={13} />
                        <span style={{ fontWeight: 600 }}>{r.rating}.0</span>
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      "{r.content}"
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
            No reviews have been submitted yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
