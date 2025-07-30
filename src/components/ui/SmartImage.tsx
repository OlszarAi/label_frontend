// Smart Image component that automatically handles Supabase URLs
'use client';
import React from 'react';
import Image from 'next/image';

interface SmartImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  onClick?: () => void;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  fill = false,
  priority = false,
  onClick
}) => {
  // Check if this is a Supabase storage URL
  const isSupabaseUrl = src.includes('supabase.co') && src.includes('/storage/v1/');
  
  // For Supabase signed URLs, disable optimization to avoid Vercel issues
  const shouldUnoptimize = isSupabaseUrl || src.includes('token=');

  return (
    <Image
      src={src}
      alt={alt}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      fill={fill}
      className={className}
      priority={priority}
      unoptimized={shouldUnoptimize} // Disable optimization for Supabase URLs
      onClick={onClick}
    />
  );
};
