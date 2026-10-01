/**
 * ExpenseForm.jsx — Add / Edit Expense Form
 *
 * This component renders the input form on the left side of the dashboard.
 * It serves a dual purpose depending on whether an expense is being created
 * or edited:
 *
 *  • ADD MODE  (default): All fields are blank. Submitting calls onSubmit
 *    with a new expense object and then resets the form back to empty.
 *  • EDIT MODE (when editingExpense prop is provided): Fields are pre-filled
 *    with the existing expense values. The submit button label changes to
 *    "Update Expense" and a "Cancel" button appears to exit edit mode.
 *
 * Props:
 *  - onSubmit(data)        Called when the form is submitted with valid data.
 *                          data = { id?, description, amount, category, date }
 *                          The id field is only included during edits.
 *  - editingExpense        The expense object currently being edited, or null
 *                          if we are in add mode.
 *  - onCancelEdit()        Called when the user clicks "Cancel" to exit edit
 *                          mode without saving changes.
 *
 * Internal state (controlled inputs):
 *  - description  string  — free-text name of the expense
 *  - amount       string  — numeric value entered by the user (kept as string
 *                           until submit to allow partial input like "12.")
 *  - category     string  — one of the values from CATEGORIES
 *  - date         string  — ISO date string "YYYY-MM-DD"
 *  - error        string  — validation message shown in the error banner
 *
 * Validation rules (enforced in handleSubmit before calling onSubmit):
 *  1. description must not be empty or whitespace-only.
 *  2. amount must be a positive number greater than $0.00.
 *  3. date must be present (the date input prevents most bad values natively).
 *
 * Key concept — useEffect for form sync:
 *  When editingExpense changes (i.e. the user clicks Edit on a row), a
 *  useEffect hook runs and copies the expense values into the local state
 *  fields, effectively "loading" the form with the existing data. When
 *  editingExpense becomes null (cancel or successful save), the same effect
 *  resets all fields back to their defaults.
 *
 * Actions you can take in a tutorial:
 *  ✦ Submit the form with an empty description to trigger the validation error
 *    and show how client-side validation works before any data is saved.
 *  ✦ Click "Edit" on an expense row and point out how the form fields populate
 *    automatically — this is the useEffect in action.
 *  ✦ Change the default category by swapping CATEGORIES[0] to CATEGORIES[2]
 *    to show how controlled inputs work with a default value.
 */

import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../categories';

export default function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }) {
  // Helper: returns today's date as a "YYYY-MM-DD" string for the date input default.
  const getTodayString = () => new Date().toISOString().split('T')[0];

  // --- Controlled input state ---
  // Each field is stored in its own piece of state so React re-renders
  // the input immediately on every keystroke, keeping the UI in sync.
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState('');

  /**
   * Sync form fields with the expense being edited.
   *
   * This effect runs whenever the editingExpense prop changes:
   *  - If a new expense is passed in (edit mode), populate all fields with
   *    its values so the user can modify them.
   *  - If editingExpense becomes null (add mode / cancel), reset all fields
   *    back to empty defaults so the form is ready for a new entry.
   */
  useEffect(() => {
    if (editingExpense) {
      setDescription(editingExpense.description);
      setAmount(editingExpense.amount.toString());
      setCategory(editingExpense.category);
      setDate(editingExpense.date);
      setError('');
    } else {
      resetForm();
    }
  }, [editingExpense]);

  // Resets all fields to their initial "empty / default" values.
  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDate(getTodayString());
    setError('');
  };

  /**
   * Validate inputs and call onSubmit if everything is valid.
   *
   * e.preventDefault() stops the browser from reloading the page,
   * which is the default behaviour for HTML form submissions.
   * After validation passes, we build the data object and hand it up
   * to App.jsx via the onSubmit prop — the form itself never touches
   * the expense list directly.
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedDesc = description.trim();
    const parsedAmount = parseFloat(amount);

    // Validate: description must not be blank.
    if (!trimmedDesc) {
      setError('Please provide a description for the expense.');
      return;
    }

    // Validate: amount must be a real, positive number.
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than $0.00.');
      return;
    }

    // Validate: a date must be selected.
    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    // Pass the clean data up to App.jsx.
    // In edit mode we include the original id so App knows which record to update.
    onSubmit({
      ...(editingExpense ? { id: editingExpense.id } : {}),
      description: trimmedDesc,
      amount: parsedAmount,
      category,
      date
    });

    // After adding (not editing), reset the form so the user can log another expense.
    if (!editingExpense) {
      resetForm();
    }
  };

  return (
    // The card wrapper gives this section its white box / elevated surface look.
    <div className="card form-card">
      {/* Card header: title changes between "Add New Expense" and "Edit Expense",
          and an "Editing Mode" badge appears to visually signal the current mode. */}
      <div className="card-header">
        <h2 className="card-title">
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        {editingExpense && (
          <span className="badge badge-warning">Editing Mode</span>
        )}
      </div>

      {/* Inline validation error — only rendered when the error state is non-empty. */}
      {error && <div className="form-error-banner">{error}</div>}

      {/* noValidate disables the browser's built-in HTML5 validation popups
          so our custom error banner handles all feedback instead. */}
      <form onSubmit={handleSubmit} className="expense-form" noValidate>

        {/* Description — free-text field for naming the expense */}
        <div className="form-group">
          <label htmlFor="expense-description">Description</label>
          <input
            id="expense-description"
            type="text"
            placeholder="e.g. Weekly Groceries, Transit Pass"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            required
          />
        </div>

        {/* Amount, Category, Date — three fields in a responsive row.
            They stack vertically on narrow screens via CSS grid auto-fit. */}
        <div className="form-row">
          {/* Amount — step="0.01" allows cents; min="0.01" blocks negatives in browsers. */}
          <div className="form-group">
            <label htmlFor="expense-amount">Amount ($)</label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              required
            />
          </div>

          {/* Category — dropdown populated from the shared CATEGORIES array. */}
          <div className="form-group">
            <label htmlFor="expense-category">Category</label>
            <select
              id="expense-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field select-field"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Date — browser native date picker, stored as "YYYY-MM-DD". */}
          <div className="form-group">
            <label htmlFor="expense-date">Date</label>
            <input
              id="expense-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Form action buttons.
            "Cancel" only appears in edit mode — clicking it calls onCancelEdit
            which sets editingExpense to null in App.jsx, returning to add mode. */}
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingExpense ? 'Update Expense' : 'Add Expense'}
          </button>
          {editingExpense && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
