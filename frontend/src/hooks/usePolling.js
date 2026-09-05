import { useState, useEffect, useCallback, useRef } from 'react';

export function usePolling(apiFunction, interval = 5000) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isPollingRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await apiFunction();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    isPollingRef.current = true;
    
    // Defer the initial state update until after the effect completes.
    const initialFetch = setTimeout(fetchData, 0);

    // Polling loop
    const pollInterval = setInterval(() => {
      if (isPollingRef.current) {
        fetchData();
      }
    }, interval);

    return () => {
      isPollingRef.current = false;
      clearTimeout(initialFetch);
      clearInterval(pollInterval);
    };
  }, [fetchData, interval]);

  return { data, error, isLoading, refetch: fetchData };
}

