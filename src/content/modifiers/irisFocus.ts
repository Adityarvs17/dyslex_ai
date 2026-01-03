import { IrisFocusSettings } from '@/types';

let overlayElement: HTMLElement | null = null;
let isInitialized = false;
let currentX = 0;
let currentY = 0;

const OVERLAY_ID = 'lexilens-iris-overlay';
const GAZE_EVENT = 'LEXILENS_GAZE_DATA';
const CMD_EVENT = 'LEXILENS_CMD';

// Smooth animation using CSS transitions
const TRANSITION_DURATION = '0.15s'; // Smooth but responsive

/**
 * Handle gaze data from the driver
 */
function handleMessage(event: MessageEvent) {
  if (event.data.type === GAZE_EVENT && overlayElement) {
    const { x, y } = event.data.payload;
    if (typeof x === 'number' && typeof y === 'number') {
      currentX = x;
      currentY = y;
      
      // Use transform for better performance
      overlayElement.style.setProperty('--gaze-x', `${x}px`);
      overlayElement.style.setProperty('--gaze-y', `${y}px`);
    }
  }
}

/**
 * Inject scripts into the page
 */
function injectScripts() {
  if (isInitialized) return;

  // Request injection from Background script (bypasses CSP)
  chrome.runtime.sendMessage({ type: 'INJECT_IRIS' });

  window.addEventListener('message', handleMessage);
  isInitialized = true;
}

/**
 * Create the overlay element with improved styling
 */
function createOverlay(settings: IrisFocusSettings): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('data-lexilens', 'iris-overlay');
  
  // Get initial center position
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483646;
    pointer-events: none;
    
    /* Blur outside the focus area */
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    
    /* CSS Variables for dynamic positioning */
    --gaze-x: ${centerX}px;
    --gaze-y: ${centerY}px;
    --spotlight-radius: ${settings.spotlightRadius}px;
    --spotlight-feather: 50px;
    
    /* Radial gradient mask - transparent in center, opaque outside */
    mask-image: radial-gradient(
      circle at var(--gaze-x) var(--gaze-y),
      transparent 0px,
      transparent var(--spotlight-radius),
      rgba(0,0,0,0.3) calc(var(--spotlight-radius) + var(--spotlight-feather)),
      rgba(0,0,0,1) calc(var(--spotlight-radius) + var(--spotlight-feather) + 100px)
    );
    -webkit-mask-image: radial-gradient(
      circle at var(--gaze-x) var(--gaze-y),
      transparent 0px,
      transparent var(--spotlight-radius),
      rgba(0,0,0,0.3) calc(var(--spotlight-radius) + var(--spotlight-feather)),
      rgba(0,0,0,1) calc(var(--spotlight-radius) + var(--spotlight-feather) + 100px)
    );
    
    /* Smooth transition for spotlight movement */
    transition: mask-image 0.1s ease-out, -webkit-mask-image 0.1s ease-out;
  `;
  
  return overlay;
}

/**
 * Enable Iris Focus
 */
export function enableIrisFocus(settings: IrisFocusSettings): void {
  console.log('[LexiLens] Enabling Iris Focus');
  
  // 1. Ensure scripts are injected
  injectScripts();

  // 2. Create Overlay if needed
  if (!overlayElement) {
    overlayElement = createOverlay(settings);
    document.documentElement.appendChild(overlayElement);
  } else {
    overlayElement.style.display = 'block';
  }

  // 3. Update Settings
  updateIrisFocus(settings);

  // 4. Start Driver with delay for script load
  setTimeout(() => {
    window.postMessage({ type: CMD_EVENT, command: 'START' }, '*');
  }, 1500);
}

/**
 * Update Iris Focus Settings
 */
export function updateIrisFocus(settings: IrisFocusSettings): void {
  if (overlayElement) {
    overlayElement.style.setProperty('--spotlight-radius', `${settings.spotlightRadius}px`);
  }
}

/**
 * Disable Iris Focus
 */
export function disableIrisFocus(): void {
  console.log('[LexiLens] Disabling Iris Focus');
  
  if (overlayElement) {
    overlayElement.style.display = 'none';
  }

  // Stop Driver
  window.postMessage({ type: CMD_EVENT, command: 'STOP' }, '*');
}

/**
 * Set calibration offset for position correction
 */
export function setCalibrationOffset(offsetX: number, offsetY: number): void {
  window.postMessage({ 
    type: CMD_EVENT, 
    command: 'SET_OFFSET', 
    value: { x: offsetX, y: offsetY } 
  }, '*');
}

/**
 * Start Calibration (show video preview)
 */
export function startCalibration(): void {
  window.postMessage({ type: CMD_EVENT, command: 'TOGGLE_VIDEO', value: true }, '*');
  console.log('[LexiLens] Calibration started - look at the calibration points');
}

/**
 * Record a calibration point
 */
export function recordCalibrationPoint(screenX: number, screenY: number): void {
  window.postMessage({ 
    type: CMD_EVENT, 
    command: 'CALIBRATE_POINT', 
    value: { x: screenX, y: screenY } 
  }, '*');
}
