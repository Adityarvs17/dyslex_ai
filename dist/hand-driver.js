/**
 * Hand Driver - Uses MediaPipe Hands for hand tracking
 * Tracks index finger tip position to control focus spotlight
 * 
 * UPDATED: Added handshake and robust initialization
 */

(function () {
  const HAND_EVENT = 'LEXILENS_HAND_DATA';
  const ACK_EVENT = 'LEXILENS_HAND_ACK';
  let isRunning = false;
  let videoElement = null;
  let canvasElement = null;
  let hands = null;
  let camera = null;
  let animationId = null;

  // Smoothing parameters
  const SMOOTHING_FACTOR = 0.2;
  const DEAD_ZONE = 20;
  let smoothX = window.innerWidth / 2;
  let smoothY = window.innerHeight / 2;
  let lastSentX = smoothX;
  let lastSentY = smoothY;

  function log(msg, ...args) {
    console.log(`[LexiLens Driver] ${msg}`, ...args);
  }

  function error(msg, ...args) {
    console.error(`[LexiLens Driver] ${msg}`, ...args);
  }

  // Notify that driver is loaded and listening
  function notifyReady() {
    window.postMessage({ type: ACK_EVENT, status: 'DRIVER_LOADED' }, '*');
  }

  /**
   * Smooth function using exponential moving average
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
   * Create video element for camera feed
   */
  function createVideoElement() {
    if (videoElement && videoElement.parentNode) return videoElement;

    if (videoElement) videoElement.remove();

    videoElement = document.createElement('video');
    videoElement.id = 'lexilens-hand-video';
    videoElement.setAttribute('playsinline', '');
    videoElement.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      width: 180px;
      height: 135px;
      border-radius: 12px;
      border: 2px solid rgba(14, 165, 233, 0.5);
      z-index: 2147483647;
      object-fit: cover;
      transform: scaleX(-1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      display: none; /* Hidden by default until active */
    `;
    document.body.appendChild(videoElement);
    return videoElement;
  }

  /**
   * Create canvas for hand visualization (optional)
   */
  function createCanvasElement() {
    if (canvasElement && canvasElement.parentNode) return canvasElement;

    if (canvasElement) canvasElement.remove();

    canvasElement = document.createElement('canvas');
    canvasElement.id = 'lexilens-hand-canvas';
    canvasElement.width = 180;
    canvasElement.height = 135;
    canvasElement.style.cssText = `
      position: fixed;
      bottom: 10px;
      left: 10px;
      width: 180px;
      height: 135px;
      border-radius: 12px;
      z-index: 2147483648;
      pointer-events: none;
      transform: scaleX(-1);
      display: none;
    `;
    document.body.appendChild(canvasElement);
    return canvasElement;
  }

  /**
   * Process hand landmarks and send position
   */
  function processHandResults(results) {
    if (!isRunning) return;

    const canvas = canvasElement;
    let ctx = null;
    if (canvas && canvas.style.display !== 'none') {
      ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(1, 1); // No need to mirror canvas ctx if CSS transform handles it? Actually drawing is raw.
      // If CSS transform scaleX(-1) is applied, we draw normally.
    }

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      const indexTip = landmarks[8];

      // Convert normalized coordinates to screen coordinates
      // Note: x is inverted because video is mirrored
      const rawX = (1 - indexTip.x) * window.innerWidth;
      const rawY = indexTip.y * window.innerHeight;

      smoothX = smooth(smoothX, rawX, SMOOTHING_FACTOR);
      smoothY = smooth(smoothY, rawY, SMOOTHING_FACTOR);

      if (exceedsDeadZone(smoothX, smoothY, lastSentX, lastSentY)) {
        const clampedX = Math.max(0, Math.min(window.innerWidth, smoothX));
        const clampedY = Math.max(0, Math.min(window.innerHeight, smoothY));

        window.postMessage({
          type: HAND_EVENT,
          payload: {
            x: Math.round(clampedX),
            y: Math.round(clampedY),
            detected: true
          }
        }, '*');

        lastSentX = smoothX;
        lastSentY = smoothY;
      }

      // Draw visualization
      if (ctx) {
        // Draw index finger
        ctx.beginPath();
        ctx.arc(indexTip.x * canvas.width, indexTip.y * canvas.height, 8, 0, 2 * Math.PI);
        ctx.fillStyle = '#0ea5e9';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw skeleton
        // ... (simplified for perf)
      }
    } else {
      window.postMessage({
        type: HAND_EVENT,
        payload: { detected: false }
      }, '*');
    }

    if (ctx) ctx.restore();
  }

  /**
   * Initialize MediaPipe Hands
   */
  async function initMediaPipeHands(baseUrl) {
    log('Initializing MediaPipe Hands...');

    // Default to CDN if no base provided (fallback)
    const assetBase = baseUrl || 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/';
    log('Loading assets from:', assetBase);

    if (!window.Hands) {
      error('MediaPipe Hands global not found. Script might not be loaded.');
      return false;
    }

    try {
      hands = new window.Hands({
        locateFile: (file) => {
          // FORCE NON-SIMD: strict CSP/COOP policies on generic pages (like Wikipedia) 
          // often block SIMD/Threading features. Fallback to standard WASM.
          if (file.indexOf('simd') !== -1) {
            const oldFile = file;
            file = file.replace('_simd', '');
            log(`Force-downgrading WASM: ${oldFile} -> ${file}`);
          }
          return `${assetBase}${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(processHandResults);
      log('MediaPipe Hands instance created');
      return true;
    } catch (e) {
      error('Failed to create Hands instance', e);
      return false;
    }
  }

  /**
   * Start camera and hand detection
   */
  async function startHandTracking() {
    if (isRunning) return;

    try {
      log('Requesting camera access...');
      const video = createVideoElement();
      createCanvasElement();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          facingMode: 'user'
        }
      });

      video.srcObject = stream;
      await video.play();

      // Force display block when active
      video.style.display = 'block';
      if (canvasElement) canvasElement.style.display = 'block';

      log('Camera started successfully');

      // Process frames
      async function processFrame() {
        if (!isRunning) return;

        if (hands && video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
          try {
            await hands.send({ image: video });
          } catch (e) {
            // Log the error once or periodically to avoid spam, but we need to see it
            if (Math.random() < 0.01) error('Error in hands.send:', e);
          }
        }
        animationId = requestAnimationFrame(processFrame);
      }

      isRunning = true;
      processFrame();

      window.postMessage({ type: ACK_EVENT, status: 'STARTED' }, '*');

    } catch (err) {
      error('Failed to start camera:', err);
      window.postMessage({ type: ACK_EVENT, status: 'ERROR', message: err.message }, '*');
    }
  }

  function stopHandTracking() {
    isRunning = false;
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    if (videoElement) {
      const stream = videoElement.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      videoElement.remove();
      videoElement = null;
    }

    if (canvasElement) {
      canvasElement.remove();
      canvasElement = null;
    }

    window.postMessage({ type: ACK_EVENT, status: 'STOPPED' }, '*');
    log('Tracking stopped');
  }

  // Listen for commands
  window.addEventListener('message', async (event) => {
    // Only accept messages from same window
    if (event.source !== window) return;

    if (event.data.type === 'LEXILENS_HAND_CMD') {
      const { command, value } = event.data;
      log(`Received command: ${command}`);

      if (command === 'START') {
        const baseUrl = value && value.baseUrl;
        if (!hands) {
          const initSuccess = await initMediaPipeHands(baseUrl);
          if (!initSuccess) {
            window.postMessage({ type: ACK_EVENT, status: 'ERROR', message: 'MediaPipe Init Failed' }, '*');
            return;
          }
        }
        await startHandTracking();
      } else if (command === 'STOP') {
        stopHandTracking();
      } else if (command === 'PING') {
        notifyReady();
      }
    }
  });

  // Initial ready signal
  log('Driver loaded in page context');
  notifyReady();
})();
