
import React from 'react';

const variants = {
  primary: 'bg-[#3ea6ff] hover:bg-[#65b8ff] text-black border-transparent',
  secondary: 'bg-[#272727] hover:bg-[#3f3f3f] text-white border-transparent',
  outline: 'bg-transparent border-[#3ea6ff] text-[#3ea6ff] hover:bg-[#263850]',
  ghost: 'bg-transparent hover:bg-[#272727] text-white border-transparent',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  icon: 'p-2',
};

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  ...props 
}) {
  return (
    <button
      type={type}
      className={`
        inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 border
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      ) : null}
      {children}
    </button>
  );
}
