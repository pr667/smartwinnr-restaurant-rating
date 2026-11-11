import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import LoadingState from '../components/LoadingState';
import {
  Compass,
  Star,
  ShieldCheck,
  Award,
  ArrowRight,
  UtensilsCrossed,
} from 'lucide-react';

const Home = () => {
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const data = await api.get('/restaurants?limit=3');
        if (data.success) {
          setFeaturedRestaurants(data.restaurants || []);
        }
      } catch (err) {
        console.error('Failed to fetch featured restaurants:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div>
      {/* Editorial Hero Section */}
      <section
        style={{
          backgroundColor: 'var(--bg-subtle)',
          borderBottom: '1px solid var(--border-light)',
          padding: '4.5rem 0 4rem',
        }}
      >
        <div className="container">
          <div style={{ maxWidth: '780px', margin: '0 auto', textAlign: 'center' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--accent-forest-subtle)',
                color: 'var(--accent-forest)',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                marginBottom: '1.25rem',
              }}
            >
              <Award size={14} /> Curated Dining & Verified Feedback
            </div>

            <h1
              style={{
                fontSize: 'clamp(2.25rem, 5vw, 3.25rem)',
                fontFamily: 'var(--font-serif)',
                lineHeight: 1.15,
                color: 'var(--text-primary)',
                marginBottom: '1.25rem',
              }}
            >
              Discover culinary excellence with ratings you can trust.
            </h1>

            <p
              style={{
                fontSize: '1.1rem',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
                marginBottom: '2rem',
                maxWidth: '640px',
                margin: '0 auto 2.25rem',
              }}
            >
              An authentic restaurant rating platform engineered with strict
              integrity. One verified review per customer, accurate MongoDB
              aggregation, and direct engagement with restaurant proprietors.
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <Link to="/restaurants" className="btn btn-primary btn-lg">
                <Compass size={18} />
                <span>Explore Restaurants</span>
              </Link>
              <Link to="/register" className="btn btn-secondary btn-lg">
                <span>Join as Diner</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Pillars */}
      <section style={{ padding: '3.5rem 0', borderBottom: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="grid-3">
            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-forest-subtle)',
                  color: 'var(--accent-forest)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <ShieldCheck size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                One Review Per Diner
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Enforced in both Express controllers and MongoDB unique compound
                indexes. No review manipulation or duplicate score spamming.
              </p>
            </div>

            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-terracotta-subtle)',
                  color: 'var(--accent-terracotta)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Star size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                Aggregated Distributions
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Real-time MongoDB aggregation pipelines accurately compute
                5-to-1 star rating breakdowns and platform averages across all
                persistent reviews.
              </p>
            </div>

            <div
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <div
                style={{
                  width: '2.5rem',
                  height: '2.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <UtensilsCrossed size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.4rem' }}>
                Role-Enforced Workflows
              </h3>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Isolated dashboards for Diners, Restaurant Owners, and Platform
                Administrators backed by cryptographically signed JWT tokens.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dining Section */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '2rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--accent-forest)',
                }}
              >
                Curated Selections
              </span>
              <h2 style={{ fontSize: '2rem', marginTop: '0.25rem' }}>
                Featured Dining Destinations
              </h2>
            </div>

            <Link
              to="/restaurants"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--accent-forest)',
              }}
            >
              <span>View all restaurants</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingState message="Fetching curated restaurants..." />
          ) : featuredRestaurants.length > 0 ? (
            <div className="grid-3">
              {featuredRestaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
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
              <p>No restaurants listed yet. Administrators can add restaurants via the portal.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
