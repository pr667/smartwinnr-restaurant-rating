import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import { Star, Compass, Edit2, X } from 'lucide-react';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit Modal State
  const [editingReview, setEditingReview] = useState(null);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchMyReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/reviews/me');
      if (response.success) {
        setReviews(response.reviews || []);
      }
    } catch (err) {
      console.error('Failed to fetch personal reviews:', err);
      setError('Unable to load your reviews at this time.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  // Handle Edit Submit
  const handleEditSubmit = async (payload) => {
    if (!editingReview) return;
    setEditSubmitting(true);
    setEditError('');

    try {
      const res = await api.patch(`/reviews/${editingReview._id}`, payload);
      if (res.success) {
        setEditingReview(null);
        await fetchMyReviews();
      }
    } catch (err) {
      setEditError(
        err.response?.data?.message || 'Failed to update review. Please try again.'
      );
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Delete
  const handleOpenDelete = (rev) => {
    setReviewToDelete(rev);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/reviews/${reviewToDelete._id}`);
      if (res.success) {
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        await fetchMyReviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--accent-forest)',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: '0.35rem',
            }}
          >
            <Star size={16} /> Verified Contributions
          </div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)' }}>
            My Submitted Reviews
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Manage, update, or remove your dining feedback and ratings across all restaurants.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingState message="Fetching your submitted reviews..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchMyReviews} />
        ) : reviews.length > 0 ? (
          <div>
            <div
              style={{
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
              }}
            >
              Total reviews submitted: <strong>{reviews.length}</strong>
            </div>

            {reviews.map((rev) => (
              <ReviewCard
                key={rev._id}
                review={rev}
                showRestaurantInfo={true}
                onEdit={(r) => setEditingReview(r)}
                onDelete={handleOpenDelete}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-light)',
            }}
          >
            <Compass size={36} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
              You haven't reviewed any restaurants yet
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Explore fine dining venues across the platform and share your authentic dining experiences.
            </p>
            <Link to="/restaurants" className="btn btn-primary">
              <Compass size={16} /> Discover Restaurants
            </Link>
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-serif)' }}>
                Edit Review for {editingReview.restaurant?.name}
              </h3>
              <button
                onClick={() => setEditingReview(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <ReviewForm
              initialRating={editingReview.rating}
              initialContent={editingReview.content}
              isEditing={true}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingReview(null)}
              submitting={editSubmitting}
              errorMessage={editError}
            />
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Review"
        message={`Are you sure you want to delete your review for "${reviewToDelete?.restaurant?.name}"? This will permanently remove your rating.`}
        confirmText="Delete Review"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setReviewToDelete(null);
        }}
        loading={deleteLoading}
      />
    </div>
  );
};

export default MyReviews;
