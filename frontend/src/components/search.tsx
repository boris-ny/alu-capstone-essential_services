import { Search, Loader2, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Business } from '@/Home';
import { cn } from '@/lib/utils';
import api from '@/services/api';

interface SearchProps {
  onSearchResults: (results: Business[]) => void;
  className?: string;
}

interface Category {
  id: number;
  name: string;
}

const SearchServices: React.FC<SearchProps> = ({
  onSearchResults,
  className,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(false);

  useEffect(() => {
    setCategoriesLoading(true);
    setCategoriesError(false);

    api
      .get('/categories')
      .then((response) => {
        setCategories(response.data);
        setCategoriesError(false);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        setCategoriesError(true);
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  const clearSearch = () => {
    setSearchTerm('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const params: Record<string, string> = {};
      if (searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }
      if (category) {
        params.category = category;
      }

      const response = await api.get('/businesses/search', { params });

      onSearchResults(response.data);
    } catch (error) {
      console.error('Error during search:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Search failed';
        // Replace alert with toast notification in a real implementation
        alert(errorMessage);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
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
            {categories.map((cat) => (
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
    </form>
  );
};

export default SearchServices;
