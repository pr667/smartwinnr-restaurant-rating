import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Utensils, Star, ArrowRight } from 'lucide-react';
import RatingStars from './RatingStars';

const RestaurantCard = ({ restaurant }) => {
  const {
    _id,
    name,
    location,
    cuisine,
    description,
    averageRating,
    totalReviews = 0,
    customerReview,
  } = restaurant;

  const hasRating = averageRating !== null && averageRating !== undefined && totalReviews > 0;

  return (
    <article
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        position: 'relative',
        padding: '1.5rem',
      }}
    >
      <div>
        {/* Badges: Cuisine & Personal Rating */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.5rem',
            marginBottom: '0.85rem',
            flexWrap: 'wrap',
          }}
        >
          <span className="badge badge-forest">
            <Utensils size={11} /> {cuisine}
          </span>

          {customerReview && (
            <span
              className="badge badge-terracotta"
              title="You have reviewed this restaurant"
            >
              <Star size={11} fill="currentColor" /> You rated: {customerReview.rating}★
            </span>
          )}
        </div>

        {/* Restaurant Name */}
        <h3
          style={{
            fontSize: '1.35rem',
            marginBottom: '0.4rem',
            color: 'var(--text-primary)',
          }}
        >
          <Link
            to={`/restaurants/${_id}`}
            style={{
              color: 'inherit',
              transition: 'color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--accent-forest)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
          >
            {name}
          </Link>
        </h3>

        {/* Location */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            marginBottom: '0.85rem',
          }}
        >
          <MapPin size={14} color="var(--accent-terracotta)" />
          <span>{location}</span>
        </div>

        {/* Description snippet */}
        {description && (
          <p
            style={{
              fontSize: '0.85rem',
              lineHeight: 1.5,
              color: 'var(--text-secondary)',
              marginBottom: '1.25rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Footer: Rating summary & View Button */}
      <div
        style={{
          borderTop: '1px solid var(--border-light)',
          paddingTop: '1rem',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.75rem',
        }}
      >
        <div>
          {hasRating ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                {averageRating.toFixed(1)}
              </span>
              <RatingStars rating={Math.round(averageRating)} size={14} />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                ({totalReviews})
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: '0.825rem',
                color: 'var(--text-muted)',
                fontStyle: 'italic',
              }}
            >
              No ratings yet
            </span>
          )}
        </div>

        <Link
          to={`/restaurants/${_id}`}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.65rem' }}
        >
          <span>View</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
};

export default RestaurantCard;
