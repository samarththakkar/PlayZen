
import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  error,
  className = '',
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-300 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={`
          w-full px-4 py-2.5 bg-[#121212] border border-[#3f3f3f] rounded-lg 
          text-white placeholder-gray-500
          focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff]
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-200
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
