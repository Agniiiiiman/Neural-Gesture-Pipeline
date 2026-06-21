'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { 
  User, 
  Lock, 
  AlertTriangle, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  Check, 
  ShieldCheck, 
  Zap, 
  Cpu, 
  AreaChart, 
  Network 
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [shakeCard, setShakeCard] = useState(false);
  
  // Password strength calculation
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: 'Empty', color: '#4b5563' });

  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, label: 'Empty', color: '#4b5563' });
      return;
    }
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    let label = 'Weak';
    let color = '#ef4444'; // Red
    if (score >= 4) {
      label = 'Strong';
      color = '#10b981'; // Green
    } else if (score >= 2) {
      label = 'Medium';
      color = '#f59e0b'; // Amber
    }

    setPasswordStrength({ score, label, color });
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      triggerError('Please fill out all credentials.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const success = await login(username, password);
      if (!success) {
        triggerError('Verification failed. Invalid credentials.');
      }
    } catch (err) {
      triggerError('Security node error. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShakeCard(true);
    playErrorBuzzer();
    setTimeout(() => {
      setShakeCard(false);
    }, 500);
  };

  const playErrorBuzzer = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(70, audioCtx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  const handleSSO = (provider: string) => {
    setErrorMsg(`SSO nodes are restricted. Please authenticate using the credentials form.`);
    setTimeout(() => setErrorMsg(null), 4000);
  };

  return (
    <div className="split-page-wrapper">
      {/* LEFT PANEL: HERO & MOTION GRAPHICS */}
      <section className="hero-section">
        <div className="bg-grid"></div>
        <div className="glow-blob b-1"></div>
        <div className="glow-blob b-2"></div>

        {/* Floating AI Particles */}
        <div className="particle-container">
          <div className="particle p-1"></div>
          <div className="particle p-2"></div>
          <div className="particle p-3"></div>
          <div className="particle p-4"></div>
          <div className="particle p-5"></div>
        </div>

        <div className="hero-content">
          <div className="badge-system">
            <span className="live-dot"></span>
            <span>SYSTEM ONLINE</span>
          </div>

          <h1 className="hero-title">
            Welcome to <br />
            <span className="text-gradient-cyan-purple">Neural Gesture Pipeline</span>
          </h1>
          <p className="hero-subtitle">
            Real-Time Gesture Recognition Powered by Artificial Intelligence and Computer Vision.
          </p>

          {/* Interactive Joint Skeleton SVG */}
          <div className="hand-wireframe-container">
            <svg viewBox="0 0 400 400" className="hand-svg">
              <defs>
                <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Connecting bones */}
              <g className="bone-lines">
                {/* Palm Base */}
                <line x1="200" y1="350" x2="130" y2="280" />
                <line x1="200" y1="350" x2="270" y2="280" />
                
                {/* Thumb */}
                <line x1="130" y1="280" x2="80" y2="250" />
                <line x1="80" y1="250" x2="60" y2="200" />
                
                {/* Index */}
                <line x1="150" y1="230" x2="140" y2="150" />
                <line x1="140" y1="150" x2="130" y2="90" />
                
                {/* Middle */}
                <line x1="190" y1="220" x2="190" y2="130" />
                <line x1="190" y1="130" x2="190" y2="60" />
                
                {/* Ring */}
                <line x1="230" y1="230" x2="240" y2="150" />
                <line x1="240" y1="150" x2="250" y2="90" />
                
                {/* Pinky */}
                <line x1="270" y1="280" x2="290" y2="210" />
                <line x1="290" y1="210" x2="310" y2="160" />

                {/* Palm connections */}
                <line x1="130" y1="280" x2="150" y2="230" />
                <line x1="150" y1="230" x2="190" y2="220" />
                <line x1="190" y1="220" x2="230" y2="230" />
                <line x1="230" y1="230" x2="270" y2="280" />
              </g>

              {/* Joint Keypoints */}
              <g className="joint-points">
                <circle cx="200" cy="350" r="7" className="joint wrist" />
                
                {/* Thumb */}
                <circle cx="130" cy="280" r="5" className="joint" />
                <circle cx="80" cy="250" r="5" className="joint" />
                <circle cx="60" cy="200" r="5" className="joint fingertip cyan-pulse" />
                
                {/* Index */}
                <circle cx="150" cy="230" r="5" className="joint" />
                <circle cx="140" cy="150" r="5" className="joint" />
                <circle cx="130" cy="90" r="5" className="joint fingertip purple-pulse" />
                
                {/* Middle */}
                <circle cx="190" cy="220" r="5" className="joint" />
                <circle cx="190" cy="130" r="5" className="joint" />
                <circle cx="190" cy="60" r="5" className="joint fingertip cyan-pulse" />
                
                {/* Ring */}
                <circle cx="230" cy="230" r="5" className="joint" />
                <circle cx="240" cy="150" r="5" className="joint" />
                <circle cx="250" cy="90" r="5" className="joint fingertip purple-pulse" />
                
                {/* Pinky */}
                <circle cx="270" cy="280" r="5" className="joint" />
                <circle cx="290" cy="210" r="5" className="joint" />
                <circle cx="310" cy="160" r="5" className="joint fingertip cyan-pulse" />
              </g>
            </svg>
          </div>

          {/* Highlights grid */}
          <div className="features-grid">
            <div className="feature-item glass-card-hover">
              <Zap size={18} className="feat-icon blue" />
              <div>
                <h4>Real-Time Detection</h4>
                <p>Sub-10ms response latency</p>
              </div>
            </div>
            <div className="feature-item glass-card-hover">
              <Cpu size={18} className="feat-icon purple" />
              <div>
                <h4>MediaPipe Hand Tracking</h4>
                <p>21 landmark 3D coordinate estimation</p>
              </div>
            </div>
            <div className="feature-item glass-card-hover">
              <AreaChart size={18} className="feat-icon cyan" />
              <div>
                <h4>AI-Powered Analytics</h4>
                <p>Interactive metrics & CSV logs export</p>
              </div>
            </div>
            <div className="feature-item glass-card-hover">
              <Network size={18} className="feat-icon violet" />
              <div>
                <h4>Secure Cloud Dashboard</h4>
                <p>Node authentication & controls</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: SECURE LOGIN FORM */}
      <section className="form-section">
        <div className="form-container">
          <div className={`login-card glass-panel-right ${shakeCard ? 'shake-animation' : ''}`}>
            
            <div className="card-header">
              <div className="brand-logo">
                <Fingerprint size={28} className="logo-icon" />
              </div>
              <h2>Access Portal</h2>
              <p>Sign in to launch pipeline control nodes</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              {errorMsg && (
                <div className="error-alert">
                  <AlertTriangle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Username Field */}
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input"
                    placeholder=" "
                    disabled={isSubmitting}
                    required
                  />
                  <label className="floating-label">Email or Username</label>
                  <User size={16} className="input-icon" />
                </div>
              </div>

              {/* Password Field */}
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    placeholder=" "
                    disabled={isSubmitting}
                    required
                  />
                  <label className="floating-label">Security Key</label>
                  <Lock size={16} className="input-icon" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                {password && (
                  <div className="strength-meter">
                    <div className="meter-bar-bg">
                      <div 
                        className="meter-bar-fill" 
                        style={{ 
                          width: `${(passwordStrength.score / 5) * 100}%`,
                          backgroundColor: passwordStrength.color 
                        }}
                      ></div>
                    </div>
                    <span className="strength-label" style={{ color: passwordStrength.color }}>
                      Key Security: {passwordStrength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Remember & Forgot */}
              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span>Keep session cached</span>
                </label>
                <a href="#reset" onClick={() => triggerError('Credential recovery restricted to console administrator.')} className="forgot-link">
                  Reset Credentials
                </a>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary login-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="btn-loader">
                    <span className="spinner-dot"></span>
                    <span>Validating Node...</span>
                  </div>
                ) : (
                  <span>Authenticate Credentials</span>
                )}
              </button>

              <div className="sso-divider">
                <span>OR CONTINUE WITH</span>
              </div>

              {/* Social Login placeholders */}
              <div className="sso-grid">
                <button type="button" onClick={() => handleSSO('Google')} className="sso-button">
                  <svg className="sso-svg" viewBox="0 0 24 24">
                    <path fill="#ea4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.68 1.54 14.98 1 12 1 7.24 1 3.23 3.73 1.34 7.69l3.85 3C6.1 7.67 8.81 5.04 12 5.04z" />
                    <path fill="#4285f4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.43h6.45c-.28 1.47-1.11 2.71-2.36 3.55l3.66 2.84c2.14-1.97 3.74-4.88 3.74-8.48z" />
                    <path fill="#fbbc05" d="M5.19 14.31c-.24-.72-.38-1.49-.38-2.31s.14-1.59.38-2.31L1.34 7.69C.49 9.47 0 11.53 0 12s.49 2.53 1.34 4.31l3.85-3z" />
                    <path fill="#34a853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.66-2.84c-1.1.74-2.51 1.18-4.3 1.18-3.19 0-5.9-2.63-6.81-5.65l-3.85 3C3.23 20.27 7.24 23 12 23z" />
                  </svg>
                  <span>Google</span>
                </button>
                <button type="button" onClick={() => handleSSO('GitHub')} className="sso-button">
                  <svg className="sso-svg" viewBox="0 0 24 24">
                    <path fill="#ffffff" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span>GitHub</span>
                </button>
              </div>
            </form>

            <div className="mfa-badge">
              <ShieldCheck size={14} className="mfa-icon" />
              <span>Multi-Factor Authentication Mode Active</span>
            </div>
          </div>

          {/* Footer inside right panel */}
          <footer className="login-footer">
            <span className="copy">© 2026 Neural Gesture Pipeline</span>
            <div className="footer-links">
              <a href="#privacy">Privacy</a>
              <span className="dot">•</span>
              <a href="#terms">Terms</a>
              <span className="dot">•</span>
              <a href="#support">Support</a>
            </div>
          </footer>
        </div>
      </section>

      <style jsx>{`
        .split-page-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          display: flex;
          background: #030307;
          overflow: hidden;
          z-index: 9999;
          font-family: var(--font-sans, system-ui, sans-serif);
        }

        /* ------------------ LEFT SIDE ------------------ */
        .hero-section {
          width: 60%;
          height: 100%;
          position: relative;
          background: radial-gradient(circle at 10% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
                      #05050a;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px;
          border-right: 1px solid rgba(255, 255, 255, 0.04);
          z-index: 10;
        }

        .bg-grid {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          z-index: 1;
          pointer-events: none;
        }

        .glow-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(140px);
          opacity: 0.12;
          pointer-events: none;
          z-index: 2;
        }

        .b-1 {
          width: 400px;
          height: 400px;
          background: #8b5cf6;
          top: -50px;
          left: -50px;
        }

        .b-2 {
          width: 500px;
          height: 500px;
          background: #06b6d4;
          bottom: -100px;
          right: 50px;
        }

        /* Particles */
        .particle-container {
          position: absolute;
          inset: 0;
          z-index: 2;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
          background: #ffffff;
          opacity: 0.2;
        }

        .p-1 { width: 4px; height: 4px; top: 20%; left: 15%; animation: float-up 9s linear infinite; }
        .p-2 { width: 3px; height: 3px; top: 60%; left: 25%; animation: float-up 12s linear infinite; }
        .p-3 { width: 5px; height: 5px; top: 40%; left: 75%; animation: float-up 8s linear infinite; }
        .p-4 { width: 2px; height: 2px; top: 80%; left: 60%; animation: float-up 15s linear infinite; }
        .p-5 { width: 4px; height: 4px; top: 15%; left: 85%; animation: float-up 10s linear infinite; }

        @keyframes float-up {
          0% { transform: translateY(100px); opacity: 0; }
          10% { opacity: 0.3; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-150px); opacity: 0; }
        }

        .hero-content {
          width: 100%;
          max-width: 560px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 24px;
          z-index: 10;
        }

        .badge-system {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.15);
          color: #10b981;
          padding: 6px 12px;
          border-radius: 100px;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.05);
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 8px #10b981;
          animation: pulse-dot 1.5s infinite;
        }

        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        .text-gradient-cyan-purple {
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.1));
        }

        .hero-subtitle {
          font-size: 1rem;
          color: #a1a1aa;
          line-height: 1.5;
        }

        /* SVG Hand Wireframe */
        .hand-wireframe-container {
          width: 260px;
          height: 260px;
          margin: 16px 0;
          align-self: center;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hand-svg {
          width: 100%;
          height: 100%;
        }

        .bone-lines line {
          stroke: rgba(255, 255, 255, 0.05);
          stroke-width: 1.5;
          stroke-dasharray: 2 2;
          animation: line-flicker 4s infinite alternate;
        }

        .joint {
          fill: rgba(255, 255, 255, 0.1);
          stroke: rgba(255, 255, 255, 0.2);
          stroke-width: 1.5;
          transition: transform 0.2s ease;
          animation: joint-wobble 6s infinite ease-in-out alternate;
        }

        .fingertip {
          fill: #06b6d4;
          stroke: #8b5cf6;
          stroke-width: 2;
        }

        .wrist {
          fill: #8b5cf6;
          stroke: #ffffff;
        }

        .cyan-pulse {
          animation: pulse-cyan-dot 2s infinite ease-in-out;
        }

        .purple-pulse {
          animation: pulse-purple-dot 2.5s infinite ease-in-out;
        }

        @keyframes pulse-cyan-dot {
          0%, 100% { fill: #06b6d4; filter: drop-shadow(0 0 2px #06b6d4); }
          50% { fill: #8b5cf6; filter: drop-shadow(0 0 8px #8b5cf6); }
        }

        @keyframes pulse-purple-dot {
          0%, 100% { fill: #8b5cf6; filter: drop-shadow(0 0 2px #8b5cf6); }
          50% { fill: #06b6d4; filter: drop-shadow(0 0 8px #06b6d4); }
        }

        @keyframes joint-wobble {
          0% { transform: translate(0, 0); }
          50% { transform: translate(2px, -3px); }
          100% { transform: translate(-3px, 2px); }
        }

        @keyframes line-flicker {
          0%, 100% { stroke: rgba(255, 255, 255, 0.05); }
          50% { stroke: rgba(6, 182, 212, 0.15); }
        }

        /* Features List Grid */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
          margin-top: 12px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.03);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.07);
          transform: translateY(-2px);
        }

        .feat-icon {
          padding: 8px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.02);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
        }

        .feat-icon.blue { color: #06b6d4; }
        .feat-icon.purple { color: #8b5cf6; }
        .feat-icon.cyan { color: #22d3ee; }
        .feat-icon.violet { color: #a78bfa; }

        .feature-item h4 {
          font-size: 0.82rem;
          font-weight: 600;
          color: #f4f4f5;
          margin-bottom: 2px;
        }

        .feature-item p {
          font-size: 0.72rem;
          color: #71717a;
        }


        /* ------------------ RIGHT SIDE ------------------ */
        .form-section {
          width: 40%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        }

        .form-container {
          width: 100%;
          max-width: 420px;
          padding: 40px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .glass-panel-right {
          background: rgba(10, 10, 15, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 
            0 24px 60px -12px rgba(0, 0, 0, 0.8),
            0 0 2px 1px rgba(255, 255, 255, 0.02) inset;
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-radius: 16px;
          padding: 36px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .brand-logo {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(139, 92, 246, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 8px;
        }

        .logo-icon {
          color: #06b6d4;
          filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.4));
        }

        .card-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #ffffff;
        }

        .card-header p {
          font-size: 0.82rem;
          color: #71717a;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.07);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.8rem;
          animation: fade-in 0.25s ease-out;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: #4b5563;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .form-input {
          width: 100%;
          padding: 16px 42px 16px 42px;
          background: rgba(255, 255, 255, 0.01);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: #ffffff;
          font-size: 0.9rem;
          outline: none;
          transition: all 0.25s ease;
        }

        /* Floating Label Effect */
        .floating-label {
          position: absolute;
          left: 42px;
          color: #4b5563;
          pointer-events: none;
          transition: all 0.2s ease;
          font-size: 0.88rem;
        }

        .form-input:focus ~ .floating-label,
        .form-input:not(:placeholder-shown) ~ .floating-label {
          transform: translateY(-24px) scale(0.8);
          left: 20px;
          background: #0a0a0f;
          padding: 0 6px;
          color: #06b6d4;
        }

        .form-input:focus {
          border-color: #06b6d4;
          background: rgba(6, 182, 212, 0.01);
          box-shadow: 
            0 0 0 3px rgba(6, 182, 212, 0.1),
            0 0 10px rgba(6, 182, 212, 0.05) inset;
        }

        .form-input:focus ~ .input-icon {
          color: #06b6d4;
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: #4b5563;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .password-toggle:hover {
          color: #ffffff;
        }

        /* Password Strength */
        .strength-meter {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 4px;
          padding: 0 4px;
        }

        .meter-bar-bg {
          width: 60%;
          height: 3px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
        }

        .meter-bar-fill {
          height: 100%;
          width: 0;
          transition: width 0.3s ease, background-color 0.3s ease;
        }

        .strength-label {
          font-size: 0.72rem;
          font-weight: 600;
        }

        /* Checkbox & Options */
        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.78rem;
          margin-top: 2px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #a1a1aa;
          cursor: pointer;
          user-select: none;
        }

        .checkbox-input {
          accent-color: #8b5cf6;
          width: 14px;
          height: 14px;
          cursor: pointer;
        }

        .forgot-link {
          color: #8b5cf6;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #a78bfa;
          text-decoration: underline;
        }

        /* Authenticate Button */
        .login-btn {
          width: 100%;
          padding: 15px;
          font-size: 0.9rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
          border: none;
          color: #ffffff;
          box-shadow: 0 4px 20px rgba(6, 182, 212, 0.25);
          transition: all 0.2s ease;
        }

        .login-btn:hover {
          box-shadow: 0 4px 24px rgba(6, 182, 212, 0.4);
          transform: translateY(-1px);
        }

        .login-btn:active {
          transform: scale(0.99);
        }

        .btn-loader {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .spinner-dot {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* SSO Options */
        .sso-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 4px 0;
        }

        .sso-divider::before,
        .sso-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.05);
        }

        .sso-divider span {
          font-size: 0.68rem;
          font-weight: 600;
          color: #4b5563;
          letter-spacing: 0.05em;
        }

        .sso-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .sso-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 8px;
          color: #f4f4f5;
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .sso-button:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .sso-svg {
          width: 16px;
          height: 16px;
        }

        .mfa-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 0.7rem;
          color: #71717a;
          border-top: 1px solid rgba(255, 255, 255, 0.03);
          padding-top: 16px;
        }

        .mfa-icon {
          color: #10b981;
        }

        /* Footer */
        .login-footer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          font-size: 0.72rem;
          color: #4b5563;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .footer-links a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .footer-links a:hover {
          color: #ffffff;
        }

        .dot {
          color: rgba(255, 255, 255, 0.05);
        }

        /* Shake & Spin */
        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-6px); }
          40%, 80% { transform: translateX(6px); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-5px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* ------------------ RESPONSIVE BREAKPOINTS ------------------ */
        @media (max-width: 1024px) {
          .split-page-wrapper {
            flex-direction: column;
            overflow-y: auto;
          }

          .hero-section {
            width: 100%;
            height: auto;
            min-height: 480px;
            padding: 40px 24px;
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          }

          .hero-content {
            align-items: center;
            text-align: center;
            max-width: 480px;
          }

          .hero-title {
            font-size: 2rem;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-section {
            width: 100%;
            height: auto;
            min-height: 520px;
            padding: 24px 0;
            background: #030307;
          }

          .form-container {
            max-width: 420px;
            padding: 0 24px;
          }
        }

        @media (max-width: 640px) {
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .hero-section {
            min-height: 420px;
          }

          .sso-grid {
            grid-template-columns: 1fr;
          }

          .glass-panel-right {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};
