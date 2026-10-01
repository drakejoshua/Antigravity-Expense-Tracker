/**
 * DeleteConfirmDialog.jsx — Delete Confirmation Modal
 *
 * Renders a modal dialog that asks the user to confirm before permanently
 * deleting an expense. It appears as an overlay on top of the rest of the UI.
 *
 * WHY a confirmation dialog?
 *  Deleting an expense is a destructive, irreversible action (it removes the
 *  record from localStorage). A two-step "click Delete → confirm in dialog"
 *  flow prevents accidental deletions, which is a standard UX safety pattern.
 *
 * Built with Radix UI Alert Dialog (@radix-ui/react-alert-dialog):
 *  Radix UI is a headless component library — it provides the accessibility
 *  behaviour (focus trapping, keyboard navigation, ARIA roles, screen-reader
 *  announcements) without imposing any visual styles. Our CSS classes in
 *  App.css handle all the visual design. This is why you see no Radix-specific
 *  styling props; only className attributes that map to our own CSS rules.
 *
 *  Key Radix primitives used:
 *   • AlertDialog.Root    — Controls open/closed state.
 *   • AlertDialog.Portal  — Renders the dialog outside the normal DOM tree
 *                           (directly in <body>) so it always appears on top.
 *   • AlertDialog.Overlay — The semi-transparent backdrop behind the dialog.
 *   • AlertDialog.Content — The modal box itself. Radix auto-manages focus
 *                           trapping so keyboard users cannot tab behind it.
 *   • AlertDialog.Title / Description — Announced by screen readers when
 *                           the dialog opens.
 *   • AlertDialog.Cancel  — Closes the dialog without calling onConfirm.
 *   • AlertDialog.Action  — The destructive confirm button; asChild means
 *                           Radix renders our <button> element directly rather
 *                           than wrapping it in an extra node.
 *
 * Props:
 *  - isOpen        boolean   Controls whether the dialog is visible.
 *                            Driven by Boolean(deleteTarget) in App.jsx.
 *  - onOpenChange  function  Called by Radix when the user closes the dialog
 *                            (e.g. pressing Escape or clicking the overlay).
 *                            App.jsx uses this to set deleteTarget back to null.
 *  - onConfirm     function  Called when the user clicks "Confirm Delete".
 *                            App.jsx performs the actual array filter and
 *                            localStorage update at this point.
 *  - expense       object|null  The expense pending deletion. Used to show
 *                            the expense description in the warning message
 *                            so the user knows exactly what they are deleting.
 *
 * Actions you can take in a tutorial:
 *  ✦ Open the dialog and press the Escape key — it closes without deleting.
 *    This is free behaviour from Radix UI, not code we wrote.
 *  ✦ Open the dialog and click the backdrop — same result. Point out that
 *    Radix handles both interactions automatically via onOpenChange.
 *  ✦ Confirm a deletion and then inspect localStorage in the browser DevTools
 *    (Application → Local Storage) to show the record is truly gone.
 *  ✦ Explain why the expense name appears in the dialog body: we pass the
 *    full expense object so the user sees e.g. 'Delete "Weekly Groceries"?'
 *    rather than a generic message — this reduces the chance of mistakes.
 */

import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export default function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  expense
}) {
  return (
    // AlertDialog.Root controls visibility — open={isOpen} syncs with App.jsx state.
    <AlertDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      {/* Portal teleports the dialog to <body> so it renders above everything else */}
      <AlertDialog.Portal>
        {/* Dimmed backdrop — clicking it triggers onOpenChange(false) via Radix */}
        <AlertDialog.Overlay className="dialog-overlay" />

        {/* The modal box — focus is automatically trapped here while open */}
        <AlertDialog.Content className="dialog-content">

          {/* Warning icon */}
          <div className="dialog-icon-wrapper">
            <span className="dialog-icon">⚠️</span>
          </div>

          {/* Title and description are read aloud by screen readers on open */}
          <div className="dialog-body">
            <AlertDialog.Title className="dialog-title">
              Delete Expense
            </AlertDialog.Title>
            <AlertDialog.Description className="dialog-description">
              Are you sure you want to delete{' '}
              {/* Show the specific expense name so the user knows what will be removed */}
              <strong>{expense ? `"${expense.description}"` : 'this item'}</strong>?
              {' '}This action cannot be undone and will be permanently removed from your storage.
            </AlertDialog.Description>
          </div>

          <div className="dialog-actions">
            {/* Cancel — closes the dialog without any deletion */}
            <AlertDialog.Cancel asChild>
              <button type="button" className="btn btn-secondary">
                Cancel
              </button>
            </AlertDialog.Cancel>

            {/* Confirm — calls onConfirm() which removes the expense in App.jsx */}
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
