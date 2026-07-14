import axios from 'axios';
import { SystemMetric } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

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
