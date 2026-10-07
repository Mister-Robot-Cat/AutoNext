import React, { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ImageWithFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = '',
  fallbackSrc,
  fallbackText = 'Image not available',
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}>
      {(!isLoaded && !hasError) && (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <div className="w-1/2 h-1/2 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
        </div>
      )}
      
      {hasError && !fallbackSrc ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-medium px-2 text-center">{fallbackText}</span>
        </div>
      ) : (
        <img
          src={imgSrc}
          alt={alt}
          onError={handleError}
          onLoad={handleLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${hasError && fallbackSrc ? 'opacity-50' : ''}`}
          {...props}
        />
      )}
    </div>
  );
};
