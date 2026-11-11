import React, { useState } from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({
  rating = 0,
  max = 5,
  interactive = false,
  onChange = () => {},
  size = 18,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = interactive && hoverRating > 0 ? hoverRating : rating;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
      }}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={interactive ? 'Select rating' : `Rating: ${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => {
        const starValue = index + 1;
        const isFilled = activeRating >= starValue;

        if (interactive) {
          return (
            <button
              key={starValue}
              type="button"
              role="radio"
              aria-checked={rating === starValue}
              aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
              onClick={() => onChange(starValue)}
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: isFilled ? 'var(--rating-star)' : 'var(--border-medium)',
                transition: 'transform 0.1s ease, color 0.1s ease',
                transform: hoverRating === starValue ? 'scale(1.2)' : 'none',
              }}
            >
              <Star
                size={size}
                fill={isFilled ? 'currentColor' : 'none'}
                strokeWidth={1.75}
              />
            </button>
          );
        }

        return (
          <span
            key={starValue}
            style={{
              display: 'inline-flex',
              color: isFilled ? 'var(--rating-star)' : 'var(--border-medium)',
            }}
          >
            <Star
              size={size}
              fill={isFilled ? 'currentColor' : 'none'}
              strokeWidth={1.75}
            />
          </span>
        );
      })}
    </div>
  );
};

export default RatingStars;
