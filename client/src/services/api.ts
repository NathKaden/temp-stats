import axios from 'axios';
import { SystemMetric } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
});

export const metricsService = {
  getLatest: async (): Promise<SystemMetric> => {
    const response = await api.get<SystemMetric>('/api/metrics/latest');
    return response.data;
  },
  getHistory: async (limit: number = 100): Promise<SystemMetric[]> => {
    const response = await api.get<SystemMetric[]>(`/api/metrics?limit=${limit}`);
    return response.data;
  },
};
