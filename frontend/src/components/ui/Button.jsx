import React from 'react';

const Button = ({ children, className = '', ...props }) => {
  return (
    <button 
      className={`px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
