'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Camera, 
  BarChart3, 
  Fingerprint, 
  FileSpreadsheet, 
  Settings, 
  Info, 
  Menu, 
  X, 
  Sun, 
  Moon,
  Activity,
  LogOut
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Live Detection', path: '/live', icon: Camera },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Hand Landmarks', path: '/landmarks', icon: Fingerprint },
    { name: 'Activity Logs', path: '/logs', icon: FileSpreadsheet },
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'About Project', path: '/about', icon: Info },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="mobile-header">
        <div className="mobile-logo">
          <Activity size={22} className="logo-icon animate-pulse" />
          <span>Neural Gesture</span>
        </div>
        <div className="mobile-actions">
          <button onClick={toggleTheme} className="theme-toggle-btn" aria-label="Toggle Theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={logout} className="theme-toggle-btn" aria-label="Logout">
            <LogOut size={20} />
          </button>
          <button onClick={toggleSidebar} className="menu-toggle-btn" aria-label="Toggle Menu">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Overlay for Mobile Sidebar */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      {/* Sidebar Navigation */}
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Activity size={28} className="logo-icon animate-pulse" />
          <div>
            <h2>Gesture Pipeline</h2>
            <p>Real-Time Tracking</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link 
                key={item.name} 
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.name}</span>
                {isActive && <div className="active-indicator"></div>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="status-badge">
            <span className="glow-dot active"></span>
            <span>Pipeline Running</span>
          </div>

          <button onClick={toggleTheme} className="theme-toggle-btn-desktop">
            {theme === 'dark' ? (
              <>
                <Sun size={18} />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon size={18} />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          <button onClick={logout} className="logout-btn-desktop">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <style jsx global>{`
        /* Desktop styles (default) */
        .mobile-header {
          display: none;
        }

        .sidebar-overlay {
          display: none;
        }

        .sidebar-container {
          position: fixed;
          top: 20px;
          left: 20px;
          bottom: 20px;
          width: 260px;
          background: var(--sidebar-background);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          padding: 24px;
          box-shadow: var(--shadow-lg);
          z-index: 100;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .logo-icon {
          color: var(--accent-primary);
          filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.5));
        }

        .sidebar-logo h2 {
          font-size: 1.15rem;
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--foreground);
        }

        .sidebar-logo p {
          font-size: 0.75rem;
          color: var(--foreground-muted);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--foreground-muted);
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 500;
          position: relative;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background: rgba(255, 255, 255, 0.04);
          color: var(--foreground);
        }

        [data-theme="light"] .nav-item:hover {
          background: rgba(0, 0, 0, 0.03);
        }

        .nav-item.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--foreground);
          font-weight: 600;
        }

        [data-theme="light"] .nav-item.active {
          background: rgba(79, 70, 229, 0.08);
          color: var(--accent-primary);
        }

        .nav-icon {
          color: inherit;
          transition: transform 0.2s ease;
        }

        .nav-item:hover .nav-icon {
          transform: translateX(2px);
        }

        .active-indicator {
          position: absolute;
          left: 0;
          top: 25%;
          height: 50%;
          width: 3px;
          background: var(--accent-primary);
          border-radius: 0 4px 4px 0;
          box-shadow: var(--accent-glow);
        }

        .sidebar-footer {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.8rem;
          color: var(--foreground-muted);
          padding: 4px 8px;
          background: rgba(16, 185, 129, 0.05);
          border: 1px solid rgba(16, 185, 129, 0.1);
          border-radius: var(--radius-sm);
          width: fit-content;
        }

        .theme-toggle-btn-desktop {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--foreground);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 500;
          transition: background 0.2s;
        }

        [data-theme="light"] .theme-toggle-btn-desktop {
          background: rgba(0, 0, 0, 0.02);
        }

        .theme-toggle-btn-desktop:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--border-color-glow);
        }

        [data-theme="light"] .theme-toggle-btn-desktop:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        .logout-btn-desktop {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 10px;
          border-radius: var(--radius-md);
          background: rgba(239, 68, 68, 0.03);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: var(--danger, #ef4444);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.85rem;
          font-weight: 500;
          transition: background 0.2s, border-color 0.2s;
        }

        .logout-btn-desktop:hover {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* Responsive Breakpoints */
        @media (max-width: 1024px) {
          .mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 60px;
            padding: 0 20px;
            background: var(--sidebar-background);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border-bottom: 1px solid var(--border-color);
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 110;
          }

          .mobile-logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: var(--font-display);
            font-weight: 700;
            font-size: 1.1rem;
          }

          .mobile-actions {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .menu-toggle-btn, .theme-toggle-btn {
            background: none;
            border: none;
            color: var(--foreground);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            border-radius: 50%;
          }

          .menu-toggle-btn:hover, .theme-toggle-btn:hover {
            background: rgba(255, 255, 255, 0.05);
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            z-index: 99;
          }

          .sidebar-container {
            top: 0;
            left: 0;
            bottom: 0;
            height: 100vh;
            border-radius: 0;
            border: none;
            border-right: 1px solid var(--border-color);
            transform: translateX(-100%);
            z-index: 100;
            width: 280px;
          }

          .sidebar-container.open {
            transform: translateX(0);
          }

          .theme-toggle-btn-desktop {
            display: none; /* Hide desktop button on mobile sidebar */
          }
        }
      `}</style>
    </>
  );
};
