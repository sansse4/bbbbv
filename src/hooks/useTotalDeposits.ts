import { useState, useEffect, useCallback } from "react";

const DEPOSITS_SHEET_BASE_URL = "https://script.google.com/macros/s/AKfycbx3Abe7hL1qeSDOhwgDKGKftUaF-2BjlO36T02vq13gGCIKQ42xSXzqmhdg_Nr5uiin/exec";
const FIELD_NAME = "قيمة_المقدمة";

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
      const url = `${DEPOSITS_SHEET_BASE_URL}?field=${encodeURIComponent(FIELD_NAME)}`;
      console.log("Fetching deposits from:", url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("فشل في جلب بيانات المقدمات");
      }
      
      const data = await response.json();
      console.log("Deposits API response:", data);
      
      // Handle the API response format
      if (data.success === true && data.total !== undefined) {
        setTotal(Number(data.total) || 0);
      } else if (data.success === true && data.sum !== undefined) {
        setTotal(Number(data.sum) || 0);
      } else if (typeof data === "number") {
        setTotal(data);
      } else if (data.total !== undefined) {
        setTotal(Number(data.total) || 0);
      } else if (data.sum !== undefined) {
        setTotal(Number(data.sum) || 0);
      } else if (data.success === false) {
        console.error("API Error:", data.message);
        setError(data.message || "خطأ في جلب البيانات");
        setTotal(0);
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
