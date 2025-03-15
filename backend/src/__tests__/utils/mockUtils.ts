import { Request, Response } from 'express';

// Create mock request object
export function mockRequest(options = {}) {
  const req = {
    body: {},
    params: {},
    query: {},
    ...options,
  };
  return req as Request;
}

// Create mock response object
export function mockResponse() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
}

// Create mock next function
export function mockNext() {
  return jest.fn();
}