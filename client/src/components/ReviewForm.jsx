import React, { useState, useEffect } from 'react';
import RatingStars from './RatingStars';
import { Send, AlertCircle, CheckCircle2 } from 'lucide-react';

const ReviewForm = ({
  initialRating = 5,
  initialContent = '',
  isEditing = false,
  onSubmit,
  onCancel,
  submitting = false,
  errorMessage = '',
}) => {
  const [rating, setRating] = useState(initialRating);
  const [content, setContent] = useState(initialContent);
  const [clientError, setClientError] = useState('');

  useEffect(() => {
    setRating(initialRating);
    setContent(initialContent);
  }, [initialRating, initialContent]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setClientError('');

    if (!rating || rating < 1 || rating > 5) {
      setClientError('Please select a star rating between 1 and 5.');
      return;
    }

    if (!content || content.trim().length < 3) {
      setClientError('Please provide at least 3 characters of written feedback.');
      return;
    }

    if (content.trim().length > 1000) {
      setClientError('Review feedback cannot exceed 1000 characters.');
      return;
    }

    onSubmit({ rating: Number(rating), content: content.trim() });
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '1.5rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem' }}>
          {isEditing ? 'Update Your Review' : 'Write a Review'}
        </h4>

        {isEditing && (
          <span className="badge badge-terracotta">
            Editing Mode
          </span>
        )}
      </div>

      {/* Global Error or Server Conflict Message */}
      {(clientError || errorMessage) && (
        <div className="alert alert-danger" role="alert">
          <AlertCircle size={16} />
          <div>{clientError || errorMessage}</div>
        </div>
      )}

      {/* Star Rating Picker */}
      <div className="form-group">
        <label className="form-label" id="star-picker-label">
          Your Rating <span style={{ color: 'var(--status-danger)' }}>*</span>
        </label>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem',
            padding: '0.5rem 0',
          }}
          aria-labelledby="star-picker-label"
        >
          <RatingStars
            rating={rating}
            interactive={true}
            onChange={(val) => setRating(val)}
            size={26}
          />
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
            }}
          >
            {rating} Star{rating > 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Content Textarea */}
      <div className="form-group">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.4rem',
          }}
        >
          <label className="form-label" htmlFor="review-content" style={{ margin: 0 }}>
            Written Experience <span style={{ color: 'var(--status-danger)' }}>*</span>
          </label>
          <span
            style={{
              fontSize: '0.75rem',
              color: content.length > 900 ? 'var(--status-danger)' : 'var(--text-muted)',
            }}
          >
            {content.length}/1000 characters
          </span>
        </div>

        <textarea
          id="review-content"
          className="form-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Describe your dining experience, favorite signature dishes, hospitality, and ambiance..."
          rows={4}
          maxLength={1000}
          required
        />
        <div className="form-hint">
          Be specific and thoughtful. You can submit only one review per restaurant.
        </div>
      </div>

      {/* Buttons */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '0.75rem',
          marginTop: '1.25rem',
        }}
      >
        {isEditing && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? (
            <span>Saving Review...</span>
          ) : (
            <>
              <Send size={15} />
              <span>{isEditing ? 'Update Review' : 'Submit Review'}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
