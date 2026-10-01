import React, { useState, useEffect } from 'react';
import { CATEGORIES } from '../categories';

export default function ExpenseForm({ onSubmit, editingExpense, onCancelEdit }) {
  const getTodayString = () => new Date().toISOString().split('T')[0];

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(getTodayString());
  const [error, setError] = useState('');

  // Populate or reset form whenever editingExpense changes
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

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setCategory(CATEGORIES[0]);
    setDate(getTodayString());
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedDesc = description.trim();
    const parsedAmount = parseFloat(amount);

    if (!trimmedDesc) {
      setError('Please provide a description for the expense.');
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than $0.00.');
      return;
    }

    if (!date) {
      setError('Please select a valid date.');
      return;
    }

    onSubmit({
      ...(editingExpense ? { id: editingExpense.id } : {}),
      description: trimmedDesc,
      amount: parsedAmount,
      category,
      date
    });

    if (!editingExpense) {
      resetForm();
    }
  };

  return (
    <div className="card form-card">
      <div className="card-header">
        <h2 className="card-title">
          {editingExpense ? 'Edit Expense' : 'Add New Expense'}
        </h2>
        {editingExpense && (
          <span className="badge badge-warning">Editing Mode</span>
        )}
      </div>

      {error && <div className="form-error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="expense-form" noValidate>
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

        <div className="form-row">
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
