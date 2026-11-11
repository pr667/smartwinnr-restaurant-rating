import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import RestaurantCard from '../components/RestaurantCard';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Compass, RotateCcw } from 'lucide-react';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (location) params.append('location', location);
      if (cuisine) params.append('cuisine', cuisine);
      params.append('page', page);
      params.append('limit', 9);

      const response = await api.get(`/restaurants?${params.toString()}`);
      if (response.success) {
        setRestaurants(response.restaurants || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.total || 0);
      }
    } catch (err) {
      console.error('Error fetching restaurants:', err);
      setError('Unable to retrieve restaurant listings. Please verify server connection.');
    } finally {
      setLoading(false);
    }
  }, [search, location, cuisine, page]);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  const handleReset = () => {
    setSearch('');
    setLocation('');
    setCuisine('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || location || cuisine);

  return (
    <div style={{ padding: '2.5rem 0 4rem' }}>
      <div className="container">
        {/* Page Heading */}
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
            <Compass size={16} /> Restaurant Discovery
          </div>
          <h1 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)' }}>
            Explore Verified Culinary Establishments
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Browse authentic dining venues filtered by location and culinary tradition.
          </p>
        </div>

        {/* Filter and Search Bar Row */}
        <div
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setPage(1);
              }}
              onSubmit={() => setPage(1)}
              onClear={() => {
                setSearch('');
                setPage(1);
              }}
            />

            <FilterPanel
              location={location}
              cuisine={cuisine}
              onLocationChange={(val) => {
                setLocation(val);
                setPage(1);
              }}
              onCuisineChange={(val) => {
                setCuisine(val);
                setPage(1);
              }}
              onReset={handleReset}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Active filters & result count meta */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid var(--border-light)',
              paddingTop: '0.75rem',
              flexWrap: 'wrap',
              gap: '0.5rem',
            }}
          >
            <div>
              <span>Showing </span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {restaurants.length}
              </strong>
              <span> of </span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {totalCount}
              </strong>
              <span> restaurants</span>
              {hasActiveFilters && (
                <span style={{ fontStyle: 'italic', marginLeft: '0.5rem' }}>
                  (filtered)
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleReset}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  color: 'var(--accent-terracotta)',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={13} /> Clear all filters
              </button>
            )}
          </div>
        </div>

        {/* Listings Content */}
        {loading ? (
          <LoadingState message="Searching restaurants in database..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchRestaurants} />
        ) : restaurants.length > 0 ? (
          <>
            <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant._id} restaurant={restaurant} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginTop: '2rem',
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`btn btn-sm ${
                      p === page ? 'btn-primary' : 'btn-secondary'
                    }`}
                    style={{ minWidth: '2.25rem' }}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
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
              No restaurants matched your criteria
            </h3>
            <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem' }}>
              Try broadening your search term or clearing the cuisine and location filters.
            </p>
            {hasActiveFilters && (
              <button onClick={handleReset} className="btn btn-secondary btn-sm">
                <RotateCcw size={14} />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants;
