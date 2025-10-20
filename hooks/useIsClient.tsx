import { useEffect, useState, useSyncExternalStore } from "react";

// Option 1: Suppress hydration warnings
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

// Option 2: Modern React 18+ version with useSyncExternalStore
const clientStore = {
  getSnapshot: () => typeof window !== "undefined",
  getServerSnapshot: () => false,
  subscribe: () => () => {}, // No-op since this never changes after initial render
};

export const useIsClientModern = (): boolean => {
  return useSyncExternalStore(
    clientStore.subscribe,
    clientStore.getSnapshot,
    clientStore.getServerSnapshot
  );
};

// Option 3: No-hydration-mismatch version (prevents issues entirely)
export const useIsClientSafe = () => {
  const [isClient, setIsClient] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    setIsClient(true);
  }, []);

  // Return false until after first render to match server
  return hasMounted && isClient;
};

// Option 4: For components that need immediate client detection
export const useIsHydrated = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return isHydrated;
};

export default useIsClient;
