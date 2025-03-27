import api from './api';
import { Category } from '@/lib/types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get('/categories');
  return response.data;
};