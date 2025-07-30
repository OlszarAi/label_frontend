// Auto-refresh expired thumbnails component
'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface SmartThumbnailProps {
  src: string;
  alt: string;
  labelId: string;
  width?: number;
  height?: number;
  className?: string;
}

export const SmartThumbnail: React.FC<SmartThumbnailProps> = ({
  src,
  alt,
  labelId,
  width = 200,
  height = 150,
  className = ''
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(false);

  // Refresh thumbnail URL when it fails to load
  const refreshThumbnail = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setError(false);
    
    try {
      const response = await fetch(`/api/projects/labels/${labelId}/refresh-thumbnail`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSrc(data.thumbnailUrl);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error('Failed to refresh thumbnail:', err);
      setError(true);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle image load error (e.g., expired signed URL)
  const handleImageError = () => {
    if (!isRefreshing && !error) {
      refreshThumbnail();
    } else {
      setError(true);
    }
  };

  // Update src when prop changes
  useEffect(() => {
    setCurrentSrc(src);
    setError(false);
  }, [src]);

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-gray-100 text-gray-500`}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
        <span className="ml-2">No preview</span>
      </div>
    );
  }

  return (
    <div className="relative">
      {isRefreshing && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 z-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
        </div>
      )}
      <Image
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleImageError}
        unoptimized // Important for Supabase signed URLs
      />
    </div>
  );
};
