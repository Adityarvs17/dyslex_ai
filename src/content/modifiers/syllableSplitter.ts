// Syllable Splitter - Visual syllable separation for easier reading

import { SyllableSplitterSettings } from '@/types';

const PROCESSED_ATTR = 'data-lexilens-syllable';
const ORIGINAL_ATTR = 'data-lexilens-syllable-original';

let isEnabled = false;

/**
 * Simple syllable splitting rules for English
 * This is a simplified implementation - for production, consider using a proper hyphenation library
 */
const VOWELS = 'aeiouyAEIOUY';
const CONSONANTS = 'bcdfghjklmnpqrstvwxzBCDFGHJKLMNPQRSTVWXZ';

/**
 * Check if a character is a vowel
 */
function isVowel(char: string): boolean {
  return VOWELS.includes(char);
}

/**
 * Split a word into syllables using basic English rules
 */
function splitIntoSyllables(word: string): string[] {
  if (word.length <= 3) return [word];
  
  const syllables: string[] = [];
  let current = '';
  let i = 0;
  
  while (i < word.length) {
    const char = word[i];
    current += char;
    
    // Check for syllable break opportunities
    if (i < word.length - 2) {
      const next = word[i + 1];
      const nextNext = word[i + 2];
      
      // Pattern: vowel + consonant + vowel -> split before consonant
      if (isVowel(char) && !isVowel(next) && isVowel(nextNext)) {
        syllables.push(current);
        current = '';
      }
      // Pattern: vowel + double consonant -> split between consonants
      else if (isVowel(char) && !isVowel(next) && !isVowel(nextNext) && next === nextNext) {
        current += next;
        syllables.push(current);
        current = '';
        i++; // Skip the doubled consonant
      }
      // Pattern: two different consonants between vowels -> split between them
      else if (isVowel(char) && !isVowel(next) && !isVowel(nextNext) && next !== nextNext) {
        current += next;
        syllables.push(current);
        current = '';
        i++;
      }
    }
    
    i++;
  }
  
  // Add remaining characters
  if (current) {
    if (syllables.length > 0 && current.length <= 2 && !current.match(/[aeiouy]/i)) {
      // Attach short consonant endings to previous syllable
      syllables[syllables.length - 1] += current;
    } else {
      syllables.push(current);
    }
  }
  
  return syllables.filter(s => s.length > 0);
}

/**
 * Process a text node to add syllable separators
 */
function processTextNode(textNode: Text, separator: string): DocumentFragment {
  const text = textNode.textContent || '';
  const fragment = document.createDocumentFragment();
  
  // Match words and non-words
  const regex = /([a-zA-Z']+)|([^a-zA-Z']+)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const word = match[1];
    const nonWord = match[2];
    
    if (word && word.length > 3) {
      const syllables = splitIntoSyllables(word);
      const span = document.createElement('span');
      span.setAttribute('data-lexilens-syllables', syllables.join(separator));
      span.textContent = syllables.join(separator);
      span.style.letterSpacing = '0.5px';
      fragment.appendChild(span);
    } else if (word) {
      fragment.appendChild(document.createTextNode(word));
    } else if (nonWord) {
      fragment.appendChild(document.createTextNode(nonWord));
    }
  }
  
  return fragment;
}

/**
 * Check if an element should be skipped
 */
function shouldSkipElement(element: Element): boolean {
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'CANVAS', 'CODE', 'PRE', 'KBD', 'INPUT', 'TEXTAREA'];
  
  if (skipTags.includes(element.tagName)) return true;
  if (element.hasAttribute(PROCESSED_ATTR)) return true;
  if (element.hasAttribute('data-lexilens-syllables')) return true;
  if (element.closest('.lexilens-widget')) return true;
  if (element.getAttribute('contenteditable') === 'true') return true;
  
  return false;
}

/**
 * Apply syllable splitting to a subtree
 */
function applyToSubtree(root: Element | Document, separator: string): void {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (shouldSkipElement(parent)) return NodeFilter.FILTER_REJECT;
        if (!node.textContent?.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  const textNodes: Text[] = [];
  let node: Text | null;
  
  while ((node = walker.nextNode() as Text | null)) {
    textNodes.push(node);
  }
  
  // Process in reverse
  for (let i = textNodes.length - 1; i >= 0; i--) {
    const textNode = textNodes[i];
    const parent = textNode.parentElement;
    
    if (!parent || parent.hasAttribute(PROCESSED_ATTR)) continue;
    
    // Store original for reverting
    if (!parent.hasAttribute(ORIGINAL_ATTR)) {
      parent.setAttribute(ORIGINAL_ATTR, parent.innerHTML);
    }
    
    const fragment = processTextNode(textNode, separator);
    textNode.replaceWith(fragment);
    parent.setAttribute(PROCESSED_ATTR, 'true');
  }
}

/**
 * Enable syllable splitter
 */
export function enableSyllableSplitter(settings: SyllableSplitterSettings): void {
  if (isEnabled) return;
  isEnabled = true;
  
  applyToSubtree(document.body, settings.separator);
  
  // Observe for new content
  // Optimize with debounce to prevent UI stuttering
  let timeout: number | null = null;

  // Observe for new content
  const observer = new MutationObserver((mutations) => {
    // Collect all elements to process
    const elementsToProcess: Element[] = [];
    
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (!shouldSkipElement(element)) {
            elementsToProcess.push(element);
          }
        }
      }
    }
    
    if (elementsToProcess.length === 0) return;

    // Debounce processing
    if (timeout) window.clearTimeout(timeout);
    
    timeout = window.setTimeout(() => {
      // Disconnect to avoid observing our own changes
      observer.disconnect();
      
      try {
        elementsToProcess.forEach(el => applyToSubtree(el, settings.separator));
      } finally {
        // Reconnect
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
        timeout = null;
      }
    }, 100);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  
  (window as any).__lexilensSyllableObserver = observer;
}

/**
 * Disable syllable splitter
 */
export function disableSyllableSplitter(): void {
  isEnabled = false;
  
  const observer = (window as any).__lexilensSyllableObserver as MutationObserver | undefined;
  if (observer) {
    observer.disconnect();
    delete (window as any).__lexilensSyllableObserver;
  }
  
  // Restore original content
  const processed = document.querySelectorAll(`[${ORIGINAL_ATTR}]`);
  processed.forEach((el) => {
    const original = el.getAttribute(ORIGINAL_ATTR);
    if (original) {
      el.innerHTML = original;
    }
    el.removeAttribute(PROCESSED_ATTR);
    el.removeAttribute(ORIGINAL_ATTR);
  });
}

/**
 * Update syllable splitter settings
 */
export function updateSyllableSplitter(settings: SyllableSplitterSettings): void {
  if (isEnabled) {
    disableSyllableSplitter();
    enableSyllableSplitter(settings);
  }
}

/**
 * Check if syllable splitter is active
 */
export function isSyllableSplitterActive(): boolean {
  return isEnabled;
}
