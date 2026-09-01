import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const heightClasses = {
    sm: 'h-7',
    md: 'h-10',
    lg: 'h-14',
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/merabetta_logo.svg" 
        alt="Merabetta Logo" 
        className={`${heightClasses[size]} w-auto object-contain`} 
      />
    </div>
  );
}
