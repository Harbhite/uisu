import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Fallback src if the image fails to load */
  fallbackSrc?: string;
  /** Whether to use native lazy loading (default: true) */
  lazy?: boolean;
  /** Aspect ratio wrapper class (e.g. "aspect-square", "aspect-video") */
  aspectRatio?: string;
  /** Show a skeleton while loading */
  showSkeleton?: boolean;
}

export const OptimizedImage = ({
  src,
  alt = "",
  className,
  fallbackSrc = "/placeholder.svg",
  lazy = true,
  aspectRatio,
  showSkeleton = true,
  ...props
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state when src changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  const handleLoad = () => setLoaded(true);
  const handleError = () => {
    setError(true);
    setLoaded(true);
  };

  const imgSrc = error ? fallbackSrc : src;

  const image = (
    <img
      ref={imgRef}
      src={imgSrc}
      alt={alt}
      loading={lazy ? "lazy" : undefined}
      decoding="async"
      onLoad={handleLoad}
      onError={handleError}
      className={cn(
        "transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        className
      )}
      {...props}
    />
  );

  if (!showSkeleton) return image;

  return (
    <div className={cn("relative overflow-hidden bg-muted", aspectRatio)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" />
      )}
      {image}
    </div>
  );
};
