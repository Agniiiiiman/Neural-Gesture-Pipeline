export interface GestureLog {
  id: string;
  timestamp: string;
  gesture: string;
  confidence: number;
  duration: number; // in milliseconds
  status: 'Recognised' | 'Low Confidence';
}

const STORAGE_KEY = 'ngp_gesture_logs';

const MOCK_LOGS: GestureLog[] = [
  { id: '1', timestamp: '2026-06-21 21:15:32', gesture: 'Peace ✌', confidence: 98.4, duration: 850, status: 'Recognised' },
  { id: '2', timestamp: '2026-06-21 21:14:10', gesture: 'Open Hand 🖐', confidence: 95.2, duration: 1200, status: 'Recognised' },
  { id: '3', timestamp: '2026-06-21 21:12:45', gesture: 'Thumbs Up 👍', confidence: 99.1, duration: 450, status: 'Recognised' },
  { id: '4', timestamp: '2026-06-21 21:10:05', gesture: 'Fist ✊', confidence: 97.0, duration: 600, status: 'Recognised' },
  { id: '5', timestamp: '2026-06-21 21:08:12', gesture: 'Fist ✊', confidence: 42.8, duration: 300, status: 'Low Confidence' },
  { id: '6', timestamp: '2026-06-21 20:55:12', gesture: 'Pointing ☝', confidence: 93.6, duration: 1100, status: 'Recognised' },
  { id: '7', timestamp: '2026-06-21 20:42:01', gesture: 'Call Me 🤙', confidence: 96.5, duration: 950, status: 'Recognised' },
  { id: '8', timestamp: '2026-06-21 20:10:30', gesture: 'Rock On 🤘', confidence: 97.8, duration: 1500, status: 'Recognised' },
];

export function getLogs(): GestureLog[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_LOGS));
    return MOCK_LOGS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return MOCK_LOGS;
  }
}

export function addLog(log: Omit<GestureLog, 'id'>): GestureLog {
  const logs = getLogs();
  const newLog: GestureLog = {
    ...log,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 4)
  };
  const updatedLogs = [newLog, ...logs];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedLogs));
  return newLog;
}

export function clearLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
