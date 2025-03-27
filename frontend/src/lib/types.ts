export interface Category {
  id: number;
  name: string;
}

export type Business = {
  reviews: boolean;
  regularHours: boolean;
  priceLevel: string;
  id: number;
  placeId?: string;
  businessName: string;
  description?: string;
  categoryId: number;
  contactNumber: string;
  latitude?: number;
  openingHours?: string;
  closingHours?: string;
  longitude?: number;
  email?: string;
  website?: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
};

export interface Place {
  websiteUri: string;
  id: string;
  displayName: {
    text: string;
  };
  formattedAddress: string;
  priceLevel?: string;
  // Optionally you can add location or other fields if available:
  location?: {
    latitude: number;
    longitude: number;
  };
  types?: string[];
}

export interface Feedback {
  id: number;
  businessId: number;
  rating: number;
  comment: string | null;
  reviewerName: string | null;
  createdAt: string;
}

// Add interface for Google Places reviews
export interface PlaceReview {
  author: string;
  rating: number;
  text: string;
  time: string;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
}