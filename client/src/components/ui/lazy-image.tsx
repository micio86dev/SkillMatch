import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
  onLoad?: () => void;
  onError?: () => void;
}

export function LazyImage({
  src,
  alt,
  className,
  fallback = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAxNkMyMS4xMDQ2IDE2IDIyIDEzLjEwNDYgMjIgMTJDMjIgMTAuODk1NCAyMS4xMDQ2IDEwIDIwIDEwQzE4Ljg5NTQgMTAgMTggMTAuODk1NCAxOCAxMkMxOCAxMy4xMDQ2IDE4Ljg5NTQgMTYgMjAgMTZaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0zMiAyOEwzMCAyNkwyNCAyMEwyMCAyNEwxNiAyMEwxMCAyNkw4IDI4VjMwSDMyVjI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K",
  width,
  height,
  style,
  onLoad,
  onError,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div
      ref={imgRef}
      className={cn("overflow-hidden", className)}
      style={{ width, height, ...style }}
    >
      {isInView && (
        <>
          {!isLoaded && !hasError && (
            <div
              className="animate-pulse bg-slate-200 dark:bg-slate-700 w-full h-full flex items-center justify-center"
              style={{ width, height }}
            >
              <div className="w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 border-t-slate-600 dark:border-t-slate-300 animate-spin" />
            </div>
          )}
          <img
            src={hasError ? fallback : src}
            alt={alt}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              hasError ? "filter grayscale" : "",
              className
            )}
            style={{ width, height, ...style }}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
      {!isInView && (
        <div
          className="bg-slate-100 dark:bg-slate-800 w-full h-full flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="text-slate-400 text-xs">Loading...</div>
        </div>
      )}
    </div>
  );
}