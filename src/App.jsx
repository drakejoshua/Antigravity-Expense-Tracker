/**
 * App.jsx — Root Application Component (State & Logic Orchestrator)
 *
 * This is the top-level component of the expense tracker. It is the single
 * place where all application state lives and where all CRUD operations are
 * defined. Child components receive data and callback functions as props —
 * they never manipulate state directly.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ARCHITECTURAL OVERVIEW  (what this file owns)
 * ─────────────────────────────────────────────────────────────────────────
 *
 *  STATE (useState)
 *  ┌─────────────────────┬───────────────────────────────────────────────┐
 *  │ expenses            │ The master list of all expense records.        │
 *  │                     │ Shape: { id, description, amount,              │
 *  │                     │         category, date }[]                     │
 *  ├─────────────────────┼───────────────────────────────────────────────┤
 *  │ selectedCategory    │ The active filter pill value.                  │
 *  │                     │ "All" = show everything.                       │
 *  ├─────────────────────┼───────────────────────────────────────────────┤
 *  │ editingExpense      │ The expense object currently loaded into the   │
 *  │                     │ form for editing, or null if in add mode.      │
 *  ├─────────────────────┼───────────────────────────────────────────────┤
 *  │ deleteTarget        │ The expense object pending deletion, or null.  │
 *  │                     │ Drives the confirmation dialog open/closed.    │
 *  ├─────────────────────┼───────────────────────────────────────────────┤
 *  │ darkMode            │ Boolean — true = dark theme active.            │
 *  │                     │ Persisted in localStorage under "theme".       │
 *  └─────────────────────┴───────────────────────────────────────────────┘
 *
 *  EFFECTS (useEffect)
 *  1. expenses → localStorage  — whenever the expenses array changes, the
 *     new value is serialised and saved so data survives page reloads.
 *  2. darkMode → <html> attribute — sets/removes data-theme="dark" on the
 *     document root and persists the preference to localStorage.
 *
 *  DERIVED VALUES (calculated fresh on every render, no caching)
 *  • sortedExpenses       — expenses sorted newest → oldest by date.
 *  • filteredExpenses     — sortedExpenses filtered by selectedCategory.
 *  • totalFilteredSpending — sum of amounts in filteredExpenses.
 *  • totalOverallSpending  — sum of ALL expense amounts regardless of filter.
 *
 *  CRUD HANDLERS
 *  • handleAddExpense    — creates a new record with a unique id and prepends
 *                          it to the expenses array.
 *  • handleUpdateExpense — replaces the matching record in the array with the
 *                          edited data, then clears editingExpense.
 *  • handleFormSubmit    — single entry point for the form; routes to Add or
 *                          Update depending on whether editingExpense is set.
 *  • handleStartEdit     — sets editingExpense and scrolls back to the top
 *                          so the user can see the form populate.
 *  • handleCancelEdit    — clears editingExpense, returning form to add mode.
 *  • handleDeleteRequest — sets deleteTarget, opening the confirm dialog.
 *  • handleConfirmDelete — actually removes the record from the array and
 *                          clears both deleteTarget and editingExpense if needed.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DATA FLOW DIAGRAM
 * ─────────────────────────────────────────────────────────────────────────
 *
 *   App.jsx (state + handlers)
 *     │
 *     ├─▶ ExpenseForm      ← receives: onSubmit, editingExpense, onCancelEdit
 *     │
 *     ├─▶ ExpenseFilter    ← receives: categories, selectedCategory, onSelectCategory
 *     │
 *     ├─▶ ExpenseList      ← receives: filteredExpenses, onEdit, onDeleteRequest, editingId
 *     │     └─▶ ExpenseItem (one per expense row)
 *     │
 *     └─▶ DeleteConfirmDialog ← receives: isOpen, onOpenChange, onConfirm, expense
 *
 * Actions you can take in a tutorial:
 *  ✦ Add an expense and immediately open DevTools → Application → Local Storage
 *    to see the serialised JSON. Reload the page and show the data persists.
 *  ✦ Toggle dark mode and inspect the <html> element in DevTools — watch
 *    data-theme="dark" appear and disappear, driving all CSS variable overrides.
 *  ✦ Add a console.log(expenses) inside the component body to show that React
 *    re-runs the function on every state change (this is how React rendering works).
 *  ✦ Point out that filteredExpenses and totalFilteredSpending are not stored in
 *    state — they are recalculated each render from the source-of-truth arrays.
 *    Ask: "why don't we need useState for these?"
 */

