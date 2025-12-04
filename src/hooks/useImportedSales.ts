import { useState, useEffect } from "react";

export interface ImportedSale {
  id: string;
  property: string;
  client: string;
  amount: string;
  status: string;
  date: string;
}

const SALES_SHEET_URL = "https://script.google.com/macros/s/AKfycbyGWprXHrPtiTVJhlP0iqVSAqfbqTwJr2vh7TIEs0Nv67_05Ig-0BYtSWihSwUPWE7z/exec";

export const useImportedSales = () => {
  const [sales, setSales] = useState<ImportedSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${SALES_SHEET_URL}?action=read`, {
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
        console.log("Sales response text:", text);
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON response");
        }
      }
      
      // Handle both array and object responses
      const dataArray = Array.isArray(data) ? data : (data.rows || data.data || []);
      
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        setSales([]);
        setError(null);
        return;
      }
      
      // Transform the data to match our interface
      const transformedSales = dataArray
        .filter((item: any) => item && (item.property || item.العقار || item.client || item.العميل))
        .map((item: any, index: number) => ({
          id: item.id || String(index + 1),
          property: item.property || item.العقار || item.اسم_العقار || "",
          client: item.client || item.العميل || item.اسم_العميل || item.customer_name || "",
          amount: item.amount || item.المبلغ || item.السعر || "",
          status: item.status || item.الحالة || "pending",
          date: item.date || item.التاريخ || new Date().toISOString().split('T')[0],
        }));

      setSales(transformedSales);
      setError(null);
    } catch (err) {
      console.error("Error fetching sales:", err);
      setError("فشل تحميل البيانات من Google Sheet");
      setSales([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  return {
    sales,
    isLoading,
    error,
    refetch: fetchSales,
  };
};
