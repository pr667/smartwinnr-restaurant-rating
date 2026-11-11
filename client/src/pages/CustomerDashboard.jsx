import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import LoadingState from '../components/LoadingState';
import {
  User,
  Star,
  Compass,
  ArrowRight,
  MessageSquare,
  Calendar,
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get('/reviews/me');
        if (res.success) {
          setReviews(res.reviews || []);
        }
      } catch (err) {
        console.error('Error loading customer dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingState message="Loading your dining profile..." />;
  }

  const totalReviews = reviews.length;
  const avgGiven =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : null;

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Banner */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <span className="badge badge-forest" style={{ marginBottom: '0.4rem' }}>
              Verified Diner
            </span>
            <h1 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>
              Welcome back, {user?.name}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Here is a summary of your culinary ratings and contributions.
            </p>
          </div>

          <Link to="/restaurants" className="btn btn-primary">
            <Compass size={16} /> Discover More Restaurants
          </Link>
        </div>

        {/* Metrics Grid */}
        <div className="grid-2" style={{ marginBottom: '2.5rem' }}>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-forest)' }}>
              <MessageSquare size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Total Reviews Submitted
              </span>
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                marginTop: '0.5rem',
                color: 'var(--text-primary)',
              }}
            >
              {totalReviews}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Each review counts towards the public platform rating.
            </p>
          </div>

          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--accent-terracotta)' }}>
              <Star size={20} />
              <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
                Your Average Rating Given
              </span>
            </div>
            <div
              style={{
                fontSize: '2.5rem',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                marginTop: '0.5rem',
                color: 'var(--text-primary)',
              }}
            >
              {avgGiven ? `${avgGiven} ★` : '—'}
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {avgGiven ? 'Across all rated restaurants' : 'No ratings submitted yet'}
            </p>
          </div>
        </div>

        {/* Recent Reviews section */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>
              Your Recent Reviews
            </h3>
            {totalReviews > 0 && (
              <Link
                to="/customer/reviews"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.875rem',
                  color: 'var(--accent-forest)',
                  fontWeight: 600,
                }}
              >
                <span>Manage all reviews</span>
                <ArrowRight size={14} />
              </Link>
            )}
          </div>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.slice(0, 3).map((r) => (
                <div
                  key={r._id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.25rem 1.5rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem' }}>
                        <Link
                          to={`/restaurants/${r.restaurant?._id}`}
                          style={{ color: 'inherit' }}
                        >
                          {r.restaurant?.name}
                        </Link>
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {r.restaurant?.location} • {r.restaurant?.cuisine}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RatingStars rating={r.rating} size={15} />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {r.rating}.0
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    "{r.content}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                You have not shared any reviews yet.
              </p>
              <Link to="/restaurants" className="btn btn-primary btn-sm">
                <Compass size={15} /> Browse Restaurants
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
