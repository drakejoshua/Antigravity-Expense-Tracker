import React from 'react';

export default function ExpenseFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="filter-container">
      <span className="filter-label">Filter by Category:</span>
      <div className="filter-pills" role="tablist" aria-label="Filter expenses by category">
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'All'}
          className={`filter-pill ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => onSelectCategory('All')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={selectedCategory === cat}
            className={`filter-pill ${selectedCategory === cat ? 'active' : ''}`}
            onClick={() => onSelectCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
