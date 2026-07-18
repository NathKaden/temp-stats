import axios from 'axios';
import { SystemMetric } from '@/types';

let API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Automatically detect backend port based on client port in dev environment
if (typeof window !== 'undefined' && !API_URL) {
  const port = window.location.port;
  
  if (port === '3001') {
    API_URL = 'http://localhost:8001';
  } else if (port === '3000') {
    API_URL = 'http://localhost:8000';
  } else {
    API_URL = window.location.origin;
  }
}

const api = axios.create({
  baseURL: API_URL,
});

export const metricsService = {
  getLatest: async (): Promise<SystemMetric> => {
    const response = await api.get<SystemMetric>('/api/metrics/latest');
    return response.data;
  },
  getHistory: async (limit: number = 100): Promise<SystemMetric[]> => {
    const response = await api.get<SystemMetric[]>('/api/metrics', { params: { limit } });
    return response.data;
  },
  getDevices: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/api/devices');
      return response.data;
    } catch (e) {
      return ["host-machine"];
    }
  },
};
