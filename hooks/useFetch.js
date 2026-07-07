// hooks/useFetch.js
import { useState, useEffect, useCallback } from "react";

export function useFetch(url, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!url) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                },
                ...options,
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Something went wrong');
            }

            setData(result.data || result);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [url]); // ✅ Only url

    useEffect(() => {
        fetchData();
    }, [url]); // ✅ ✅ Only url as dependency, NOT fetchData

    const refetch = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return { data, loading, error, refetch };
}

export default useFetch;