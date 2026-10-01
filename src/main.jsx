/**
 * main.jsx — Application Entry Point
 *
 * This is the very first JavaScript file that runs when the browser loads the app.
 * Its sole job is to find the <div id="root"> element in index.html and mount
 * the entire React application inside it.
 *
 * Key concepts to explain here:
 *  - StrictMode: A React development helper that deliberately runs your
 *    component functions twice to help catch bugs early (e.g. side effects
 *    that shouldn't run on every render). It has zero impact in production.
 *  - createRoot / render: The modern React 18 API that "boots" the app.
 *    createRoot(element) prepares the DOM node, then .render(<App />) tells
 *    React to draw the entire component tree inside it.
 *  - index.css is imported here so its global styles are loaded before any
 *    component paints to the screen.
 *
 * Action you can take in a tutorial:
 *  ✦ Remove <StrictMode> temporarily and observe that double-invoking warnings
 *    disappear in the console — then add it back to explain why it matters.
 *  ✦ Change the selector from 'root' to something that doesn't exist and show
 *    the resulting error to explain how React finds its mounting point.
 */

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Mount the React component tree into the <div id="root"> in index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
