import { useState, useEffect } from "react";

export interface ImportedCall {
  name: string;
  phone: string;
  timestamp: string;
  status: "pending" | "contacted" | "no-answer" | "wrong-number";
}

const IMPORT_SHEET_URL = "https://script.google.com/macros/s/AKfycby_ZUUZum7NGy53xtsOBuwcSgggyZKC64r1TdOhFpAn9gmXAxU8QT764w0Vf4saEqfk/exec";

export const useImportedCalls = () => {
  const [calls, setCalls] = useState<ImportedCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(IMPORT_SHEET_URL);
      
      if (!response.ok) {
        throw new Error("Failed to fetch calls");
      }

      const data = await response.json();
      
      // Transform the data to match our interface
      const transformedCalls = data.map((item: any) => ({
        name: item.name || item.الاسم || "",
        phone: item.phone || item.رقم_الهاتف || item.الرقم || "",
        timestamp: item.timestamp || item.وقت_التسجيل || new Date().toISOString(),
        status: "pending" as const,
      }));

      setCalls(transformedCalls);
      setError(null);
    } catch (err) {
      console.error("Error fetching calls:", err);
      setError("فشل تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  const updateCallStatus = (phone: string, status: ImportedCall["status"]) => {
    setCalls(prev => 
      prev.map(call => 
        call.phone === phone ? { ...call, status } : call
      )
    );
  };

  return {
    calls,
    isLoading,
    error,
    refetch: fetchCalls,
    updateCallStatus,
  };
};
