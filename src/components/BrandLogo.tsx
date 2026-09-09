import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

export default function BrandLogo({ className = '', size = 'md', variant = 'full' }: BrandLogoProps) {
  const heightClasses = {
    xs: 'h-5',
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
  };

  const src = variant === 'icon' ? '/merabetta_icon.svg' : '/merabetta_logo.svg';

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={src} 
        alt="Merabetta Logo" 
        className={`${heightClasses[size]} w-auto object-contain`} 
      />
    </div>
  );
}
