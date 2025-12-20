import { useState, useEffect, useCallback } from "react";

// استخدام نفس رابط جوجل شيت المبيعات
const SALES_SHEET_URL = "https://script.google.com/macros/s/AKfycbwSMozG5H01u1uVrX4wgXWyr6CHocUuqkAofnowdqBaZSVDJkoj2rOe1g58l4gQ6TPw/exec";

interface DepositsData {
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Helper to parse number from string or number
const parseNumber = (value: number | string | undefined): number => {
  if (value === undefined || value === "" || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

export function useTotalDeposits(): DepositsData {
  const [total, setTotal] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeposits = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Fetching deposits from:", SALES_SHEET_URL);
      
      const response = await fetch(SALES_SHEET_URL);
      
      if (!response.ok) {
        throw new Error("فشل في جلب بيانات المقدمات");
      }
      
      const data = await response.json();
      console.log("Sales API response for deposits:", data);
      
      // استخراج مجموع المقدمات من عمود "قيمة المقدمة"
      const rows = data.rows || data.data || [];
      const totalDeposits = rows.reduce((sum: number, row: Record<string, unknown>) => {
        const depositValue = row["قيمة المقدمة"];
        return sum + parseNumber(depositValue as string | number | undefined);
      }, 0);
      
      setTotal(totalDeposits);
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