import React, { useState, useEffect } from 'react';
import { FaMoon, FaSun } from 'react-icons/fa6';
import { CATEGORIES } from './categories';
import ExpenseForm from './components/ExpenseForm';
import ExpenseFilter from './components/ExpenseFilter';
import ExpenseList from './components/ExpenseList';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import './App.css';

// The localStorage key under which the expenses array is saved.
// Keeping it as a constant avoids typos when reading and writing.
const STORAGE_KEY = 'expenses_tracker_data';

export default function App() {
  // ---------------------------------------------------------------------------
  // 1. Primary State
  // ---------------------------------------------------------------------------

  /**
   * expenses — the master list of all expense records.
   *
   * The useState initialiser function (lazy initialisation) reads from
   * localStorage once when the app first loads. Using a function here (rather
   * than a value) means the localStorage.getItem call only runs on mount,
   * not on every re-render. If parsing fails (e.g. corrupted data), we fall
   * back to an empty array so the app still works.
   */
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse expenses from localStorage:', err);
      return [];
    }
  });

  // The active category filter. "All" shows every expense regardless of category.
  const [selectedCategory, setSelectedCategory] = useState('All');

  // The expense currently loaded into the edit form, or null when in add mode.
  const [editingExpense, setEditingExpense] = useState(null);

  // The expense pending deletion — opening this triggers the confirm dialog.
  const [deleteTarget, setDeleteTarget] = useState(null);

  /**
   * darkMode — whether the dark colour scheme is active.
   *
   * Initialised from localStorage so the user's last preference is remembered
   * between sessions. The matching useEffect below keeps the DOM and storage
   * in sync whenever this value changes.
   */
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  // ---------------------------------------------------------------------------
  // 2. Side Effects (useEffect)
  // ---------------------------------------------------------------------------

  /**
   * Persist the expenses array to localStorage whenever it changes.
   *
   * The dependency array [expenses] means this effect only re-runs when the
   * expenses value changes — not on every render. This is an example of
   * "syncing React state with an external system" (localStorage in this case).
   */
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (err) {
      console.error('Failed to write expenses to localStorage:', err);
    }
  }, [expenses]);

  /**
   * Sync dark mode preference: toggle data-theme on <html> and persist choice.
   *
   * Setting data-theme="dark" on the root <html> element activates the dark
   * CSS variable overrides defined in index.css ([data-theme="dark"] { ... }).
   * This means the entire colour system switches without any inline styles.
   */
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // ---------------------------------------------------------------------------
  // 3. Derived Calculations (computed fresh on every render — no useMemo)
  // ---------------------------------------------------------------------------

  /**
   * Sort the expenses array newest-first (most recent date at the top).
   * We spread into a new array ([...expenses]) before sorting because
   * Array.sort mutates in place, and we must never mutate React state directly.
   */
  const sortedExpenses = [...expenses].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeB - timeA;
  });

  /**
   * Apply the active category filter to the sorted list.
   * When selectedCategory is "All", every expense passes through.
   * Otherwise only expenses whose category matches are included.
   * This filtered array is what gets passed to ExpenseList for display.
   */
  const filteredExpenses = selectedCategory === 'All'
    ? sortedExpenses
    : sortedExpenses.filter((item) => item.category === selectedCategory);

  // Sum of amounts for the currently visible (filtered) expenses.
  // Shown in the summary card as "Total Spending" or "Spending (Category)".
  const totalFilteredSpending = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // Sum of ALL expense amounts regardless of the active filter.
  // Shown as the "Overall All-Time" card when a category filter is active.
  const totalOverallSpending = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // ---------------------------------------------------------------------------
  // 4. CRUD Action Handlers
  // ---------------------------------------------------------------------------

  /**
   * CREATE — Add a brand-new expense to the list.
   *
   * crypto.randomUUID() generates a collision-proof unique identifier without
   * needing a database or external service. The new record is prepended to the
   * array (not appended) so the newest entry naturally appears at the top
   * before sorting is even applied.
   */
  const handleAddExpense = (expenseData) => {
    const newRecord = {
      // Fallback ID for browsers that don't support crypto.randomUUID (very rare).
      id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}-${Math.random()}`,
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date
    };
    // Functional update: prev => [...] ensures we always work from the latest state.
    setExpenses((prev) => [newRecord, ...prev]);
  };

  /**
   * UPDATE — Replace an existing expense with edited data.
   *
   * We use Array.map to create a new array: for every item, if its id matches
   * the edited record's id we return the updated version; otherwise we return
   * the item unchanged. This is the standard immutable update pattern in React.
   * After saving, editingExpense is cleared to return the form to add mode.
   */
  const handleUpdateExpense = (updatedData) => {
    setExpenses((prev) =>
      prev.map((item) =>
        item.id === updatedData.id
          ? {
              ...item,
              description: updatedData.description,
              amount: updatedData.amount,
              category: updatedData.category,
              date: updatedData.date
            }
          : item
      )
    );
    setEditingExpense(null);
  };

  /**
   * FORM SUBMIT ROUTER — single callback passed to ExpenseForm.
   *
   * ExpenseForm doesn't know whether we're adding or editing — it just calls
   * onSubmit(data). This handler checks editingExpense to decide which
   * operation to perform. This keeps the form component simple and reusable.
   */
  const handleFormSubmit = (data) => {
    if (editingExpense) {
      handleUpdateExpense(data);
    } else {
      handleAddExpense(data);
    }
  };

  /**
   * START EDIT — Load an expense into the form for editing.
   *
   * Setting editingExpense triggers a useEffect inside ExpenseForm that
   * populates the input fields with the expense's current values.
   * window.scrollTo ensures the user sees the form at the top of the page.
   */
  const handleStartEdit = (expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // CANCEL EDIT — Exit edit mode without saving. Clears the form back to add mode.
  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  /**
   * REQUEST DELETE — Open the confirmation dialog for a specific expense.
   *
   * We store the target expense in deleteTarget rather than deleting immediately.
   * This gives the user a chance to cancel before the data is gone.
   * The dialog reads deleteTarget to display the expense name in its message.
   */
  const handleDeleteRequest = (expense) => {
    setDeleteTarget(expense);
  };

  /**
   * CONFIRM DELETE — Actually remove the expense from the list.
   *
   * Only runs after the user confirms in the dialog. Uses Array.filter to
   * create a new array without the targeted expense, then clears both
   * deleteTarget (closes the dialog) and editingExpense (in case the deleted
   * record was currently loaded into the form).
   */
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    setExpenses((prev) => prev.filter((item) => item.id !== deleteTarget.id));

    // If the expense being deleted is also the one being edited, clear edit mode.
    if (editingExpense && editingExpense.id === deleteTarget.id) {
      setEditingExpense(null);
    }

    setDeleteTarget(null); // Closing the dialog
  };

  /**
   * Formats a raw number as a USD currency string for display in summary cards.
   * Example: 1234.5 → "$1,234.50"
   */
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  // ---------------------------------------------------------------------------
  // 5. Render — Component Tree
  // ---------------------------------------------------------------------------

  return (
    // Root container — centres the layout and constrains max width (see App.css).
    <div className="app-container">

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      {/* Contains: dark mode toggle, brand identity, and spending summary cards */}
      <header className="app-header">

        {/* Dark mode toggle button — positioned top-right via App.css absolute positioning.
            Inline color forces monochrome: white in dark mode, near-black in light mode,
            overriding the amber color set in App.css for this specific requirement. */}
        <button
          id="dark-mode-toggle"
          className="dark-mode-toggle"
          onClick={() => setDarkMode((prev) => !prev)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={darkMode ? 'Light mode' : 'Dark mode'}
          style={{ color: darkMode ? '#ffffff' : '#111827' }}
        >
          {/* Moon icon = currently in light mode (click to go dark).
              Sun icon  = currently in dark mode (click to go light). */}
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Brand section: badge, title, and subtitle */}
        <div className="header-brand">
          <span className="brand-badge">Personal Finance</span>
          <h1 className="app-title">Expense Tracker</h1>
          <p className="app-subtitle">
            Manage, filter, and monitor your personal expenses with real-time totals and browser storage.
          </p>
        </div>

        {/* ── SUMMARY CARDS ─────────────────────────────────────────────── */}
        {/* Always shows the filtered total. Shows the all-time total as a
            second card only when a category filter is active (so both numbers
            are meaningful to compare). */}
        <div className="summary-banner">
          {/* Primary card: spending for the current filter selection */}
          <div className="summary-card">
            <span className="summary-label">
              {selectedCategory === 'All' ? 'Total Spending' : `Spending (${selectedCategory})`}
            </span>
            <span className="summary-value">{formatCurrency(totalFilteredSpending)}</span>
            <span className="summary-subtext">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>

          {/* Secondary card: all-time total, only visible when a category is active.
              Conditional rendering with && — the card doesn't exist in the DOM when
              selectedCategory is "All". */}
          {selectedCategory !== 'All' && (
            <div className="summary-card">
              <span className="summary-label">Overall All-Time</span>
              <span className="summary-value secondary">{formatCurrency(totalOverallSpending)}</span>
              <span className="summary-subtext">across all categories ({expenses.length} total)</span>
            </div>
          )}
        </div>
      </header>

      {/* ── MAIN CONTENT GRID ─────────────────────────────────────────────── */}
      {/* Two-column layout on desktop (form | list), stacks to one column on mobile.
          Grid configuration is handled by .app-main-grid in App.css. */}
      <main className="app-main-grid">

        {/* LEFT COLUMN — Add / Edit Form */}
        <section className="form-column" aria-label="Expense input form">
          <ExpenseForm
            onSubmit={handleFormSubmit}         // Handles both add and update
            editingExpense={editingExpense}      // null = add mode, object = edit mode
            onCancelEdit={handleCancelEdit}      // Returns form to add mode
          />
        </section>

        {/* RIGHT COLUMN — Category Filter & Expense Records */}
        <section className="list-column" aria-label="Expense records and filters">
          <div className="card list-container-card">
            {/* Category pills filter bar — controls which expenses are visible */}
            <ExpenseFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}  // Directly pass the setter
            />

            {/* Expense list — receives only the already-filtered, sorted expenses */}
            <ExpenseList
              expenses={filteredExpenses}
              selectedCategory={selectedCategory}    // Used for empty state messaging
              onEdit={handleStartEdit}               // Loads expense into the form
              onDeleteRequest={handleDeleteRequest}  // Opens the confirm dialog
              editingId={editingExpense ? editingExpense.id : null} // Highlights the active row
            />
          </div>
        </section>
      </main>

      {/* ── DELETE CONFIRMATION DIALOG ────────────────────────────────────── */}
      {/* Rendered outside the grid so it can overlay the entire page.
          isOpen is derived from deleteTarget — truthy = open, null = closed. */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          // Radix calls this when the user dismisses the dialog (Escape key,
          // backdrop click). Setting deleteTarget to null closes it.
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        expense={deleteTarget}
      />
    </div>
  );
}
