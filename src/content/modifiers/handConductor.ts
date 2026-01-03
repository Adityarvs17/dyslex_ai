
import { HandConductorSettings } from '@/types';

// Using the same MediaPipe driver infrastructure
let isInitialized = false;
let isEnabled = false;
let lastX = 0;
let lastY = 0;
let lastTimestamp = 0;
let handshakeInterval: number | null = null;
let isDriverReady = false;

const HAND_EVENT = 'LEXILENS_HAND_DATA';
const CMD_EVENT = 'LEXILENS_HAND_CMD';
const ACK_EVENT = 'LEXILENS_HAND_ACK';

// Thresholds for gestures and velocity
const TEMPO_THRESHOLD = 50; // px/sec movement for tempo/pacing
const SWIPE_THRESHOLD = 300; // px movement for swipe
const SWIPE_TIME_WINDOW = 500; // ms

interface SwipeState {
    startX: number;
    startTime: number;
    isTracking: boolean;
}

let swipeState: SwipeState = {
    startX: 0,
    startTime: 0,
    isTracking: false,
};

/**
 * Handle incoming hand data to detect rhythm and gestures
 */
function handleHandData(event: MessageEvent) {
    // 1. Hand Position Data
    if (event.data.type === HAND_EVENT) {
        const { x, y, detected } = event.data.payload;
        const now = Date.now();

        updateStatusVisuals(detected, true, false);

        if (detected && typeof x === 'number' && typeof y === 'number') {
            // Calculate Velocity (pixels per second)
            const dt = (now - lastTimestamp) / 1000;
            if (dt > 0 && lastTimestamp !== 0) {
                const dx = x - lastX;
                const dy = y - lastY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const velocity = distance / dt;

                // Dispatch velocity event for UI to consume
                window.dispatchEvent(new CustomEvent('LEXILENS_HAND_VELOCITY', {
                    detail: { velocity, x, y }
                }));

                // Gesture Recognition (Horizontal Swipe)
                detectSwipe(x, now);

                // Vertical Tempo (for reading pulse)
                if (Math.abs(dy) > 5) { // Noise filter
                    window.dispatchEvent(new CustomEvent('LEXILENS_HAND_SCROLL', {
                        detail: { deltaY: dy }
                    }));
                }
            }

            lastX = x;
            lastY = y;
            lastTimestamp = now;
        } else {
            // Reset tracking if hand lost
            swipeState.isTracking = false;
        }
    }
    // 2. Driver Handshake & Status
    else if (event.data.type === ACK_EVENT) {
        console.log('[LexiLens Conductor] Driver status:', event.data.status);

        if (event.data.status === 'DRIVER_LOADED') {
            isDriverReady = true;
            if (isEnabled) {
                const baseUrl = chrome.runtime.getURL('mediapipe/');
                sendCommand('START', { baseUrl });
                stopHandshake();
            }
        } else if (event.data.status === 'STARTED') {
            stopHandshake();
            updateStatusVisuals(false, true, false); // Driver active
        } else if (event.data.status === 'ERROR') {
            console.error('[LexiLens Conductor] Driver error:', event.data.message);
            updateStatusVisuals(false, false, true); // Error state
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
 * (Idempotent: safe to call even if HandFocus already did it)
 */
function injectScripts() {
    const scriptId = 'lexilens-mediapipe-script';
    if (document.getElementById(scriptId)) {
        return;
    }

    const mediapipeScript = document.createElement('script');
    mediapipeScript.id = scriptId;
    mediapipeScript.src = chrome.runtime.getURL('mediapipe/hands.js');
    document.head.appendChild(mediapipeScript);

    mediapipeScript.onload = () => {
        console.log('[LexiLens Conductor] MediaPipe lib loaded');
        const driverScript = document.createElement('script');
        driverScript.src = chrome.runtime.getURL('hand-driver.js');
        document.head.appendChild(driverScript);
    };
}

function detectSwipe(x: number, time: number) {
    if (!swipeState.isTracking) {
        swipeState.isTracking = true;
        swipeState.startX = x;
        swipeState.startTime = time;
    } else {
        // Check time window
        if (time - swipeState.startTime > SWIPE_TIME_WINDOW) {
            // Too slow, reset
            swipeState.isTracking = true;
            swipeState.startX = x;
            swipeState.startTime = time;
        } else {
            const dist = x - swipeState.startX;
            if (Math.abs(dist) > SWIPE_THRESHOLD) {
                // SWIPE DETECTED
                const direction = dist > 0 ? 'RIGHT' : 'LEFT';
                console.log(`[LexiLens] Swipe ${direction} Detected!`);

                // Dispatch gesture event
                window.dispatchEvent(new CustomEvent('LEXILENS_HAND_GESTURE', {
                    detail: { type: 'SWIPE', direction }
                }));

                // Reset
                swipeState.isTracking = false;
            }
        }
    }
}

/**
 * Enable Hand Conductor
 */
export function enableHandConductor(settings: HandConductorSettings): void {
    if (isEnabled) return;
    console.log('[LexiLens] Enabling Hand Conductor');
    isEnabled = true;
    isInitialized = true;

    // 1. Inject Scripts
    injectScripts();

    // 2. Listen to driver
    window.addEventListener('message', handleHandData);

    // 3. Create Visual Feedback (Glow + Status Dot)
    createConductorVisuals();

    // 4. Start Handshake
    stopHandshake();
    const baseUrl = chrome.runtime.getURL('mediapipe/');
    // Try immediate start
    sendCommand('START', { baseUrl });

    handshakeInterval = window.setInterval(() => {
        if (!isEnabled) { stopHandshake(); return; }
        console.log('[LexiLens Conductor] Connecting to driver...');
        sendCommand('PING');
        sendCommand('START', { baseUrl });
    }, 1000);
}

/**
 * Update Settings
 */
export function updateHandConductor(settings: HandConductorSettings): void {
    // Update internal thresholds based on sensitivity if needed
}

/**
 * Disable Hand Conductor
 */
export function disableHandConductor(): void {
    console.log('[LexiLens] Disabling Hand Conductor');
    isEnabled = false;
    window.removeEventListener('message', handleHandData);
    removeConductorVisuals();
    stopHandshake();

    // Only stop driver if HandFocus isn't using it? 
    // For now, we assume user turns off one feature before another or accepts shared driver stops.
    // Ideally we'd check shared state, but let's just stop it to be safe.
    sendCommand('STOP');
}

// --- Visual Feedback ---

let conductorGlow: HTMLElement | null = null;
let statusDot: HTMLElement | null = null;

// 1. Glow Effect (Improved)
function createConductorVisuals() {
    if (conductorGlow) return;

    conductorGlow = document.createElement('div');
    conductorGlow.id = 'lexilens-conductor-glow';
    conductorGlow.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 2147483640;
    transition: box-shadow 0.1s ease-out; /* Faster transition */
  `;
    document.body.appendChild(conductorGlow);

    // 2. Status HUD (Improved)
    statusDot = document.createElement('div');
    statusDot.id = 'lexilens-conductor-status';
    statusDot.innerText = 'Initializing...';
    statusDot.style.cssText = `
    position: fixed;
    bottom: 20px; right: 20px;
    padding: 8px 12px;
    border-radius: 20px;
    background-color: rgba(15, 23, 42, 0.9);
    color: white;
    font-family: sans-serif;
    font-size: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid rgba(255,255,255,0.1);
    z-index: 2147483650;
    pointer-events: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  `;

    // Add indicator dot inside
    const dot = document.createElement('span');
    dot.style.cssText = `
        width: 8px; height: 8px;
        border-radius: 50%;
        background-color: #ef4444;
        display: inline-block;
    `;
    statusDot.prepend(dot);

    document.body.appendChild(statusDot);

    window.addEventListener('LEXILENS_HAND_VELOCITY', onVelocityUpdate as EventListener);
}

function removeConductorVisuals() {
    if (conductorGlow) { conductorGlow.remove(); conductorGlow = null; }
    if (statusDot) { statusDot.remove(); statusDot = null; }
    window.removeEventListener('LEXILENS_HAND_VELOCITY', onVelocityUpdate as EventListener);
}

function updateStatusVisuals(handDetected: boolean, driverConnected: boolean = true, error: boolean = false) {
    if (!statusDot) return;
    const dot = statusDot.querySelector('span') as HTMLElement;

    if (error) {
        dot.style.backgroundColor = '#ef4444';
        dot.style.boxShadow = 'none';
        statusDot.childNodes[1].textContent = ' Error';
        statusDot.style.borderColor = '#ef4444';
    } else if (!driverConnected) {
        dot.style.backgroundColor = '#f59e0b';
        dot.style.boxShadow = 'none';
        statusDot.childNodes[1].textContent = ' Connecting...';
    } else if (handDetected) {
        dot.style.backgroundColor = '#22c55e';
        dot.style.boxShadow = '0 0 12px #22c55e';
        statusDot.childNodes[1].textContent = ' Active';
        statusDot.style.borderColor = '#22c55e';
    } else {
        dot.style.backgroundColor = '#3b82f6';
        dot.style.boxShadow = 'none';
        statusDot.childNodes[1].textContent = ' Raise Hand';
        statusDot.style.borderColor = 'rgba(255,255,255,0.1)';
    }
}

function onVelocityUpdate(e: CustomEvent) {
    if (!conductorGlow) return;

    const { velocity, x, y } = e.detail;
    // Map velocity (0 - ~2000) to glow intensity (0 - 100px)
    const intensity = Math.min(Math.pow(velocity, 0.7) * 2, 120);

    // Tempo Zones
    let color = '';
    let statusText = '';

    if (velocity < 100) {
        // Slow / Steady
        color = 'rgba(100, 255, 255, 0.15)'; // Cyan
        statusText = 'Steady';
    } else if (velocity < 800) {
        // FLOW STATE (Target)
        color = 'rgba(34, 197, 94, 0.15)'; // Green
        statusText = 'Flow State';
    } else {
        // Too Fast / Rushing
        color = 'rgba(239, 68, 68, 0.2)'; // Red
        statusText = 'Slow Down!';
    }

    // Inset shadow that grows with velocity
    conductorGlow.style.boxShadow = `inset 0 0 ${intensity}px ${intensity / 3}px ${color}`;

    // Update Status Text dynamically if Active
    if (statusDot && statusDot.childNodes[1]) {
        // Only override text if we are in "Active" mode (green dot)
        const dot = statusDot.querySelector('span');
        if (dot && dot.style.backgroundColor === 'rgb(34, 197, 94)') { // check computed style usually, but strict string match might work if unchanged
            // Actually, safer to check internal state or just update if text is not "Connect/Raise"
            const currentText = statusDot.childNodes[1].textContent;
            if (currentText !== ' Connecting...' && currentText !== ' Raise Hand' && currentText !== ' Error') {
                statusDot.childNodes[1].textContent = ` ${statusText}`;
            }
        }
    }
}
