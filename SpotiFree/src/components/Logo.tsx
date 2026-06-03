import React from 'react';

// Define the TypeScript interface for the component props
interface LogoProps {
  className?: string;
}

export default function Logo({ className = "w-8 h-8 text-[#1DB954]" }: LogoProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
      <path d="M12 12v.01" strokeWidth="4" />
      <path d="M9 12v.01" strokeWidth="3" />
      <path d="M15 12v.01" strokeWidth="3" />
    </svg>
  );
}