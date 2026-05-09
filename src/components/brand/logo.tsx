"use client"

import React from 'react';
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
}

export function BharatmaanLogo({ className, size = 24 }: LogoProps) {
  return (
    <div 
      className={cn("relative flex items-center justify-center overflow-hidden rounded-full", className)}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background Circle */}
        <circle cx="50" cy="50" r="48" fill="white" fillOpacity="0.1" />
        
        {/* Stylized 'B' with Tech Elements */}
        <path
          d="M35 25V75H55C65 75 72 68 72 60C72 53 68 48 60 46C66 44 70 39 70 33C70 27 64 22 55 22H35V25Z"
          fill="currentColor"
          className="text-primary"
        />
        
        {/* Bharat Colors Accents */}
        <path d="M35 25H55C60 25 64 28 64 32C64 36 60 39 55 39H35V25Z" fill="#FF9933" />
        <path d="M35 46H55C60 46 64 49 64 53C64 57 60 60 55 60H35V46Z" fill="#138808" />
        <rect x="35" y="39" width="20" height="7" fill="white" />
        
        {/* Tech dots */}
        <circle cx="75" cy="40" r="3" fill="#FF9933" />
        <circle cx="80" cy="50" r="3" fill="white" />
        <circle cx="75" cy="60" r="3" fill="#138808" />
        <line x1="65" y1="46" x2="72" y2="40" stroke="white" strokeWidth="1" />
        <line x1="65" y1="50" x2="77" y2="50" stroke="white" strokeWidth="1" />
        <line x1="65" y1="54" x2="72" y2="60" stroke="white" strokeWidth="1" />
      </svg>
    </div>
  );
}
