import React, { useState, useEffect } from 'react';
import { CATEGORIES } from './categories';
import ExpenseForm from './components/ExpenseForm';
import ExpenseFilter from './components/ExpenseFilter';
import ExpenseList from './components/ExpenseList';
import DeleteConfirmDialog from './components/DeleteConfirmDialog';
import './App.css';

const STORAGE_KEY = 'expenses_tracker_data';

export default function App() {
  // ---------------------------------------------------------------------------
  // 1. Primary State
  // ---------------------------------------------------------------------------
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (err) {
      console.error('Failed to parse expenses from localStorage:', err);
      return [];
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ---------------------------------------------------------------------------
  // 2. Persistence via localStorage
  // ---------------------------------------------------------------------------
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch (err) {
      console.error('Failed to write expenses to localStorage:', err);
    }
  }, [expenses]);

  // ---------------------------------------------------------------------------
  // 3. Derived Calculations (Render-time, strictly no useMemo per requirements)
  // ---------------------------------------------------------------------------
  // Chronological sort descending by date (most recent first)
  const sortedExpenses = [...expenses].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    return timeB - timeA;
  });

  // Filtered expenses based on active category
  const filteredExpenses = selectedCategory === 'All'
    ? sortedExpenses
    : sortedExpenses.filter((item) => item.category === selectedCategory);

  // Filtered total spending
  const totalFilteredSpending = filteredExpenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // Overall all-time spending
  const totalOverallSpending = expenses.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  // ---------------------------------------------------------------------------
  // 4. CRUD Action Handlers
  // ---------------------------------------------------------------------------
  const handleAddExpense = (expenseData) => {
    const newRecord = {
      id: crypto.randomUUID ? crypto.randomUUID() : `exp-${Date.now()}-${Math.random()}`,
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date
    };
    setExpenses((prev) => [newRecord, ...prev]);
  };

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

  const handleFormSubmit = (data) => {
    if (editingExpense) {
      handleUpdateExpense(data);
    } else {
      handleAddExpense(data);
    }
  };

  const handleStartEdit = (expense) => {
    setEditingExpense(expense);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
  };

  const handleDeleteRequest = (expense) => {
    setDeleteTarget(expense);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    setExpenses((prev) => prev.filter((item) => item.id !== deleteTarget.id));

    // Clear editing state if the deleted expense was currently in edit mode
    if (editingExpense && editingExpense.id === deleteTarget.id) {
      setEditingExpense(null);
    }

    setDeleteTarget(null);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

  return (
    <div className="app-container">
      {/* App Header & Spending Metrics */}
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-badge">Personal Finance</span>
          <h1 className="app-title">Expense Tracker</h1>
          <p className="app-subtitle">
            Manage, filter, and monitor your personal expenses with real-time totals and browser storage.
          </p>
        </div>

        <div className="summary-banner">
          <div className="summary-card">
            <span className="summary-label">
              {selectedCategory === 'All' ? 'Total Spending' : `Spending (${selectedCategory})`}
            </span>
            <span className="summary-value">{formatCurrency(totalFilteredSpending)}</span>
            <span className="summary-subtext">
              {filteredExpenses.length} {filteredExpenses.length === 1 ? 'transaction' : 'transactions'}
            </span>
          </div>

          {selectedCategory !== 'All' && (
            <div className="summary-card">
              <span className="summary-label">Overall All-Time</span>
              <span className="summary-value secondary">{formatCurrency(totalOverallSpending)}</span>
              <span className="summary-subtext">across all categories ({expenses.length} total)</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Two-Column Dashboard Grid */}
      <main className="app-main-grid">
        {/* Left Column: Add / Edit Form */}
        <section className="form-column" aria-label="Expense input form">
          <ExpenseForm
            onSubmit={handleFormSubmit}
            editingExpense={editingExpense}
            onCancelEdit={handleCancelEdit}
          />
        </section>

        {/* Right Column: Category Filter & Expense Records List */}
        <section className="list-column" aria-label="Expense records and filters">
          <div className="card list-container-card">
            <ExpenseFilter
              categories={CATEGORIES}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            <ExpenseList
              expenses={filteredExpenses}
              selectedCategory={selectedCategory}
              onEdit={handleStartEdit}
              onDeleteRequest={handleDeleteRequest}
              editingId={editingExpense ? editingExpense.id : null}
            />
          </div>
        </section>
      </main>

      {/* In-App Delete Confirmation Modal (Radix UI) */}
      <DeleteConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        expense={deleteTarget}
      />
    </div>
  );
}
