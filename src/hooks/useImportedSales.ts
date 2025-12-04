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

const SALES_SHEET_URL = "https://script.google.com/macros/s/AKfycbw7Hyc7b4OC2P3y8EjCqK8z_DHcJb22NidQq-VNXB_oyXgoIVJwIR55GTslitHodd84/exec";

export const useImportedSales = () => {
  const [sales, setSales] = useState<ImportedSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`${SALES_SHEET_URL}?action=getAll`, {
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
      
      // Transform the data to match our interface - exact column names from sheet
      const transformedSales = dataArray
        .filter((item: any) => item && (item["الاسم"] || item.name || item["رقم الهاتف"] || item.phone))
        .map((item: any, index: number) => ({
          id: String(index + 1),
          name: item["الاسم"] || item.name || "",
          address: item["العنوان"] || item.address || "",
          phone: item["رقم الهاتف"] || item.phone || "",
          profession: item["المهنة"] || item.profession || "",
          familyMembers: item["عدد افراد الاسرة"] || item.familyMembers || "",
          houseCategory: item["فئة الدار"] || item.houseCategory || "",
          houseNumber: item["رقم الدار"] || item.houseNumber || "",
          source: item["المصدر"] || item.source || "",
          timestamp: item["التاريخ"] || item.Timestamp || item.timestamp || "",
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
