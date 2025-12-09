import { ApiLog } from '../types';

let logs: ApiLog[] = [];
const listeners: ((logs: ApiLog[]) => void)[] = [];

// Initial System Log
logs.push({
  id: 'sys-init',
  timestamp: new Date().toISOString(),
  endpoint: 'SYSTEM_BOOT',
  status: 'SUCCESS',
  latencyMs: 0,
  details: 'AetherPredict Shield initialized. Using Mock Data for Cyclone Ditwah (Public Domain).'
});

export const addLog = (log: Omit<ApiLog, 'id' | 'timestamp'>) => {
  const newLog: ApiLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    ...log
  };
  // Keep last 50 logs to prevent memory overflow
  logs = [newLog, ...logs].slice(0, 50);
  notifyListeners();
};

export const getLogs = () => logs;

export const subscribeLogs = (listener: (logs: ApiLog[]) => void) => {
  listeners.push(listener);
  // Send current state immediately
  listener(logs);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
};

const notifyListeners = () => {
  listeners.forEach(l => l(logs));
};