import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`bg-surface1 border border-border rounded-xl shadow-sm overflow-hidden text-textPrimary hover:bg-surface2 transition-colors duration-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
