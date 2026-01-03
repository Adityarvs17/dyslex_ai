// Text-to-Speech utility using Web Speech API

import { AudioSettings } from '@/types';

let synthesis: SpeechSynthesis | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let isReading = false;
let highlightedElements: HTMLElement[] = [];

// Highlight styles
const HIGHLIGHT_STYLE = 'lexilens-tts-highlight';
let styleElement: HTMLStyleElement | null = null;

/**
 * Initialize the speech synthesis
 */
function initSynthesis(): SpeechSynthesis {
  if (!synthesis) {
    synthesis = window.speechSynthesis;
  }
  return synthesis;
}

/**
 * Get available voices
 */
export function getVoices(): SpeechSynthesisVoice[] {
  const synth = initSynthesis();
  return synth.getVoices().filter(voice => voice.lang.startsWith('en'));
}

/**
 * Wait for voices to load (they load asynchronously)
 */
export function onVoicesReady(callback: (voices: SpeechSynthesisVoice[]) => void): void {
  const synth = initSynthesis();
  
  const voices = synth.getVoices();
  if (voices.length > 0) {
    callback(voices.filter(v => v.lang.startsWith('en')));
    return;
  }
  
  synth.onvoiceschanged = () => {
    callback(synth.getVoices().filter(v => v.lang.startsWith('en')));
  };
}

/**
 * Create highlight style element
 */
function ensureHighlightStyle(color: string): void {
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'lexilens-tts-styles';
    document.head.appendChild(styleElement);
  }
  
  styleElement.textContent = `
    .${HIGHLIGHT_STYLE} {
      background-color: ${color} !important;
      border-radius: 2px;
      transition: background-color 0.1s ease;
    }
  `;
}

/**
 * Remove all highlights
 */
function clearHighlights(): void {
  highlightedElements.forEach(el => {
    el.classList.remove(HIGHLIGHT_STYLE);
  });
  highlightedElements = [];
}

/**
 * Speak text with optional highlighting
 */
export function speak(
  text: string, 
  settings: AudioSettings,
  element?: HTMLElement
): Promise<void> {
  return new Promise((resolve, reject) => {
    const synth = initSynthesis();
    
    // Cancel any ongoing speech
    stop();
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = settings.speed;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Set voice if specified
    if (settings.voiceURI) {
      const voices = synth.getVoices();
      const voice = voices.find(v => v.voiceURI === settings.voiceURI);
      if (voice) {
        utterance.voice = voice;
      }
    }
    
    currentUtterance = utterance;
    isReading = true;
    
    // Highlight the element being read
    if (element && settings.highlightColor) {
      ensureHighlightStyle(settings.highlightColor);
      element.classList.add(HIGHLIGHT_STYLE);
      highlightedElements.push(element);
    }
    
    utterance.onend = () => {
      isReading = false;
      clearHighlights();
      currentUtterance = null;
      resolve();
    };
    
    utterance.onerror = (event) => {
      isReading = false;
      clearHighlights();
      currentUtterance = null;
      if (event.error !== 'canceled') {
        reject(new Error(event.error));
      } else {
        resolve();
      }
    };
    
    synth.speak(utterance);
  });
}

/**
 * Stop current speech
 */
export function stop(): void {
  if (synthesis) {
    synthesis.cancel();
  }
  isReading = false;
  clearHighlights();
  currentUtterance = null;
}

/**
 * Pause speech
 */
export function pause(): void {
  if (synthesis && isReading) {
    synthesis.pause();
  }
}

/**
 * Resume speech
 */
export function resume(): void {
  if (synthesis) {
    synthesis.resume();
  }
}

/**
 * Check if currently reading
 */
export function isSpeaking(): boolean {
  return isReading;
}

/**
 * Set up click-to-read functionality
 */
let clickHandler: ((e: MouseEvent) => void) | null = null;

export function enableClickToRead(settings: AudioSettings): void {
  if (clickHandler) return;
  
  clickHandler = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Skip if clicking on the widget
    if (target.closest('.lexilens-widget')) return;
    
    // Get text content from the clicked element or its parent paragraph
    const textElement = target.closest('p, h1, h2, h3, h4, h5, h6, li, span, div');
    if (!textElement) return;
    
    const text = textElement.textContent?.trim();
    if (!text) return;
    
    // If clicking the same element that's being read, stop
    if (highlightedElements.includes(textElement as HTMLElement) && isReading) {
      stop();
      return;
    }
    
    speak(text, settings, textElement as HTMLElement);
  };
  
  document.addEventListener('click', clickHandler);
}

export function disableClickToRead(): void {
  if (clickHandler) {
    document.removeEventListener('click', clickHandler);
    clickHandler = null;
  }
  stop();
}

/**
 * Read selected text
 */
export async function readSelection(settings: AudioSettings): Promise<void> {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed) return;
  
  const text = selection.toString().trim();
  if (!text) return;
  
  // Try to find the common ancestor for highlighting
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const element = container.nodeType === Node.ELEMENT_NODE 
    ? container as HTMLElement 
    : container.parentElement;
  
  await speak(text, settings, element || undefined);
}
