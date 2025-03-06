import { Link } from 'react-router-dom';
import { Business } from '@/Home';
import { Phone, Globe, Clock, ChevronRight } from 'lucide-react';

export const BusinessCard = ({ business }: { business: Business }) => {
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
