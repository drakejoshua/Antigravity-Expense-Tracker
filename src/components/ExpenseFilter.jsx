/**
 * ExpenseFilter.jsx — Category Filter Bar
 *
 * Renders a row of clickable "pill" buttons, one for each expense category
 * plus a special "All" pill at the start. Clicking a pill tells App.jsx to
 * show only expenses matching that category (or all expenses if "All" is
 * selected).
 *
 * This component is purely presentational — it holds no state of its own.
 * The currently active category (selectedCategory) is owned by App.jsx and
 * passed down as a prop. When the user clicks a pill, onSelectCategory is
 * called with the new value, App.jsx updates its state, and the new value
 * flows back down as a prop — this is the classic React "lifting state up"
 * pattern.
 *
 * Props:
 *  - categories        string[]  The list of category strings to render as pills.
 *                                Comes from the shared CATEGORIES array in categories.js.
 *  - selectedCategory  string    The currently active filter. "All" means no filter.
 *  - onSelectCategory  function  Callback invoked with the clicked category string.
 *
 * Accessibility:
 *  The pill container uses role="tablist" and each button uses role="tab"
 *  with aria-selected, so screen readers announce the filter state correctly.
 *
 * Styling:
 *  The active pill gets the "active" CSS class which inverts its colours
 *  (dark fill, light text) to clearly distinguish it from inactive pills.
 *
 * Actions you can take in a tutorial:
 *  ✦ Click through the category pills and watch the expense list update
 *    instantly — demonstrate that no server request is made; it is all
 *    derived from the in-memory expenses array in App.jsx.
 *  ✦ Point out the conditional className (`filter-pill ${... ? 'active' : ''}`)
 *    as an example of dynamic CSS class application in React.
 *  ✦ Add a new string to CATEGORIES in categories.js and reload the page —
 *    a new pill will appear automatically without touching this file.
 */

import React from 'react';

export default function ExpenseFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="filter-container">
      {/* Label describing the control's purpose */}
      <span className="filter-label">Filter by Category:</span>

      {/* Pill group — role="tablist" makes screen readers treat this as a tab panel */}
      <div className="filter-pills" role="tablist" aria-label="Filter expenses by category">

        {/* "All" pill — always the first option; shows the complete unfiltered list */}
        <button
          type="button"
          role="tab"
          aria-selected={selectedCategory === 'All'}
          className={`filter-pill ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => onSelectCategory('All')}
        >
          All
        </button>

        {/* One pill per category, generated from the categories prop.
            The "active" class is applied when this pill's value matches
            the currently selected category. */}
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
