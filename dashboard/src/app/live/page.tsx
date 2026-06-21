'use client';

import React, { useRef, useEffect } from 'react';
import { 
  Play, 
  Square, 
  Pause, 
  RotateCcw, 
  Camera, 
  CameraOff, 
  Fingerprint, 
  Activity,
  Layers,
  Percent,
  CheckCircle,
  Eye,
  Sliders
} from 'lucide-react';
import { useHandTracker } from '@/hooks/useHandTracker';

export default function LiveDetection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    isLoading,
    isModelLoaded,
    isTracking,
    isPaused,
    isSimulated,
    fps,
    results,
    startTracking,
    stopTracking,
    pauseTracking,
    resetSession
  } = useHandTracker();

  // Canvas render hook
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid if simulated/idle
    if (!isTracking || results.length === 0) {
      drawStaticGrid(ctx, canvas.width, canvas.height);
      return;
    }

    // Hand connections mapping
    const connections = [
      // Thumb
      [0, 1], [1, 2], [2, 3], [3, 4],
      // Index
      [0, 5], [5, 6], [6, 7], [7, 8],
      // Middle
      [0, 9], [9, 10], [10, 11], [11, 12],
      // Ring
      [0, 13], [13, 14], [14, 15], [15, 16],
      // Pinky
      [0, 17], [17, 18], [18, 19], [19, 20],
      // Palm base
      [5, 9], [9, 13], [13, 17]
    ];

    results.forEach((hand) => {
      const landmarks = hand.landmarks;
      if (!landmarks || landmarks.length < 21) return;

      // Draw bounding box
      drawBoundingBox(ctx, landmarks, canvas.width, canvas.height, hand.gesture);

      // Draw connections
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.8)';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#06b6d4';

      connections.forEach(([i, j]) => {
        const ptA = landmarks[i];
        const ptB = landmarks[j];
        ctx.beginPath();
        ctx.moveTo(ptA.x * canvas.width, ptA.y * canvas.height);
        ctx.lineTo(ptB.x * canvas.width, ptB.y * canvas.height);
        ctx.stroke();
      });

      // Draw landmark nodes
      ctx.shadowBlur = 0; // reset shadow
      landmarks.forEach((pt, idx) => {
        ctx.beginPath();
        ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 5, 0, 2 * Math.PI);
        
        // Highlight finger tips differently
        const isTip = [4, 8, 12, 16, 20].includes(idx);
        ctx.fillStyle = isTip ? '#10b981' : '#8b5cf6';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
      });
    });
  }, [results, isTracking]);

  const drawStaticGrid = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Draw central target rings
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 80, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 120, 0, 2 * Math.PI);
    ctx.stroke();

    // Center text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.font = '500 14px var(--font-sans)';
    ctx.textAlign = 'center';
    ctx.fillText('CAMERA STANDBY - CLICK START TO INITIALISE', w / 2, h / 2 + 10);
  };

  const drawBoundingBox = (
    ctx: CanvasRenderingContext2D, 
    landmarks: any[], 
    w: number, 
    h: number,
    gestureLabel: string
  ) => {
    let minX = w, maxX = 0, minY = h, maxY = 0;
    landmarks.forEach((pt) => {
      const px = pt.x * w;
      const py = pt.y * h;
      if (px < minX) minX = px;
      if (px > maxX) maxX = px;
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    });

    // Add padding
    const pad = 20;
    minX = Math.max(0, minX - pad);
    minY = Math.max(0, minY - pad);
    maxX = Math.min(w, maxX + pad);
    maxY = Math.min(h, maxY + pad);

    // Draw box
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    ctx.setLineDash([]); // reset

    // Label background
    ctx.fillStyle = 'rgba(139, 92, 246, 0.85)';
    ctx.font = 'bold 12px var(--font-sans)';
    const textWidth = ctx.measureText(gestureLabel).width;
    ctx.fillRect(minX, minY - 24, textWidth + 16, 24);

    // Label text
    ctx.fillStyle = '#ffffff';
    ctx.fillText(gestureLabel, minX + 8, minY - 8);
  };

  const handleStart = () => {
    if (videoRef.current) {
      startTracking(videoRef.current);
    }
  };

  const activeHand = results[0];

  return (
    <div className="live-detection animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-gradient">Real-Time Gesture Scanner</h1>
          <p className="page-subtitle">Track, overlay, and run model predictions on live camera frames.</p>
        </div>
        <div className="fps-indicator">
          <Activity size={16} className={isTracking && !isPaused ? 'animate-pulse text-success' : ''} />
          <span>FPS: {fps}</span>
        </div>
      </div>

      <div className="main-layout-grid">
        {/* Left Side - Webcam Screen */}
        <div className="glass-panel feed-panel">
          <div className="feed-container">
            {/* Visual Indicators */}
            {isTracking && (
              <div className="live-pill">
                <span className="glow-dot active"></span>
                <span>{isSimulated ? 'SIMULATOR ACTIVE' : 'LIVE'}</span>
              </div>
            )}

            {/* Video element */}
            <video 
              ref={videoRef}
              className="webcam-video"
              playsInline
              muted
              style={{ display: isTracking && !isSimulated ? 'block' : 'none' }}
            />

            {/* Render Canvas */}
            <canvas 
              ref={canvasRef}
              width={640}
              height={480}
              className="render-canvas"
            />
          </div>

          {/* Player controls */}
          <div className="control-bar">
            {!isTracking ? (
              <button onClick={handleStart} className="btn-primary">
                <Play size={18} />
                <span>Start Detection</span>
              </button>
            ) : (
              <>
                <button onClick={stopTracking} className="btn-secondary danger-btn">
                  <Square size={18} />
                  <span>Stop</span>
                </button>
                <button onClick={pauseTracking} className="btn-secondary">
                  <Pause size={18} />
                  <span>{isPaused ? 'Resume' : 'Pause'}</span>
                </button>
              </>
            )}
            <button onClick={resetSession} className="btn-secondary">
              <RotateCcw size={18} />
              <span>Reset Session</span>
            </button>
          </div>
        </div>

        {/* Right Side - Detection Details Panel */}
        <div className="glass-panel telemetry-panel">
          <div className="panel-section-header">
            <Eye size={18} className="section-icon" />
            <h3>Scan Telemetry</h3>
          </div>

          <div className="telemetry-box">
            <div className="telemetry-row">
              <div className="telemetry-label">
                <Sliders size={16} />
                <span>Current Gesture</span>
              </div>
              <div className="telemetry-value highlight-cyan">
                {activeHand ? activeHand.gesture : 'None'}
              </div>
            </div>

            <div className="telemetry-row">
              <div className="telemetry-label">
                <Percent size={16} />
                <span>Confidence Score</span>
              </div>
              <div className="telemetry-value">
                {activeHand ? `${activeHand.confidence}%` : '0%'}
              </div>
            </div>

            <div className="telemetry-row">
              <div className="telemetry-label">
                <Fingerprint size={16} />
                <span>Fingers Up</span>
              </div>
              <div className="telemetry-value">
                {activeHand ? `${activeHand.fingerCount} / 5` : '0 / 5'}
              </div>
            </div>

            <div className="telemetry-row">
              <div className="telemetry-label">
                <Layers size={16} />
                <span>Active Hand</span>
              </div>
              <div className="telemetry-value uppercase">
                {activeHand ? activeHand.handedness : 'None'}
              </div>
            </div>
          </div>

          <div className="finger-indicators">
            <h4>Finger Extension Profile</h4>
            <div className="finger-bars">
              {['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'].map((finger, idx) => {
                const isExtended = activeHand ? activeHand.fingerStates[idx] === 1 : false;
                return (
                  <div key={finger} className="finger-row">
                    <span className="finger-name">{finger}</span>
                    <div className="finger-track">
                      <div className={`finger-fill ${isExtended ? 'extended' : ''}`}></div>
                    </div>
                    <span className={`finger-status ${isExtended ? 'up' : 'down'}`}>
                      {isExtended ? 'UP' : 'CURL'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="coordinates-card">
            <h4>Wrist Anchors (Relative 3D)</h4>
            <div className="coord-grid">
              <div className="coord-box">
                <span className="coord-axis">X</span>
                <span className="coord-num">
                  {activeHand ? activeHand.landmarks[0].x.toFixed(4) : '0.0000'}
                </span>
              </div>
              <div className="coord-box">
                <span className="coord-axis">Y</span>
                <span className="coord-num">
                  {activeHand ? activeHand.landmarks[0].y.toFixed(4) : '0.0000'}
                </span>
              </div>
              <div className="coord-box">
                <span className="coord-axis">Z</span>
                <span className="coord-num">
                  {activeHand ? activeHand.landmarks[0].z.toFixed(4) : '0.0000'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .live-detection {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .fps-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--card-background);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--foreground-muted);
        }

        .main-layout-grid {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .main-layout-grid {
            grid-template-columns: 1fr;
          }
        }

        /* Feed container */
        .feed-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 16px;
        }

        .feed-container {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: #000000;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .webcam-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* mirror output */
          z-index: 1;
        }

        .render-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1); /* mirror output */
          z-index: 2;
          pointer-events: none;
        }

        .live-pill {
          position: absolute;
          top: 16px;
          left: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.7);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 20;
        }

        .control-bar {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .danger-btn {
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: var(--danger) !important;
        }

        .danger-btn:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }

        /* Telemetry Panel */
        .telemetry-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .panel-section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 14px;
        }

        .section-icon {
          color: var(--accent-primary);
        }

        .telemetry-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .telemetry-row {
          display: flex;
          align-items: center;
          justify-content: justify;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .telemetry-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--foreground-muted);
        }

        .telemetry-value {
          margin-left: auto;
          font-size: 1rem;
          font-weight: 600;
          font-family: var(--font-display);
        }

        .highlight-cyan {
          color: var(--accent-secondary);
          text-shadow: 0 0 10px rgba(6, 182, 212, 0.25);
        }

        /* Finger profiles */
        .finger-indicators h4, .coordinates-card h4 {
          font-size: 0.85rem;
          color: var(--foreground-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }

        .finger-bars {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .finger-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.85rem;
        }

        .finger-name {
          width: 60px;
          font-weight: 500;
        }

        .finger-track {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .finger-fill {
          height: 100%;
          width: 0%;
          background: var(--accent-primary);
          border-radius: 4px;
          transition: width 0.2s ease, background-color 0.2s ease;
        }

        .finger-fill.extended {
          width: 100%;
          background: var(--accent-gradient);
          box-shadow: var(--accent-glow);
        }

        .finger-status {
          width: 40px;
          text-align: right;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .finger-status.up {
          color: var(--success);
        }

        .finger-status.down {
          color: var(--foreground-muted);
        }

        /* Coordinates */
        .coord-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .coord-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .coord-axis {
          font-size: 0.7rem;
          font-weight: 700;
          color: var(--accent-primary);
          margin-bottom: 2px;
        }

        .coord-num {
          font-size: 0.85rem;
          font-family: var(--font-display);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
