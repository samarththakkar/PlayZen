import React from 'react';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
