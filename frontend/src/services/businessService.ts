/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './api';
import { Business, PaginatedResponse } from '@/lib/types';

// Utility function to debounce API calls
const debounce = <T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number = 300
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCall: number = 0;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;

      // Clear the previous timeout if it exists
      if (timeout) clearTimeout(timeout);

      if (timeSinceLastCall >= wait) {
        // If enough time has passed since the last call, execute immediately
        lastCall = now;
        func(...args)
          .then(resolve)
          .catch(reject);
      } else {
        // Otherwise, schedule to run after the wait period
        timeout = setTimeout(() => {
          lastCall = Date.now();
          func(...args)
            .then(resolve)
            .catch(reject);
        }, wait - timeSinceLastCall);
      }
    });
  };
};

// Original API functions
const _getBusinessesByCategory = async (categoryId: number, page = 1, limit = 9): Promise<PaginatedResponse<Business>> => {
  const response = await api.get('/businesses/search', {
    params: { category: categoryId, page, limit },
  });
  return response.data;
};

const _searchBusinesses = async (params: {
  searchTerm?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Business>> => {
  const response = await api.get('/businesses/search', { params });
  return response.data;
};

// Debounced versions of the API calls
export const getBusinessesByCategory = debounce(_getBusinessesByCategory, 500);
export const searchBusinesses = debounce(_searchBusinesses, 500);

export const getBusinessById = async (id: string): Promise<Business> => {
  const response = await api.get(`/businesses/${id}`);
  return response.data;
};

export const updateBusiness = async (id: string, data: Business): Promise<Business> => {
  const response = await api.put(`/businesses/${id}`, data);
  return response.data;
};