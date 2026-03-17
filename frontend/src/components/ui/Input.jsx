import React from 'react';

const Input = React.forwardRef(({ className = '', ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`w-full px-4 py-2 bg-surface1 border border-border text-textPrimary rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-textMuted transition-colors ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export default Input;
