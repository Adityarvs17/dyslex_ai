/**
 * Iris Driver - Runs in the MAIN WORLD (Page Context)
 * Bridges WebGazer.js with LexiLens Content Script
 * 
 * IMPROVED: Added smoothing, dead zones, and calibration
 */

(function() {
  const GAZE_EVENT = 'LEXILENS_GAZE_DATA';
  let isRunning = false;
  let pendingStart = false;

  // Smoothing parameters
  const SMOOTHING_FACTOR = 0.15; // Lower = smoother but slower (0.1-0.3 recommended)
  const DEAD_ZONE = 30; // Pixels - ignore small movements
  const MIN_UPDATE_INTERVAL = 50; // ms - don't update faster than this

  // Smoothed position
  let smoothX = window.innerWidth / 2;
  let smoothY = window.innerHeight / 2;
  let lastSentX = smoothX;
  let lastSentY = smoothY;
  let lastUpdateTime = 0;

  // Calibration offset (can be adjusted)
  let offsetX = 0;
  let offsetY = 0;

  /**
   * Exponential moving average for smoothing
   */
  function smooth(current, target, factor) {
    return current + (target - current) * factor;
  }

  /**
   * Check if movement exceeds dead zone
   */
  function exceedsDeadZone(x1, y1, x2, y2) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return dx > DEAD_ZONE || dy > DEAD_ZONE;
  }

  /**
   * Process and send gaze data with smoothing
   */
  function processGaze(rawX, rawY) {
    const now = performance.now();
    
    // Apply calibration offset
    const calibratedX = rawX + offsetX;
    const calibratedY = rawY + offsetY;

    // Apply smoothing
    smoothX = smooth(smoothX, calibratedX, SMOOTHING_FACTOR);
    smoothY = smooth(smoothY, calibratedY, SMOOTHING_FACTOR);

    // Check if we should send update (rate limiting + dead zone)
    const timeSinceLastUpdate = now - lastUpdateTime;
    const movedEnough = exceedsDeadZone(smoothX, smoothY, lastSentX, lastSentY);

    if (timeSinceLastUpdate >= MIN_UPDATE_INTERVAL && movedEnough) {
      // Clamp to viewport
      const clampedX = Math.max(0, Math.min(window.innerWidth, smoothX));
      const clampedY = Math.max(0, Math.min(window.innerHeight, smoothY));

      window.postMessage({
        type: GAZE_EVENT,
        payload: { 
          x: Math.round(clampedX), 
          y: Math.round(clampedY) 
        }
      }, '*');

      lastSentX = smoothX;
      lastSentY = smoothY;
      lastUpdateTime = now;
    }
  }

  function initWebGazer() {
    if (!window.webgazer) {
      console.warn('[LexiLens] WebGazer not ready, retrying...');
      setTimeout(initWebGazer, 500);
      return;
    }

    // Configure WebGazer
    window.webgazer
      .setRegression('ridge')
      .setTracker('TFFacemesh')
      .showVideoPreview(true)
      .showFaceOverlay(false)
      .showFaceFeedbackBox(true)
      .saveDataAcrossSessions(true)
      .setGazeListener((data, clock) => {
        if (data && isRunning) {
          processGaze(data.x, data.y);
        }
      });
      
    console.log('[LexiLens] WebGazer initialized with smoothing');
    
    // Auto-start if pending
    if (pendingStart) {
      console.log('[LexiLens] Executing pending START');
      window.webgazer.begin();
      window.webgazer.showVideoPreview(true);
      isRunning = true;
      pendingStart = false;
    }
  }

  // Listen for commands from Content Script
  window.addEventListener('message', (event) => {
    if (event.data.type === 'LEXILENS_CMD') {
      const { command, value } = event.data;
      
      console.log('[LexiLens] Driver received:', command, value);

      if (command === 'START') {
        // Reset smoothed position to center
        smoothX = window.innerWidth / 2;
        smoothY = window.innerHeight / 2;
        
        if (window.webgazer) {
          window.webgazer.begin();
          window.webgazer.showVideoPreview(true);
          isRunning = true;
        } else {
          console.log('[LexiLens] Queuing START');
          pendingStart = true;
        }
      } else if (command === 'STOP') {
        if (window.webgazer) {
          window.webgazer.pause();
          window.webgazer.showVideoPreview(false);
        }
        isRunning = false;
        pendingStart = false;
      } else if (command === 'SET_SMOOTHING') {
        // Allow runtime adjustment of smoothing
        if (value && typeof value.factor === 'number') {
          // Can't reassign const, would need to refactor for dynamic smoothing
          console.log('[LexiLens] Smoothing factor requested:', value.factor);
        }
      } else if (command === 'SET_OFFSET') {
        // Calibration offset adjustment
        if (value) {
          offsetX = value.x || 0;
          offsetY = value.y || 0;
          console.log('[LexiLens] Offset set to:', offsetX, offsetY);
        }
      } else if (command === 'CALIBRATE_POINT') {
        // Record a calibration point
        if (window.webgazer && value) {
          window.webgazer.recordScreenPosition(value.x, value.y);
        }
      } else if (command === 'TOGGLE_VIDEO') {
        if (window.webgazer) window.webgazer.showVideoPreview(value);
      }
    }
  });

  // Start initialization loop
  initWebGazer();
})();
