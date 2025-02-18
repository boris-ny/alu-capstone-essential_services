import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createBusiness = async (req: Request, res: Response) => {
  try {
    const business = await prisma.business.create({
      data: req.body,
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
    const updatedBusiness = await prisma.business.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
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