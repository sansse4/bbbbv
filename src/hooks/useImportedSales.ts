import { useState, useEffect } from "react";

export interface ImportedSale {
  id: string;
  name: string;
  address: string;
  phone: string;
  profession: string;
  familyMembers: string;
  houseCategory: string;
  houseNumber: string;
  source: string;
  timestamp: string;
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
        .filter((item: any) => item && (item.name || item.الاسم || item.phone || item.الهاتف))
        .map((item: any, index: number) => ({
          id: String(index + 1),
          name: item.name || item.الاسم || "",
          address: item.address || item.العنوان || "",
          phone: item.phone || item.الهاتف || item.رقم_الهاتف || "",
          profession: item.المهنة || item.profession || "",
          familyMembers: item["عدد افراد الاسرة"] || item.عدد_افراد_الاسرة || item.familyMembers || "",
          houseCategory: item["فئة الدار"] || item.فئة_الدار || item.houseCategory || "",
          houseNumber: item["رقم الدار"] || item.رقم_الدار || item.houseNumber || "",
          source: item.source || item.المصدر || "",
          timestamp: item.Timestamp || item.timestamp || item.التاريخ || "",
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
