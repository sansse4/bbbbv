import { useState, useEffect, useCallback } from "react";

const DEPOSITS_SHEET_URL = "https://script.google.com/macros/s/AKfycbxbB7cwLB1e4hjA_PoOl4wYdAf-grjGueA7kRGL2L2akYneeB1UzglbyGABYkR5L9OVuw/exec";

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
      console.log("Fetching deposits from:", DEPOSITS_SHEET_URL);
      
      const response = await fetch(DEPOSITS_SHEET_URL);
      
      if (!response.ok) {
        throw new Error("فشل في جلب بيانات المقدمات");
      }
      
      const data = await response.json();
      console.log("Deposits API response:", data);
      
      // Extract downPayment from totals object
      if (data.success === true && data.totals?.downPayment !== undefined) {
        setTotal(Number(data.totals.downPayment) || 0);
      } else if (data.totals?.downPayment !== undefined) {
        setTotal(Number(data.totals.downPayment) || 0);
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
