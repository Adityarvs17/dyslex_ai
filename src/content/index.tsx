import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from './ui/App';

// Tailwind CSS will be injected into the shadow root
import styles from '../styles/index.css?inline';

const CONTAINER_ID = 'lexilens-root';

let root: Root | null = null;
let shadowHost: HTMLDivElement | null = null;

/**
 * Initialize the LexiLens widget in a Shadow DOM container
 */
function initLexiLens(): void {
  // Check if already initialized
  if (document.getElementById(CONTAINER_ID)) {
    console.log('[LexiLens] Already initialized');
    return;
  }

  // Don't inject on extension pages or special pages
  if (
    window.location.protocol === 'chrome-extension:' ||
    window.location.protocol === 'chrome:' ||
    window.location.protocol === 'moz-extension:' ||
    window.location.protocol === 'about:' ||
    window.location.hostname === 'newtab'
  ) {
    console.log('[LexiLens] Skipping extension/special page');
    return;
  }

  // Create the shadow host container
  shadowHost = document.createElement('div');
  shadowHost.id = CONTAINER_ID;
  shadowHost.className = 'lexilens-widget';
  shadowHost.setAttribute('data-lexilens', 'root');
  
  // Ensure it doesn't interfere with page layout
  Object.assign(shadowHost.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '0',
    height: '0',
    overflow: 'visible',
    zIndex: '2147483647',
    pointerEvents: 'none', // Let the actual content handle pointer events
  });

  // Create shadow root for style isolation
  const shadowRoot = shadowHost.attachShadow({ mode: 'closed' });

  // Inject Tailwind CSS into shadow root
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  shadowRoot.appendChild(styleSheet);

  // Add custom styles for the widget container
  const widgetStyles = document.createElement('style');
  widgetStyles.textContent = `
    :host {
      all: initial;
    }
    
    .widget-container {
      pointer-events: auto;
      font-family: 'OpenDyslexic', 'Comic Sans MS', Arial, sans-serif;
    }
    
    * {
      box-sizing: border-box;
      font-family: inherit;
    }
  `;
  shadowRoot.appendChild(widgetStyles);

  // Create React mount point
  const mountPoint = document.createElement('div');
  mountPoint.className = 'widget-container';
  shadowRoot.appendChild(mountPoint);

  // Mount the shadow host to the document
  document.body.appendChild(shadowHost);

  // Create React root and render
  root = createRoot(mountPoint);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('[LexiLens] Initialized successfully');
}

/**
 * Cleanup function
 */
function cleanup(): void {
  if (root) {
    root.unmount();
    root = null;
  }
  if (shadowHost) {
    shadowHost.remove();
    shadowHost = null;
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLexiLens);
} else {
  initLexiLens();
}

// Cleanup on pagehide (replaces deprecated unload)
window.addEventListener('pagehide', cleanup);

// Export for hot module replacement during development
if (import.meta.hot) {
  import.meta.hot.accept();
  import.meta.hot.dispose(cleanup);
}
