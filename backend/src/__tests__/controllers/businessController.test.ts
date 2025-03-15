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

    it('should return 400 when credentials are missing', async () => {
      // Test with missing password
      const req = mockRequest({ body: { businessName: 'Test Business' } });
      const res = mockResponse();
      const next = mockNext();

      await businessController.loginBusiness(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Business name and password are required'
      });
    });

    it('should return 401 when business does not exist', async () => {
      // Mock business not found
      mockPrisma.business.findFirst.mockResolvedValue(null);

      const req = mockRequest({
        body: { businessName: 'NonExistentBusiness', password: 'test123' }
      });
      const res = mockResponse();
      const next = mockNext();

      await businessController.loginBusiness(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 when password is incorrect', async () => {
      // Mock business found but incorrect password
      const business = {
        id: 1,
        businessName: 'Test Business',
        password: 'hashed_password',
        // Other required fields...
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

      mockPrisma.business.findFirst.mockResolvedValue(business);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const req = mockRequest({
        body: { businessName: 'Test Business', password: 'wrong_password' }
      });
      const res = mockResponse();
      const next = mockNext();

      await businessController.loginBusiness(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });
  });

  describe('getAllBusinesses', () => {
    it('should return all businesses', async () => {
      // Mock data
      const businesses = [
        {
          id: 1,
          businessName: 'Business 1',
          password: 'hashed_password',
          description: 'Description 1',
          categoryId: 1,
          contactNumber: '123456789',
          email: 'business1@test.com',
          website: 'https://business1.com',
          openingHours: '9 AM',
          closingHours: '5 PM',
          latitude: 40.7128,
          longitude: -74.006,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          businessName: 'Business 2',
          password: 'hashed_password',
          description: 'Description 2',
          categoryId: 2,
          contactNumber: '987654321',
          email: 'business2@test.com',
          website: 'https://business2.com',
          openingHours: '10 AM',
          closingHours: '6 PM',
          latitude: 34.0522,
          longitude: -118.2437,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Mock the findMany method
      mockPrisma.business.findMany.mockResolvedValue(businesses);

      const req = mockRequest();
      const res = mockResponse();

      await businessController.getAllBusinesses(req, res);

      expect(mockPrisma.business.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(businesses);
    });

    it('should handle errors', async () => {
      // Mock error
      const error = new Error('Database error');
      mockPrisma.business.findMany.mockRejectedValue(error);

      const req = mockRequest();
      const res = mockResponse();

      await businessController.getAllBusinesses(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Database error' });
    });
  });

  describe('updateBusiness', () => {
    it('should update business successfully', async () => {
      // Mock data
      const businessId = '1';
      const updateData = {
        businessName: 'Updated Business',
        description: 'Updated description'
      };

      const updatedBusiness = {
        id: 1,
        businessName: 'Updated Business',
        password: 'hashed_password',
        description: 'Updated description',
        categoryId: 1,
        contactNumber: '123456789',
        email: 'test@business.com',
        website: 'https://testbusiness.com',
        openingHours: '9 AM',
        closingHours: '5 PM',
        latitude: 40.7128,
        longitude: -74.006,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock update to return the updated business
      mockPrisma.business.update.mockResolvedValue(updatedBusiness);

      const req = mockRequest({
        params: { id: businessId },
        body: updateData
      });
      const res = mockResponse();

      await businessController.updateBusiness(req, res);

      expect(mockPrisma.business.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(res.json).toHaveBeenCalledWith(updatedBusiness);
    });

    it('should hash password when updating password', async () => {
      // Mock data
      const businessId = '1';
      const updateData = {
        businessName: 'Updated Business',
        password: 'new_password'
      };
      const hashedPassword = 'new_hashed_password';

      const updatedBusiness = {
        id: 1,
        businessName: 'Updated Business',
        password: hashedPassword,
        // Other required fields...
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

      // Mock bcrypt.hash
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      // Mock update to return the updated business
      mockPrisma.business.update.mockResolvedValue(updatedBusiness);

      const req = mockRequest({
        params: { id: businessId },
        body: updateData
      });
      const res = mockResponse();

      await businessController.updateBusiness(req, res);

      expect(bcrypt.hash).toHaveBeenCalledWith('new_password', 10);
      expect(mockPrisma.business.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { ...updateData, password: hashedPassword }
      });
      expect(res.json).toHaveBeenCalledWith(updatedBusiness);
    });

    it('should handle errors', async () => {
      // Mock error
      const error = new Error('Update failed');
      mockPrisma.business.update.mockRejectedValue(error);

      const req = mockRequest({
        params: { id: '1' },
        body: { businessName: 'Updated Business' }
      });
      const res = mockResponse();

      await businessController.updateBusiness(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update failed' });
    });
  });

  describe('deleteBusiness', () => {
    it('should delete business successfully', async () => {
      // Mock data
      const businessId = '1';
      const deletedBusiness = {
        id: 1,
        businessName: 'Deleted Business',
        // Other required fields...
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

      // Mock delete to return the deleted business
      mockPrisma.business.delete.mockResolvedValue(deletedBusiness);

      const req = mockRequest({ params: { id: businessId } });
      const res = mockResponse();

      await businessController.deleteBusiness(req, res);

      expect(mockPrisma.business.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.json).toHaveBeenCalledWith(deletedBusiness);
    });

    it('should handle errors', async () => {
      // Mock error - e.g., record to delete does not exist
      const error = new Error('Record to delete does not exist');
      mockPrisma.business.delete.mockRejectedValue(error);

      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await businessController.deleteBusiness(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Record to delete does not exist' });
    });
  });
});