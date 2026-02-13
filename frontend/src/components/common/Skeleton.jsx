
import React from 'react';

export default function Skeleton({ 
  width, 
  height, 
  variant = 'text', // text, circular, rectangular
  className = '' 
}) {
  const baseClasses = 'bg-[#272727] animate-pulse';
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`} 
      style={style}
    />
  );
}
