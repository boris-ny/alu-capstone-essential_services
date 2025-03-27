import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBusinessesByCategory,
  getBusinessById,
  searchBusinesses,
  updateBusiness,
} from '@/services/businessService';
import { searchBusinessesInKigali } from '@/services/placesService';
import { Business } from '@/lib/types';

export function useBusinessesByCategory(
  categoryId: number | null,
  categoryName: string | null = null,
  page = 1,
  limit = 9
) {
  return useQuery({
    queryKey: ['businesses', 'category', categoryId, categoryName, page, limit],
    queryFn: async () => {
      console.log(`Fetching businesses for category ID: ${categoryId}, name: ${categoryName}, page: ${page}, limit: ${limit}`);
      try {
        // Fetch local businesses by category with pagination
        const localResults = await getBusinessesByCategory(categoryId!, page, limit);
        console.log('Local businesses API response:', localResults);

        // Fetch external businesses from Places API using the provided category name
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let externalResults: string | any[] = [];
        if (categoryName) {
          // Use the provided category name directly instead of trying to extract it
          console.log('Using category name for external search:', categoryName);
          externalResults = await searchBusinessesInKigali(categoryName);
          console.log('External businesses fetched:', externalResults.length);
        }

        // Calculate total items and pages (local + external)
        const totalItems = localResults.meta.total + externalResults.length;
        const totalPages = Math.ceil(totalItems / limit);

        // Check if we have any results at all
        if (localResults.data.length === 0 && externalResults.length === 0) {
          console.warn(`No businesses found for category ID: ${categoryId}, name: ${categoryName}`);
        }

        // Merge and paginate results
        const combinedData = [...localResults.data, ...externalResults];

        // Create a paginated response
        return {
          data: combinedData.slice((page - 1) * limit, page * limit),
          meta: {
            total: totalItems,
            page,
            limit,
            totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching businesses by category:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
          console.error('Error stack:', error.stack);
        }
        throw error;
      }
    },
    enabled: !!categoryId, // Only run the query if categoryId is provided
    retry: 1, // Retry once if failed
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useBusinessSearch(params: {
  searchTerm?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 9;

  return useQuery({
    queryKey: ['businesses', 'search', params],
    queryFn: async () => {
      // Fetch local search results with pagination
      const localResults = await searchBusinesses(params);

      // Fetch external results if a searchTerm is provided
      // Since Places API doesn't support pagination, we'll fetch all and then manually paginate
      const externalResults = params.searchTerm
        ? await searchBusinessesInKigali(params.searchTerm)
        : [];

      // Calculate total items and pages (local + external)
      const totalItems = localResults.meta.total + externalResults.length;
      const totalPages = Math.ceil(totalItems / limit);

      // Merge and paginate results
      // For simplicity, we'll show all local results first, then external results
      const combinedData = [...localResults.data, ...externalResults];

      // Create a paginated response
      return {
        data: combinedData.slice((page - 1) * limit, page * limit),
        meta: {
          total: totalItems,
          page,
          limit,
          totalPages
        }
      };
    },
    enabled: !!(params.searchTerm || params.category), // Only run if at least one param is provided
  });
}

export function useBusiness(id: string | undefined) {
  return useQuery({
    queryKey: ['business', id],
    queryFn: () => getBusinessById(id!),
    enabled: !!id, // Only run if id is provided
  });
}

export function useUpdateBusiness() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Business }) => updateBusiness(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['business', data.id] });
    },
  });
}