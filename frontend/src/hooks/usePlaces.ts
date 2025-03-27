import { useQuery } from '@tanstack/react-query';
import { getPlaceDetails } from '@/services/placesService';



export function usePlaceDetails(placeId: string | undefined) {
  return useQuery({
    queryKey: ['places', 'details', placeId],
    queryFn: () => getPlaceDetails(placeId!),
    enabled: !!placeId, // Only run if placeId is provided
  });
}