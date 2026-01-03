// Screen Tint - Color overlay to reduce visual stress

import { ScreenTintSettings } from '@/types';

const TINT_ID = 'lexilens-screen-tint';

// Preset color values
const PRESETS: Record<ScreenTintSettings['preset'], string> = {
  'none': 'transparent',
  'sepia': '#f5e6d3',
  'blue-light': '#ffedd5', // Warm orange-ish to filter blue
  'custom': '', // Uses customColor
};

/**
 * Get the actual color based on preset or custom
 */
function getColor(settings: ScreenTintSettings): string {
  if (settings.preset === 'custom') {
    return settings.customColor;
  }
  return PRESETS[settings.preset];
}

/**
 * Create the screen tint overlay
 */
function createTintOverlay(settings: ScreenTintSettings): HTMLDivElement {
  const overlay = document.createElement('div');
  overlay.id = TINT_ID;
  overlay.setAttribute('data-lexilens', 'screen-tint');
  
  const color = getColor(settings);
  
  Object.assign(overlay.style, {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: color,
    opacity: String(settings.intensity / 100),
    pointerEvents: 'none', // Allow clicks through
    zIndex: '2147483645', // High but below ruler
    mixBlendMode: 'multiply',
    transition: 'opacity 0.3s ease, background-color 0.3s ease',
  });
  
  return overlay;
}

/**
 * Enable the screen tint
 */
export function enableScreenTint(settings: ScreenTintSettings): void {
  let overlay = document.getElementById(TINT_ID) as HTMLDivElement | null;
  
  if (overlay) {
    updateScreenTint(settings);
    return;
  }
  
  overlay = createTintOverlay(settings);
  document.body.appendChild(overlay);
}

/**
 * Update screen tint settings
 */
export function updateScreenTint(settings: ScreenTintSettings): void {
  const overlay = document.getElementById(TINT_ID) as HTMLDivElement | null;
  
  if (!overlay) {
    if (settings.enabled && settings.preset !== 'none') {
      enableScreenTint(settings);
    }
    return;
  }
  
  const color = getColor(settings);
  overlay.style.backgroundColor = color;
  overlay.style.opacity = String(settings.intensity / 100);
}

/**
 * Disable the screen tint
 */
export function disableScreenTint(): void {
  const overlay = document.getElementById(TINT_ID);
  
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }
}

/**
 * Check if screen tint is active
 */
export function isScreenTintActive(): boolean {
  return document.getElementById(TINT_ID) !== null;
}

/**
 * Get available preset options for UI
 */
export function getTintPresets(): Array<{ value: ScreenTintSettings['preset']; label: string; color: string }> {
  return [
    { value: 'none', label: 'None', color: 'transparent' },
    { value: 'sepia', label: 'Sepia (Warm)', color: '#f5e6d3' },
    { value: 'blue-light', label: 'Blue Light Filter', color: '#ffedd5' },
    { value: 'custom', label: 'Custom Color', color: '' },
  ];
}
