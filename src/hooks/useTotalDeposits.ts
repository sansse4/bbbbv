import { useState, useEffect, useCallback } from "react";

const DEPOSITS_SHEET_URL = "https://script.google.com/macros/s/AKfycbzSdXyejlXu8t-SroB5D-lwMhPFaeWPCerhMZizPDcIBbJc1JUed5Yc-CG9GLzhXcg/exec";

interface DepositsData {
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTotalDeposits(): DepositsData {
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(DEPOSITS_SHEET_URL);
      
      if (!response.ok) {
        throw new Error("فشل في جلب بيانات المقدمات");
      }
      
      const data = await response.json();
      
      // Handle different response formats
      if (typeof data === "number") {
        setTotal(data);
      } else if (data.total !== undefined) {
        setTotal(Number(data.total) || 0);
      } else if (data.sum !== undefined) {
        setTotal(Number(data.sum) || 0);
      } else if (Array.isArray(data) && data.length > 0) {
        // If it's an array, try to sum up the values
        const sum = data.reduce((acc, item) => {
          const value = item.amount || item.paid || item.deposit || item.value || 0;
          return acc + (Number(value) || 0);
        }, 0);
        setTotal(sum);
      } else {
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching deposits:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  return { total, isLoading, error, refetch: fetchDeposits };
}
