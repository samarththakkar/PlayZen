import React from 'react';

const Button = React.forwardRef(({ children, className = '', variant = 'primary', ...props }, ref) => {
  const baseStyles = "px-4 py-2 rounded font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-bg disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-primary-600 text-white hover:bg-primary-500 shadow-md shadow-primary-900/20",
    secondary: "bg-surface1 text-textPrimary hover:bg-surface2 border border-border",
    ghost: "bg-transparent text-textSecondary hover:bg-surface1 hover:text-textPrimary",
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };

  return (
    <button 
      ref={ref}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
