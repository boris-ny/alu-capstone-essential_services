import { useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/header';
import SearchServices from '@/components/search';
import { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Business } from './lib/types';
import { InfoBusinessCard } from './components/infoBusinessCard';

const SearchResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<Business[]>(
    location.state?.results || []
  );
  const [filteredResults, setFilteredResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortOption, setSortOption] = useState('name');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const isPerformingSearch = useRef(false);

  // Extract search parameters from location state or search query
  const initialSearchTerm = location.state?.searchTerm || '';
  const initialCategory = location.state?.category || '';

  const uniqueCategories = Array.from(
    new Set(
      searchResults
        .filter((business) => business.category?.name)
        .map((business) => business.category?.name)
    )
  );

  useEffect(() => {
    let sorted = [...searchResults];

    // Apply category filter
    if (categoryFilter !== 'all') {
      sorted = sorted.filter(
        (business) => business.category?.name === categoryFilter
      );
    }

    // Apply sorting
    if (sortOption === 'name') {
      sorted.sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else if (sortOption === 'category') {
      sorted.sort((a, b) =>
        (a.category?.name || '').localeCompare(b.category?.name || '')
      );
    } else if (sortOption === 'recent') {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Update pagination metadata
    setTotalItems(sorted.length);
    setTotalPages(Math.ceil(sorted.length / itemsPerPage));

    // Paginate the results
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setFilteredResults(sorted.slice(startIndex, endIndex));
  }, [searchResults, sortOption, categoryFilter, currentPage, itemsPerPage]);

  const handleNewSearch = (
    newResults: Business[],
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  ) => {
    // Set loading state immediately when search is initiated
    setIsLoading(true);

    // Reset the isPerformingSearch at the beginning
    isPerformingSearch.current = true;

    try {
      // Update state with new results immediately
      setSearchResults(newResults);

      // Reset to first page when performing a new search
      setCurrentPage(1);

      // Set pagination metadata if available
      if (meta) {
        setTotalPages(meta.totalPages);
        setTotalItems(meta.total);
        setItemsPerPage(meta.limit);
      }

      // Only update navigation state if we actually have results
      // and they're different from what we already have
      if (newResults.length > 0) {
        navigate('/search-results', {
          state: {
            results: newResults,
            searchTerm: initialSearchTerm,
            category: initialCategory,
            meta,
          },
          replace: true, // Replace current history entry instead of adding a new one
        });
      }
    } finally {
      // Always update loading state regardless of success/failure
      setIsLoading(false);
      isPerformingSearch.current = false;
    }
  };

  const handlePageChange = (newPage: number) => {
    // Ensure page is within bounds
    if (newPage < 1 || newPage > totalPages) return;

    // Update the current page
    setCurrentPage(newPage);

    // Scroll to top of results
    window.scrollTo({
      top: document.getElementById('results-section')?.offsetTop || 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <SearchServices
            onSearchResults={(results, meta) => handleNewSearch(results, meta)}
            initialSearchTerm={initialSearchTerm}
            initialCategory={initialCategory}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div
        id="results-section"
        className="container mx-auto max-w-6xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Search Results
                <span className="text-lg md:text-xl font-medium text-gray-500 ml-2">
                  ({totalItems})
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
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1); // Reset to first page when changing items per page
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
        ) : filteredResults.length > 0 ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredResults.map((business) => (
                <InfoBusinessCard key={business.id} business={business} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
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
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNumber = index + 1;

                      // Show ellipsis for large page ranges
                      if (totalPages > 7) {
                        // Always show first page, current page, and last page
                        // For others, show ellipsis if they're far from current
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
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
                            currentPage < totalPages - 2)
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
                    disabled={currentPage === totalPages}
                    className={cn(
                      'p-2 rounded-md border border-gray-300',
                      currentPage === totalPages
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
