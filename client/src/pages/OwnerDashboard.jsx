import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import RatingDistribution from '../components/RatingDistribution';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import {
  Building2,
  MapPin,
  Utensils,
  Star,
  Users,
  Edit3,
  MessageSquare,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Restaurant Details Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    location: '',
    cuisine: '',
    address: '',
    description: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchOwnerData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resRestaurant, resReviews] = await Promise.all([
        api.get('/owner/restaurant'),
        api.get('/owner/restaurant/reviews'),
      ]);

      if (resRestaurant.success) {
        setData(resRestaurant);
        if (resRestaurant.restaurant) {
          setEditForm({
            name: resRestaurant.restaurant.name || '',
            location: resRestaurant.restaurant.location || '',
            cuisine: resRestaurant.restaurant.cuisine || '',
            address: resRestaurant.restaurant.address || '',
            description: resRestaurant.restaurant.description || '',
          });
        }
      }

      if (resReviews.success) {
        setReviews(resReviews.reviews || []);
      }
    } catch (err) {
      console.error('Error fetching owner data:', err);
      setError('Unable to load assigned restaurant console. Please check connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOwnerData();
  }, [fetchOwnerData]);

  const handleUpdateRestaurant = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditError('');
    setEditSuccess('');

    try {
      const response = await api.patch('/owner/restaurant', editForm);
      if (response.success) {
        setEditSuccess('Restaurant information updated successfully.');
        setTimeout(() => {
          setEditModalOpen(false);
          setEditSuccess('');
        }, 1200);
        await fetchOwnerData();
      }
    } catch (err) {
      setEditError(
        err.response?.data?.message || 'Failed to update restaurant details.'
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading your restaurant console..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchOwnerData} />;
  }

  const { hasRestaurant, restaurant, ratingDistribution } = data || {};

  if (!hasRestaurant || !restaurant) {
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '600px',
          margin: '0 auto',
        }}
      >
        <Building2 size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          No Restaurant Assigned Yet
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Your owner account is active, but a platform administrator has not yet
          assigned a restaurant to your profile. Please contact the platform
          administrator to have your culinary establishment linked.
        </p>
      </div>
    );
  }

  const {
    name,
    location,
    cuisine,
    address,
    description,
    averageRating,
    totalReviews = 0,
  } = restaurant;

  const hasRatings = averageRating !== null && averageRating !== undefined && totalReviews > 0;

  return (
    <div>
      {/* Restaurant Overview Card */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-forest">
                <Utensils size={12} /> {cuisine}
              </span>
              <span className="badge badge-neutral">
                <MapPin size={12} /> {location}
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
              {name}
            </h2>
            {address && (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                {address}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="btn btn-secondary"
          >
            <Edit3 size={15} /> Edit Restaurant Details
          </button>
        </div>

        {description && (
          <p
            style={{
              fontSize: '0.925rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              borderTop: '1px solid var(--border-light)',
              paddingTop: '1rem',
              marginTop: '1rem',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Analytics KPI Row */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-forest)' }}>
            <Star size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Average Rating
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
            {hasRatings ? averageRating.toFixed(1) : '—'}
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            {hasRatings ? (
              <RatingStars rating={Math.round(averageRating)} size={15} />
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                No ratings yet
              </span>
            )}
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-terracotta)' }}>
            <MessageSquare size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Verified Reviews
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
            Submitted by genuine diners
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Users size={18} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Unique Diners
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
            Strict 1 review per customer
          </p>
        </div>
      </div>

      {/* Two Column Section: Rating Distribution & Customer Feedback List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '2rem' }} className="grid-details">
        {/* Rating Distribution */}
        <div>
          <div
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
              Rating Distribution
            </h3>
            <RatingDistribution
              distribution={ratingDistribution}
              totalReviews={totalReviews}
            />
          </div>
        </div>

        {/* Reviews List */}
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
              Customer Reviews ({reviews.length})
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Read-only owner view
            </span>
          </div>

          {reviews.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <div
                  key={rev._id}
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
                      flexWrap: 'wrap',
                      gap: '0.5rem',
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {rev.customer?.name || 'Verified Diner'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                        ({rev.customer?.email})
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RatingStars rating={rev.rating} size={15} />
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        {rev.rating}.0
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    "{rev.content}"
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginTop: '0.65rem',
                    }}
                  >
                    <Calendar size={12} />
                    <span>
                      {new Date(rev.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem 2rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-light)',
              }}
            >
              <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                No customer reviews have been submitted for your restaurant yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Restaurant Modal */}
      {editModalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '580px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.25rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
                Edit Restaurant Information
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div className="alert alert-danger" role="alert">
                <AlertCircle size={16} />
                <div>{editError}</div>
              </div>
            )}

            {editSuccess && (
              <div className="alert alert-success" role="alert">
                <CheckCircle2 size={16} />
                <div>{editSuccess}</div>
              </div>
            )}

            <form onSubmit={handleUpdateRestaurant}>
              <div className="form-group">
                <label className="form-label" htmlFor="edit-name">
                  Restaurant Name
                </label>
                <input
                  id="edit-name"
                  type="text"
                  className="form-input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="edit-location">
                    Location / City
                  </label>
                  <input
                    id="edit-location"
                    type="text"
                    className="form-input"
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="edit-cuisine">
                    Cuisine Type
                  </label>
                  <input
                    id="edit-cuisine"
                    type="text"
                    className="form-input"
                    value={editForm.cuisine}
                    onChange={(e) => setEditForm({ ...editForm, cuisine: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-address">
                  Full Street Address
                </label>
                <input
                  id="edit-address"
                  type="text"
                  className="form-input"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="edit-desc">
                  Description
                </label>
                <textarea
                  id="edit-desc"
                  className="form-textarea"
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  borderTop: '1px solid var(--border-light)',
                  paddingTop: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="btn btn-secondary"
                  disabled={editSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
