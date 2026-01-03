// Focus Mode - Dims page except for hovered paragraph

import { FocusModeSettings } from '@/types';

const STYLE_ID = 'lexilens-focus-mode-styles';
const FOCUS_CLASS = 'lexilens-focused';
const DIM_CLASS = 'lexilens-dimmed';

let isEnabled = false;
let currentFocused: Element | null = null;
let debounceTimer: number | null = null;

// Selector for focusable text containers
const FOCUSABLE_SELECTORS = [
  'p',
  'article',
  'section',
  'blockquote',
  'li',
  '.paragraph',
  '[role="article"]',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
].join(', ');

/**
 * Generate focus mode CSS
 */
function generateFocusModeCSS(dimOpacity: number): string {
  return `
    /* Focus mode dimming */
    .${DIM_CLASS} {
      opacity: ${1 - dimOpacity} !important;
      transition: opacity 0.2s ease !important;
    }
    
    .${FOCUS_CLASS} {
      opacity: 1 !important;
      transition: opacity 0.2s ease !important;
      position: relative;
      z-index: 1;
    }
    
    /* Ensure the focused element stands out */
    .${FOCUS_CLASS}::before {
      content: '';
      position: absolute;
      top: -8px;
      left: -12px;
      right: -12px;
      bottom: -8px;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
      pointer-events: none;
      z-index: -1;
    }
  `;
}

/**
 * Find the closest focusable ancestor
 */
function findFocusableElement(target: Element): Element | null {
  return target.closest(FOCUSABLE_SELECTORS);
}

/**
 * Handle mouse movement with debouncing
 */
function handleMouseMove(event: MouseEvent): void {
  if (debounceTimer) {
    window.clearTimeout(debounceTimer);
  }
  
  debounceTimer = window.setTimeout(() => {
    const target = event.target as Element;
    if (!target) return;
    
    const focusable = findFocusableElement(target);
    
    if (focusable === currentFocused) return;
    
    // Remove focus from previous element
    if (currentFocused) {
      currentFocused.classList.remove(FOCUS_CLASS);
      currentFocused.classList.add(DIM_CLASS);
    }
    
    // Add focus to new element
    if (focusable) {
      focusable.classList.remove(DIM_CLASS);
      focusable.classList.add(FOCUS_CLASS);
      currentFocused = focusable;
    } else {
      currentFocused = null;
    }
  }, 50); // 50ms debounce
}

/**
 * Apply initial dimming to all elements
 */
function applyInitialDimming(): void {
  const elements = document.querySelectorAll(FOCUSABLE_SELECTORS);
  elements.forEach((el) => {
    if (!el.closest('.lexilens-widget')) {
      el.classList.add(DIM_CLASS);
    }
  });
}

/**
 * Remove all focus mode classes
 */
function removeAllClasses(): void {
  const dimmed = document.querySelectorAll(`.${DIM_CLASS}`);
  const focused = document.querySelectorAll(`.${FOCUS_CLASS}`);
  
  dimmed.forEach((el) => el.classList.remove(DIM_CLASS));
  focused.forEach((el) => el.classList.remove(FOCUS_CLASS));
}

/**
 * Enable focus mode
 */
export function enableFocusMode(settings: FocusModeSettings): void {
  if (isEnabled) {
    updateFocusMode(settings);
    return;
  }
  
  isEnabled = true;
  
  // Add styles
  let styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = STYLE_ID;
    styleElement.setAttribute('data-lexilens', 'focus-mode');
    document.head.appendChild(styleElement);
  }
  styleElement.textContent = generateFocusModeCSS(settings.dimOpacity);
  
  // Apply initial dimming
  applyInitialDimming();
  
  // Add event listener
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
}

/**
 * Update focus mode settings
 */
export function updateFocusMode(settings: FocusModeSettings): void {
  const styleElement = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (styleElement) {
    styleElement.textContent = generateFocusModeCSS(settings.dimOpacity);
  }
}

/**
 * Disable focus mode
 */
export function disableFocusMode(): void {
  isEnabled = false;
  
  if (debounceTimer) {
    window.clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  
  document.removeEventListener('mousemove', handleMouseMove);
  
  removeAllClasses();
  currentFocused = null;
  
  const styleElement = document.getElementById(STYLE_ID);
  if (styleElement) {
    styleElement.remove();
  }
}

/**
 * Check if focus mode is active
 */
export function isFocusModeActive(): boolean {
  return isEnabled;
}
