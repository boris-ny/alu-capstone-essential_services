import { mockRequest, mockResponse, mockNext } from '../utils/mockUtils';
import { mockPrisma } from '../utils/mockPrisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock bcrypt and jwt
jest.mock('bcrypt');
jest.mock('jsonwebtoken');


// Set up the mock before importing the controller
jest.mock('../../utils/prisma', () => ({
  prisma: mockPrisma,
}));

import * as businessController from '../../controllers/businessController';


describe('Business Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBusiness', () => {
    it('should create a business successfully', async () => {
      // Mock data
      const businessData = {
        businessName: 'Test Business',
        password: 'test123',
        email: 'test@example.com',
        categoryId: 1,
      };
      const hashedPassword = 'hashed_password';

      // Create a complete business object matching Prisma schema
      const createdBusiness = {
        id: 1,
        businessName: 'Test Business',
        password: hashedPassword,
        description: null,
        categoryId: 1,
        contactNumber: '',
        email: 'test@example.com',
        website: null,
        openingHours: null,
        closingHours: null,
        latitude: null,
        longitude: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock dependencies
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrisma.business.create.mockResolvedValue(createdBusiness);

      // Create request and response
      const req = mockRequest({ body: businessData });
      const res = mockResponse();

      // Call the controller
      await businessController.createBusiness(req, res);

      // Assertions
      expect(bcrypt.hash).toHaveBeenCalledWith('test123', 10);
      expect(mockPrisma.business.create).toHaveBeenCalledWith({
        data: { ...businessData, password: hashedPassword },
      });
      expect(res.json).toHaveBeenCalledWith(createdBusiness);
    });

    it('should handle errors when creating a business fails', async () => {
      // Mock error
      const error = new Error('Database error');
      mockPrisma.business.create.mockRejectedValue(error);

      // Create request and response
      const req = mockRequest({ body: { businessName: 'Test' } });
      const res = mockResponse();

      // Call the controller
      await businessController.createBusiness(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('loginBusiness', () => {
    it('should login a business and return a token', async () => {
      // Mock data
      const credentials = { businessName: 'Test Business', password: 'test123' };

      // Create a complete business object matching Prisma schema
      const business = {
        id: 1,
        businessName: 'Test Business',
        password: 'hashed_password',
        description: null,
        categoryId: 1,
        contactNumber: '',
        email: null,
        website: null,
        openingHours: null,
        closingHours: null,
        latitude: null,
        longitude: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const token = 'jwt_token';

      // Mock dependencies
      mockPrisma.business.findFirst.mockResolvedValue(business);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue(token);

      // Create request, response, and next
      const req = mockRequest({ body: credentials });
      const res = mockResponse();
      const next = mockNext();

      // Call the controller
      await businessController.loginBusiness(req, res, next);

      // Assertions
      expect(mockPrisma.business.findFirst).toHaveBeenCalledWith({
        where: { businessName: 'Test Business' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('test123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 1, name: 'Test Business' },
        'test_jwt_secret',
        { expiresIn: '1h' }
      );
      expect(res.json).toHaveBeenCalledWith({ token });
    });
  });

  // Add tests for other business controller methods
});