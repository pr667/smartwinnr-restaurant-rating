import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value = '', onChange, onSubmit, onClear }) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit();
      }}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '0.85rem',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        <Search size={18} />
      </div>

      <input
        type="text"
        className="form-input"
        placeholder="Search restaurants by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          paddingLeft: '2.5rem',
          paddingRight: value ? '2.5rem' : '1rem',
          height: '2.75rem',
          fontSize: '0.95rem',
          backgroundColor: 'var(--bg-surface)',
        }}
      />

      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          style={{
            position: 'absolute',
            right: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X size={16} />
        </button>
      )}
    </form>
  );
};

export default SearchBar;
