import axios from 'axios';
import { SystemMetric } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const metricsService = {
  getLatest: async (deviceName?: string): Promise<SystemMetric> => {
    const params = deviceName ? { device_name: deviceName } : {};
    const response = await api.get<SystemMetric>('/api/metrics/latest', { params });
    return response.data;
  },
  getHistory: async (limit: number = 100, deviceName?: string): Promise<SystemMetric[]> => {
    const params: any = { limit };
    if (deviceName) {
      params.device_name = deviceName;
    }
    const response = await api.get<SystemMetric[]>('/api/metrics', { params });
    return response.data;
  },
  getDevices: async (): Promise<string[]> => {
    const response = await api.get<string[]>('/api/devices');
    return response.data;
  },
};
