import api from './api';
import axios from 'axios';
import { Business, Place } from '@/lib/types';

// Utility function to debounce API calls
const debounce = <T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number = 500
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastCall: number = 0;

  // Track pending calls to avoid duplicate requests
  const pendingCalls = new Map<string, Promise<ReturnType<T>>>();

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    // Create a key based on function arguments for caching similar requests
    const callKey = JSON.stringify(args);

    // If this exact call is pending, return the pending promise
    if (pendingCalls.has(callKey)) {
      return pendingCalls.get(callKey)!;
    }

    const promise = new Promise<ReturnType<T>>((resolve, reject) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCall;

      // Clear the previous timeout if it exists
      if (timeout) clearTimeout(timeout);

      if (timeSinceLastCall >= wait) {
        // If enough time has passed since the last call, execute immediately
        lastCall = now;
        func(...args)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            pendingCalls.delete(callKey);
          });
      } else {
        // Otherwise, schedule to run after the wait period
        timeout = setTimeout(() => {
          lastCall = Date.now();
          func(...args)
            .then(resolve)
            .catch(reject)
            .finally(() => {
              pendingCalls.delete(callKey);
            });
        }, wait - timeSinceLastCall);
      }
    });

    // Store the promise for this call
    pendingCalls.set(callKey, promise);
    return promise;
  };
};

// Original API functions
const _getPlaceSearch = async (input: string) => {
  const response = await api.post('/places/search', {
    params: { input },
  });
  return response.data;
};

const _getPlaceDetails = async (placeId: string) => {
  const response = await api.get(`/places/${placeId}`);
  return response.data;
};

export const getPlaceSearch = debounce(_getPlaceSearch, 1000);
export const getPlaceDetails = debounce(_getPlaceDetails, 1000);

const _searchBusinessesInKigali = async (textQuery: string): Promise<Business[]> => {
  try {
    // Define Kigali area boundaries for more accurate results
    const kigaliCoordinates = {
      rectangle: {
        low: {
          latitude: -1.9800,  // SW corner
          longitude: 30.0300  // SW corner
        },
        high: {
          latitude: -1.9000,  // NE corner
          longitude: 30.1200  // NE corner
        }
      }
    };

    // Skip the API call if no search text or key is available
    if (!textQuery) {
      console.warn('Missing search text for Places API');
      return [];
    }

    if (!import.meta.env.VITE_GOOGLE_PLACES_API_KEY) {
      console.warn('Missing API key for Places API. Check your environment variables.');
      // Instead of silently failing, throw a more descriptive error
      throw new Error('Google Places API key is missing. This might impact search results.');
    }

    // Cache key to prevent duplicate requests
    const cacheKey = `place_search_${textQuery.toLowerCase().trim()}`;
    const cachedResults = sessionStorage.getItem(cacheKey);

    // Return cached results if available (valid for 5 minutes)
    if (cachedResults) {
      try {
        const cached = JSON.parse(cachedResults);
        const cacheTime = new Date(cached.timestamp);
        const now = new Date();
        // If cache is less than 5 minutes old, use it
        if ((now.getTime() - cacheTime.getTime()) < 5 * 60 * 1000) {
          console.log('Using cached Places API results');
          return cached.data;
        }
      } catch (cacheError) {
        console.warn('Cache parsing error, will fetch fresh data:', cacheError);
        // Clear invalid cache entry
        sessionStorage.removeItem(cacheKey);
      }
    }

    // Add a timeout promise to handle network issues
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Google Places API request timed out')), 8000);
    });

    // Actual API request
    const requestPromise = axios.post(
      'https://places.googleapis.com/v1/places:searchText',
      {
        textQuery: textQuery,
        locationRestriction: kigaliCoordinates,
        pageSize: "10", // Reduced to 10 to minimize API usage
        maxResultCount: "10"
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_PLACES_API_KEY || '',
          'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.priceLevel,places.websiteUri',
        },
        timeout: 5000 // Add 5 second timeout to prevent hanging requests
      }
    );

    // Race between request and timeout
    const response = await Promise.race([requestPromise, timeoutPromise]);

    // Handle case when places data is missing or empty
    if (!response.data?.places || !Array.isArray(response.data.places)) {
      console.warn('Places API returned no results or invalid format');
      return [];
    }

    // Improved mapping with better defaults and structure
    const businesses: (Business & { external?: boolean })[] = response.data.places.map((place: Place) => {
      // Extract primary type as category name with formatting
      const categoryName = place.types?.[0]
        ? place.types[0].replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        : 'Uncategorized';

      // Generate a unique ID that won't conflict with database IDs
      const uniqueId = `ext-${Date.now()}-${Math.floor(Math.random() * 1000)}`.slice(-12);

      return {
        id: parseInt(uniqueId), // Use the unique ID as numeric ID
        placeId: place.id || uniqueId, // Store the original Google Place ID
        businessName: place.displayName?.text || 'Unnamed Business',
        description: place.formattedAddress || 'Business in Kigali',
        categoryId: 1, // Default category ID
        category: {
          id: 1,
          name: categoryName
        },
        contactNumber: '',
        email: '',
        website: place.websiteUri || '',
        openingHours: '',
        closingHours: '',
        latitude: place.location?.latitude || -1.9441, // Default to Kigali center if missing
        longitude: place.location?.longitude || 30.0619,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reviews: false,
        regularHours: false,
        priceLevel: place.priceLevel || '',
        external: true // Flag to identify as external source
      };
    });

    // Cache the results
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({
        data: businesses,
        timestamp: new Date().toISOString()
      }));
    } catch (storageError) {
      console.warn('Failed to cache search results:', storageError);
      // Continue execution even if caching fails
    }

    return businesses;
  } catch (error) {
    console.error('Error fetching places from Google API:', error);

    // Enhance error reporting with more context
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);

        // Provide more specific error messages based on status codes
        if (error.response.status === 403) {
          throw new Error('Google Places API access denied. Check your API key permissions.');
        } else if (error.response.status === 400) {
          throw new Error('Invalid request to Google Places API. Check your search parameters.');
        } else if (error.response.status >= 500) {
          throw new Error('Google Places API server error. Try again later.');
        }
      } else if (error.request) {
        // Network error occurred
        throw new Error('Network error when connecting to Google Places API. Check your internet connection.');
      }
    }

    // Rethrow with context if we haven't thrown a more specific error
    throw error instanceof Error
      ? new Error(`Places API error: ${error.message}`)
      : new Error('Unknown error occurred with Places API');
  }
};

// Export the debounced version with longer wait time for the external Google API
export const searchBusinessesInKigali = debounce(_searchBusinessesInKigali, 1500);