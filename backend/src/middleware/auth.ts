import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Update the type declaration to properly extend Express.Request
export interface AuthRequest extends Request {
  user?: {
    id: number;
    name: string;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; name: string };
    
    // Add the user info to the request
    (req as AuthRequest).user = decoded;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

// Middleware to check if user is updating their own business
export const ownerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    if (!authReq.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    
    const businessId = parseInt(req.params.id);
    
    // Check if this business belongs to the authenticated user
    const business = await prisma.business.findUnique({
      where: { id: businessId }
    });
    
    if (!business) {
      res.status(404).json({ error: 'Business not found' });
      return;
    }
    
    // Check if the authenticated user is the owner of this business
    if (business.id !== authReq.user.id) {
      res.status(403).json({ error: 'You are not authorized to update this business' });
      return;
    }
    
    next();
  } catch (error) {
    console.error('Owner verification error:', error);
    res.status(500).json({ error: 'Error verifying business ownership' });
    return;
  }
};