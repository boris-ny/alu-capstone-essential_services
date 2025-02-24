import { Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Business } from '@/Home';

interface SearchProps {
  onSearchResults: (results: Business[]) => void;
}

interface Category {
  id: number;
  name: string;
}

const SearchServices: React.FC<SearchProps> = ({ onSearchResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch categories from backend
    axios
      .get('http://localhost:3000/categories')
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error('Error fetching categories:', error);
        alert('Failed to load categories');
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Only include non-empty parameters
      const params: Record<string, string> = {};
      if (searchTerm.trim()) {
        params.searchTerm = searchTerm.trim();
      }
      if (category) {
        params.category = category;
      }

      const response = await axios.get(
        'http://localhost:3000/businesses/search',
        { params }
      );

      onSearchResults(response.data);
    } catch (error) {
      console.error('Error during search:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || 'Search failed';
        alert(errorMessage);
      } else {
        alert('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center w-full">
      <input
        type="text"
        placeholder="Search for services"
        className="w-full border bg-white border-gray-300 rounded-2xl px-6 py-3 text-xl focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <select
        className="ml-4 border bg-white border-gray-300 rounded-2xl px-4 py-3 text-xl focus:outline-none"
        value={category}
        onChange={(e) => setCategory(e.target.value)}>
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={String(cat.id)}>
            {cat.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={isLoading}
        className={`bg-primary text-white rounded-2xl gap-3 py-3 px-6 flex items-center ml-4 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
        <Search size={24} />
        <span className="text-xl">
          {isLoading ? 'Searching...' : 'Discover'}
        </span>
      </button>
    </form>
  );
};

export default SearchServices;
