import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FinanceSummary {
  total_real_price: number;
  total_sale_price: number;
  total_down_payment: number;
  total_admin_commission: number;
  total_roaya_commission: number;
  net_income: number;
  cached_at?: string;
  cached?: boolean;
}

interface UseFinanceSummaryReturn {
  data: FinanceSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFinanceSummary(): UseFinanceSummaryReturn {
  const [data, setData] = useState<FinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (retryCount = 0) => {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching finance summary from edge function...");
      
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('finance-summary', {
        method: 'GET',
      });

      if (invokeError) {
        throw new Error(invokeError.message || "Failed to fetch finance summary");
      }

      if (responseData?.error) {
        throw new Error(responseData.error);
      }

      console.log("Finance summary received:", responseData);
      setData(responseData as FinanceSummary);
    } catch (err) {
      console.error("Error fetching finance summary:", err);
      
      // Retry logic
      if (retryCount < MAX_RETRIES) {
        console.log(`Retrying finance summary... attempt ${retryCount + 1} of ${MAX_RETRIES}`);
        setTimeout(() => fetchData(retryCount + 1), RETRY_DELAY * (retryCount + 1));
        return;
      }
      
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء جلب البيانات المالية");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: () => fetchData(0) };
}
