import React from 'react';

/**
 * A beautiful, professional logo based on the letter 'J'
 * designed specifically for a JSON Visualization tool.
 * 
 * Design elements:
 * - Stylized 'J' curve representing a tree branch.
 * - Integrated curly brace { character subtlely hidden in the curve.
 * - Circular nodes representing data points.
 * - Vibrant gradient for a modern feel.
 */
export const JSONVisualizerLogo: React.FC<{ size?: number; showText?: boolean }> = ({ 
  size = 40, 
  showText = true 
}) => (
  <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Main J Shape - Stylized as a combination of a brace and a branch */}
      <path 
        d="M70 20V65C70 78.8071 58.8071 90 45 90C31.1929 90 20 78.8071 20 65" 
        stroke="url(#logoGradient)" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        filter="url(#glow)"
      />
      
      {/* Top horizontal bar of J (styled like a bracket) */}
      <path 
        d="M45 20H70" 
        stroke="#6366f1" 
        strokeWidth="12" 
        strokeLinecap="round" 
      />

      {/* Connection Nodes (Circles) */}
      <circle cx="70" cy="20" r="8" fill="#6366f1" />
      <circle cx="45" cy="20" r="6" fill="#a855f7" />
      
      {/* Floating data bits to signify JSON nodes */}
      <circle cx="85" cy="45" r="5" fill="#ec4899" />
      <circle cx="85" cy="65" r="4" fill="#3b82f6" />
      
      {/* Decorative lines connecting the J to floating nodes */}
      <path d="M70 45H80" stroke="#ec4899" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      <path d="M70 65H81" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" opacity="0.6" />
    </svg>

    {showText && (
      <div className="logo-text">
        <span className="text-j">J</span>
        <span className="text-son">SON</span>
        <span className="text-tree">Tree</span>
      </div>
    )}

    <style>{`
      .logo-text {
        font-family: 'Inter', system-ui, sans-serif;
        font-weight: 800;
        font-size: 1.25rem;
        letter-spacing: -0.02em;
        display: flex;
        align-items: center;
      }
      .text-j { color: #6366f1; }
      .text-son { color: #1e293b; }
      .text-tree { 
        color: #a855f7; 
        margin-left: 2px;
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `}</style>
  </div>
);
