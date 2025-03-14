import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import axios from 'axios';
import cache from '../utils/cache';


const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

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
    const { searchTerm, category, includePlaces = 'true' } = req.query;
    console.log('Search request received:', { searchTerm, category, includePlaces });

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

    // Search local database
    const localBusinesses = await prisma.business.findMany({
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
      }
    });

    console.log(`Found ${localBusinesses.length} local businesses`);

    // If includePlaces is true and we have a searchTerm, fetch from Places API v1 too
    let placesResults: any[] = [];
    if (includePlaces === 'true' && searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      try {
        console.log('Fetching from Places API v1...');

        // Create cache key
        const cacheKey = `places_search_v1_${searchTerm.trim()}`;
        const cachedResults = cache.get(cacheKey);

        if (cachedResults && Array.isArray(cachedResults)) {
          console.log('Using cached Places results');
          placesResults = cachedResults;
        } else {
          // Use Places API v1 instead of the old API
          const response = await axios.post(
            'https://places.googleapis.com/v1/places:searchText',
            {
              textQuery: `${searchTerm} in Kigali, Rwanda`,
              languageCode: 'en'
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
                'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types'
              }
            }
          );

          console.log(`Places API v1 response:`, JSON.stringify(response.data).substring(0, 100) + '...');

          // Check if we have places in the response
          if (!response.data.places || !Array.isArray(response.data.places)) {
            console.error('Unexpected response format: places is not an array', typeof response.data.places);
            placesResults = [];
          } else {
            console.log(`Places API v1 returned ${response.data.places.length} results`);

            // Map places results to match your business schema
            placesResults = response.data.places.map((place: any) => ({
              id: `place_${place.id}`, // Add prefix to distinguish from local DB IDs
              businessName: place.displayName.text,
              description: place.formattedAddress || 'Business in Kigali',
              categoryId: 1, // Default category
              category: {
                id: 1,
                name: place.types?.[0] || 'Uncategorized'
              },
              contactNumber: '',
              email: '',
              website: '',
              openingHours: '',
              closingHours: '',
              latitude: place.location?.latitude || -1.9441,
              longitude: place.location?.longitude || 30.0619,
              createdAt: new Date(),
              updatedAt: new Date(),
              external: true, // Flag to identify external sources
              placeId: place.id // Store the Google Place ID
            }));
          }
        }

        // Filter out places that already exist in local results (by name)
        const filteredPlacesResults = placesResults.filter(place =>
          !localBusinesses.some(local =>
            local.businessName.toLowerCase() === place.businessName.toLowerCase()
          )
        );

        console.log(`After filtering, ${filteredPlacesResults.length} unique Places results remain`);
        placesResults = filteredPlacesResults;
      } catch (placeError: unknown) {
        console.error('Error fetching from Places API:', placeError);
        // Type guard to check if it's an axios error with response property
        if (placeError && typeof placeError === 'object' && 'response' in placeError) {
          const axiosError = placeError as { response?: { status: number, data: any } };
          if (axiosError.response) {
            console.error('Response status:', axiosError.response.status);
            console.error('Response data:', JSON.stringify(axiosError.response.data));
          }
        }
      }
    }

    // Combine results, local results first
    const combinedResults = [...localBusinesses, ...placesResults];
    console.log(`Returning a total of ${combinedResults.length} search results`);

    return res.json(combinedResults);
  } catch (error: any) {
    console.error('Search error:', error);
    return res.status(500).json({
      error: 'An error occurred while searching businesses',
      details: error.message
    });
  }
};