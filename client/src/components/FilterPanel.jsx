import React from 'react';
import { Filter, RotateCcw, MapPin, Utensils } from 'lucide-react';

const CUISINES = [
  'Indian',
  'Italian',
  'Japanese',
  'Mexican',
  'French',
  'Pan-Asian',
  'Mediterranean',
  'Continental',
];

const LOCATIONS = [
  'Hyderabad',
  'Bangalore',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Kolkata',
  'Pune',
];

const FilterPanel = ({
  location = '',
  cuisine = '',
  onLocationChange,
  onCuisineChange,
  onReset,
  hasActiveFilters = false,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
      }}
    >
      {/* Location Filter Dropdown */}
      <div style={{ position: 'relative', minWidth: '150px', flex: '1 1 150px' }}>
        <div
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
          }}
        >
          <MapPin size={15} />
        </div>
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="form-select"
          style={{
            paddingLeft: '2.2rem',
            height: '2.75rem',
            fontSize: '0.875rem',
          }}
          aria-label="Filter by Location"
        >
          <option value="">All Locations</option>
          {LOCATIONS.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>
      </div>

      {/* Cuisine Filter Dropdown */}
      <div style={{ position: 'relative', minWidth: '150px', flex: '1 1 150px' }}>
        <div
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
          }}
        >
          <Utensils size={15} />
        </div>
        <select
          value={cuisine}
          onChange={(e) => onCuisineChange(e.target.value)}
          className="form-select"
          style={{
            paddingLeft: '2.2rem',
            height: '2.75rem',
            fontSize: '0.875rem',
          }}
          aria-label="Filter by Cuisine"
        >
          <option value="">All Cuisines</option>
          {CUISINES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="btn btn-secondary btn-sm"
          style={{ height: '2.75rem', padding: '0 1rem', whiteSpace: 'nowrap' }}
          title="Reset all filters"
        >
          <RotateCcw size={14} />
          <span>Reset Filters</span>
        </button>
      )}
    </div>
  );
};

export default FilterPanel;
