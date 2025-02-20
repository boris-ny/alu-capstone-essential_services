import { Search } from 'lucide-react';
import React, { useState } from 'react';
import axios from 'axios';

interface SearchProps {
  onSearchResults: (results: any[]) => void; // Changed prop name
}

const SearchServices: React.FC<SearchProps> = ({ onSearchResults }) => {
  // Changed prop name
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.get(
        'http://localhost:3000/businesses/search',
        {
          params: {
            searchTerm: searchTerm,
            category: category,
          },
        }
      );

      onSearchResults(response.data); // Pass the results back up
    } catch (error) {
      console.error('Error during search:', error);
      alert('Search failed');
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
        <option value="Healthcare">Healthcare</option>
        <option value="Education">Education</option>
        {/* Add more categories as needed */}
      </select>
      <button
        type="submit"
        className="bg-primary text-white rounded-2xl gap-3 py-3 px-6 flex items-center ml-4">
        <Search size={24} />
        <span className="text-xl">Discover</span>
      </button>
    </form>
  );
};

export default SearchServices;
