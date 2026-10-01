/**
 * ExpenseItem.jsx — Single Expense Row
 *
 * Renders one expense record as a card row inside the expense list.
 * Each row displays the expense's category badge, date, description,
 * formatted dollar amount, and two action buttons (Edit / Delete).
 *
 * This component is purely presentational — it receives all data and
 * callbacks as props and never manages any state of its own. This is
 * intentional: keeping display components "dumb" makes them easy to
 * test, reuse, and reason about.
 *
 * Props:
 *  - expense         object    The expense record to display.
 *                              Shape: { id, description, amount, category, date }
 *  - onEdit          function  Called with the full expense object when the
 *                              user clicks "Edit". App.jsx uses this to set
 *                              editingExpense and load the form.
 *  - onDeleteRequest function  Called with the full expense object when the
 *                              user clicks "Delete". App.jsx uses this to open
 *                              the confirmation dialog (does NOT delete immediately).
 *  - isEditing       boolean   True when this specific row is the one currently
 *                              loaded into the edit form. Adds a visual highlight
 *                              (amber border) so the user knows which row is active.
 *
 * Helper functions (local, not exported):
 *  - formatCurrency(val): Converts a raw number like 12.5 into "$12.50" using
 *    the browser's built-in Intl.NumberFormat API for locale-aware formatting.
 *  - formatDate(dateStr): Converts an ISO date string "2024-03-15" into a
 *    human-readable label like "Mar 15, 2024". The manual year/month/day split
 *    avoids timezone offset issues that arise with new Date("YYYY-MM-DD").
 *
 * Actions you can take in a tutorial:
 *  ✦ Click "Edit" on any row and point out how the form on the left immediately
 *    fills with that row's values — this demonstrates parent-to-child data flow
 *    (App.jsx → ExpenseForm) driven by lifting state up.
 *  ✦ Click "Delete" and observe that nothing disappears yet — a confirmation
 *    dialog appears first. Explain that onDeleteRequest only requests deletion;
 *    the actual removal happens in App.jsx after the user confirms.
 *  ✦ Highlight the isEditing prop and the conditional CSS class on the outer
 *    div as an example of prop-driven conditional styling.
 */

import React from 'react';

export default function ExpenseItem({ expense, onEdit, onDeleteRequest, isEditing }) {

  /**
   * Formats a raw number as a USD currency string.
   * Example: 1234.5 → "$1,234.50"
   * Uses Intl.NumberFormat so the formatting is locale-aware and precise.
   */
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  /**
   * Converts a "YYYY-MM-DD" date string to a readable label like "Mar 15, 2024".
   *
   * Why not just use new Date(dateStr)?
   * JavaScript interprets "YYYY-MM-DD" as UTC midnight, which can shift the
   * displayed day by one when the user's timezone is behind UTC. By splitting
   * the string and constructing the date with local year/month/day values,
   * we always display the date the user actually entered.
   */
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const dateObj = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    // Outer card row. When isEditing is true, "expense-item-active" adds an
    // amber highlight so the user can see which row is currently in the form.
    <div className={`expense-item ${isEditing ? 'expense-item-active' : ''}`}>

      {/* LEFT SIDE: metadata (category badge, date, description) */}
      <div className="expense-item-info">
        <div className="expense-item-header">
          {/* Category pill — small coloured badge showing the expense type */}
          <span className="expense-item-category">{expense.category}</span>
          {/* Human-readable date label */}
          <span className="expense-item-date">{formatDate(expense.date)}</span>
        </div>
        {/* Main description text — what the expense was for */}
        <div className="expense-item-description">{expense.description}</div>
      </div>

      {/* RIGHT SIDE: amount and action buttons */}
      <div className="expense-item-actions-wrapper">
        {/* Dollar amount, right-aligned and formatted */}
        <span className="expense-item-amount">{formatCurrency(expense.amount)}</span>

        <div className="expense-item-buttons">
          {/* Edit button — passes the full expense object up so App.jsx can
              load it into the form via setEditingExpense(expense). */}
          <button
            type="button"
            className="btn btn-icon btn-edit"
            title="Edit expense"
            aria-label={`Edit ${expense.description}`}
            onClick={() => onEdit(expense)}
          >
            Edit
          </button>

          {/* Delete button — does NOT delete immediately. It calls onDeleteRequest
              which opens the confirmation dialog in App.jsx first. */}
          <button
            type="button"
            className="btn btn-icon btn-delete"
            title="Delete expense"
            aria-label={`Delete ${expense.description}`}
            onClick={() => onDeleteRequest(expense)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
