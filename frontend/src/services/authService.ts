import api from './api';

// Types for login response and params
export interface LoginParams {
  businessName: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  id: number;
  businessName: string;
}

export interface RegisterParams {
  businessName: string;
  password: string;
  description?: string;
  categoryId: number;
  contactNumber: string;
  email?: string;
  website?: string;
  openingHours?: string;
  closingHours?: string;
  latitude?: number;
  longitude?: number;
}

export const login = async (data: LoginParams): Promise<LoginResponse> => {
  const response = await api.post('/businesses/login', data);
  return response.data;
};

export const register = async (data: RegisterParams) => {
  const response = await api.post('/businesses', data);
  return response.data;
};