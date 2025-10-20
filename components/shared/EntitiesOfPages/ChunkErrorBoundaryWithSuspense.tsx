"use client";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Suspense, ReactNode } from "react";

// Error Boundary Component for chunk loading errors
const ChunkErrorBoundary = ({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleChunkError = () => {
      setHasError(true);
    };

    window.addEventListener("unhandledrejection", handleChunkError);
    return () =>
      window.removeEventListener("unhandledrejection", handleChunkError);
  }, []);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Something went Wrong!</h3>
        <p className="text-muted-foreground mb-4">Failed to load Page!</p>
        <Button
          variant="outline"
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

interface ChunkErrorBoundaryWithSuspenseProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const ChunkErrorBoundaryWithSuspense = ({
  children,
  fallback = null,
}: ChunkErrorBoundaryWithSuspenseProps) => (
  <ChunkErrorBoundary>
    <Suspense fallback={fallback}>{children}</Suspense>
  </ChunkErrorBoundary>
);
