import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import RatingDistribution from '../components/RatingDistribution';
import ReviewCard from '../components/ReviewCard';
import ReviewForm from '../components/ReviewForm';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  MapPin,
  Utensils,
  Building,
  User,
  ArrowLeft,
  MessageSquare,
  AlertCircle,
  LogIn,
} from 'lucide-react';

const RestaurantDetails = () => {
  const { id } = useParams();
  const { user, isCustomer, isAuthenticated } = useAuth();

  const [restaurant, setRestaurant] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ratingDistribution, setRatingDistribution] = useState({});
  const [customerReview, setCustomerReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Review form states
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewErrorMessage, setReviewErrorMessage] = useState('');

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchRestaurantDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/restaurants/${id}`);
      if (response.success) {
        setRestaurant(response.restaurant);
        setReviews(response.reviews || []);
        setRatingDistribution(response.ratingDistribution || {});
        setCustomerReview(response.customerReview || null);
      }
    } catch (err) {
      console.error('Failed to load restaurant details:', err);
      setError(err.response?.data?.message || 'Restaurant not found or unavailable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRestaurantDetails();
  }, [fetchRestaurantDetails]);

  // Handle Review Submission (Create or Update)
  const handleReviewSubmit = async (payload) => {
    setReviewSubmitting(true);
    setReviewErrorMessage('');

    try {
      if (isEditingReview && customerReview) {
        // Update review
        const res = await api.patch(`/reviews/${customerReview._id}`, payload);
        if (res.success) {
          setIsEditingReview(false);
          await fetchRestaurantDetails();
        }
      } else {
        // Create review
        const res = await api.post(`/restaurants/${id}/reviews`, payload);
        if (res.success) {
          await fetchRestaurantDetails();
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Unable to submit your review. Please try again.';
      setReviewErrorMessage(msg);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Open Delete confirmation
  const handleOpenDelete = (rev) => {
    setReviewToDelete(rev);
    setDeleteDialogOpen(true);
  };

  // Confirm review deletion
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return;
    setDeleteLoading(true);
    try {
      const res = await api.delete(`/reviews/${reviewToDelete._id}`);
      if (res.success) {
        setDeleteDialogOpen(false);
        setReviewToDelete(null);
        await fetchRestaurantDetails();
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading restaurant details..." />;
  }

  if (error || !restaurant) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem' }}>
        <ErrorState
          title="Restaurant Not Found"
          message={error || 'The requested restaurant is unavailable.'}
        />
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/restaurants" className="btn btn-secondary">
            <ArrowLeft size={16} /> Back to Directory
          </Link>
        </div>
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
    owner,
  } = restaurant;

  const hasRatings = averageRating !== null && averageRating !== undefined && totalReviews > 0;

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link
            to="/restaurants"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={15} /> Back to Directory
          </Link>
        </div>

        {/* Restaurant Header Editorial Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem 2.5rem',
            marginBottom: '2.5rem',
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <span className="badge badge-forest">
                  <Utensils size={12} /> {cuisine}
                </span>
                <span className="badge badge-neutral">
                  <MapPin size={12} /> {location}
                </span>
              </div>
              <h1 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', color: 'var(--text-primary)' }}>
                {name}
              </h1>
            </div>

            {/* Rating Summary Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.5rem',
                textAlign: 'center',
                minWidth: '150px',
              }}
            >
              {hasRatings ? (
                <>
                  <div
                    style={{
                      fontSize: '2.25rem',
                      fontFamily: 'var(--font-serif)',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      lineHeight: 1,
                    }}
                  >
                    {averageRating.toFixed(1)}
                  </div>
                  <div style={{ margin: '0.35rem 0' }}>
                    <RatingStars rating={Math.round(averageRating)} size={16} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </div>
                </>
              ) : (
                <div style={{ padding: '0.5rem 0' }}>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--text-muted)',
                      fontStyle: 'italic',
                      marginBottom: '0.25rem',
                    }}
                  >
                    No ratings yet
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Be the first to review
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Address & Details */}
          {address && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                marginBottom: '1rem',
              }}
            >
              <Building size={16} color="var(--accent-forest)" />
              <span>{address}</span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: 1.7,
                color: 'var(--text-secondary)',
                borderTop: '1px solid var(--border-light)',
                paddingTop: '1.25rem',
                marginTop: '1.25rem',
              }}
            >
              {description}
            </p>
          )}

          {/* Owner attribution if available */}
          {owner && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginTop: '1rem',
              }}
            >
              <User size={13} />
              <span>Proprietor: {owner.name}</span>
            </div>
          )}
        </div>

        {/* Two-Column Section: Ratings Distribution & Customer Reviews */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '2rem' }} className="grid-details">
          {/* Left Column: Rating Distribution */}
          <div>
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm)',
                position: 'sticky',
                top: '5.5rem',
              }}
            >
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>
                Rating Breakdown
              </h3>

              {hasRatings ? (
                <RatingDistribution
                  distribution={ratingDistribution}
                  totalReviews={totalReviews}
                />
              ) : (
                <p style={{ fontSize: '0.875rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                  Detailed rating breakdown will appear once customer reviews are submitted.
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Customer Reviews & Submission Interface */}
          <div>
            {/* Review Form Container for Logged-In Customer */}
            <div style={{ marginBottom: '2.5rem' }}>
              {isCustomer ? (
                customerReview && !isEditingReview ? (
                  // Customer has already reviewed and is not actively editing
                  <div
                    style={{
                      backgroundColor: 'var(--accent-forest-subtle)',
                      border: '1px solid var(--accent-forest)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem 1.5rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.75rem',
                        flexWrap: 'wrap',
                        gap: '0.5rem',
                      }}
                    >
                      <span className="badge badge-forest">
                        Your Submitted Review
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditingReview(true)}
                        className="btn btn-secondary btn-sm"
                      >
                        Edit Your Review
                      </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <RatingStars rating={customerReview.rating} size={16} />
                      <span style={{ fontWeight: 600 }}>{customerReview.rating}.0 Stars</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                      "{customerReview.content}"
                    </p>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      To prevent review inflation, each verified diner can submit one review per restaurant.
                    </div>
                  </div>
                ) : (
                  // Review submission or edit form
                  <ReviewForm
                    initialRating={customerReview ? customerReview.rating : 5}
                    initialContent={customerReview ? customerReview.content : ''}
                    isEditing={isEditingReview}
                    onSubmit={handleReviewSubmit}
                    onCancel={() => setIsEditingReview(false)}
                    submitting={reviewSubmitting}
                    errorMessage={reviewErrorMessage}
                  />
                )
              ) : !isAuthenticated ? (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.5rem',
                    textAlign: 'center',
                  }}
                >
                  <MessageSquare size={28} color="var(--accent-forest)" style={{ marginBottom: '0.5rem' }} />
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                    Have you dined at {name}?
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    Log in with a customer account to share your verified review and star rating.
                  </p>
                  <Link to="/login" className="btn btn-primary btn-sm">
                    <LogIn size={14} /> Log In to Review
                  </Link>
                </div>
              ) : null}
            </div>

            {/* List of Customer Reviews */}
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <h3 style={{ fontSize: '1.35rem', fontFamily: 'var(--font-serif)' }}>
                  Customer Reviews ({reviews.length})
                </h3>
              </div>

              {reviews.length > 0 ? (
                <div>
                  {reviews.map((rev) => (
                    <ReviewCard
                      key={rev._id}
                      review={rev}
                      onEdit={() => setIsEditingReview(true)}
                      onDelete={handleOpenDelete}
                    />
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 'var(--radius-md)',
                    padding: '3rem 2rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
                    No reviews have been written for this restaurant yet.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Review Deletion */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Review"
        message="Are you sure you want to delete this review? Your rating will be removed from the restaurant's average."
        confirmText="Yes, Delete Review"
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setReviewToDelete(null);
        }}
        loading={deleteLoading}
      />

      <style>{`
        @media (max-width: 860px) {
          .grid-details {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RestaurantDetails;
