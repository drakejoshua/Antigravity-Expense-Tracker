import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  expense
}) {
  return (
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <div className="dialog-icon-wrapper">
            <span className="dialog-icon">⚠️</span>
          </div>
          <div className="dialog-body">
            <AlertDialog.Title className="dialog-title">
              Delete Expense
            </AlertDialog.Title>
            <AlertDialog.Description className="dialog-description">
              Are you sure you want to delete{' '}
              <strong>{expense ? `"${expense.description}"` : 'this item'}</strong>? This action cannot be undone and will be permanently removed from your storage.
            </AlertDialog.Description>
          </div>
          <div className="dialog-actions">
            <AlertDialog.Cancel asChild>
              <button type="button" className="btn btn-secondary">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                type="button"
                className="btn btn-danger"
                onClick={onConfirm}
              >
                Confirm Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
