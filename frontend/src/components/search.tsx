import { Search, Loader2, X, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useCategories } from '@/hooks/useCategories';
import { useBusinessSearch } from '@/hooks/useBusinesses';
import { Business } from '@/lib/types';

interface SearchProps {
  onSearchResults: (
    results: Business[],
    meta?: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }
  ) => void;
  className?: string;
  initialSearchTerm?: string;
  initialCategory?: string;
  initialPage?: number;
  initialLimit?: number;
}

const SearchServices: React.FC<SearchProps> = ({
  onSearchResults,
  className,
  initialSearchTerm = '',
  initialCategory = '',
  initialPage = 1,
  initialLimit = 9,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [category, setCategory] = useState(initialCategory);
  const [searchParams, setSearchParams] = useState<{
    searchTerm?: string;
    category?: string;
    page?: number;
    limit?: number;
  }>(
    // Only set initial params if they have values
    {
      ...(initialSearchTerm ? { searchTerm: initialSearchTerm } : {}),
      ...(initialCategory ? { category: initialCategory } : {}),
      page: initialPage,
      limit: initialLimit,
    }
  );

  // Track if this is the initial load
  const isInitialMount = useRef(true);
  // Track if we've sent results to the parent
  const resultsSent = useRef(false);

  const {
    data: results,
    isLoading,
    error,
    isError,
    isFetched,
  } = useBusinessSearch(searchParams);

  const {
    data: categoriesData = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = useCategories();

  useEffect(() => {
    // Send search results to parent component when results are available
    if (results) {
      // Avoid duplicate sends of the same results
      const resultsFingerprint = JSON.stringify(results.data.map((b) => b.id));

      // Only send results if:
      // 1. We have results AND
      // 2. Either this isn't the initial mount OR we have initial search params
      // 3. And we haven't sent these exact results before
      if (!isInitialMount.current || initialSearchTerm || initialCategory) {
        console.log('Sending search results to parent');
        onSearchResults(results.data, results.meta);
        resultsSent.current = true;
      }
    }

    // After first render, mark initial mount as completed
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [results, onSearchResults, initialSearchTerm, initialCategory]);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset the resultsSent flag when starting a new search
    resultsSent.current = false;

    // Build the search parameters
    const params: {
      searchTerm?: string;
      category?: string;
      page: number;
      limit: number;
    } = {
      page: 1, // Reset to page 1 on new search
      limit: searchParams.limit || initialLimit,
    };

    if (searchTerm) params.searchTerm = searchTerm;
    if (category) params.category = category;

    // Only update search params if they've actually changed
    if (JSON.stringify(params) !== JSON.stringify(searchParams)) {
      setSearchParams(params);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('w-full transition-all duration-200', className)}>
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Search for services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={cn(
              'w-full pl-11 pr-10 py-3 bg-white rounded-xl border border-gray-300',
              'text-gray-900 placeholder-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'transition-colors duration-200'
            )}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="relative min-w-[180px] md:w-1/4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={categoriesLoading}
            className={cn(
              'w-full px-4 py-3 appearance-none bg-white rounded-xl',
              'border border-gray-300 text-gray-900',
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              'transition-colors duration-200',
              categoriesLoading && 'text-gray-400',
              categoriesError && 'border-red-300'
            )}>
            <option value="">All Categories</option>
            {categoriesData.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {categoriesLoading ? (
              <Loader2 size={16} className="animate-spin text-gray-400" />
            ) : (
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Search Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'flex items-center justify-center gap-2 px-6 py-3',
            'bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl',
            'transition-all duration-200 transform hover:scale-[1.02]',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
            isLoading && 'opacity-80 cursor-wait'
          )}>
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Search size={20} />
          )}
          <span className="whitespace-nowrap">
            {isLoading ? 'Searching...' : 'Search'}
          </span>
        </button>
      </div>

      {isError && (
        <div className="flex items-center gap-2 text-red-600 mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle size={16} />
          <div>
            <p className="font-medium">Search error</p>
            <p className="text-sm text-red-500">
              {error instanceof Error
                ? error.message
                : 'An error occurred while searching. Please try again.'}
            </p>
            {import.meta.env.DEV && error instanceof Error && error.stack && (
              <details className="mt-1">
                <summary className="text-xs cursor-pointer hover:underline">
                  Technical details
                </summary>
                <pre className="text-xs mt-1 p-2 bg-red-100 rounded overflow-auto max-h-[150px]">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default SearchServices;
