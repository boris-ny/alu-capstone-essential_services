import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';



const JWT_SECRET = process.env.JWT_SECRET || '';

export const createBusiness = async (req: Request, res: Response) => {
  try {
    const data = { ...req.body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    const business = await prisma.business.create({
      data,
    });
    res.json(business);
  } catch (error: any) {
    res.status(500).json({ message: (error as Error).message });
    console.log(error);
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

export const getBusinessById = async (req: Request, res: Response) => {
  try {
    const business = await prisma.business.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true, // Include the category relationship
        feedback: true, // Optionally include feedback if needed for display
      }
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
    const { searchTerm, category, page = 1, limit = 9 } = req.query;
    console.log('Search request received:', { searchTerm, category, page, limit });

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 9;
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // Only add search filter if searchTerm is not empty
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      where.OR = [
        {
          businessName: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          }
        },
        {
          description: {
            contains: searchTerm.trim(),
            mode: 'insensitive',
          }
        }
      ];
    }

    // Only add category filter if category is a valid number
    if (category && !isNaN(Number(category))) {
      const categoryId = parseInt(category as string);
      if (categoryId > 0) {
        where.categoryId = categoryId;
      }
    }

    console.log('Database query where clause:', JSON.stringify(where));

    // Count total businesses matching the criteria
    const totalCount = await prisma.business.count({ where });

    // Search local database with pagination
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
        openingHours: true,
        closingHours: true,
        latitude: true,
        longitude: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip,
      take: limitNum,
    });

    console.log(`Found ${businesses.length} businesses out of ${totalCount} total`);

    // Return paginated response
    return res.json({
      data: businesses,
      meta: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'An error occurred while searching businesses',
      details: error.message
    });
  }
};
