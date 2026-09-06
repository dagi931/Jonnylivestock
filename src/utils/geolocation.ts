/**
 * High-Precision GPS Geolocation Utility
 *
 * Mobile browsers and desktops often return an initial coarse location
 * (from cell towers or Wi-Fi, accuracy 500m - 3000m) while satellite GPS hardware
 * is still acquiring a lock.
 *
 * This utility uses `watchPosition` with high accuracy and progressive refinement:
 * - Continuously monitors incoming coordinate updates.
 * - If satellite accuracy <= 25m is achieved, locks immediately.
 * - Keeps the single most accurate position received.
 * - Safely resolves with the best fix within a maximum time window, reporting progress and accuracy.
 */

export interface AccuratePositionResult {
  latitude: number;
  longitude: number;
  accuracy: number; // in meters (e.g. 5m, 12m)
  heading?: number | null;
  speed?: number | null;
  altitude?: number | null;
}

export interface GeolocationProgress {
  step: 'requesting' | 'locking' | 'done';
  accuracy?: number;
  attempt?: number;
}

export function getAccurateCurrentPosition(
  options: {
    maxWaitMs?: number;
    desiredAccuracyMeters?: number;
    onProgress?: (progress: GeolocationProgress) => void;
  } = {}
): Promise<AccuratePositionResult> {
  const {
    maxWaitMs = 12000,
    desiredAccuracyMeters = 25,
    onProgress
  } = options;

  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      return reject(new Error('Geolocation is not supported by your device browser'));
    }

    let bestPos: GeolocationPosition | null = null;
    let watchId: number | null = null;
    let timerId: any = null;
    let attemptCount = 0;

    const cleanup = () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
    };

    if (onProgress) {
      onProgress({ step: 'requesting' });
    }

    // Safety timeout: after maxWaitMs, resolve with the most accurate fix we found
    timerId = setTimeout(() => {
      cleanup();
      if (bestPos) {
        resolve({
          latitude: bestPos.coords.latitude,
          longitude: bestPos.coords.longitude,
          accuracy: Math.round(bestPos.coords.accuracy),
          heading: bestPos.coords.heading,
          speed: bestPos.coords.speed,
          altitude: bestPos.coords.altitude
        });
      } else {
        reject(new Error('Location acquisition timed out. Please select your location from the map.'));
      }
    }, maxWaitMs);

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        attemptCount++;
        const currentAccuracy = pos.coords.accuracy;

        if (!bestPos || currentAccuracy < bestPos.coords.accuracy) {
          bestPos = pos;
        }

        if (onProgress) {
          onProgress({
            step: 'locking',
            accuracy: Math.round(bestPos.coords.accuracy),
            attempt: attemptCount
          });
        }

        // If accuracy is high enough (satellite lock <= desiredAccuracyMeters, e.g. 25m), resolve immediately!
        if (currentAccuracy <= desiredAccuracyMeters) {
          cleanup();
          if (onProgress) {
            onProgress({ step: 'done', accuracy: Math.round(currentAccuracy) });
          }
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: Math.round(currentAccuracy),
            heading: pos.coords.heading,
            speed: pos.coords.speed,
            altitude: pos.coords.altitude
          });
        }
      },
      (err) => {
        // If error occurs but we already have a fix, use it
        if (bestPos) {
          cleanup();
          resolve({
            latitude: bestPos.coords.latitude,
            longitude: bestPos.coords.longitude,
            accuracy: Math.round(bestPos.coords.accuracy),
            heading: bestPos.coords.heading,
            speed: bestPos.coords.speed,
            altitude: bestPos.coords.altitude
          });
        } else {
          cleanup();
          reject(err);
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: maxWaitMs
      }
    );
  });
}
