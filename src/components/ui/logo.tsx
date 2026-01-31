'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Image from 'next/image';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = '', width = 120, height = 120 }: LogoProps) {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR to avoid hydration mismatch
    return (
      <div 
        className={className} 
        style={{ width: `${width}px`, height: `${height}px` }}
      />
    );
  }

  // Determine current theme (handle system theme)
  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  // Choose logo based on theme
  const logoSrc = currentTheme === 'dark' 
    ? '/images/logo-dark.svg'
    : '/images/logo-light.svg';

  return (
    <Image
      src={logoSrc}
      alt="AIzYantra - Intelligence Engineered"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
}