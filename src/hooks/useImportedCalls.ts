import { useState, useEffect } from "react";

export interface ImportedCall {
  name: string;
  phone: string;
  customerStatus?: string;
  notes?: string;
  timestamp: string;
  status: "pending" | "contacted" | "no-answer" | "wrong-number";
}

const IMPORT_SHEET_URL = "https://script.google.com/macros/s/AKfycbymyr7BV5Hmq_cX-t0_83aN_f1r9dYk2F5yjt7R_upz4GYTwuStRVA695JLdhdAlg59/exec";

export const useImportedCalls = () => {
  const [calls, setCalls] = useState<ImportedCall[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalls = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${IMPORT_SHEET_URL}?action=get`, {
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
      
      // Handle both array and single object responses
      let dataArray: any[] = [];
      
      if (Array.isArray(data)) {
        dataArray = data;
      } else if (data.rows) {
        dataArray = data.rows;
      } else if (data.row) {
        // New API returns single row object
        dataArray = [data.row];
      } else if (data.data) {
        dataArray = data.data;
      }
      
      if (dataArray.length === 0) {
        setCalls([]);
        setError(null);
        return;
      }
      
      // Transform the data to match our interface
      const transformedCalls = dataArray
        .filter((item: any) => item && (item.name || item.الاسم || item.phone || item.رقم_الهاتف))
        .map((item: any) => ({
          name: item.name || item.الاسم || item.customerName || "",
          phone: item.phone || item.رقم_الهاتف || item["رقم الهاتف"] || item.الرقم || item.phoneNumber || "",
          customerStatus: item.customerStatus || item.حالة_الزبون || item["حالة الزبون"] || "",
          notes: item.notes || item.ملاحظات || item.ملاحضات || "",
          timestamp: item.timestamp || item.Timestamp || item.وقت_التسجيل || item.date || new Date().toISOString(),
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
    setCalls(prev => {
      const updated = prev.map(call => 
        call.phone === phone ? { ...call, status } : call
      );
      console.log("Updated calls:", updated.length, "Status changed to:", status);
      return updated;
    });
  };

  return {
    calls,
    isLoading,
    error,
    refetch: fetchCalls,
    updateCallStatus,
  };
};
