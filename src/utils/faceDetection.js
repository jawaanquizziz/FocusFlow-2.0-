/**
 * FocusFlow Face Presence Detection Utility
 * Powered by tracking.js
 */

export const initFaceTracker = async (videoEl, onPresenceChange) => {
  if (!window.tracking) {
    console.error('tracking.js library not loaded');
    return null;
  }

  let stream = null;
  let trackerTask = null;
  let missingTimeout = null;
  let isPresent = true; // start assuming present

  try {
    // Request camera access
    stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 320, height: 240, facingMode: 'user' },
      audio: false
    });
    
    videoEl.srcObject = stream;
    videoEl.setAttribute('playsinline', true);
    videoEl.muted = true;
    await videoEl.play();

    // Create tracking.js ObjectTracker for faces
    const tracker = new window.tracking.ObjectTracker('face');
    tracker.setInitialScale(4);
    tracker.setStepSize(2);
    tracker.setEdgesDensity(0.1);

    // Track state to avoid repeated triggers
    let consecutiveMissingFrames = 0;

    tracker.on('track', (event) => {
      if (event.data.length > 0) {
        // Face found
        consecutiveMissingFrames = 0;
        if (!isPresent) {
          isPresent = true;
          onPresenceChange(true, event.data[0]);
        }
      } else {
        // No face found in this frame
        consecutiveMissingFrames++;
        // If we consistently miss a face for ~4-5 consecutive frames (about 1.5 - 2 seconds)
        if (consecutiveMissingFrames >= 4 && isPresent) {
          isPresent = false;
          onPresenceChange(false, null);
        }
      }
    });

    // Start tracking video
    trackerTask = window.tracking.track(videoEl, tracker, { camera: false });

    // Return control object
    return {
      stop: () => {
        if (trackerTask) {
          trackerTask.stop();
        }
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (videoEl) {
          videoEl.srcObject = null;
        }
      }
    };

  } catch (err) {
    console.error('Error starting face tracker:', err);
    throw err;
  }
};
