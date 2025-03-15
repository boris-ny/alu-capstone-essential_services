import { mockRequest, mockResponse } from '../utils/mockUtils';
import { mockPrisma } from '../utils/mockPrisma';

// Set up the mock before importing the controller
jest.mock('../../utils/prisma', () => ({
  prisma: mockPrisma,
}));

import * as feedbackController from '../../controllers/feedbackController';

describe('Feedback Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createFeedback', () => {
    it('should create feedback successfully', async () => {
      // Mock data
      const businessId = '1';
      const feedbackData = {
        rating: 4,
        comment: 'Great service!',
        reviewerName: 'John Doe'
      };

      const business = {
        id: 1,
        businessName: 'Test Business',
        // Other required fields...
        password: 'hashed_password',
        description: 'Business description',
        categoryId: 1,
        contactNumber: '123456789',
        email: 'business@test.com',
        website: 'https://test.com',
        openingHours: '9 AM',
        closingHours: '5 PM',
        latitude: 40.7128,
        longitude: -74.006,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const createdFeedback = {
        id: 1,
        businessId: 1,
        rating: 4,
        comment: 'Great service!',
        reviewerName: 'John Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock dependencies
      mockPrisma.business.findUnique.mockResolvedValue(business);
      mockPrisma.feedback.create.mockResolvedValue(createdFeedback);

      // Create request and response
      const req = mockRequest({
        params: { id: businessId },
        body: feedbackData
      });
      const res = mockResponse();

      // Call the controller
      await feedbackController.createFeedback(req, res);

      // Assertions
      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.feedback.create).toHaveBeenCalledWith({
        data: {
          businessId: 1,
          rating: 4,
          comment: 'Great service!',
          reviewerName: 'John Doe'
        }
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(createdFeedback);
    });

    it('should return validation error when rating is invalid', async () => {
      // Test with invalid rating (outside 1-5 range)
      const req = mockRequest({
        params: { id: '1' },
        body: { rating: 6, comment: 'Great service!' }
      });
      const res = mockResponse();

      await feedbackController.createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: ['Rating must be between 1 and 5']
      });
    });

    it('should return 404 when business does not exist', async () => {
      // Mock business not found
      mockPrisma.business.findUnique.mockResolvedValue(null);

      const req = mockRequest({
        params: { id: '999' },
        body: { rating: 4, comment: 'Great service!' }
      });
      const res = mockResponse();

      await feedbackController.createFeedback(req, res);

      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Business not found' });
    });

    it('should handle server errors', async () => {
      // Mock error
      mockPrisma.business.findUnique.mockRejectedValue(new Error('Database error'));

      const req = mockRequest({
        params: { id: '1' },
        body: { rating: 4, comment: 'Great service!' }
      });
      const res = mockResponse();

      await feedbackController.createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('getFeedbackForBusiness', () => {
    it('should get all feedback for a business with average rating', async () => {
      // Mock data
      const businessId = '1';
      const business = {
        id: 1,
        businessName: 'Test Business',
        password: 'hashedpassword123',
        description: 'A test business for feedback',
        categoryId: 1,
        contactNumber: '+1234567890',
        email: 'contact@testbusiness.com',
        website: 'https://testbusiness.com',
        openingHours: '9 AM - 5 PM',
        closingHours: '9 AM - 5 PM',
        latitude: 40.7128,
        longitude: -74.006,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const feedback = [
        {
          id: 1,
          businessId: 1,
          rating: 5,
          comment: 'Excellent service!',
          reviewerName: 'Alice',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          businessId: 1,
          rating: 3,
          comment: 'Good service',
          reviewerName: 'Bob',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Mock dependencies
      mockPrisma.business.findUnique.mockResolvedValue(business);
      mockPrisma.feedback.findMany.mockResolvedValue(feedback);

      // Create request and response
      const req = mockRequest({ params: { id: businessId } });
      const res = mockResponse();

      // Call the controller
      await feedbackController.getFeedbackForBusiness(req, res);

      // Assertions
      expect(mockPrisma.business.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.feedback.findMany).toHaveBeenCalledWith({
        where: { businessId: 1 },
        orderBy: { createdAt: 'desc' }
      });
      expect(res.json).toHaveBeenCalledWith({
        feedback,
        meta: {
          count: 2,
          avgRating: 4.0 // (5 + 3) / 2 = 4.0
        }
      });
    });

    it('should return an empty array with zero average when no feedback exists', async () => {
      // Mock data
      const businessId = '1';
      const business = {
        id: 1,
        businessName: 'Test Business',
        password: 'hashedpassword123',
        description: 'A test business for feedback',
        categoryId: 1,
        contactNumber: '+1234567890',
        email: 'contact@testbusiness.com',
        website: 'https://testbusiness.com',
        openingHours: '9 AM - 5 PM',
        closingHours: '9 AM - 5 PM',
        latitude: 40.7128,
        longitude: -74.006,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const feedback: any[] = [];

      // Mock dependencies
      mockPrisma.business.findUnique.mockResolvedValue(business);
      mockPrisma.feedback.findMany.mockResolvedValue(feedback);

      // Create request and response
      const req = mockRequest({ params: { id: businessId } });
      const res = mockResponse();

      // Call the controller
      await feedbackController.getFeedbackForBusiness(req, res);

      // Assertions
      expect(res.json).toHaveBeenCalledWith({
        feedback: [],
        meta: {
          count: 0,
          avgRating: 0
        }
      });
    });

    it('should return 404 when business does not exist', async () => {
      // Mock business not found
      mockPrisma.business.findUnique.mockResolvedValue(null);

      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await feedbackController.getFeedbackForBusiness(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Business not found' });
    });

    it('should handle server errors', async () => {
      // Mock error
      mockPrisma.business.findUnique.mockRejectedValue(new Error('Database error'));

      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await feedbackController.getFeedbackForBusiness(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateFeedback', () => {
    it('should update feedback successfully', async () => {
      // Mock data
      const feedbackId = '1';
      const updateData = {
        rating: 5,
        comment: 'Updated comment',
        reviewerName: 'Jane Doe'
      };

      const existingFeedback = {
        id: 1,
        businessId: 1,
        rating: 3,
        comment: 'Original comment',
        reviewerName: 'Jane Doe',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedFeedback = {
        ...existingFeedback,
        rating: 5,
        comment: 'Updated comment'
      };

      // Mock dependencies
      mockPrisma.feedback.findUnique.mockResolvedValue(existingFeedback);
      mockPrisma.feedback.update.mockResolvedValue(updatedFeedback);

      // Create request and response
      const req = mockRequest({
        params: { id: feedbackId },
        body: updateData
      });
      const res = mockResponse();

      // Call the controller
      await feedbackController.updateFeedback(req, res);

      // Assertions
      expect(mockPrisma.feedback.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.feedback.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(res.json).toHaveBeenCalledWith(updatedFeedback);
    });

    it('should return 404 when feedback does not exist', async () => {
      // Mock feedback not found
      mockPrisma.feedback.findUnique.mockResolvedValue(null);

      const req = mockRequest({
        params: { id: '999' },
        body: { rating: 5, comment: 'Updated comment' }
      });
      const res = mockResponse();

      await feedbackController.updateFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Feedback not found' });
    });

    it('should handle validation errors', async () => {
      const req = mockRequest({
        params: { id: '1' },
        body: { rating: 0, comment: 'Invalid rating' }
      });
      const res = mockResponse();

      await feedbackController.updateFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        errors: ['Rating is required', 'Rating must be between 1 and 5']
      });
    });

    it('should handle server errors', async () => {
      // Mock error
      mockPrisma.feedback.findUnique.mockRejectedValue(new Error('Database error'));

      const req = mockRequest({
        params: { id: '1' },
        body: { rating: 4, comment: 'Updated comment' }
      });
      const res = mockResponse();

      await feedbackController.updateFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('deleteFeedback', () => {
    it('should delete feedback successfully', async () => {
      // Mock data
      const feedbackId = '1';
      const feedback = {
        id: 1,
        businessId: 1,
        rating: 4,
        comment: 'To be deleted',
        reviewerName: 'Test User',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock dependencies
      mockPrisma.feedback.findUnique.mockResolvedValue(feedback);
      mockPrisma.feedback.delete.mockResolvedValue(feedback);

      // Create request and response
      const req = mockRequest({ params: { id: feedbackId } });
      const res = mockResponse();

      // Call the controller
      await feedbackController.deleteFeedback(req, res);

      // Assertions
      expect(mockPrisma.feedback.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(mockPrisma.feedback.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.json).toHaveBeenCalledWith({ message: 'Feedback deleted successfully' });
    });

    it('should return 404 when feedback does not exist', async () => {
      // Mock feedback not found
      mockPrisma.feedback.findUnique.mockResolvedValue(null);

      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      await feedbackController.deleteFeedback(req, res);

      expect(mockPrisma.feedback.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
      expect(mockPrisma.feedback.delete).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Feedback not found' });
    });

    it('should handle server errors', async () => {
      // Mock error
      const error = new Error('Database error');
      mockPrisma.feedback.findUnique.mockRejectedValue(error);

      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      await feedbackController.deleteFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });
});