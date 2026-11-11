import React from 'react';
import { User, Calendar, Edit2, Trash2 } from 'lucide-react';
import RatingStars from './RatingStars';
import { useAuth } from '../context/AuthContext';

const ReviewCard = ({ review, onEdit, onDelete, showRestaurantInfo = false }) => {
  const { user, isAdmin } = useAuth();
  const { _id, customer, restaurant, rating, content, createdAt, updatedAt } = review;

  const isAuthor = user && customer && user._id === (customer._id || customer);
  const canEdit = isAuthor;
  const canDelete = isAuthor || isAdmin;

  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const isEdited = updatedAt && updatedAt !== createdAt;

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem 1.5rem',
        marginBottom: '1rem',
      }}
    >
      {/* Header: Customer / Restaurant Name + Stars */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '0.75rem',
        }}
      >
        <div>
          {showRestaurantInfo && restaurant && (
            <h4
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.1rem',
                marginBottom: '0.25rem',
                color: 'var(--accent-forest)',
              }}
            >
              {restaurant.name}
              {restaurant.location && (
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 'normal',
                    color: 'var(--text-muted)',
                    marginLeft: '0.5rem',
                  }}
                >
                  ({restaurant.location} • {restaurant.cuisine})
                </span>
              )}
            </h4>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div
              style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <User size={12} />
            </div>
            <div>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                {customer?.name || 'Verified Diner'}
              </span>
              {isAuthor && (
                <span
                  className="badge badge-forest"
                  style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}
                >
                  You
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Rating and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <RatingStars rating={rating} size={15} />
            <span
              style={{
                fontWeight: 700,
                fontSize: '0.9rem',
                color: 'var(--text-primary)',
              }}
            >
              {rating}.0
            </span>
          </div>

          {(canEdit || canDelete) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {canEdit && onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(review)}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.3rem 0.5rem' }}
                  title="Edit review"
                >
                  <Edit2 size={13} />
                  <span>Edit</span>
                </button>
              )}
              {canDelete && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(review)}
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.3rem 0.5rem' }}
                  title={isAdmin && !isAuthor ? 'Remove inappropriate review' : 'Delete review'}
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Review Content */}
      <p
        style={{
          fontSize: '0.925rem',
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
          margin: '0.5rem 0',
          whiteSpace: 'pre-wrap',
        }}
      >
        {content}
      </p>

      {/* Date metadata */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          marginTop: '0.75rem',
        }}
      >
        <Calendar size={12} />
        <span>Reviewed on {formattedDate}</span>
        {isEdited && <span style={{ fontStyle: 'italic' }}>(edited)</span>}
      </div>
    </div>
  );
};

export default ReviewCard;
