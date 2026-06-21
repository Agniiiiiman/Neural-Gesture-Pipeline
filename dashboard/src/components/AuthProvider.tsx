'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LoginPage } from './LoginPage';

interface AuthUser {
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check saved session on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedAuth = localStorage.getItem('ngp_auth');
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          setUser(parsed);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('ngp_auth');
        }
      }
      // Small timeout to make the loading splash transition feel smooth and premium
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Artificial API network latency delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Simple mock authentication
    if (username.trim().toLowerCase() === 'admin' && password === 'gesture123') {
      const authUser = { username: username.trim() };
      setUser(authUser);
      setIsAuthenticated(true);
      localStorage.setItem('ngp_auth', JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ngp_auth');
  };

  if (isLoading) {
    return (
      <div className="auth-splash-screen">
        <div className="splash-loader">
          <div className="loader-ring"></div>
          <div className="loader-pulse"></div>
          <h2 className="loader-text text-gradient">Neural Gesture Pipeline</h2>
          <p className="loader-subtitle">Initializing secure interface...</p>
        </div>

        <style jsx>{`
          .auth-splash-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: #09090b; /* Cosmic black */
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          }

          .splash-loader {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            text-align: center;
          }

          .loader-ring {
            width: 60px;
            height: 60px;
            border: 3px dashed var(--accent-secondary, #06b6d4);
            border-top: 3px solid var(--accent-primary, #8b5cf6);
            border-radius: 50%;
            animation: spin 1.5s linear infinite;
            filter: drop-shadow(0 0 10px rgba(139, 92, 246, 0.5));
          }

          .loader-pulse {
            position: absolute;
            width: 30px;
            height: 30px;
            background: rgba(6, 182, 212, 0.2);
            border-radius: 50%;
            animation: pulse 1.5s ease-out infinite;
          }

          .loader-text {
            font-size: 1.5rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            margin-top: 8px;
          }

          .loader-subtitle {
            font-size: 0.85rem;
            color: var(--foreground-muted, #a1a1aa);
            letter-spacing: 0.05em;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes pulse {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {!isAuthenticated ? (
        <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
