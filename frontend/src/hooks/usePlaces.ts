import { useQuery } from '@tanstack/react-query';
import { getPlaceSuggestions, getPlaceDetails } from '@/services/placesService';

export function usePlaceSuggestions(input: string) {
  return useQuery({
    queryKey: ['places', 'suggestions', input],
    queryFn: () => getPlaceSuggestions(input),
    enabled: !!input, // Only run if input is provided
  });
}

export function usePlaceDetails(placeId: string | undefined) {
  return useQuery({
    queryKey: ['places', 'details', placeId],
    queryFn: () => getPlaceDetails(placeId!),
    enabled: !!placeId, // Only run if placeId is provided
  });
}