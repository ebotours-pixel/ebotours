import React from 'react';

export function Logo() {
  return (
    <svg 
      width="36" 
      height="36" 
      viewBox="0 0 24 24" 
      strokeWidth="1.5"
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className="text-primary"
    >
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.1716 8.5 10.5 9.17157 10.5 10C10.5 10.8284 11.1716 11.5 12 11.5Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M15.5 15.5L12 11.5L8.5 15.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
