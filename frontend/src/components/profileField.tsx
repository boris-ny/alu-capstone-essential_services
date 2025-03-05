import React from 'react';

interface ProfileFieldProps {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  optional?: boolean;
  readOnly?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Then use it for your component
const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  icon,
  error,
  optional,
  readOnly,
  children,
  className = '', // Default to empty string
}) => {
  return (
    <div
      className={`form-field ${readOnly ? 'read-only' : 'editable'} ${className}`}>
      <div className="space-y-1">
        <div className="flex justify-between">
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
          {optional && <span className="text-xs text-gray-500">Optional</span>}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
          {children}
        </div>

        {error && (
          <div className="flex items-center text-sm text-red-500 mt-1">
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileField;
