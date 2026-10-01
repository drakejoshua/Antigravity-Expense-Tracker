/**
 * ExpenseList.jsx — Expense Records List
 *
 * Renders the scrollable list of expense rows on the right side of the
 * dashboard. It handles two visual states:
 *
 *  EMPTY STATE  — When no expenses match the current filter, a friendly
 *                 placeholder card is shown with context-sensitive messaging:
 *                 • "All" selected with no expenses → first-use prompt.
 *                 • A specific category selected with no matches → nudge to
 *                   switch categories or add an expense.
 *
 *  LIST STATE   — When expenses exist, a count header is shown ("Showing N
 *                 expenses") followed by a vertical stack of ExpenseItem cards,
 *                 one per expense.
 *
 * This component is a "container" component: it handles the conditional
 * rendering logic (empty vs populated) but delegates the actual row markup
 * to the ExpenseItem child component.
 *
 * Props:
 *  - expenses          object[]  The already-filtered and sorted array of
 *                                expense records to display. Filtering and
 *                                sorting happen in App.jsx before this
 *                                component receives them.
 *  - selectedCategory  string    The active category filter, used only to
 *                                customise the empty-state message.
 *  - onEdit            function  Passed down to each ExpenseItem. Called when
 *                                the user clicks "Edit" on a row.
 *  - onDeleteRequest   function  Passed down to each ExpenseItem. Called when
 *                                the user clicks "Delete" on a row.
 *  - editingId         string|null  The id of the expense currently loaded
 *                                into the form for editing. Passed to each
 *                                ExpenseItem as isEditing={editingId === expense.id}
 *                                so the correct row gets highlighted.
 *
 * Actions you can take in a tutorial:
 *  ✦ Delete all expenses and observe the empty state — then point out how
 *    the message changes when you have a specific category filter active
 *    vs "All". This shows conditional rendering based on props.
 *  ✦ Highlight how this component never touches localStorage or the expenses
 *    array directly — it only displays what App.jsx gives it. This is the
 *    separation of concerns (data vs display) principle in action.
 *  ✦ Point out that the expense count ("Showing N expenses") is derived
 *    directly from expenses.length — no extra state needed.
 */

import React from 'react';
import ExpenseItem from './ExpenseItem';

export default function ExpenseList({
  expenses,
  selectedCategory,
  onEdit,
  onDeleteRequest,
  editingId
}) {

  /**
   * EMPTY STATE
   * Shown when the expenses array is empty (either no expenses exist at all,
   * or none match the active category filter). The message adapts based on
   * which filter is currently active.
   */
  if (expenses.length === 0) {
    return (
      <div className="card empty-state">
        <div className="empty-state-icon">💸</div>
        <h3>No expenses recorded</h3>
        <p>
          {selectedCategory === 'All'
            ? 'You have not added any expenses yet. Fill out the form above to track your spending!'
            : `No expenses found in category "${selectedCategory}". Try choosing another category or add a new expense above.`}
        </p>
      </div>
    );
  }

  /**
   * LIST STATE
   * Renders a count header and a vertical stack of ExpenseItem rows.
   * Each item gets its own unique key (expense.id) so React can efficiently
   * add, remove, and reorder rows without re-rendering the entire list.
   */
  return (
    <div className="expense-list-wrapper">
      {/* Count header — tells the user how many records are visible */}
      <div className="expense-list-header">
        <span className="list-count">
          Showing {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </span>
      </div>

      {/* The list of expense row cards */}
      <div className="expense-list">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}           // Unique key for React's reconciler
            expense={expense}          // The full expense data object
            onEdit={onEdit}            // Bubble edit intent up to App.jsx
            onDeleteRequest={onDeleteRequest} // Bubble delete intent up to App.jsx
            isEditing={editingId === expense.id} // Highlight the row being edited
          />
        ))}
      </div>
    </div>
  );
}
