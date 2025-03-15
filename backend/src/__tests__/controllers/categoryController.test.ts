import { mockPrisma } from '../utils/mockPrisma';
import * as categoryController from '../../controllers/categoryConroller';
import { mockRequest, mockResponse } from '../utils/mockUtils';

jest.mock('../../utils/prisma', () => ({
  prisma: mockPrisma,
}));

describe('Category Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      // Mock data
      const categoryData = { name: 'Test Category' };
      const createdCategory = { id: 1, ...categoryData };

      // Mock dependencies
      mockPrisma.category.create.mockResolvedValue(createdCategory);

      // Create request and response
      const req = mockRequest({ body: categoryData });
      const res = mockResponse();

      // Call the controller
      await categoryController.createCategory(req, res);

      // Assertions
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: categoryData,
      });
      expect(res.json).toHaveBeenCalledWith(createdCategory);
    });

    // Add test for error handling
  });

  describe('getAllCategories', () => {
    it('should return all categories', async () => {
      // Mock data
      const categories = [
        { id: 1, name: 'Category 1' },
        { id: 2, name: 'Category 2' },
      ];

      // Mock dependencies
      mockPrisma.category.findMany.mockResolvedValue(categories);

      // Create request and response
      const req = mockRequest();
      const res = mockResponse();

      // Call the controller
      await categoryController.getAllCategories(req, res);

      // Assertions
      expect(mockPrisma.category.findMany).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(categories);
    });
  });

  describe('getCategoryById', () => {
    it('should return a category when found', async () => {
      // Mock data
      const categoryId = '1';
      const category = { id: 1, name: 'Test Category' };

      // Mock dependencies
      mockPrisma.category.findUnique.mockResolvedValue(category);

      // Create request and response
      const req = mockRequest({ params: { id: categoryId } });
      const res = mockResponse();

      // Call the controller
      await categoryController.getCategoryById(req, res);

      // Assertions
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.json).toHaveBeenCalledWith(category);
    });

    it('should return 404 when category is not found', async () => {
      // Mock dependencies - return null to simulate not found
      mockPrisma.category.findUnique.mockResolvedValue(null);

      // Create request and response
      const req = mockRequest({ params: { id: '999' } });
      const res = mockResponse();

      // Call the controller
      await categoryController.getCategoryById(req, res);

      // Assertions
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 999 }
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Category not found' });
    });

    it('should handle errors when retrieving a category fails', async () => {
      // Mock error
      const error = new Error('Database error');
      mockPrisma.category.findUnique.mockRejectedValue(error);

      // Create request and response
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      // Call the controller
      await categoryController.getCategoryById(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Database error' });
    });
  });

  describe('updateCategory', () => {
    it('should update a category successfully', async () => {
      // Mock data
      const categoryId = '1';
      const updateData = { name: 'Updated Category' };
      const updatedCategory = { id: 1, ...updateData };

      // Mock dependencies
      mockPrisma.category.update.mockResolvedValue(updatedCategory);

      // Create request and response
      const req = mockRequest({
        params: { id: categoryId },
        body: updateData
      });
      const res = mockResponse();

      // Call the controller
      await categoryController.updateCategory(req, res);

      // Assertions
      expect(mockPrisma.category.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData
      });
      expect(res.json).toHaveBeenCalledWith(updatedCategory);
    });

    it('should handle errors when updating a category fails', async () => {
      // Mock error - e.g., when category doesn't exist
      const error = new Error('Record to update not found');
      mockPrisma.category.update.mockRejectedValue(error);

      // Create request and response
      const req = mockRequest({
        params: { id: '999' },
        body: { name: 'Updated Category' }
      });
      const res = mockResponse();

      // Call the controller
      await categoryController.updateCategory(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Record to update not found' });
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category successfully', async () => {
      // Mock data
      const categoryId = '1';
      const deletedCategory = { id: 1, name: 'Deleted Category' };

      // Mock dependencies
      mockPrisma.category.delete.mockResolvedValue(deletedCategory);

      // Create request and response
      const req = mockRequest({ params: { id: categoryId } });
      const res = mockResponse();

      // Call the controller
      await categoryController.deleteCategory(req, res);

      // Assertions
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 1 }
      });
      expect(res.json).toHaveBeenCalledWith(deletedCategory);
    });

    it('should handle errors when deleting a category fails', async () => {
      // Mock error - e.g., when category has related records
      const error = new Error('Foreign key constraint failed');
      mockPrisma.category.delete.mockRejectedValue(error);

      // Create request and response
      const req = mockRequest({ params: { id: '1' } });
      const res = mockResponse();

      // Call the controller
      await categoryController.deleteCategory(req, res);

      // Assertions
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Foreign key constraint failed' });
    });
  });
});