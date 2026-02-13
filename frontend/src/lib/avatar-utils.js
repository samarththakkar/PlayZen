import React from 'react';

// Avatar utility functions for generating default avatars and cover images

export const getAvatarColors = () => [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E'
];

export const getCoverColors = () => [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
];

export const generateDefaultAvatar = (name, size = 32) => {
  const colors = getAvatarColors();
  const firstLetter = name.charAt(0).toUpperCase();
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];
  
  return {
    letter: firstLetter,
    backgroundColor,
    size
  };
};

export const generateDefaultCover = (name) => {
  const gradients = getCoverColors();
  const gradientIndex = name.charCodeAt(0) % gradients.length;
  return gradients[gradientIndex];
};

export const DefaultAvatar = ({ name, size = 32, className = '' }) => {
  const avatar = generateDefaultAvatar(name, size);
  
  return (
    <div 
      className={`rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: avatar.backgroundColor,
        fontSize: size * 0.4
      }}
    >
      {avatar.letter}
    </div>
  );
};