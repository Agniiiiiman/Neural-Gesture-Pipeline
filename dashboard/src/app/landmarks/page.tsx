'use client';

import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Fingerprint, 
  Grid, 
  Layers, 
  Table, 
  Crosshair,
  HelpCircle
} from 'lucide-react';
import { useHandTracker } from '@/hooks/useHandTracker';

const LANDMARK_NAMES = [
  'Wrist (Anchor)',
  'Thumb CMC', 'Thumb MCP', 'Thumb IP', 'Thumb TIP',
  'Index MCP', 'Index PIP', 'Index DIP', 'Index TIP',
  'Middle MCP', 'Middle PIP', 'Middle DIP', 'Middle TIP',
  'Ring MCP', 'Ring PIP', 'Ring DIP', 'Ring TIP',
  'Pinky MCP', 'Pinky PIP', 'Pinky DIP', 'Pinky TIP'
];

export default function HandLandmarks() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const {
    isTracking,
    isPaused,
    isSimulated,
    results,
    startTracking,
    stopTracking,
    resetSession
  } = useHandTracker();

  const handleStart = () => {
    if (videoRef.current) {
      startTracking(videoRef.current);
    }
  };

  const handData = results[0];
  const landmarks = handData?.landmarks || [];

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    const step = 40;
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (landmarks.length === 0) {
      // Draw idle hand placeholder skeleton
      drawPlaceholderSkeleton(ctx, canvas.width, canvas.height);
      return;
    }

    // Connections mapping
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
      // Knuckles
      [5, 9], [9, 13], [13, 17]
    ];

    // Draw connections
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.4)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    connections.forEach(([i, j]) => {
      const ptA = landmarks[i];
      const ptB = landmarks[j];
      ctx.beginPath();
      ctx.moveTo(ptA.x * canvas.width, ptA.y * canvas.height);
      ctx.lineTo(ptB.x * canvas.width, ptB.y * canvas.height);
      ctx.stroke();
    });

    // Draw nodes
    landmarks.forEach((pt, idx) => {
      ctx.beginPath();
      ctx.arc(pt.x * canvas.width, pt.y * canvas.height, 6, 0, 2 * Math.PI);
      
      const isSelected = selectedNode === idx;
      ctx.fillStyle = isSelected ? '#06b6d4' : '#8b5cf6';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = isSelected ? 2 : 1;
      
      // Selected glow
      if (isSelected) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#06b6d4';
      }
      
      ctx.fill();
      ctx.stroke();
      ctx.shadowBlur = 0; // reset
    });

  }, [landmarks, selectedNode]);

  const drawPlaceholderSkeleton = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Render a nice static vector hand blueprint in the center
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // Draw simple hand representation
    const cx = w / 2;
    const cy = h / 2 + 50;

    // Wrist to knuckles
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 60, cy - 80);
    ctx.lineTo(cx - 40, cy - 140);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 20, cy - 100);
    ctx.lineTo(cx - 15, cy - 170);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 20, cy - 100);
    ctx.lineTo(cx + 20, cy - 165);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 55, cy - 90);
    ctx.lineTo(cx + 55, cy - 145);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - 50, cy - 40); // thumb
    ctx.lineTo(cx - 85, cy - 65);

    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '500 12px var(--font-sans)';
    ctx.textAlign = 'center';
    ctx.fillText('CAMERA DISCONNECTED', cx, cy - 210);
    ctx.font = '400 11px var(--font-sans)';
    ctx.fillText('Start webcam tracking to display live spatial matrices.', cx, cy - 190);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (landmarks.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Translate mouse coordinates to local canvas coords, mirroring X for scaleX(-1) overlay
    const clickX = (rect.width - (e.clientX - rect.left)) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    // Find closest node
    let closestId = null;
    let minDistance = 20; // max distance threshold in px

    landmarks.forEach((pt, idx) => {
      const px = pt.x * canvas.width;
      const py = pt.y * canvas.height;
      const dist = Math.hypot(clickX - px, clickY - py);
      if (dist < minDistance) {
        minDistance = dist;
        closestId = idx;
      }
    });

    if (closestId !== null) {
      setSelectedNode(closestId);
      const rowElement = document.getElementById(`landmark-row-${closestId}`);
      if (rowElement) {
        rowElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  };

  return (
    <div className="hand-landmarks animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-gradient">3D Spatial Landmarks</h1>
          <p className="page-subtitle">Inspect the 21 coordinate vectors returned by the hand detector model.</p>
        </div>
        <div className="controls-group">
          {!isTracking ? (
            <button onClick={handleStart} className="btn-primary">
              <Play size={16} />
              <span>Start Camera</span>
            </button>
          ) : (
            <button onClick={stopTracking} className="btn-secondary danger-btn">
              <Square size={16} />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>

      <div className="landmarks-layout">
        {/* Skeleton Canvas */}
        <div className="glass-panel canvas-panel">
          <div className="panel-badge">
            <Crosshair size={14} />
            <span>Interactive Node Mesh</span>
          </div>

          <div className="canvas-wrapper">
            <video 
              ref={videoRef}
              className="webcam-video"
              playsInline
              muted
              style={{ display: isTracking && !isSimulated ? 'block' : 'none' }}
            />
            <canvas 
              ref={canvasRef}
              width={640}
              height={480}
              onClick={handleCanvasClick}
              className="skeleton-canvas"
            />
          </div>
          <div className="canvas-tips">
            <HelpCircle size={14} />
            <span>Tip: Click on any knuckle joint on the mesh above to inspect its spatial values.</span>
          </div>
        </div>

        {/* Coordinates Table */}
        <div className="glass-panel table-panel">
          <div className="table-title">
            <Table size={18} />
            <h3>Normalized Vector Indices</h3>
          </div>

          <div className="coordinate-list-wrapper">
            <table className="coords-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Joint Name</th>
                  <th>X Value</th>
                  <th>Y Value</th>
                  <th>Z Value</th>
                </tr>
              </thead>
              <tbody>
                {LANDMARK_NAMES.map((name, idx) => {
                  const pt = landmarks[idx];
                  const isSelected = selectedNode === idx;
                  return (
                    <tr 
                      key={idx} 
                      id={`landmark-row-${idx}`}
                      onClick={() => setSelectedNode(idx)}
                      className={isSelected ? 'selected-row' : ''}
                    >
                      <td className="idx-col">{idx}</td>
                      <td className="name-col">{name}</td>
                      <td className="val-col">{pt ? pt.x.toFixed(6) : '0.000000'}</td>
                      <td className="val-col">{pt ? pt.y.toFixed(6) : '0.000000'}</td>
                      <td className="val-col">{pt ? pt.z.toFixed(6) : '0.000000'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hand-landmarks {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .controls-group {
          display: flex;
          gap: 12px;
        }

        .landmarks-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .landmarks-layout {
            grid-template-columns: 1fr;
          }
        }

        .canvas-panel {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .panel-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: var(--accent-secondary);
          font-weight: 600;
        }

        .canvas-wrapper {
          position: relative;
          background: #000000;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          overflow: hidden;
          width: 100%;
          aspect-ratio: 4/3;
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

        .skeleton-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          cursor: crosshair;
          transform: scaleX(-1); /* mirror output */
          z-index: 2;
        }

        .canvas-tips {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          color: var(--foreground-muted);
          background: rgba(255, 255, 255, 0.02);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        /* Table panel */
        .table-panel {
          display: flex;
          flex-direction: column;
          gap: 18px;
          height: 600px;
        }

        .table-title {
          display: flex;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 12px;
        }

        .coordinate-list-wrapper {
          flex: 1;
          overflow-y: auto;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .coords-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .coords-table th {
          position: sticky;
          top: 0;
          background: var(--background);
          z-index: 10;
          padding: 12px 16px;
          border-bottom: 2px solid var(--border-color);
          color: var(--foreground-muted);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .coords-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.85rem;
          cursor: pointer;
        }

        .coords-table tr:hover td {
          background: rgba(255, 255, 255, 0.02);
        }

        [data-theme="light"] .coords-table tr:hover td {
          background: rgba(0, 0, 0, 0.01);
        }

        .coords-table tr.selected-row td {
          background: rgba(6, 182, 212, 0.15);
          color: var(--foreground);
          font-weight: 600;
          border-left: 3px solid var(--accent-secondary);
        }

        .idx-col {
          font-weight: 600;
          color: var(--accent-primary);
          width: 40px;
        }

        .name-col {
          font-weight: 500;
        }

        .val-col {
          font-family: monospace;
          color: var(--foreground-muted);
        }

        .selected-row .val-col {
          color: var(--foreground);
        }

        .danger-btn {
          border-color: rgba(239, 68, 68, 0.3) !important;
          color: var(--danger) !important;
        }

        .danger-btn:hover {
          background: rgba(239, 68, 68, 0.1) !important;
        }
      `}</style>
    </div>
  );
}
