'use client';

import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  FileSpreadsheet, 
  FileCode, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { getLogs, clearLogs, GestureLog } from '@/utils/logStore';

const ITEMS_PER_PAGE = 8;

export default function ActivityLogs() {
  const [logs, setLogs] = useState<GestureLog[]>([]);
  const [mounted, setMounted] = useState(false);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [gestureFilter, setGestureFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setLogs(getLogs());
    setMounted(true);
  }, []);

  const handleRefresh = () => {
    setLogs(getLogs());
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all gesture activity logs? This cannot be undone.')) {
      clearLogs();
      setLogs([]);
      setCurrentPage(1);
    }
  };

  // Get unique gestures for the filter dropdown
  const uniqueGestures = ['All', ...Array.from(new Set(logs.map(log => log.gesture)))];

  // Filtering Logic
  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.gesture.toLowerCase().includes(search.toLowerCase()) || 
                          log.status.toLowerCase().includes(search.toLowerCase()) ||
                          log.timestamp.includes(search);
    const matchesGesture = gestureFilter === 'All' || log.gesture === gestureFilter;
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;

    return matchesSearch && matchesGesture && matchesStatus;
  });

  // Pagination Logic
  const totalEntries = filteredLogs.length;
  const totalPages = Math.ceil(totalEntries / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalEntries);
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset pagination if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, gestureFilter, statusFilter]);

  // Export JSON
  const exportJSON = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(filteredLogs, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `neural_gesture_logs_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Gesture', 'Confidence %', 'Duration ms', 'Status'];
    const rows = filteredLogs.map(log => [
      log.id,
      log.timestamp,
      log.gesture.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, ''),
      log.confidence,
      log.duration,
      log.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `neural_gesture_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!mounted) {
    return <div className="loading-state">Loading Activity Logs...</div>;
  }

  return (
    <div className="logs-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="text-gradient">Activity Logs</h1>
          <p className="page-subtitle">Inspect, query, and download historical hand recognition scanner data.</p>
        </div>
        <div className="actions-group">
          <button onClick={handleRefresh} className="btn-secondary" title="Reload logs">
            <RefreshCw size={16} />
            <span>Reload</span>
          </button>
          <button onClick={handleClear} className="btn-secondary danger-btn" title="Clear all logs">
            <Trash2 size={16} />
            <span>Clear History</span>
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="glass-panel filter-panel">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by gesture name, status, or date..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="filter-input"
          />
        </div>

        <div className="filter-dropdowns">
          <div className="filter-item">
            <Filter size={14} className="filter-icon" />
            <select 
              value={gestureFilter}
              onChange={(e) => setGestureFilter(e.target.value)}
              className="select-filter"
            >
              {uniqueGestures.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Gestures' : g}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <Filter size={14} className="filter-icon" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="select-filter"
            >
              <option value="All">All Statuses</option>
              <option value="Recognised">Recognised</option>
              <option value="Low Confidence">Low Confidence</option>
            </select>
          </div>
        </div>

        <div className="export-buttons">
          <button onClick={exportCSV} className="export-btn" title="Export filtered to CSV">
            <FileSpreadsheet size={16} />
            <span>CSV</span>
          </button>
          <button onClick={exportJSON} className="export-btn" title="Export filtered to JSON">
            <FileCode size={16} />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel table-panel">
        <div className="table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Gesture Name</th>
                <th>Confidence Score</th>
                <th>Hold Duration</th>
                <th>Detection Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <div className="timestamp-cell">
                        <Clock size={14} className="cell-icon" />
                        <span>{log.timestamp}</span>
                      </div>
                    </td>
                    <td className="bold-text">{log.gesture}</td>
                    <td>{log.confidence.toFixed(1)}%</td>
                    <td>{(log.duration / 1000).toFixed(2)}s</td>
                    <td>
                      {log.status === 'Recognised' ? (
                        <span className="badge badge-success">
                          <CheckCircle2 size={12} />
                          {log.status}
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          <AlertTriangle size={12} />
                          {log.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="no-logs">
                    No matching activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {totalEntries > 0 && (
          <div className="pagination-footer">
            <span className="pagination-text">
              Showing <span className="bold-text">{startIndex + 1}</span> to{' '}
              <span className="bold-text">{endIndex}</span> of{' '}
              <span className="bold-text">{totalEntries}</span> entries
            </span>

            <div className="pagination-controls">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="page-btn"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="page-btn"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .logs-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .actions-group {
          display: flex;
          gap: 12px;
        }

        /* Filter Panel */
        .filter-panel {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 24px;
          flex-wrap: wrap;
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(0, 0, 0, 0.15);
          border: 1px solid var(--border-color);
          padding: 8px 16px;
          border-radius: var(--radius-md);
          min-width: 300px;
          flex: 1;
        }

        [data-theme="light"] .search-bar {
          background: rgba(255, 255, 255, 0.5);
        }

        .search-icon {
          color: var(--foreground-muted);
        }

        .filter-input {
          background: none;
          border: none;
          color: var(--foreground);
          font-family: var(--font-sans);
          font-size: 0.9rem;
          width: 100%;
          outline: none;
        }

        .filter-dropdowns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.1);
          border: 1px solid var(--border-color);
          padding: 8px 12px;
          border-radius: var(--radius-md);
        }

        [data-theme="light"] .filter-item {
          background: rgba(255, 255, 255, 0.5);
        }

        .filter-icon {
          color: var(--foreground-muted);
        }

        .select-filter {
          background: none;
          border: none;
          color: var(--foreground);
          font-family: var(--font-sans);
          font-size: 0.85rem;
          outline: none;
          cursor: pointer;
        }

        .export-buttons {
          display: flex;
          gap: 8px;
        }

        .export-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--foreground-muted);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s;
        }

        [data-theme="light"] .export-btn {
          background: rgba(0, 0, 0, 0.02);
        }

        .export-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: var(--foreground);
          border-color: var(--border-color-glow);
        }

        [data-theme="light"] .export-btn:hover {
          background: rgba(0, 0, 0, 0.05);
        }

        /* Table */
        .table-panel {
          padding: 0;
          display: flex;
          flex-direction: column;
        }

        .table-container {
          overflow-x: auto;
          width: 100%;
        }

        .logs-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .logs-table th {
          padding: 14px 20px;
          border-bottom: 2px solid var(--border-color);
          color: var(--foreground-muted);
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .logs-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
          color: var(--foreground);
        }

        .logs-table tr:hover td {
          background: rgba(255, 255, 255, 0.015);
        }

        [data-theme="light"] .logs-table tr:hover td {
          background: rgba(0, 0, 0, 0.005);
        }

        .no-logs {
          text-align: center;
          padding: 40px !important;
          color: var(--foreground-muted);
          font-size: 0.9rem;
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
        }

        /* Pagination */
        .pagination-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-top: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 16px;
        }

        .pagination-text {
          font-size: 0.85rem;
          color: var(--foreground-muted);
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border-color);
          color: var(--foreground);
          cursor: pointer;
          transition: background 0.2s;
        }

        [data-theme="light"] .page-btn {
          background: rgba(0, 0, 0, 0.02);
        }

        .page-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          border-color: var(--border-color-glow);
        }

        [data-theme="light"] .page-btn:hover:not(:disabled) {
          background: rgba(0, 0, 0, 0.05);
        }

        .page-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .page-indicator {
          font-size: 0.85rem;
          color: var(--foreground-muted);
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
