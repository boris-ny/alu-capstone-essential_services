import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const createBusiness = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };

    // Check if business with email already exists
    if (data.email) {
      const existingBusiness = await prisma.business.findUnique({
        where: { email: data.email },
      });

      if (existingBusiness) {
        return res.status(400).json({
          message: 'A business with this email already exists'
        });
      }
    }

    // Hash password if provided
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }

    const business = await prisma.business.create({
      data,
    });

    // Remove password from response
    const { password, ...businessWithoutPassword } = business;
    res.status(201).json(businessWithoutPassword);

  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        message: `A business with this ${error.meta.target[0]} already exists`
      });
    }
    console.error('Error creating business:', error);
    res.status(500).json({ message: 'Error creating business' });
  }
};

export const getAllBusinesses = async (req: Request, res: Response) => {
  try {
    const businesses = await prisma.business.findMany();
    res.json(businesses);
  } catch (error: any) {
    res.status(500).json({ message: (error as Error).message });
    console.log(error);
  }
};

export const getBusinessById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({ message: 'Invalid business ID' });
    }

    const business = await prisma.business.findUnique({
      where: { id: id },
    });

    if (business) {
      res.json(business);
    } else {
      res.status(404).json({ message: 'Business not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBusiness = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const updatedBusiness = await prisma.business.update({
      where: { id: parseInt(req.params.id) },
      data,
    });
    res.json(updatedBusiness);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteBusiness = async (req: Request, res: Response) => {
  try {
    const deletedBusiness = await prisma.business.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json(deletedBusiness);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const loginBusiness = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { businessName, password } = req.body;
    if (!businessName || !password) {
      res.status(400).json({ error: 'Business name and password are required' });
      return;
    }

    const business = await prisma.business.findFirst({
      where: { businessName },
    });

    if (!business) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Compare provided password with the hashed password from the database
    const validPassword = await bcrypt.compare(password, business.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: business.id, name: business.businessName }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error: any) {
    next(error);
  }
};

export const searchBusinesses = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { searchTerm, category } = req.query;
    const where: any = {};

    // Only add businessName filter if searchTerm is not empty
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      where.businessName = {
        contains: searchTerm.trim(),
        mode: 'insensitive', // Make search case-insensitive
      };
    }

    // Only add category filter if category is a valid number
    if (category && !isNaN(Number(category))) {
      const categoryId = parseInt(category as string);
      if (categoryId > 0) { // Ensure category ID is positive
        where.categoryId = categoryId;
      }
    }

    const businesses = await prisma.business.findMany({
      where,
      select: {
        id: true,
        businessName: true,
        description: true,
        categoryId: true,
        contactNumber: true,
        email: true,
        website: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        password: false, // Exclude password from results
      },
    });

    return res.json(businesses);
  } catch (error: any) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'An error occurred while searching businesses',
      details: error.message
    });
  }
};