'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { User, Lock, AlertTriangle, Fingerprint, Eye, EyeOff } from 'lucide-react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      triggerError('Please enter both username and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const success = await login(username, password);
      if (!success) {
        triggerError('Invalid credentials. Use admin / gesture123.');
      }
    } catch (err) {
      triggerError('An error occurred during authentication.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    setShakeCard(true);
    // Play a buzzer sound or alert chime if preferred (synthesized using audio API)
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
      osc.frequency.setValueAtTime(120, audioCtx.currentTime); // Low buzz freq
      osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.15);
      
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.2);
    } catch (e) {}
  };

  return (
    <div className="login-page-container">
      {/* Moving Background Blobs */}
      <div className="bg-blob blob-purple"></div>
      <div className="bg-blob blob-cyan"></div>
      <div className="bg-grid-overlay"></div>

      {/* Login Card */}
      <div className={`login-card glass-panel ${shakeCard ? 'shake-animation' : ''}`}>
        <div className="card-header">
          <div className="brand-logo">
            <Fingerprint size={32} className="logo-icon" />
          </div>
          <h1 className="text-gradient">System Access</h1>
          <p className="card-subtitle">Authenticate to launch Neural Gesture Pipeline</p>
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
            <label className="input-label">Username</label>
            <div className="input-wrapper">
              <User size={18} className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter system username"
                className="form-input"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter access password"
                className="form-input"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Remember and Helper */}
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="checkbox-input"
              />
              <span>Remember session</span>
            </label>
            <span className="credential-hint">Hint: admin / gesture123</span>
          </div>

          {/* Submit Button */}
          <button type="submit" className="btn-primary login-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="btn-loader">
                <span className="spinner-dot"></span>
                <span>Authorizing...</span>
              </div>
            ) : (
              <span>Authenticate Node</span>
            )}
          </button>
        </form>
      </div>

      <style jsx>{`
        .login-page-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #050508; /* Ultra dark indigo background */
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          z-index: 999;
          font-family: var(--font-sans, system-ui, sans-serif);
        }

        /* Ambient Blobs */
        .bg-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.18;
          z-index: 1;
          pointer-events: none;
        }

        .blob-purple {
          width: 450px;
          height: 450px;
          background: #8b5cf6;
          top: -100px;
          right: 15%;
          animation: float-slow 12s ease-in-out infinite alternate;
        }

        .blob-cyan {
          width: 450px;
          height: 450px;
          background: #06b6d4;
          bottom: -100px;
          left: 15%;
          animation: float-slow 16s ease-in-out infinite alternate-reverse;
        }

        .bg-grid-overlay {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
          background-size: 50px 50px;
          z-index: 2;
          pointer-events: none;
        }

        /* Glassmorphic Login Card */
        .login-card {
          width: 420px;
          padding: 40px;
          border-radius: var(--radius-lg, 16px);
          background: rgba(15, 15, 24, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 
            0 24px 64px -16px rgba(0, 0, 0, 0.7),
            0 0 2px 1px rgba(255, 255, 255, 0.03) inset;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 10;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        .card-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .brand-logo {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-md, 12px);
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 16px -4px rgba(0, 0, 0, 0.3);
          margin-bottom: 4px;
        }

        .logo-icon {
          color: var(--accent-secondary, #06b6d4);
          filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.4));
        }

        .card-subtitle {
          font-size: 0.82rem;
          color: var(--foreground-muted, #a1a1aa);
          line-height: 1.4;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* Form Controls */
        .error-alert {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #f87171;
          padding: 12px 16px;
          border-radius: var(--radius-md, 8px);
          font-size: 0.82rem;
          animation: fade-in 0.25s ease-out;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--foreground-muted, #a1a1aa);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--foreground-muted, #71717a);
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .form-input {
          width: 100%;
          padding: 14px 44px 14px 42px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-md, 8px);
          color: #ffffff;
          font-size: 0.92rem;
          outline: none;
          transition: 
            border-color 0.25s ease, 
            box-shadow 0.25s ease, 
            background-color 0.25s ease;
        }

        .form-input:focus {
          border-color: var(--accent-secondary, #06b6d4);
          background: rgba(6, 182, 212, 0.02);
          box-shadow: 
            0 0 0 3px rgba(6, 182, 212, 0.15),
            0 0 12px rgba(6, 182, 212, 0.1) inset;
        }

        .form-input:focus ~ .input-icon {
          color: var(--accent-secondary, #06b6d4);
        }

        .password-toggle {
          position: absolute;
          right: 14px;
          background: none;
          border: none;
          color: var(--foreground-muted, #71717a);
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
          transition: color 0.2s ease;
        }

        .password-toggle:hover {
          color: #ffffff;
        }

        .form-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground-muted, #a1a1aa);
          cursor: pointer;
          user-select: none;
        }

        .checkbox-input {
          accent-color: var(--accent-primary, #8b5cf6);
          width: 14px;
          height: 14px;
          cursor: pointer;
        }

        .credential-hint {
          color: var(--foreground-muted, #71717a);
          font-style: italic;
        }

        .login-btn {
          width: 100%;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: 600;
          border-radius: var(--radius-md, 8px);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--accent-glow);
          transition: transform 0.15s ease, box-shadow 0.2s ease;
        }

        .login-btn:active {
          transform: scale(0.98);
        }

        /* Button Loader */
        .btn-loader {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spinner-dot {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top: 2px solid #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Animations */
        @keyframes float-slow {
          0% { transform: translateY(0) scale(1); }
          100% { transform: translateY(-40px) scale(1.15); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
      `}</style>
    </div>
  );
};
