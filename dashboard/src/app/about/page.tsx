'use client';

import React from 'react';
import { 
  Terminal, 
  Video, 
  Fingerprint, 
  Binary, 
  Eye, 
  Cpu, 
  Zap, 
  Activity 
} from 'lucide-react';

const TECH_STACK = [
  {
    name: 'Python',
    desc: 'Core language driving the backend orchestrator. Manages configuration parameters, captures camera loops, and hosts recognition files.',
    category: 'Backend Core',
    icon: Terminal,
    color: '#3b82f6',
  },
  {
    name: 'OpenCV',
    desc: 'Open Source Computer Vision Library. Handles webcam input capture, camera matrix scaling, and on-screen graphical boundary draws.',
    category: 'Computer Vision',
    icon: Video,
    color: '#ef4444',
  },
  {
    name: 'MediaPipe',
    desc: "Google's cross-platform framework for on-device machine learning. Runs Hand Landmarker model to output 21 keypoint coords.",
    category: 'Inference Engine',
    icon: Fingerprint,
    color: '#06b6d4',
  },
  {
    name: 'NumPy',
    desc: 'Enables high-performance multi-dimensional array math, allowing rapid vector calculations on hand spatial landmark indices.',
    category: 'Data Science',
    icon: Binary,
    color: '#f59e0b',
  },
  {
    name: 'Computer Vision',
    desc: 'Applies image transformations, coordinates scaling, BGR/RGB canvas overlays, and real-time screen display mappings.',
    category: 'AI Domain',
    icon: Eye,
    color: '#8b5cf6',
  },
  {
    name: 'Machine Learning',
    desc: 'Leverages coordinate relationship checking and spatial algorithms to classify finger states into human-readable actions.',
    category: 'Model Logic',
    icon: Cpu,
    color: '#10b981',
  },
  {
    name: 'Real-Time Processing',
    desc: 'Optimized performance routines designed for zero-latency calculations, keeping the tracking scanner running at a stable 30 FPS.',
    category: 'Architecture',
    icon: Zap,
    color: '#ec4899',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page animate-fade-in">
      {/* Page Title Header */}
      <div className="page-header">
        <div>
          <h1 className="text-gradient">About Project</h1>
          <p className="page-subtitle">Learn about the technology stack and core goals of the Neural Gesture Pipeline.</p>
        </div>
      </div>

      {/* Main Project Description Card */}
      <div className="glass-panel intro-card">
        <div className="intro-badge">
          <Activity size={16} className="logo-icon animate-pulse" />
          <span>Neural Gesture Pipeline v1.0.0</span>
        </div>
        
        <h2>Project Overview</h2>
        
        <p className="project-description">
          Neural Gesture Pipeline is a real-time computer vision system that leverages MediaPipe Hand Tracking 
          and OpenCV to detect, track, and classify hand gestures from live webcam input. The system extracts 
          21 hand landmarks, processes spatial relationships between fingers, and performs gesture classification 
          to enable intuitive human-computer interaction.
        </p>

        <div className="intro-footer">
          <div className="footer-bullet">
            <span className="bullet-indicator"></span>
            <span>21 Coordinate Mesh Detections</span>
          </div>
          <div className="footer-bullet">
            <span className="bullet-indicator"></span>
            <span>Zero-latency WebAssembly Inference</span>
          </div>
          <div className="footer-bullet">
            <span className="bullet-indicator"></span>
            <span>Rule-based Temporal Classifiers</span>
          </div>
        </div>
      </div>

      {/* Tech Stack Cards Grid */}
      <div className="tech-section-header">
        <h2>Technology Stack</h2>
        <p>The core libraries and frameworks utilized in the python and browser implementation.</p>
      </div>

      <div className="tech-grid">
        {TECH_STACK.map((tech) => {
          const Icon = tech.icon;
          return (
            <div key={tech.name} className="glass-panel glass-panel-hover tech-card">
              <div className="tech-header">
                <span className="tech-category">{tech.category}</span>
                <div 
                  className="tech-icon-wrapper" 
                  style={{ backgroundColor: `${tech.color}15`, color: tech.color }}
                >
                  <Icon size={20} />
                </div>
              </div>
              <h3 className="tech-name">{tech.name}</h3>
              <p className="tech-desc">{tech.desc}</p>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .about-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        /* Intro Card */
        .intro-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 32px;
        }

        .intro-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: rgba(99, 102, 241, 0.1);
          border: 1px solid rgba(99, 102, 241, 0.2);
          border-radius: 20px;
          font-size: 0.8rem;
          color: var(--accent-primary);
          width: fit-content;
          font-weight: 600;
        }

        .logo-icon {
          color: var(--accent-primary);
        }

        .intro-card h2 {
          font-size: 1.4rem;
          color: var(--foreground);
        }

        .project-description {
          font-size: 1.05rem;
          line-height: 1.6;
          color: var(--foreground-muted);
        }

        .intro-footer {
          display: flex;
          gap: 24px;
          flex-wrap: wrap;
          border-top: 1px solid var(--border-color);
          padding-top: 20px;
          margin-top: 10px;
        }

        .footer-bullet {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.82rem;
          color: var(--foreground-muted);
        }

        .bullet-indicator {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-secondary);
          box-shadow: 0 0 6px var(--accent-secondary);
        }

        /* Tech Section */
        .tech-section-header {
          margin-top: 16px;
        }

        .tech-section-header h2 {
          font-size: 1.3rem;
          color: var(--foreground);
        }

        .tech-section-header p {
          font-size: 0.9rem;
          color: var(--foreground-muted);
          margin-top: 4px;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        .tech-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .tech-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tech-category {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--foreground-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .tech-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
        }

        .tech-name {
          font-size: 1.15rem;
          font-family: var(--font-display);
          color: var(--foreground);
        }

        .tech-desc {
          font-size: 0.85rem;
          line-height: 1.5;
          color: var(--foreground-muted);
        }
      `}</style>
    </div>
  );
}
