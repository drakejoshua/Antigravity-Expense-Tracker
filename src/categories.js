/**
 * categories.js — Shared Expense Category Definitions
 *
 * This file defines the single source of truth for every category label
 * used throughout the app. Both the expense form (category dropdown) and
 * the filter bar (category pills) import this same list, so adding or
 * renaming a category here automatically updates both places.
 *
 * Why a separate file?
 *  Keeping static data like this in its own module avoids duplicating the
 *  array in multiple components. If the list ever needs to change (e.g.
 *  adding "Travel" or removing "Entertainment"), you only edit one file.
 *
 * Data shape:
 *  A plain JavaScript array of strings. Each string is a human-readable
 *  category name that gets displayed directly in the UI.
 *
 * Action you can take in a tutorial:
 *  ✦ Add a new category string to this array (e.g. 'Travel') and watch
 *    it appear automatically in both the form dropdown and the filter bar
 *    without touching any other file — this demonstrates the "single
 *    source of truth" principle.
 *  ✦ Point out that this is a named export (not a default export), so
 *    consumers import it with curly braces: import { CATEGORIES } from ...
 */

// The ordered list of spending categories available to the user.
// Import this wherever you need to render or validate a category value.
export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Housing & Utilities',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Education',
  'Other'
];
