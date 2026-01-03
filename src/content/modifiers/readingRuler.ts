// Reading Ruler - Horizontal bar that follows cursor to isolate text lines

import { ReadingRulerSettings } from '@/types';

const RULER_ID = 'lexilens-reading-ruler';
let rulerElement: HTMLDivElement | null = null;
let lastY = 0;
let animationFrameId: number | null = null;
let isEnabled = false;

/**
 * Create the reading ruler element
 */
function createRuler(settings: ReadingRulerSettings): HTMLDivElement {
  const ruler = document.createElement('div');
  ruler.id = RULER_ID;
  ruler.setAttribute('data-lexilens', 'reading-ruler');
  
  Object.assign(ruler.style, {
    position: 'fixed',
    left: '0',
    right: '0',
    height: `${settings.height}px`,
    backgroundColor: settings.color,
    opacity: String(settings.opacity),
    pointerEvents: 'none',
    zIndex: '2147483646', // Just below max to stay on top
    transform: 'translateY(-50%)',
    transition: 'top 0.05s ease-out, opacity 0.2s ease',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.1)',
    top: '-100px', // Start off-screen
  });
  
  return ruler;
}

/**
 * Handle mouse movement with smooth animation
 */
function handleMouseMove(event: MouseEvent): void {
  lastY = event.clientY;
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  
  animationFrameId = requestAnimationFrame(() => {
    if (rulerElement) {
      rulerElement.style.top = `${lastY}px`;
    }
  });
}

/**
 * Handle mouse leaving the window
 */
function handleMouseLeave(): void {
  if (rulerElement) {
    rulerElement.style.opacity = '0';
  }
}

/**
 * Handle mouse entering the window
 */
function handleMouseEnter(): void {
  if (rulerElement && isEnabled) {
    const settings = rulerElement.dataset.opacity;
    rulerElement.style.opacity = settings || '0.4';
  }
}

/**
 * Enable the reading ruler
 */
export function enableReadingRuler(settings: ReadingRulerSettings): void {
  if (rulerElement) {
    updateReadingRuler(settings);
    return;
  }
  
  isEnabled = true;
  rulerElement = createRuler(settings);
  rulerElement.dataset.opacity = String(settings.opacity);
  document.body.appendChild(rulerElement);
  
  document.addEventListener('mousemove', handleMouseMove, { passive: true });
  document.addEventListener('mouseleave', handleMouseLeave);
  document.addEventListener('mouseenter', handleMouseEnter);
  
  // Fade in
  requestAnimationFrame(() => {
    if (rulerElement) {
      rulerElement.style.opacity = String(settings.opacity);
    }
  });
}

/**
 * Update reading ruler settings
 */
export function updateReadingRuler(settings: ReadingRulerSettings): void {
  if (!rulerElement) {
    if (settings.enabled) {
      enableReadingRuler(settings);
    }
    return;
  }
  
  rulerElement.style.height = `${settings.height}px`;
  rulerElement.style.backgroundColor = settings.color;
  rulerElement.style.opacity = String(settings.opacity);
  rulerElement.dataset.opacity = String(settings.opacity);
}

/**
 * Disable the reading ruler
 */
export function disableReadingRuler(): void {
  isEnabled = false;
  
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseleave', handleMouseLeave);
  document.removeEventListener('mouseenter', handleMouseEnter);
  
  if (rulerElement) {
    rulerElement.style.opacity = '0';
    setTimeout(() => {
      rulerElement?.remove();
      rulerElement = null;
    }, 200);
  }
}

/**
 * Check if reading ruler is active
 */
export function isReadingRulerActive(): boolean {
  return isEnabled && rulerElement !== null;
}
