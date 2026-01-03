// Bionic Reading - Bold the first portion of words to guide the eye
// Adapted from working implementation

import { BionicReadingSettings } from '@/types';

const PROCESSED_CLASS = 'lexilens-bionic-processed';
let processingJob: number | null = null;
let isEnabled = false;

/**
 * Get bionic formatted word with bold first portion
 */
function getBionicWord(word: string, boldPercentage: number): string {
  const len = word.length;
  if (len < 1) return word;
  if (len === 1) return `<b>${word}</b>`;

  // Calculate split point based on percentage
  let splitPoint = Math.ceil(len * (boldPercentage / 100));
  
  // Ensure at least 1 character is bold
  if (splitPoint < 1) splitPoint = 1;
  
  // For very long words, cap at percentage to avoid visual clutter
  if (len > 10) {
    splitPoint = Math.max(1, Math.floor(len * (boldPercentage / 100)));
  }

  return `<b>${word.slice(0, splitPoint)}</b>${word.slice(splitPoint)}`;
}

/**
 * Process the page content for bionic reading
 */
function processPage(boldPercentage: number): void {
  // Cancel any ongoing job
  if (processingJob) {
    cancelAnimationFrame(processingJob);
    processingJob = null;
  }

  // Walk the tree to collect text nodes
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.tagName;
        if (['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG', 'IMG', 'CANVAS', 'VIDEO', 'AUDIO'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }

        // Content Editable protection
        if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;

        // Skip our own extension elements
        if (parent.closest('[data-lexilens]') || parent.closest('.lexilens-widget') || parent.closest('#lexilens-root')) {
          return NodeFilter.FILTER_REJECT;
        }

        // Skip already processed
        if (parent.classList.contains(PROCESSED_CLASS)) {
          return NodeFilter.FILTER_REJECT;
        }

        if (!node.nodeValue?.trim()) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodesToProcess: Text[] = [];
  while (walker.nextNode()) {
    nodesToProcess.push(walker.currentNode as Text);
  }

  console.log(`[LexiLens] Bionic Reading: Found ${nodesToProcess.length} text nodes`);

  // Process nodes in chunks using requestAnimationFrame
  let index = 0;

  const processChunk = () => {
    if (!isEnabled) {
      processingJob = null;
      return;
    }

    const startTime = performance.now();

    // Process for max 10ms per frame to keep UI responsive
    while (index < nodesToProcess.length && performance.now() - startTime < 10) {
      const textNode = nodesToProcess[index++];

      // Double check it's still in DOM
      if (!textNode.isConnected) continue;

      const text = textNode.nodeValue || '';
      
      // Split keeping whitespace as delimiters
      const parts = text.split(/(\s+)/);

      const fragment = document.createDocumentFragment();
      let changed = false;

      parts.forEach(part => {
        // If it's whitespace, just add it as text
        if (!part.trim()) {
          fragment.appendChild(document.createTextNode(part));
          return;
        }

        // Check if the part contains letters (words to process)
        if (/[a-zA-Z]/.test(part)) {
          changed = true;
          const span = document.createElement('span');
          span.className = PROCESSED_CLASS;
          span.innerHTML = getBionicWord(part, boldPercentage);
          fragment.appendChild(span);
        } else {
          // Non-letter content (numbers, symbols)
          fragment.appendChild(document.createTextNode(part));
        }
      });

      if (changed && textNode.parentNode) {
        textNode.replaceWith(fragment);
      }
    }

    if (index < nodesToProcess.length && isEnabled) {
      processingJob = requestAnimationFrame(processChunk);
    } else {
      processingJob = null;
      console.log('[LexiLens] Bionic Reading: Processing complete');
    }
  };

  processingJob = requestAnimationFrame(processChunk);
}

/**
 * Revert all bionic reading changes
 */
function revertChanges(): void {
  // Cancel any ongoing processing
  if (processingJob) {
    cancelAnimationFrame(processingJob);
    processingJob = null;
  }

  // Find all our processed spans
  const processed = document.querySelectorAll(`.${PROCESSED_CLASS}`);

  // Collect parents to normalize after
  const parents = new Set<HTMLElement>();
  
  processed.forEach(span => {
    if (span.parentElement) parents.add(span.parentElement);
    // Replace span with its text content
    const text = span.textContent || '';
    span.replaceWith(document.createTextNode(text));
  });

  // Normalize parents to merge adjacent text nodes back into one
  parents.forEach(parent => {
    try {
      parent.normalize();
    } catch (e) {
      // Ignore errors from detached nodes
    }
  });
}

/**
 * Enable bionic reading
 */
export function enableBionicReading(settings: BionicReadingSettings): void {
  if (isEnabled) {
    // Already enabled, just update
    return;
  }
  
  isEnabled = true;
  console.log(`[LexiLens] Enabling Bionic Reading (${settings.boldPercentage}% bold)`);
  
  // Small delay to allow page to settle
  setTimeout(() => {
    if (isEnabled) {
      processPage(settings.boldPercentage);
    }
  }, 100);
}

/**
 * Disable bionic reading and restore original content
 */
export function disableBionicReading(): void {
  console.log('[LexiLens] Disabling Bionic Reading');
  isEnabled = false;
  revertChanges();
}

/**
 * Update bionic reading settings
 */
export function updateBionicReading(settings: BionicReadingSettings): void {
  if (isEnabled && settings.enabled) {
    // Revert and re-apply with new settings
    revertChanges();
    setTimeout(() => {
      if (isEnabled) {
        processPage(settings.boldPercentage);
      }
    }, 50);
  }
}

/**
 * Check if bionic reading is active
 */
export function isBionicReadingActive(): boolean {
  return isEnabled;
}
