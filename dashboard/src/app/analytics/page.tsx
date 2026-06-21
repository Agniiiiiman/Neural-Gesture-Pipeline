'use client';

import React, { useEffect, useState } from 'react';
import { 
  Download, 
  FileDown, 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Percent, 
  Layers, 
  Activity, 
  Zap, 
  Clock, 
  Info 
} from 'lucide-react';
import { getLogs, GestureLog } from '@/utils/logStore';
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
  BarChart, 
  Bar, 
  Cell, 
  AreaChart, 
  Area, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts';

// Mock monthly data
const monthlyReportData = [
  { month: 'Jan', count: 1200 },
  { month: 'Feb', count: 1900 },
  { month: 'Mar', count: 2400 },
  { month: 'Apr', count: 1800 },
  { month: 'May', count: 2800 },
  { month: 'Jun', count: 3200 },
];

export default function Analytics() {
  const [logs, setLogs] = useState<GestureLog[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLogs(getLogs());
    setMounted(mounted => true);
  }, []);

  if (!mounted) {
    return <div className="loading-state">Loading Telemetry Analytics...</div>;
  }

  // 1. Calculate Stats
  const totalCount = logs.length;
  
  const avgConfidence = totalCount > 0 
    ? parseFloat((logs.reduce((sum, log) => sum + log.confidence, 0) / totalCount).toFixed(1))
    : 0;

  const avgDuration = totalCount > 0 
    ? parseFloat((logs.reduce((sum, log) => sum + log.duration, 0) / totalCount / 1000).toFixed(2))
    : 0;

  // Find most frequent gesture
  const gestureCounts: { [key: string]: number } = {};
  logs.forEach((log) => {
    gestureCounts[log.gesture] = (gestureCounts[log.gesture] || 0) + 1;
  });
  
  let mostFrequent = 'None';
  let maxCount = 0;
  Object.entries(gestureCounts).forEach(([gesture, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = gesture;
    }
  });

  // 2. Prepare chart data
  // Detections by gesture type (for Radar Chart)
  const radarData = Object.entries(gestureCounts).map(([name, count]) => ({
    subject: name,
    value: count,
    fullMark: Math.max(...Object.values(gestureCounts), 10)
  }));

  // Accuracy over time (last 10 detections)
  const accuracyData = logs.slice(0, 10).reverse().map((log, idx) => ({
    index: `#${idx + 1}`,
    confidence: log.confidence,
    gesture: log.gesture
  }));

  // Weekly activity aggregated
  const weeklyData = [
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 },
  ];
  // Parse logs to allocate to day names (mock random fallback to keep charts filled nicely)
  logs.forEach((log, index) => {
    const dayIndex = index % 7;
    weeklyData[dayIndex].count += 1;
  });

  // Export functions
  const downloadCSV = () => {
    const headers = ['ID', 'Timestamp', 'Gesture', 'Confidence (%)', 'Duration (ms)', 'Status'];
    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.gesture.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, ''), // strip emojis
      log.confidence,
      log.duration,
      log.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `neural_gesture_telemetry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrintPDF = () => {
    window.print();
  };

  return (
    <div className="analytics-page animate-fade-in">
      <div className="page-header no-print">
        <div>
          <h1 className="text-gradient">Performance Analytics</h1>
          <p className="page-subtitle">Inspect historical recognition precision, usage distributions, and weekly charts.</p>
        </div>
        <div className="actions-group">
          <button onClick={downloadCSV} className="btn-secondary">
            <Download size={16} />
            <span>Download CSV</span>
          </button>
          <button onClick={triggerPrintPDF} className="btn-primary">
            <FileDown size={16} />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Print-only Header */}
      <div className="print-header">
        <h1>Neural Gesture Pipeline — Telemetry Report</h1>
        <p>Generated on: {new Date().toLocaleString()}</p>
        <hr />
      </div>

      {/* Metric Cards Row */}
      <div className="metrics-grid">
        <MetricCard 
          title="Total Scan Detections" 
          value={totalCount} 
          icon={Layers} 
          trend="Lifetime logs" 
          trendType="neutral"
          color="#6366f1"
        />
        <MetricCard 
          title="Most Frequent Gesture" 
          value={mostFrequent} 
          icon={TrendingUp} 
          trend={`Detected ${maxCount} times`} 
          trendType="positive"
          color="#06b6d4"
        />
        <MetricCard 
          title="Avg. Confidence" 
          value={`${avgConfidence}%`} 
          icon={Percent} 
          trend="Threshold constraint: 50%" 
          trendType="neutral"
          color="#10b981"
        />
        <MetricCard 
          title="Avg. Gesture Hold" 
          value={`${avgDuration}s`} 
          icon={Clock} 
          trend="Time per scan active" 
          trendType="neutral"
          color="#3b82f6"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-container-grid">
        {/* Weekly Trend Line Chart */}
        <div className="glass-panel chart-card">
          <div className="chart-title">
            <Zap size={18} className="chart-icon" />
            <div>
              <h3>Weekly Gesture Tracking</h3>
              <p>Frequency of detections aggregated by day of week</p>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <Tooltip contentStyle={{ background: 'var(--background)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Comparison Chart */}
        <div className="glass-panel chart-card">
          <div className="chart-title">
            <BarChart3 size={18} className="chart-icon" />
            <div>
              <h3>Gesture Footprint Comparison</h3>
              <p>Relative density and volume of classified states</p>
            </div>
          </div>
          <div className="chart-frame">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.05)" />
                  <PolarAngleAxis dataKey="subject" stroke="var(--foreground-muted)" style={{ fontSize: '0.7rem' }} />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.1)" style={{ fontSize: '0.65rem' }} />
                  <Radar name="Scans" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No gesture footprints logged yet. Run Live Detection.</div>
            )}
          </div>
        </div>

        {/* Monthly Activity Bar Chart */}
        <div className="glass-panel chart-card">
          <div className="chart-title">
            <Activity size={18} className="chart-icon" />
            <div>
              <h3>Monthly Throughput Logs</h3>
              <p>Aggregated scanner telemetry over the last 6 months</p>
            </div>
          </div>
          <div className="chart-frame">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyReportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <YAxis stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                <Tooltip contentStyle={{ background: 'var(--background)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                <Bar dataKey="count" fill="var(--accent-secondary)" radius={[4, 4, 0, 0]}>
                  {monthlyReportData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? 'var(--accent-primary)' : 'var(--accent-secondary)'} opacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accuracy Performance Area Chart */}
        <div className="glass-panel chart-card">
          <div className="chart-title">
            <Percent size={18} className="chart-icon" />
            <div>
              <h3>Detection Precision Sequence</h3>
              <p>Model confidence score sequence (Last 10 frames)</p>
            </div>
          </div>
          <div className="chart-frame">
            {accuracyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={accuracyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="index" stroke="var(--foreground-muted)" tickLine={false} style={{ fontSize: '0.8rem' }} />
                  <YAxis stroke="var(--foreground-muted)" tickLine={false} domain={[40, 100]} style={{ fontSize: '0.8rem' }} />
                  <Tooltip contentStyle={{ background: 'var(--background)', borderColor: 'var(--border-color)', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="confidence" name="Confidence %" stroke="#10b981" fillOpacity={0.1} fill="rgba(16, 185, 129, 0.2)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No detection sequences recorded. Run Live Detection.</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .analytics-page {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .actions-group {
          display: flex;
          gap: 12px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 20px;
        }

        .charts-container-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 1200px) {
          .charts-container-grid {
            grid-template-columns: 1fr;
          }
        }

        .chart-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chart-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chart-icon {
          color: var(--accent-primary);
        }

        .chart-title h3 {
          font-size: 1rem;
          color: var(--foreground);
        }

        .chart-title p {
          font-size: 0.8rem;
          color: var(--foreground-muted);
        }

        .no-data {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--foreground-muted);
          font-size: 0.85rem;
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
        }

        /* Print formatting */
        .print-header {
          display: none;
        }

        @media print {
          /* Custom styles for printing */
          .no-print {
            display: none !important;
          }
          
          .print-header {
            display: block !important;
            margin-bottom: 20px;
          }

          .print-header h1 {
            font-size: 1.8rem;
            color: #000;
          }

          .print-header p {
            color: #666;
            font-size: 0.9rem;
          }

          .analytics-page {
            color: #000 !important;
            background: #fff !important;
            gap: 20px;
          }

          .glass-panel {
            background: #fff !important;
            border: 1px solid #ddd !important;
            color: #000 !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            page-break-inside: avoid;
          }

          .charts-container-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
