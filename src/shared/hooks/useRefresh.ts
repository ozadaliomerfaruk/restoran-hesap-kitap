import { useState, useCallback } from "react";

export function useRefresh(
  refreshFn: () => Promise<void> | void,
  minDelay: number = 500
) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const startTime = Date.now();

    try {
      await refreshFn();
    } catch (error) {
      console.error("Refresh error:", error);
    }

    const elapsed = Date.now() - startTime;
    if (elapsed < minDelay) {
      await new Promise((resolve) => setTimeout(resolve, minDelay - elapsed));
    }

    setRefreshing(false);
  }, [refreshFn, minDelay]);

  return { refreshing, onRefresh };
}
