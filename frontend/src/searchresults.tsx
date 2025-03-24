import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '@/components/header';
import SearchServices from '@/components/search';
import { useState, useEffect } from 'react';
import {
  Phone,
  Globe,
  MapPin,
  Filter,
  Clock,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Business } from './lib/types';

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

    setFilteredResults(sorted);
  }, [searchResults, sortOption, categoryFilter]);

  const handleNewSearch = (newResults: Business[]) => {
    setIsLoading(true);
    setTimeout(() => {
      setSearchResults(newResults);
      navigate('/search-results', {
        state: { results: newResults },
        replace: true,
      });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      <Header />

      {/* Search Bar Section with Gradient Background */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 py-6 px-4">
        <div className="container mx-auto max-w-6xl">
          <SearchServices
            onSearchResults={handleNewSearch}
            className="bg-white/20 backdrop-blur-sm p-4 rounded-xl shadow-lg"
          />
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Results Header */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Search Results
                <span className="text-lg md:text-xl font-medium text-gray-500 ml-2">
                  ({filteredResults.length})
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
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResults.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

// Business Card Component
const BusinessCard = ({ business }: { business: Business }) => {
  // Format date to be more readable
  const formattedDate = new Date(business.createdAt).toLocaleDateString(
    'en-US',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
  );

  return (
    <Link
      to={`/business/${business.id}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col h-full border border-transparent hover:border-indigo-100">
      {/* Card Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-800 group-hover:text-indigo-700 line-clamp-2">
            {business.businessName}
          </h3>
          {business.category?.name && (
            <span className="px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full whitespace-nowrap ml-2">
              {business.category.name}
            </span>
          )}
        </div>

        <p className="text-gray-600 line-clamp-3 mb-3">
          {business.description || 'No description available'}
        </p>
      </div>

      {/* Card Footer */}
      <div className="mt-auto border-t border-gray-100 bg-gray-50 p-4 space-y-2">
        {business.contactNumber && (
          <div className="flex items-center text-gray-600">
            <Phone className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">{business.contactNumber}</span>
          </div>
        )}

        {(business.openingHours || business.closingHours) && (
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm">
              {business.openingHours || 'N/A'} -{' '}
              {business.closingHours || 'N/A'}
            </span>
          </div>
        )}

        {business.website && (
          <div className="flex items-center text-gray-600 overflow-hidden">
            <Globe className="h-4 w-4 min-w-[16px] mr-2 text-gray-400" />
            <span className="text-sm truncate">
              {business.website.replace(/^https?:\/\//, '')}
            </span>
          </div>
        )}

        {business.createdAt && (
          <div className="flex items-center text-gray-500 text-xs pt-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Added {formattedDate}</span>
          </div>
        )}
      </div>

      {/* View Details Indicator */}
      <div className="text-right p-2 bg-indigo-50 text-indigo-600 text-sm font-medium flex items-center justify-end">
        <span>View details</span>
        <ChevronRight size={16} className="ml-1" />
      </div>
    </Link>
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
