'use client';

import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Camera, 
  Sliders, 
  Sun, 
  Moon, 
  Volume2, 
  Mail, 
  Bell, 
  Palette, 
  Save, 
  SlidersHorizontal,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface SystemSettings {
  cameraSource: string;
  confidenceThreshold: number;
  detectionSensitivity: number;
  fpsLimit: number;
  themeColor: string;
  enableAlerts: boolean;
  enableEmail: boolean;
  enableSound: boolean;
}

const DEFAULT_SETTINGS: SystemSettings = {
  cameraSource: 'default',
  confidenceThreshold: 0.5,
  detectionSensitivity: 3,
  fpsLimit: 30,
  themeColor: 'indigo',
  enableAlerts: true,
  enableEmail: false,
  enableSound: true,
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isSaved, setIsSaved] = useState(false);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    // Load settings
    const saved = localStorage.getItem('ngp_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        setSettings(DEFAULT_SETTINGS);
      }
    }

    // Load available video devices
    if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setCameras(videoDevices);
      }).catch(err => {
        console.warn('Failed to list camera devices: ', err);
      });
    }
  }, []);

  const handleChange = (key: keyof SystemSettings, value: any) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    
    // Auto-update theme if toggle changes
    if (key === 'themeColor') {
      applyThemeColor(value);
    }
  };

  const applyThemeColor = (color: string) => {
    const root = document.documentElement;
    if (color === 'indigo') {
      root.style.setProperty('--accent-primary', '#6366f1');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)');
    } else if (color === 'emerald') {
      root.style.setProperty('--accent-primary', '#10b981');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #10b981 0%, #059669 100%)');
    } else if (color === 'cyan') {
      root.style.setProperty('--accent-primary', '#06b6d4');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)');
    } else if (color === 'rose') {
      root.style.setProperty('--accent-primary', '#f43f5e');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)');
    } else if (color === 'amber') {
      root.style.setProperty('--accent-primary', '#f59e0b');
      root.style.setProperty('--accent-gradient', 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)');
    }
  };

  const handleSave = () => {
    localStorage.setItem('ngp_settings', JSON.stringify(settings));
    setIsSaved(true);
    
    // Play sound if enabled
    if (settings.enableSound) {
      playConfirmationChime();
    }

    setTimeout(() => {
      setIsSaved(false);
    }, 3000);
  };

  const playConfirmationChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5

      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      console.warn('AudioContext chime failed to play: ', e);
    }
  };

  return (
    <div className="settings-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-gradient">System Settings</h1>
          <p className="page-subtitle">Configure hardware inputs, pipeline precision thresholds, and alert nodes.</p>
        </div>
        <button onClick={handleSave} className="btn-primary">
          <Save size={16} />
          <span>Save Changes</span>
        </button>
      </div>

      {isSaved && (
        <div className="saved-toast">
          <CheckCircle size={16} />
          <span>Settings saved successfully!</span>
        </div>
      )}

      <div className="settings-layout">
        {/* Left Side: System & Processing Settings */}
        <div className="glass-panel settings-group-card">
          <div className="group-header">
            <SlidersHorizontal size={20} className="group-icon" />
            <div>
              <h3>Pipeline Configuration</h3>
              <p>Calibrate detection logic and sensitivity limits</p>
            </div>
          </div>

          <div className="settings-list">
            {/* Camera Select */}
            <div className="setting-row">
              <div className="setting-info">
                <label className="setting-label">Camera Input Stream</label>
                <span className="setting-desc">Select which webcam hardware pipeline to scan</span>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.cameraSource}
                  onChange={(e) => handleChange('cameraSource', e.target.value)}
                  className="settings-select"
                >
                  <option value="default">Default Device</option>
                  {cameras.map((cam, idx) => (
                    <option key={cam.deviceId} value={cam.deviceId}>
                      {cam.label || `Camera ${idx + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Confidence Threshold */}
            <div className="setting-row slider-row">
              <div className="setting-info">
                <div className="label-with-val">
                  <label className="setting-label">Confidence Threshold</label>
                  <span className="control-val">{settings.confidenceThreshold.toFixed(2)}</span>
                </div>
                <span className="setting-desc">Minimum prediction confidence required to accept a gesture</span>
              </div>
              <div className="setting-control">
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={(e) => handleChange('confidenceThreshold', parseFloat(e.target.value))}
                  className="settings-range"
                />
              </div>
            </div>

            {/* Sensitivity */}
            <div className="setting-row slider-row">
              <div className="setting-info">
                <div className="label-with-val">
                  <label className="setting-label">Smoothing Window</label>
                  <span className="control-val">{settings.detectionSensitivity} frames</span>
                </div>
                <span className="setting-desc">Buffer length for temporal majority-vote smoothing</span>
              </div>
              <div className="setting-control">
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={settings.detectionSensitivity}
                  onChange={(e) => handleChange('detectionSensitivity', parseInt(e.target.value))}
                  className="settings-range"
                />
              </div>
            </div>

            {/* FPS Limit */}
            <div className="setting-row">
              <div className="setting-info">
                <label className="setting-label">Pipeline Frame Limit</label>
                <span className="setting-desc">Restrict camera processing loop speed (saves CPU)</span>
              </div>
              <div className="setting-control">
                <select 
                  value={settings.fpsLimit}
                  onChange={(e) => handleChange('fpsLimit', parseInt(e.target.value))}
                  className="settings-select"
                >
                  <option value={15}>15 FPS (Eco)</option>
                  <option value={30}>30 FPS (Standard)</option>
                  <option value={60}>60 FPS (Ultra)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Theme & Alerts */}
        <div className="right-settings-stack">
          {/* Appearance Card */}
          <div className="glass-panel settings-group-card">
            <div className="group-header">
              <Palette size={20} className="group-icon" />
              <div>
                <h3>Appearance & Styling</h3>
                <p>Customize dashboard interface mode and colors</p>
              </div>
            </div>

            <div className="settings-list">
              {/* Theme Toggle */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-label">Color Scheme</label>
                  <span className="setting-desc">Switch between light and dark themes</span>
                </div>
                <div className="setting-control">
                  <div className="theme-toggle-switch">
                    <button 
                      onClick={() => setTheme('dark')} 
                      className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`}
                    >
                      <Moon size={14} />
                      <span>Dark</span>
                    </button>
                    <button 
                      onClick={() => setTheme('light')} 
                      className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`}
                    >
                      <Sun size={14} />
                      <span>Light</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Accent Color Selection */}
              <div className="setting-row">
                <div className="setting-info">
                  <label className="setting-label">Accent Color Theme</label>
                  <span className="setting-desc">Select the neon focus color for active buttons and cards</span>
                </div>
                <div className="setting-control">
                  <div className="color-dots">
                    {[
                      { id: 'indigo', hex: '#6366f1' },
                      { id: 'emerald', hex: '#10b981' },
                      { id: 'cyan', hex: '#06b6d4' },
                      { id: 'rose', hex: '#f43f5e' },
                      { id: 'amber', hex: '#f59e0b' }
                    ].map(color => (
                      <button
                        key={color.id}
                        onClick={() => handleChange('themeColor', color.id)}
                        className={`color-dot ${settings.themeColor === color.id ? 'active' : ''}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="glass-panel settings-group-card">
            <div className="group-header">
              <Bell size={20} className="group-icon" />
              <div>
                <h3>Notifications & Alerts</h3>
                <p>Toggle chime outputs and system event reports</p>
              </div>
            </div>

            <div className="settings-list">
              {/* Detection Alerts */}
              <div className="setting-row checkbox-row">
                <div className="setting-info">
                  <label className="setting-label">Browser Notifications</label>
                  <span className="setting-desc">Trigger standard HTML5 system toast alerts</span>
                </div>
                <div className="setting-control">
                  <input 
                    type="checkbox" 
                    checked={settings.enableAlerts}
                    onChange={(e) => handleChange('enableAlerts', e.target.checked)}
                    className="settings-checkbox"
                  />
                </div>
              </div>

              {/* Sound Alerts */}
              <div className="setting-row checkbox-row">
                <div className="setting-info">
                  <label className="setting-label">Chime Audio Alerts</label>
                  <span className="setting-desc">Play a synthesized confirmation note when a gesture logs</span>
                </div>
                <div className="setting-control">
                  <input 
                    type="checkbox" 
                    checked={settings.enableSound}
                    onChange={(e) => handleChange('enableSound', e.target.checked)}
                    className="settings-checkbox"
                  />
                </div>
              </div>

              {/* Email Notifications */}
              <div className="setting-row checkbox-row">
                <div className="setting-info">
                  <label className="setting-label">Email Digest Reports</label>
                  <span className="setting-desc">Email daily detection frequency activity grids</span>
                </div>
                <div className="setting-control">
                  <input 
                    type="checkbox" 
                    checked={settings.enableEmail}
                    onChange={(e) => handleChange('enableEmail', e.target.checked)}
                    className="settings-checkbox"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .settings-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
          position: relative;
        }

        .saved-toast {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--success);
          color: white;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg), var(--success-glow);
          z-index: 1000;
          font-weight: 500;
          font-size: 0.9rem;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        @media (max-width: 1200px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
        }

        .right-settings-stack {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-group-card {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .group-header {
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 16px;
        }

        .group-icon {
          color: var(--accent-primary);
        }

        .group-header h3 {
          font-size: 1.1rem;
        }

        .group-header p {
          font-size: 0.82rem;
          color: var(--foreground-muted);
          margin-top: 2px;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
          gap: 24px;
        }

        .setting-row:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }

        .slider-row {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }

        .setting-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .setting-label {
          font-size: 0.92rem;
          font-weight: 600;
          color: var(--foreground);
        }

        .label-with-val {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .control-val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--accent-secondary);
          font-family: var(--font-display);
        }

        .setting-desc {
          font-size: 0.78rem;
          color: var(--foreground-muted);
          line-height: 1.3;
        }

        /* Controls styling */
        .settings-select {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          color: var(--foreground);
          font-family: var(--font-sans);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
          min-width: 160px;
        }

        [data-theme="light"] .settings-select {
          background: rgba(0, 0, 0, 0.02);
        }

        .settings-range {
          -webkit-appearance: none;
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          outline: none;
        }

        [data-theme="light"] .settings-range {
          background: rgba(0, 0, 0, 0.1);
        }

        .settings-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--accent-primary);
          cursor: pointer;
          box-shadow: var(--shadow-sm);
          transition: transform 0.1s;
        }

        .settings-range::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }

        .settings-checkbox {
          width: 18px;
          height: 18px;
          accent-color: var(--accent-primary);
          cursor: pointer;
        }

        /* Theme switches */
        .theme-toggle-switch {
          display: flex;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--border-color);
          padding: 3px;
          border-radius: var(--radius-md);
        }

        [data-theme="light"] .theme-toggle-switch {
          background: rgba(0, 0, 0, 0.03);
        }

        .theme-switch-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          border: none;
          background: none;
          color: var(--foreground-muted);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: background 0.2s, color 0.2s;
        }

        .theme-switch-btn.active {
          background: rgba(255, 255, 255, 0.08);
          color: var(--foreground);
          box-shadow: var(--shadow-sm);
        }

        [data-theme="light"] .theme-switch-btn.active {
          background: #ffffff;
          color: var(--accent-primary);
        }

        /* Color accent selector dots */
        .color-dots {
          display: flex;
          gap: 8px;
        }

        .color-dot {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid transparent;
          cursor: pointer;
          transition: transform 0.15s, border-color 0.15s;
        }

        .color-dot:hover {
          transform: scale(1.12);
        }

        .color-dot.active {
          border-color: #ffffff;
          transform: scale(1.15);
          box-shadow: var(--shadow-sm);
        }

        [data-theme="light"] .color-dot.active {
          border-color: #0f172a;
        }
      `}</style>
    </div>
  );
}
