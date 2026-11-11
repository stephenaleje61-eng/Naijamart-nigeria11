import React, { useState, useEffect, useRef } from 'react';
import { getCategoryFallback, isValidImageSource, normalizeImageSource } from '../utils/imageUtils';

export interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError' | 'onLoad'> {
  src?: string | null;
  alt?: string;
  fallbackSrc?: string;
  fallbackCategory?: string;
  containerClassName?: string;
  priority?: boolean;
  aspectRatio?: string;
  showSkeleton?: boolean;
  rounded?: string;
  fetchPriority?: 'high' | 'low' | 'auto';
  onLoad?: (e?: React.SyntheticEvent<HTMLImageElement>) => void;
  onError?: (e?: React.SyntheticEvent<HTMLImageElement>) => void;
}

/**
 * SafeImage Component
 * - 100% eliminates broken image icons and empty blank spaces
 * - Displays a sleek, theme-matched skeleton placeholder while loading
 * - Smoothly transitions the image into view once fully decoded
 * - Automatically falls back to high-resolution offline category SVGs if network fails
 * - Validates URLs and handles edge cases like stale blobs and null/undefined values
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt = '',
  className = '',
  containerClassName = '',
  fallbackSrc,
  fallbackCategory,
  priority = false,
  loading,
  decoding = 'async',
  fetchPriority,
  aspectRatio,
  showSkeleton = true,
  rounded = '',
  onClick,
  onLoad,
  onError,
  ...rest
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(() => {
    return normalizeImageSource(src, fallbackCategory);
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [attemptedFallbackSrc, setAttemptedFallbackSrc] = useState<boolean>(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Sync when prop `src` changes
  useEffect(() => {
    const valid = isValidImageSource(src);
    if (!valid) {
      setCurrentSrc(getCategoryFallback(fallbackCategory));
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const cleanSrc = (src as string).trim();
    setCurrentSrc(cleanSrc);
    setHasError(false);
    setAttemptedFallbackSrc(false);
    setIsLoading(true);

    // Check if image is already cached in memory
    const tempImg = new Image();
    tempImg.src = cleanSrc;
    if (tempImg.complete && tempImg.naturalWidth > 0) {
      setIsLoading(false);
    }
  }, [src, fallbackCategory]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) {
      onLoad(e);
    }
  };

  const handleImageError = (e?: React.SyntheticEvent<HTMLImageElement>) => {
    // 1. Try custom fallbackSrc if provided and not yet attempted
    if (fallbackSrc && !attemptedFallbackSrc && fallbackSrc !== currentSrc) {
      setAttemptedFallbackSrc(true);
      setCurrentSrc(fallbackSrc);
      return;
    }

    // 2. Fall back to high-fidelity SVG placeholder for this category
    const categoryFallback = getCategoryFallback(fallbackCategory);
    if (currentSrc !== categoryFallback) {
      setCurrentSrc(categoryFallback);
      setHasError(true);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setHasError(true);
    }

    if (onError) {
      onError(e);
    }
  };

  const finalLoading = loading || (priority ? 'eager' : 'lazy');
  const finalFetchPriority = fetchPriority || (priority ? 'high' : 'auto');

  // Extract dimension, rounding, and flex classes from className to ensure wrapper div matches
  const sizeClasses = className
    ? className
        .split(/\s+/)
        .filter((c) =>
          /^(w-|h-|aspect-|rounded-|shrink-|flex-shrink-|max-|min-)/.test(c)
        )
        .join(' ')
    : '';

  const finalContainerClass = containerClassName
    ? containerClassName
    : sizeClasses
    ? sizeClasses
    : 'w-full h-full';

  return (
    <div
      className={`relative overflow-hidden ${aspectRatio || ''} ${rounded} ${finalContainerClass}`}
      onClick={onClick}
    >
      {/* 1. Neutral Skeleton Loader (Displays ONLY while image is loading over network) */}
      {isLoading && showSkeleton && (
        <div
          className={`absolute inset-0 z-1 bg-[#151515] animate-pulse flex items-center justify-center ${rounded}`}
          aria-hidden="true"
        >
          <div className="w-full h-full bg-gradient-to-r from-[#151515] via-[#242424] to-[#151515] bg-[length:200%_100%] animate-[shimmer_1.8s_infinite]" />
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <svg
              className="w-8 h-8 text-emerald-500 animate-pulse"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        </div>
      )}

      {/* 2. Actual Image Element */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        loading={finalLoading}
        decoding={decoding}
        // @ts-ignore
        fetchPriority={finalFetchPriority}
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        {...rest}
      />
    </div>
  );
};
