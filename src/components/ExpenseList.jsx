import React from 'react';
import ExpenseItem from './ExpenseItem';

export default function ExpenseList({
  expenses,
  selectedCategory,
  onEdit,
  onDeleteRequest,
  editingId
}) {
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

  return (
    <div className="expense-list-wrapper">
      <div className="expense-list-header">
        <span className="list-count">
          Showing {expenses.length} {expenses.length === 1 ? 'expense' : 'expenses'}
        </span>
      </div>
      <div className="expense-list">
        {expenses.map((expense) => (
          <ExpenseItem
            key={expense.id}
            expense={expense}
            onEdit={onEdit}
            onDeleteRequest={onDeleteRequest}
            isEditing={editingId === expense.id}
          />
        ))}
      </div>
    </div>
  );
}
