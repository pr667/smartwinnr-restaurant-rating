import React from 'react';
import { Star } from 'lucide-react';

const RatingDistribution = ({ distribution = {}, totalReviews = 0 }) => {
  const stars = [5, 4, 3, 2, 1];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        width: '100%',
      }}
    >
      {stars.map((star) => {
        const count = distribution[star] || 0;
        const percentage =
          totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

        return (
          <div
            key={star}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.825rem',
            }}
          >
            {/* Star label */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                minWidth: '55px',
                color: 'var(--text-secondary)',
                fontWeight: 500,
              }}
            >
              <span>{star}</span>
              <Star size={13} fill="var(--rating-star)" color="var(--rating-star)" />
            </div>

            {/* Visual Bar */}
            <div
              style={{
                flex: 1,
                height: '8px',
                backgroundColor: 'var(--bg-muted)',
                borderRadius: 'var(--radius-full)',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              <div
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  backgroundColor: 'var(--rating-star)',
                  borderRadius: 'var(--radius-full)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            {/* Count and Percentage */}
            <div
              style={{
                minWidth: '50px',
                textAlign: 'right',
                color: 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
                fontSize: '0.75rem',
              }}
            >
              <span>{count}</span>
              <span style={{ marginLeft: '4px', opacity: 0.7 }}>
                ({percentage}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingDistribution;
