import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import RatingStars from '../components/RatingStars';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  MessageSquareText,
  Search,
  Filter,
  Trash2,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

const ManageReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchAdminReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (ratingFilter) params.append('rating', ratingFilter);
      params.append('limit', 50);

      const res = await api.get(`/admin/reviews?${params.toString()}`);
      if (res.success) {
        setReviews(res.reviews || []);
      }
    } catch (err) {
      console.error('Error loading reviews for moderation:', err);
      setError('Unable to load reviews.');
    } finally {
      setLoading(false);
    }
  }, [search, ratingFilter]);

  useEffect(() => {
    fetchAdminReviews();
  }, [fetchAdminReviews]);

  const handleOpenDelete = (rev) => {
    setReviewToDelete(rev);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleteLoading(true);

    try {
      const res = await api.delete(`/admin/reviews/${reviewToDelete._id}`);
      if (res.success) {
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        await fetchAdminReviews();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div>
      {/* Search and Rating Filter Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: '1 1 320px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              className="form-input"
              placeholder="Search within review text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '2.2rem', height: '2.5rem', fontSize: '0.875rem' }}
            />
          </div>

          <div style={{ minWidth: '150px' }}>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="form-select"
              style={{ height: '2.5rem', fontSize: '0.875rem' }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars only</option>
              <option value="3">3 Stars only</option>
              <option value="2">2 Stars only</option>
              <option value="1">1 Star only</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Showing <strong>{reviews.length}</strong> submitted reviews
        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <LoadingState message="Loading platform reviews..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAdminReviews} />
      ) : reviews.length > 0 ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Restaurant</th>
                <th>Rating</th>
                <th>Review Content</th>
                <th>Date</th>
                <th style={{ textAlign: 'right' }}>Moderate</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {rev.customer?.name || 'Verified Diner'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {rev.customer?.email}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>
                      {rev.restaurant?.name || 'Deleted Restaurant'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {rev.restaurant?.location}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <RatingStars rating={rev.rating} size={13} />
                      <span style={{ fontWeight: 600 }}>{rev.rating}.0</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '320px', lineHeight: 1.5 }}>
                    "{rev.content}"
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenDelete(rev)}
                      className="btn btn-danger btn-sm"
                      title="Remove inappropriate review"
                    >
                      <Trash2 size={13} />
                      <span>Remove</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <p style={{ color: 'var(--text-secondary)' }}>
            No reviews match the selected filter criteria.
          </p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Remove Inappropriate Review"
        message={`Are you sure you want to permanently remove this review by "${reviewToDelete?.customer?.name}" for "${reviewToDelete?.restaurant?.name}"? It will be removed from MongoDB and platform metrics will be recalculated immediately.`}
        confirmText="Remove Inappropriate Review"
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

export default ManageReviews;
