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
      setError(null);
      
      const response = await fetch(IMPORT_SHEET_URL, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      let data;
      
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.log("Response text:", text);
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON response");
        }
      }
      
      // Handle both array and object responses
      const dataArray = Array.isArray(data) ? data : (data.data || []);
      
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        setCalls([]);
        setError(null);
        return;
      }
      
      // Transform the data to match our interface
      const transformedCalls = dataArray
        .filter((item: any) => item && (item.name || item.الاسم || item.phone || item.رقم_الهاتف))
        .map((item: any) => ({
          name: item.name || item.الاسم || item.customerName || "",
          phone: item.phone || item.رقم_الهاتف || item.الرقم || item.phoneNumber || "",
          timestamp: item.timestamp || item.وقت_التسجيل || item.date || new Date().toISOString(),
          status: "pending" as const,
        }));

      setCalls(transformedCalls);
      setError(null);
    } catch (err) {
      console.error("Error fetching calls:", err);
      setError("فشل تحميل البيانات من Google Sheet");
      setCalls([]);
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
