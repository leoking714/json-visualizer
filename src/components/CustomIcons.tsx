import React from 'react';

export const JLogo: React.FC<{ size?: number; color?: string; className?: string }> = ({ 
  size = 24, 
  color = 'currentColor',
  className = '' 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Background Circle with Gradient */}
    <defs>
      <linearGradient id="jGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6366f1" />
        <stop offset="100%" stopColor="#a855f7" />
      </linearGradient>
    </defs>
    
    <rect width="100" height="100" rx="24" fill="url(#jGradient)" fillOpacity="0.1" />
    
    {/* Stylized J that looks like a tree branch or code bracket */}
    <path 
      d="M65 25V65C65 76.0457 56.0457 85 45 85C33.9543 85 25 76.0457 25 65" 
      stroke={color === 'currentColor' ? 'url(#jGradient)' : color} 
      strokeWidth="12" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Dot to represent a leaf node or data point */}
    <circle cx="65" cy="25" r="8" fill={color === 'currentColor' ? '#6366f1' : color} />
    
    {/* Data connections lines representing the tree aspect */}
    <path 
      d="M65 45H75M65 55H80" 
      stroke={color === 'currentColor' ? '#a855f7' : color} 
      strokeWidth="6" 
      strokeLinecap="round"
    />
  </svg>
);

export const JIcon: React.FC<{ size?: number; color?: string; className?: string }> = ({ 
  size = 18, 
  color = 'currentColor',
  className = ''
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 3v13a4 4 0 0 1-4 4H10" />
    <circle cx="18" cy="3" r="1.5" fill={color} />
    <path d="M18 9h3M18 13h4" opacity="0.6" />
  </svg>
);
