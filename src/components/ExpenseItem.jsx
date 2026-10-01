import React from 'react';

export default function ExpenseItem({ expense, onEdit, onDeleteRequest, isEditing }) {
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(val);
  };

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
    <div className={`expense-item ${isEditing ? 'expense-item-active' : ''}`}>
      <div className="expense-item-info">
        <div className="expense-item-header">
          <span className="expense-item-category">{expense.category}</span>
          <span className="expense-item-date">{formatDate(expense.date)}</span>
        </div>
        <div className="expense-item-description">{expense.description}</div>
      </div>

      <div className="expense-item-actions-wrapper">
        <span className="expense-item-amount">{formatCurrency(expense.amount)}</span>
        <div className="expense-item-buttons">
          <button
            type="button"
            className="btn btn-icon btn-edit"
            title="Edit expense"
            aria-label={`Edit ${expense.description}`}
            onClick={() => onEdit(expense)}
          >
            Edit
          </button>
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
