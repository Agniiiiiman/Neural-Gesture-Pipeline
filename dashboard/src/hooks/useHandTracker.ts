'use client';

import { useState, useEffect, useRef } from 'react';
import { classifyGesture, Landmark } from '../utils/gestureClassifier';
import { addLog } from '../utils/logStore';

// We import types from mediapipe tasks-vision if needed, but since it can be heavy
// and causes SSR issues if referenced at top-level, we import dynamically.
let FilesetResolverLib: any = null;
let HandLandmarkerLib: any = null;

export interface HandTrackerResult {
  landmarks: Landmark[];
  handedness: 'Left' | 'Right';
  gesture: string;
  confidence: number;
  fingerCount: number;
  fingerStates: number[];
}

export const useHandTracker = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [fps, setFps] = useState(0);
  const [results, setResults] = useState<HandTrackerResult[]>([]);
  const [isSimulated, setIsSimulated] = useState(false);

  const landmarkerRef = useRef<any>(null);
  const activeStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const gestureDurationRef = useRef<number>(0);
  const currentGestureRef = useRef<string>('None');
  const isTrackingRef = useRef(false);
  const isPausedRef = useRef(false);

  // Load MediaPipe scripts dynamically
  useEffect(() => {
    async function loadMediaPipe() {
      try {
        const mpVision = await import('@mediapipe/tasks-vision');
        FilesetResolverLib = mpVision.FilesetResolver;
        HandLandmarkerLib = mpVision.HandLandmarker;

        const filesetResolver = await FilesetResolverLib.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.8/wasm'
        );

        // Load settings to fetch threshold
        let threshold = 0.5;
        if (typeof window !== 'undefined') {
          const savedSettings = localStorage.getItem('ngp_settings');
          if (savedSettings) {
            try {
              const parsed = JSON.parse(savedSettings);
              threshold = parsed.confidenceThreshold ?? 0.5;
            } catch (e) {}
          }
        }

        landmarkerRef.current = await HandLandmarkerLib.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: threshold,
          minHandPresenceConfidence: threshold,
          minTrackingConfidence: threshold,
        });

        setIsModelLoaded(true);
        setIsLoading(false);
      } catch (err: any) {
        console.error('Failed to load MediaPipe, entering simulation mode: ', err);
        // Fallback to simulation mode gracefully
        setIsSimulated(true);
        setIsModelLoaded(true);
        setIsLoading(false);
      }
    }

    loadMediaPipe();

    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = async (videoElement: HTMLVideoElement) => {
    if (!isModelLoaded) return;
    setError(null);
    setIsTracking(true);
    isTrackingRef.current = true;
    setIsPaused(false);
    isPausedRef.current = false;
    lastTimeRef.current = performance.now();
    gestureDurationRef.current = 0;

    if (isSimulated) {
      runSimulation();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: false,
      });

      const onLoaded = () => {
        videoElement.play().catch(e => console.warn("Failed to play video: ", e));
        activeStreamRef.current = stream;
        runDetectionLoop(videoElement);
        videoElement.removeEventListener('loadeddata', onLoaded);
      };

      videoElement.addEventListener('loadeddata', onLoaded);
      videoElement.srcObject = stream;

      if (videoElement.readyState >= 2) {
        onLoaded();
      }
    } catch (err: any) {
      console.warn('Webcam permission denied, falling back to simulated gesture mode.', err);
      setIsSimulated(true);
      runSimulation();
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    isTrackingRef.current = false;
    setIsPaused(false);
    isPausedRef.current = false;
    setResults([]);
    setFps(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((track) => track.stop());
      activeStreamRef.current = null;
    }
  };

  const pauseTracking = () => {
    setIsPaused((prev) => {
      isPausedRef.current = !prev;
      return !prev;
    });
  };

  const resetSession = () => {
    setResults([]);
    gestureDurationRef.current = 0;
    currentGestureRef.current = 'None';
  };

  const runDetectionLoop = (video: HTMLVideoElement) => {
    if (!isTrackingRef.current || !landmarkerRef.current) return;

    const detect = () => {
      if (!isTrackingRef.current) return;
      if (isPausedRef.current) {
        animationFrameRef.current = requestAnimationFrame(detect);
        return;
      }

      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      setFps(Math.round(1000 / delta));

      if (video.readyState >= 2) {
        const timestamp = now;
        try {
          const resultsData = landmarkerRef.current.detectForVideo(video, timestamp);

          if (resultsData && resultsData.landmarks && resultsData.landmarks.length > 0) {
            const trackedHands: HandTrackerResult[] = [];

            resultsData.landmarks.forEach((landmarksList: Landmark[], index: number) => {
              const rawHandedness = resultsData.handedness[index]?.[0]?.categoryName || 'Right';
              // MediaPipe handedness is inverted when mirrored
              const handedness = rawHandedness === 'Left' ? 'Right' : 'Left';
              
              const classification = classifyGesture(landmarksList, handedness);
              const confidence = resultsData.handedness[index]?.[0]?.score || 0.95;

              trackedHands.push({
                landmarks: landmarksList,
                handedness,
                gesture: classification.gesture,
                confidence: parseFloat((confidence * 100).toFixed(1)),
                fingerCount: classification.fingerCount,
                fingerStates: classification.fingerStates,
              });

              // Log gesture transitions
              handleGestureLogging(classification.gesture, confidence, delta);
            });

            setResults(trackedHands);
          } else {
            setResults([]);
            handleGestureLogging('None', 0, delta);
          }
        } catch (err) {
          console.error("Error running MediaPipe HandLandmarker detectForVideo: ", err);
        }
      }

      animationFrameRef.current = requestAnimationFrame(detect);
    };

    animationFrameRef.current = requestAnimationFrame(detect);
  };

  const handleGestureLogging = (gestureName: string, score: number, delta: number) => {
    if (gestureName === 'None' || gestureName.includes('Fingers')) {
      currentGestureRef.current = 'None';
      gestureDurationRef.current = 0;
      return;
    }

    if (currentGestureRef.current === gestureName) {
      gestureDurationRef.current += delta;
      
      // If a gesture is held for > 1 second (1000ms), we log it
      if (gestureDurationRef.current >= 1000) {
        // Log to log store
        addLog({
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          gesture: gestureName,
          confidence: parseFloat((score * 100).toFixed(1)),
          duration: Math.round(gestureDurationRef.current),
          status: score > 0.6 ? 'Recognised' : 'Low Confidence',
        });
        // Reset duration so we don't log repeatedly
        gestureDurationRef.current = -5000; // block logging of same gesture for 5s
      }
    } else {
      currentGestureRef.current = gestureName;
      gestureDurationRef.current = 0;
    }
  };

  // Run Simulation Mode (Smooth trigonometric pathing for 21 hand joints)
  const runSimulation = () => {
    let tick = 0;
    const gestures = ['Open Hand 🖐', 'Fist ✊', 'Peace ✌', 'Pointing ☝', 'Thumbs Up 👍', 'Call Me 🤙'];

    const simulate = () => {
      if (!isTrackingRef.current) return;
      if (isPausedRef.current) {
        animationFrameRef.current = requestAnimationFrame(simulate);
        return;
      }

      tick += 0.05;
      const now = performance.now();
      const delta = now - lastTimeRef.current;
      lastTimeRef.current = now;
      setFps(Math.round(1000 / delta));

      // Choose a simulated gesture based on time
      const gestureIndex = Math.floor((tick / 5) % gestures.length);
      const gesture = gestures[gestureIndex];
      const fingerStates = [0, 0, 0, 0, 0];

      if (gesture === 'Open Hand 🖐') fingerStates.fill(1);
      else if (gesture === 'Peace ✌') { fingerStates[1] = 1; fingerStates[2] = 1; }
      else if (gesture === 'Pointing ☝') { fingerStates[1] = 1; }
      else if (gesture === 'Thumbs Up 👍') { fingerStates[0] = 1; }
      else if (gesture === 'Call Me 🤙') { fingerStates[0] = 1; fingerStates[4] = 1; }

      // Build simulated landmarks list (21 landmarks)
      // Moving in standard joint hierarchies
      const simLandmarks: Landmark[] = [];
      const baseCtxX = 0.5 + Math.sin(tick * 0.5) * 0.1;
      const baseCtxY = 0.5 + Math.cos(tick * 0.7) * 0.08;

      // Wrist
      simLandmarks.push({ x: baseCtxX, y: baseCtxY + 0.15, z: 0 });

      // Generate fingers relative to wrist
      for (let f = 0; f < 5; f++) {
        const isUp = fingerStates[f] === 1;
        const angle = -Math.PI / 6 + (f * Math.PI) / 8; // Fan angles
        const lengthMultiplier = isUp ? 1.0 : 0.4;

        // Generate 4 landmarks per finger (MCP, PIP, DIP, TIP)
        for (let j = 0; j < 4; j++) {
          const offsetDist = (0.05 + j * 0.035) * lengthMultiplier;
          const jitterX = Math.sin(tick + f + j) * 0.002;
          const jitterY = Math.cos(tick + f + j) * 0.002;

          simLandmarks.push({
            x: baseCtxX + Math.sin(angle) * offsetDist + jitterX,
            y: baseCtxY - Math.cos(angle) * offsetDist + jitterY,
            z: -j * 0.02,
          });
        }
      }

      const simResult: HandTrackerResult = {
        landmarks: simLandmarks,
        handedness: 'Right',
        gesture,
        confidence: parseFloat((92 + Math.sin(tick) * 6).toFixed(1)),
        fingerCount: fingerStates.reduce((a, b) => a + b, 0),
        fingerStates,
      };

      setResults([simResult]);
      handleGestureLogging(gesture, 0.95, delta);

      setTimeout(() => {
        animationFrameRef.current = requestAnimationFrame(simulate);
      }, 33); // Cap simulation around 30 FPS
    };

    animationFrameRef.current = requestAnimationFrame(simulate);
  };

  return {
    isLoading,
    error,
    isModelLoaded,
    isTracking,
    isPaused,
    isSimulated,
    fps,
    results,
    startTracking,
    stopTracking,
    pauseTracking,
    resetSession,
  };
};
