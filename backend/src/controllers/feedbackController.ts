import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

// Validate feedback data
const validateFeedback = (data: any) => {
  const errors = [];

  if (!data.rating) errors.push("Rating is required");
  if (data.rating < 1 || data.rating > 5) errors.push("Rating must be between 1 and 5");

  return errors;
};

// Create new feedback for a business
export const createFeedback = async (req: Request, res: Response) => {
  try {
    const businessId = parseInt(req.params.id);
    const { rating, comment, reviewerName } = req.body;

    // Validate input
    const errors = validateFeedback(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        businessId,
        rating,
        comment,
        reviewerName
      }
    });

    res.status(201).json(feedback);
  } catch (error: any) {
    console.error('Error creating feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all feedback for a specific business
export const getFeedbackForBusiness = async (req: Request, res: Response) => {
  try {
    const businessId = parseInt(req.params.id);

    // Check if business exists
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });

    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    const feedback = await prisma.feedback.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate average rating
    const avgRating = feedback.length > 0
      ? feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length
      : 0;

    res.json({
      feedback,
      meta: {
        count: feedback.length,
        avgRating: parseFloat(avgRating.toFixed(1))
      }
    });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update feedback
export const updateFeedback = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { rating, comment, reviewerName } = req.body;

    // Validate input
    const errors = validateFeedback(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Check if feedback exists
    const existingFeedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!existingFeedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Update feedback
    const updatedFeedback = await prisma.feedback.update({
      where: { id },
      data: {
        rating,
        comment,
        reviewerName
      }
    });

    res.json(updatedFeedback);
  } catch (error: any) {
    console.error('Error updating feedback:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete feedback
export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    // Check if feedback exists
    const feedback = await prisma.feedback.findUnique({
      where: { id }
    });

    if (!feedback) {
      return res.status(404).json({ error: 'Feedback not found' });
    }

    // Delete feedback
    await prisma.feedback.delete({
      where: { id }
    });

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting feedback:', error);
    res.status(500).json({ error: error.message });
  }
};