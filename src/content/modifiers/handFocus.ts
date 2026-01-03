// Hand Focus - Track hand movement to control focus spotlight
// Uses MediaPipe Hands to detect index finger position
// UPDATED: Robust handshake mechanism

import { HandFocusSettings } from '@/types';

let overlayElement: HTMLElement | null = null;
let isInitialized = false;
let isEnabled = false;
let handDetected = false;
let handshakeInterval: number | null = null;
let isDriverReady = false;

const OVERLAY_ID = 'lexilens-hand-overlay';
const HAND_EVENT = 'LEXILENS_HAND_DATA';
const CMD_EVENT = 'LEXILENS_HAND_CMD';
const ACK_EVENT = 'LEXILENS_HAND_ACK';

/**
 * Handle incoming messages
 */
function handleMessage(event: MessageEvent) {
  // Hand position data
  if (event.data.type === HAND_EVENT && overlayElement) {
    const { x, y, detected } = event.data.payload;
    
    if (detected && typeof x === 'number' && typeof y === 'number') {
      handDetected = true;
      overlayElement.style.setProperty('--hand-x', `${x}px`);
      overlayElement.style.setProperty('--hand-y', `${y}px`);
      overlayElement.style.opacity = '1';
    } else {
      handDetected = false;
      overlayElement.style.opacity = '0.3';
    }
  } 
  // Driver handshake/status
  else if (event.data.type === ACK_EVENT) {
    console.log('[LexiLens Content] Driver status:', event.data.status);
    
    if (event.data.status === 'DRIVER_LOADED') {
      isDriverReady = true;
      if (isEnabled) {
         // Driver just loaded and we are enabled, so start it
         const baseUrl = chrome.runtime.getURL('mediapipe/');
         sendCommand('START', { baseUrl });
         stopHandshake();
      }
    } else if (event.data.status === 'STARTED') {
      // Driver successfully started
      stopHandshake();
    } else if (event.data.status === 'ERROR') {
      console.error('[LexiLens Content] Driver error:', event.data.message);
    }
  }
}

function sendCommand(command: string, value?: any) {
  window.postMessage({ type: CMD_EVENT, command, value }, '*');
}

function stopHandshake() {
  if (handshakeInterval) {
    clearInterval(handshakeInterval);
    handshakeInterval = null;
  }
}

/**
 * Inject MediaPipe and Driver scripts
 */
function injectScripts() {
  if (isInitialized) return;

  const scriptId = 'lexilens-mediapipe-script';
  if (document.getElementById(scriptId)) {
    isInitialized = true;
    return;
  }

  // Inject MediaPipe Hands library (Local)
  const mediapipeScript = document.createElement('script');
  mediapipeScript.id = scriptId;
  mediapipeScript.src = chrome.runtime.getURL('mediapipe/hands.js');
  // mediapipeScript.crossOrigin = 'anonymous'; 
  document.head.appendChild(mediapipeScript);

  mediapipeScript.onload = () => {
    console.log('[LexiLens Content] MediaPipe lib loaded');
    // Inject hand driver
    const driverScript = document.createElement('script');
    driverScript.src = chrome.runtime.getURL('hand-driver.js');
    document.head.appendChild(driverScript);
  };
  
  mediapipeScript.onerror = (e) => {
    console.error('[LexiLens Content] Failed to load MediaPipe library', e);
  };

  window.addEventListener('message', handleMessage);
  isInitialized = true;
}

/**
 * Create the focus overlay
 */
function createOverlay(settings: HandFocusSettings): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = OVERLAY_ID;
  overlay.setAttribute('data-lexilens', 'hand-overlay');
  
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483645;
    pointer-events: none;
    backdrop-filter: blur(${settings.blurAmount || 6}px);
    -webkit-backdrop-filter: blur(${settings.blurAmount || 6}px);
    --hand-x: ${centerX}px;
    --hand-y: ${centerY}px;
    --spotlight-radius: ${settings.spotlightRadius}px;
    --feather: 60px;
    mask-image: radial-gradient(
      circle at var(--hand-x) var(--hand-y),
      transparent 0px,
      transparent var(--spotlight-radius),
      rgba(0,0,0,0.5) calc(var(--spotlight-radius) + var(--feather)),
      rgba(0,0,0,1) calc(var(--spotlight-radius) + var(--feather) + 80px)
    );
    -webkit-mask-image: radial-gradient(
      circle at var(--hand-x) var(--hand-y),
      transparent 0px,
      transparent var(--spotlight-radius),
      rgba(0,0,0,0.5) calc(var(--spotlight-radius) + var(--feather)),
      rgba(0,0,0,1) calc(var(--spotlight-radius) + var(--feather) + 80px)
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  return overlay;
}

/**
 * Enable Hand Focus
 */
export function enableHandFocus(settings: HandFocusSettings): void {
  if (isEnabled) return;
  
  console.log('[LexiLens Content] Enabling Hand Focus');
  isEnabled = true;

  // 1. Inject scripts (idempotent)
  injectScripts();

  // 2. Setup UI
  if (!overlayElement) {
    overlayElement = createOverlay(settings);
    document.documentElement.appendChild(overlayElement);
  } else {
    overlayElement.style.display = 'block';
  }
  updateHandFocus(settings);

  // 3. Initiate Startup Sequence
  const baseUrl = chrome.runtime.getURL('mediapipe/');
  sendCommand('START', { baseUrl }); 

  stopHandshake();
  handshakeInterval = window.setInterval(() => {
    if (!isEnabled) { 
        stopHandshake(); 
        return; 
    }
    console.log('[LexiLens Content] Pinging driver...');
    sendCommand('PING');
    // Also retry start just in case
    sendCommand('START', { baseUrl });
  }, 1000);
}

/**
 * Update Hand Focus settings
 */
export function updateHandFocus(settings: HandFocusSettings): void {
  if (overlayElement) {
    overlayElement.style.setProperty('--spotlight-radius', `${settings.spotlightRadius}px`);
    if (settings.blurAmount) {
      overlayElement.style.backdropFilter = `blur(${settings.blurAmount}px)`;
      (overlayElement.style as any).webkitBackdropFilter = `blur(${settings.blurAmount}px)`;
    }
  }
}

/**
 * Disable Hand Focus
 */
export function disableHandFocus(): void {
  console.log('[LexiLens Content] Disabling Hand Focus');
  isEnabled = false;
  handDetected = false;
  isDriverReady = false; 
  stopHandshake();

  if (overlayElement) {
    overlayElement.style.display = 'none';
  }

  sendCommand('STOP');
}
