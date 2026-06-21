'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Camera, 
  Cpu, 
  Flame, 
  Hand, 
  HelpCircle, 
  Layers, 
  TrendingUp, 
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area 
} from 'recharts';

// Mock Data
const trendData = [
  { time: '10:00', count: 12 },
  { time: '11:00', count: 18 },
  { time: '12:00', count: 15 },
  { time: '13:00', count: 28 },
  { time: '14:00', count: 34 },
  { time: '15:00', count: 22 },
  { time: '16:00', count: 40 },
  { time: '17:00', count: 45 },
];

const distributionData = [
  { name: 'Open Hand 🖐', value: 125, color: '#6366f1' },
  { name: 'Fist ✊', value: 80, color: '#8b5cf6' },
  { name: 'Peace ✌', value: 65, color: '#06b6d4' },
  { name: 'Pointing ☝', value: 50, color: '#3b82f6' },
  { name: 'Thumbs Up 👍', value: 45, color: '#10b981' },
  { name: 'Others', value: 30, color: '#f59e0b' },
];

const frequencyData = [
  { name: 'Mon', count: 140 },
  { name: 'Tue', count: 210 },
  { name: 'Wed', count: 185 },
  { name: 'Thu', count: 320 },
  { name: 'Fri', count: 290 },
  { name: 'Sat', count: 150 },
  { name: 'Sun', count: 120 },
];

const performanceData = [
  { time: '0s', cpu: 18, latency: 15, fps: 30 },
  { time: '5s', cpu: 22, latency: 14, fps: 30 },
  { time: '10s', cpu: 20, latency: 18, fps: 29 },
  { time: '15s', cpu: 25, latency: 16, fps: 30 },
  { time: '20s', cpu: 21, latency: 13, fps: 30 },
  { time: '25s', cpu: 19, latency: 15, fps: 30 },
  { time: '30s', cpu: 23, latency: 14, fps: 30 },
];

const recentActivity = [
  { id: 1, time: '2026-06-21 21:15:32', gesture: 'Peace ✌', confidence: '98.4%', status: 'Recognised' },
  { id: 2, time: '2026-06-21 21:14:10', gesture: 'Open Hand 🖐', confidence: '95.2%', status: 'Recognised' },
  { id: 3, time: '2026-06-21 21:12:45', gesture: 'Thumbs Up 👍', confidence: '99.1%', status: 'Recognised' },
  { id: 4, time: '2026-06-21 21:10:05', gesture: 'Fist ✊', confidence: '97.0%', status: 'Recognised' },
  { id: 5, time: '2026-06-21 21:08:12', gesture: 'Unknown', confidence: '42.8%', status: 'Low Confidence' },
];

