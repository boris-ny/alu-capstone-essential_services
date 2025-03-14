import { Request, Response } from 'express';
import axios from 'axios';
import { prisma } from '../utils/prisma';
import cache from '../utils/cache';

const PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';

export const importBusinessesFromPlaces = async (req: Request, res: Response) => {
  try {
    const { location, radius, type, keyword } = req.query;

    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Create a unique cache key based on query parameters
    const cacheKey = `places_import_${location}_${radius || 5000}_${type || 'establishment'}_${keyword || ''}`;

    // Check if we have a cached result
    const cachedResults = cache.get(cacheKey);
    if (cachedResults) {
      console.log('Returning cached import results');
      return res.json(cachedResults);
    }

    // Call Google Places API
    const response = await axios.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json', {
      params: {
        location, // Format: "latitude,longitude"
        radius: radius || 5000,
        type: type || 'establishment',
        keyword: keyword || '',
        key: PLACES_API_KEY
      }
    });

    const places = response.data.results;
    const importedBusinesses = [];

    // Process each place and save to database
    for (const place of places) {
      // Check if business already exists
      const existingBusiness = await prisma.business.findFirst({
        where: {
          businessName: place.name,
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng
        }
      });

      if (!existingBusiness) {
        // Get place details for more information
        const detailsCacheKey = `place_details_${place.place_id}`;
        let details;

        // Check for cached details
        const cachedDetails = cache.get(detailsCacheKey);
        if (cachedDetails) {
          details = cachedDetails;
        } else {
          const detailsResponse = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
            params: {
              place_id: place.place_id,
              fields: 'name,formatted_address,formatted_phone_number,website,opening_hours',
              key: PLACES_API_KEY
            }
          });

          details = detailsResponse.data.result;

          // Cache the details
          cache.set(detailsCacheKey, details);
        }

        // Map to category based on types
        let categoryId = 1; // Default category
        if (place.types.includes('restaurant')) categoryId = 2;  // Example mapping
        if (place.types.includes('health')) categoryId = 3;      // Example mapping

        // Create business in database
        const newBusiness = await prisma.business.create({
          data: {
            businessName: place.name,
            description: `Business imported from Google Places`,
            categoryId,
            contactNumber: details.formatted_phone_number || '',
            email: '',
            website: details.website || '',
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            openingHours: details.opening_hours?.weekday_text?.[0] || '',
            closingHours: details.opening_hours?.weekday_text?.[6] || '',
            password: 'placeholder', // You'll need to handle this appropriately
          }
        });

        importedBusinesses.push(newBusiness);
      }
    }

    const result = {
      importedCount: importedBusinesses.length,
      businesses: importedBusinesses
    };

    // Cache the import results
    cache.set(cacheKey, result);

    res.json(result);

  } catch (error: any) {
    console.error('Error importing businesses:', error);
    res.status(500).json({ error: 'Failed to import businesses', details: error.message });
  }
};


export const getPlaceSuggestions = async (req: Request, res: Response) => {
  try {
    const { input, location } = req.query;

    if (!input) {
      return res.status(400).json({ error: 'Input is required' });
    }

    // Create unique cache key
    const cacheKey = `place_suggestions_${input}_${location || ''}`;

    // Check if we have cached suggestions
    const cachedSuggestions = cache.get(cacheKey);
    if (cachedSuggestions) {
      console.log('Returning cached suggestions');
      return res.json(cachedSuggestions);
    }

    // New Places API v1 implementation
    const response = await axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: `${input}${location ? ` near ${location}` : ''}`,
        languageCode: 'en'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.types'
        }
      }
    );

    // Transform results to match your existing format
    const predictions = response.data.places.map((place: { id: any; formattedAddress: any; displayName: { text: any; }; types: any; }) => ({
      place_id: place.id,
      description: place.formattedAddress,
      structured_formatting: {
        main_text: place.displayName.text,
        secondary_text: place.formattedAddress
      },
      types: place.types || []
    }));

    // Cache the transformed results
    cache.set(cacheKey, predictions);

    res.json(predictions);
  } catch (error: any) {
    console.error('Error getting place suggestions:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data));
    }
    res.status(500).json({ error: 'Failed to get suggestions', details: error.message });
  }
};

export const getPlaceDetails = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;

    if (!placeId) {
      return res.status(400).json({ error: 'Place ID is required' });
    }

    // Create a unique cache key
    const cacheKey = `place_details_full_v1_${placeId}`;

    // Check if we have a cached result
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      console.log('Returning cached place details');
      return res.json(cachedResult);
    }

    console.log(`Fetching details for place ID: ${placeId}`);

    // Use Places API v1 for details with expanded fields
    const response = await axios.get(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask': 'id,displayName,formattedAddress,location,websiteUri,types,priceLevel,rating,userRatingCount,photos,internationalPhoneNumber,regularOpeningHours,primaryType,editorialSummary,reviews'
        }
      }
    );

    const details = response.data;
    console.log('Place details received:', JSON.stringify(details).substring(0, 200) + '...');

    // Format the response to match your business model
    const formattedResult = {
      id: `place_${placeId}`,
      businessName: details.displayName?.text || 'Unknown Business',
      description: details.editorialSummary?.text || details.formattedAddress || '',
      categoryId: 1,
      category: {
        id: 1,
        name: details.primaryType || details.types?.[0] || 'Uncategorized'
      },
      contactNumber: details.internationalPhoneNumber || '',
      email: '',
      website: details.websiteUri || '',
      openingHours: details.regularOpeningHours?.weekdayDescriptions?.[0] || '',
      closingHours: details.regularOpeningHours?.weekdayDescriptions?.[6] || '',
      latitude: details.location?.latitude,
      longitude: details.location?.longitude,
      rating: details.rating,
      totalRatings: details.userRatingCount,
      photos: details.photos?.map((photo: any) => ({
        url: photo.name
          ? `https://places.googleapis.com/v1/${photo.name}/media?key=${process.env.GOOGLE_PLACES_API_KEY}&maxHeightPx=400&maxWidthPx=400`
          : null
      })).filter((p: any) => p.url),
      reviews: details.reviews?.map((review: any) => ({
        author: review.authorAttribution?.displayName || 'Anonymous',
        rating: review.rating,
        text: review.text?.text || '',
        time: review.publishTime
      })) || [],
      regularHours: details.regularOpeningHours?.weekdayDescriptions || [],
      priceLevel: details.priceLevel,
      external: true,
      placeId: placeId
    };

    // Cache the formatted result
    cache.set(cacheKey, formattedResult);

    res.json(formattedResult);
  } catch (error: any) {
    console.error('Error fetching place details:', error);
    res.status(500).json({ error: 'Failed to fetch place details', details: error.message });
  }
};

// Add a utility method to clear cache if needed (for admin purposes)
export const clearPlacesCache = async (req: Request, res: Response) => {
  try {
    const { key } = req.query;

    if (key) {
      // Clear specific cache key if provided
      const deleted = cache.del(key.toString());
      return res.json({ success: true, message: `Cleared cache for key: ${key}`, deleted });
    }

    // Clear all places-related cache
    const keys = cache.keys();
    const placesKeys = keys.filter(k => k.startsWith('place_') || k.startsWith('places_'));
    let deleted = 0;

    placesKeys.forEach(k => {
      if (cache.del(k)) deleted++;
    });

    return res.json({
      success: true,
      message: `Cleared all places cache entries`,
      deleted,
      totalKeysRemoved: deleted
    });
  } catch (error: any) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Failed to clear cache', details: error.message });
  }
};