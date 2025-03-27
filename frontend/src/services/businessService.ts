import api from './api';
import { Business, PaginatedResponse } from '@/lib/types';

export const getBusinessesByCategory = async (categoryId: number, page = 1, limit = 9): Promise<PaginatedResponse<Business>> => {
  const response = await api.get('/businesses/search', {
    params: { category: categoryId, page, limit },
  });
  return response.data;
};

export const searchBusinesses = async (params: {
  searchTerm?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Business>> => {
  const response = await api.get('/businesses/search', { params });
  return response.data;
};

export const getBusinessById = async (id: string): Promise<Business> => {
  const response = await api.get(`/businesses/${id}`);
  return response.data;
};

export const updateBusiness = async (id: string, data: Business): Promise<Business> => {
  const response = await api.put(`/businesses/${id}`, data);
  return response.data;
};