export default function DashboardHome() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="loading-dashboard">Loading Analytics Dashboard...</div>;
  }

  return (
    <div className="dashboard-home animate-fade-in">
      {/* Page Title Header */}
      <div className="page-header">
        <div>
          <h1 className="text-gradient">AI Command Dashboard</h1>
          <p className="page-subtitle">Real-time telemetry and analysis of the hand tracking pipeline.</p>
        </div>
        <div className="time-badge">
          <Clock size={16} />
          <span>Last Updated: Live</span>
        </div>
      </div>

      {/* Grid of Key Metric Cards */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Gestures" 
          value="4,924" 
          icon={Layers} 
          trend="+18.4% today" 
          trendType="positive"
          color="#6366f1"
        />
        <MetricCard 
          title="Current Gesture" 
          value="Peace ✌" 
          icon={Hand} 
          trend="Confidence: 98.4%" 
          trendType="positive"
          color="#06b6d4"
        />
        <MetricCard 
          title="Avg. Accuracy" 
          value="96.8%" 
          icon={ShieldCheck} 
          trend="+0.3% improvement" 
          trendType="positive"
          color="#10b981"
        />
        <MetricCard 
          title="Camera Status" 
          value="ACTIVE" 
          icon={Camera} 
          trend="Webcam: USB Video Device" 
          trendType="neutral"
          color="#8b5cf6"
        />
        <MetricCard 
          title="Pipeline FPS" 
          value="29.8" 
          icon={Flame} 
          trend="Target: 30 FPS" 
          trendType="neutral"
          color="#ef4444"
        />
        <MetricCard 
          title="Hands Tracked" 
          value="1 Active" 
          icon={Cpu} 
          trend="Single-Hand Mode" 
          trendType="neutral"
          color="#3b82f6"
        />
      </div>

      {/* First Row of Charts (Line and Pie) */}
      <div className="charts-grid-two">
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>Gesture Detection Trend</h3>
            <span className="chart-info">Hourly detections (Last 8 Hours)</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--background)', 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--foreground)',
                    borderRadius: 'var(--radius-md)'
                  }} 
                />
                <Line type="monotone" dataKey="count" stroke="url(#accentGrad)" strokeWidth={3} dot={{ fill: 'var(--accent-primary)', r: 4 }} activeDot={{ r: 8 }} />
                <defs>
                  <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>Gesture Distribution</h3>
            <span className="chart-info">Usage share across system sessions</span>
          </div>
          <div className="chart-container pie-container">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--background)', 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--foreground)',
                    borderRadius: 'var(--radius-md)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-legend">
              {distributionData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-dot" style={{ backgroundColor: item.color }}></span>
                  <span className="legend-name">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row of Charts (Bar and Performance Area) */}
      <div className="charts-grid-two">
        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>Weekly Detection Frequency</h3>
            <span className="chart-info">Total daily recognized frames</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={frequencyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--background)', 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--foreground)',
                    borderRadius: 'var(--radius-md)'
                  }} 
                />
                <Bar dataKey="count" fill="var(--accent-primary)" radius={[4, 4, 0, 0]}>
                  {frequencyData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 3 ? 'var(--accent-secondary)' : 'var(--accent-primary)'} 
                      opacity={0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel chart-panel">
          <div className="chart-header">
            <h3>System Performance Graph</h3>
            <span className="chart-info">FPS, Latency, and CPU Usage</span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'var(--background)', 
                    borderColor: 'var(--border-color)', 
                    color: 'var(--foreground)',
                    borderRadius: 'var(--radius-md)'
                  }} 
                />
                <Legend style={{ fontSize: '0.8rem' }} />
                <Area type="monotone" dataKey="cpu" name="CPU (%)" stroke="#8b5cf6" fillOpacity={0.1} fill="rgba(139, 92, 246, 0.2)" strokeWidth={2} />
                <Area type="monotone" dataKey="latency" name="Latency (ms)" stroke="#06b6d4" fillOpacity={0.1} fill="rgba(6, 182, 212, 0.2)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Table Section */}
      <div className="glass-panel table-panel">
        <div className="table-header">
          <h3>Recent Pipeline Activity</h3>
          <p>Real-time detection events logged by the classification model.</p>
        </div>
        <div className="table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Detected Gesture</th>
                <th>Confidence Score</th>
                <th>Detection Status</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((activity) => (
                <tr key={activity.id}>
                  <td>
                    <div className="timestamp-cell">
                      <Clock size={14} className="cell-icon" />
                      <span>{activity.time}</span>
                    </div>
                  </td>
                  <td className="bold-text">{activity.gesture}</td>
                  <td>{activity.confidence}</td>
                  <td>
                    {activity.status === 'Recognised' ? (
                      <span className="badge badge-success">
                        <CheckCircle2 size={12} />
                        {activity.status}
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <AlertTriangle size={12} />
                        {activity.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .dashboard-home {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .loading-dashboard {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 80vh;
          font-size: 1.2rem;
          color: var(--foreground-muted);
          font-family: var(--font-display);
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-subtitle {
          font-size: 0.95rem;
          color: var(--foreground-muted);
          margin-top: 4px;
        }

        .time-badge {
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

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .charts-grid-two {
          display: grid;
          grid-template-columns: 3fr 2fr;
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .charts-grid-two {
            grid-template-columns: 1fr;
          }
        }

        .chart-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chart-header h3 {
          font-size: 1.1rem;
          color: var(--foreground);
        }

        .chart-info {
          font-size: 0.8rem;
          color: var(--foreground-muted);
        }

        .chart-container {
          margin-top: 10px;
        }

        .pie-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
        }

        .pie-legend {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          width: 100%;
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .legend-name {
          font-size: 0.75rem;
          color: var(--foreground-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Table Styling */
        .table-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .table-header h3 {
          font-size: 1.1rem;
        }

        .table-header p {
          font-size: 0.85rem;
          color: var(--foreground-muted);
          margin-top: 2px;
        }

        .table-container {
          overflow-x: auto;
          width: 100%;
        }

        .dashboard-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .dashboard-table th {
          padding: 14px 16px;
          border-bottom: 2px solid var(--border-color);
          color: var(--foreground-muted);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dashboard-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
          color: var(--foreground);
        }

        .dashboard-table tr:last-child td {
          border-bottom: none;
        }

        .dashboard-table tr:hover td {
          background: rgba(255, 255, 255, 0.01);
        }

        [data-theme="light"] .dashboard-table tr:hover td {
          background: rgba(0, 0, 0, 0.005);
        }

        .timestamp-cell {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--foreground-muted);
        }

        .cell-icon {
          color: var(--accent-primary);
        }

        .bold-text {
          font-weight: 600;
          color: var(--foreground);
        }
      `}</style>
    </div>
  );
}
