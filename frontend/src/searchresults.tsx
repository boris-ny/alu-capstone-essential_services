/* eslint-disable @typescript-eslint/no-explicit-any */
import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/header';
import SearchServices from '@/components/search';
import { useState, useEffect } from 'react';
import {
  MapPin,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Business } from './lib/types';
import { InfoBusinessCard } from './components/infoBusinessCard';
import { searchBusinesses } from './services/businessService';
import { searchBusinessesInKigali } from './services/placesService';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract initial search parameters
  const initialSearchTerm = location.state?.searchTerm || '';
  const initialCategory = location.state?.category || '';
  const initialPage = location.state?.meta?.page || 1;
  const initialLimit = location.state?.meta?.limit || 9;

  // UI state management
  const [businesses, setBusinesses] = useState<Business[]>(
    location.state?.results || []
  );
  const [filteredResults, setFilteredResults] = useState<Business[]>([]);
  const [sortOption, setSortOption] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialLimit);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<Error | null>(null);
  const [searchMeta, setSearchMeta] = useState(
    location.state?.meta || {
      total: 0,
      page: 1,
      limit: initialLimit,
      totalPages: 1,
    }
  );

  // Track unique categories across all results
  const uniqueCategories = Array.from(
    new Set(
      businesses
        ?.filter((business) => business.category?.name)
        .map((business) => business.category?.name) || []
    )
  );

  // Apply filtering and sorting to results
  useEffect(() => {
    if (!businesses.length) return;

    let filtered = [...businesses];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(
        (business) => business.category?.name === categoryFilter
      );
    }

    // Apply sorting
    if (sortOption === 'name') {
      filtered.sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else if (sortOption === 'category') {
      filtered.sort((a, b) =>
        (a.category?.name || '').localeCompare(b.category?.name || '')
      );
    } else if (sortOption === 'recent') {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredResults(filtered);
  }, [businesses, categoryFilter, sortOption]);

  // Function to perform search using regular fetch instead of React Query
  const performSearch = async (
    searchTerm: string,
    category: string,
    page: number,
    limit: number
  ) => {
    setIsLoading(true);
    setSearchError(null);

    try {
      // Prepare search params object
      const params: {
        searchTerm?: string;
        category?: string;
        page: number;
        limit: number;
      } = { page, limit };

      if (searchTerm) params.searchTerm = searchTerm;
      if (category) params.category = category;

      // Fetch results from both APIs
      const [localResults, externalResults] = await Promise.all([
        // Get results from our backend API
        searchBusinesses(params),
        // Get results from Google Places API (only if we have a search term)
        searchTerm ? searchBusinessesInKigali(searchTerm) : Promise.resolve([]),
      ]);

      // Calculate pagination metadata
      const totalItems = localResults.meta.total + externalResults.length;
      const totalPages = Math.ceil(totalItems / limit);

      // Create metadata object
      const meta = {
        total: totalItems,
        page,
        limit,
        totalPages,
      };

      // Combine results from both APIs
      const combinedData = [...localResults.data, ...externalResults];

      // Create a paginated view of the data
      const paginatedData = combinedData.slice(
        (page - 1) * limit,
        page * limit
      );

      // Update state with search results
      setBusinesses(paginatedData);
      setSearchMeta(meta);

      // Return the results in case the caller needs them
      return {
        data: paginatedData,
        meta,
      };
    } catch (error) {
      console.error('Search error:', error);
      setSearchError(
        error instanceof Error ? error : new Error('Unknown search error')
      );

      // Return empty results in case of error
      return {
        data: [],
        meta: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle page changes
  const handlePageChange = async (newPage: number) => {
    if (newPage < 1 || newPage > searchMeta.totalPages) return;

    setCurrentPage(newPage);

    // Smooth scrolling to top of results
    window.scrollTo({
      top: document.getElementById('results-section')?.offsetTop || 0,
      behavior: 'smooth',
    });

    // Perform search for the new page
    await performSearch(
      initialSearchTerm,
      initialCategory,
      newPage,
      itemsPerPage
    );
  };

  // Handle new search from search component
  function handleNewSearch(
    newResults: Business[],
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    },
    searchTerm?: string,
    category?: string
  ) {
    // Prevent unnecessary updates if results are the same
    if (JSON.stringify(businesses) === JSON.stringify(newResults)) {
      return;
    }

    // Reset filters and pagination
    setCategoryFilter('all');
    setSortOption('name');
    setCurrentPage(1);
    setIsLoading(true);

    // Clear existing businesses first
    setBusinesses([]);

    // Update with new results
    setTimeout(() => {
      // Set new search results
      setBusinesses(newResults);

      // Update metadata if available
      if (meta) {
        setSearchMeta(meta);
      }

      // Update URL state for persistence - use replace to avoid navigation history issues
      navigate('/search-results', {
        state: {
          results: newResults,
          searchTerm: searchTerm || '',
          category: category || '',
          meta,
        },
        replace: true,
      });

      setIsLoading(false);
    }, 0);
  }

  // Calculate if we have any results to show
  const hasResults = filteredResults.length > 0;

  // Calculate if we have any errors to show
  const hasError = !!searchError;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />

      {/* Search Bar Section */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <SearchServices
            onSearchResults={handleNewSearch}
            initialSearchTerm={initialSearchTerm}
            initialCategory={initialCategory}
            initialPage={currentPage}
            initialLimit={itemsPerPage}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* Results Section */}
      <div
        id="results-section"
        className="container mx-auto max-w-6xl px-4 py-8">
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Search Results
                <span className="text-lg md:text-xl font-medium text-gray-500 ml-2">
                  ({searchMeta?.total || businesses.length})
                </span>
              </h1>
              {categoryFilter !== 'all' && (
                <div className="mt-1 text-sm text-indigo-600">
                  Filtered by category:{' '}
                  <span className="font-medium">{categoryFilter}</span>
                </div>
              )}
            </div>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg">
              <SlidersHorizontal size={16} />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>

            {/* Filters - Visible on Desktop or when toggled on mobile */}
            <div
              className={cn(
                'flex flex-col sm:flex-row gap-3 w-full md:w-auto',
                !showFilters && 'hidden md:flex'
              )}>
              <div className="relative flex items-center">
                <Filter className="absolute left-3 h-4 w-4 text-indigo-500" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="pl-9 pr-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto">
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto">
                <option value="name">Sort by Name</option>
                <option value="category">Sort by Category</option>
                <option value="recent">Sort by Most Recent</option>
              </select>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  const newLimit = Number(e.target.value);
                  setItemsPerPage(newLimit);
                  setSearchMeta((prev: any) => ({
                    ...prev,
                    limit: newLimit,
                    page: 1, // Reset to first page when changing items per page
                  }));

                  // Re-run search with new limit
                  performSearch(
                    initialSearchTerm,
                    initialCategory,
                    1,
                    newLimit
                  );
                }}
                className="px-3 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto">
                <option value="9">9 per page</option>
                <option value="12">12 per page</option>
                <option value="18">18 per page</option>
                <option value="24">24 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: itemsPerPage }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded m-5 w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded mx-5 mb-2 w-1/2"></div>
                  <div className="h-20 bg-gray-200 mx-5 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mx-5 mb-2 w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded mx-5 mb-5 w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : hasResults ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResults.map((business) => (
                <InfoBusinessCard
                  key={business.placeId || business.id}
                  business={business}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {searchMeta && searchMeta.totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={cn(
                      'p-2 rounded-md border border-gray-300',
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}>
                    <ChevronLeft size={18} />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {[...Array(searchMeta.totalPages)].map((_, index) => {
                      const pageNumber = index + 1;

                      // Show ellipsis for large page ranges
                      if (searchMeta.totalPages > 7) {
                        // Always show first page, current page, and last page
                        // For others, show ellipsis if they're far from current
                        if (
                          pageNumber === 1 ||
                          pageNumber === searchMeta.totalPages ||
                          (pageNumber >= currentPage - 1 &&
                            pageNumber <= currentPage + 1)
                        ) {
                          return (
                            <button
                              key={pageNumber}
                              onClick={() => handlePageChange(pageNumber)}
                              className={cn(
                                'w-10 h-10 rounded-md border',
                                pageNumber === currentPage
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                              )}>
                              {pageNumber}
                            </button>
                          );
                        } else if (
                          (pageNumber === currentPage - 2 && currentPage > 3) ||
                          (pageNumber === currentPage + 2 &&
                            currentPage < searchMeta.totalPages - 2)
                        ) {
                          return (
                            <span
                              key={pageNumber}
                              className="text-gray-500 self-center">
                              ...
                            </span>
                          );
                        } else {
                          return null;
                        }
                      } else {
                        // If total pages <= 7, show all page numbers
                        return (
                          <button
                            key={pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                            className={cn(
                              'w-10 h-10 rounded-md border',
                              pageNumber === currentPage
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            )}>
                            {pageNumber}
                          </button>
                        );
                      }
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === searchMeta.totalPages}
                    className={cn(
                      'p-2 rounded-md border border-gray-300',
                      currentPage === searchMeta.totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}

        {/* Error display */}
        {hasError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">
                  There was an error with your search
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    {searchError instanceof Error
                      ? searchError.message
                      : 'An unknown error occurred'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = () => (
  <div className="bg-white rounded-2xl shadow-md p-10 text-center">
    <div className="mb-6 flex justify-center">
      <div className="p-5 bg-indigo-50 rounded-full">
        <MapPin className="h-12 w-12 text-indigo-400" />
      </div>
    </div>
    <h3 className="text-2xl font-medium text-gray-800 mb-3">
      No results found
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      Try adjusting your search terms or filters to find what you're looking
      for.
    </p>
    <button
      onClick={() => (window.location.href = '/')}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
      Return to Home
    </button>
  </div>
);

export default SearchResults;
