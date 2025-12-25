import { useState, useEffect, useCallback } from "react";

const SALES_SHEET_URL = "https://script.google.com/macros/s/AKfycbwSMozG5H01u1uVrX4wgXWyr6CHocUuqkAofnowdqBaZSVDJkoj2rOe1g58l4gQ6TPw/exec";

export interface SoldUnitInfo {
  unitNumber: string;
  buyerName: string;
  buyerPhone?: string;
  salesPerson: string;
  saleDate: string;
  accountantName?: string;
  area?: number;
  salePrice?: number;
  category?: string;
}

// Helper to parse number from string or number
const parseNumber = (value: number | string | undefined): number => {
  if (value === undefined || value === "" || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value).replace(/,/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

export function useSoldUnitsFromSheet() {
  const [soldUnits, setSoldUnits] = useState<Map<string, SoldUnitInfo>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSoldUnits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(SALES_SHEET_URL);
      
      if (!response.ok) {
        throw new Error("فشل في جلب بيانات المبيعات");
      }

      const data = await response.json();
      const rows = data.rows || data.data || [];

      // Create a map of unit numbers to sold unit info
      const soldUnitsMap = new Map<string, SoldUnitInfo>();

      rows.forEach((row: Record<string, unknown>) => {
        const unitNumber = String(row["رقم الوحدة"] || "").trim();
        
        if (unitNumber) {
          soldUnitsMap.set(unitNumber, {
            unitNumber,
            buyerName: String(row["اسم المشتري"] || ""),
            salesPerson: String(row["موظف المبيعات"] || ""),
            saleDate: String(row["تاريخ الاستلام"] || ""),
            accountantName: String(row["اسم المحاسب"] || ""),
            area: parseNumber(row["لمساحة"] as string | number), // Fixed: "لمساحة" not "المساحة"
            salePrice: parseNumber(row["سعر البيع"] as string | number),
            category: String(row["الفىة"] || ""), // Fixed: "الفىة" not "الفئة"
          });
        }
      });

      console.log("Google Sheet sold units count:", soldUnitsMap.size);
      console.log("Unit numbers from sheet:", Array.from(soldUnitsMap.keys()));
      setSoldUnits(soldUnitsMap);
    } catch (err) {
      console.error("Error fetching sold units:", err);
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء جلب البيانات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSoldUnits();
  }, [fetchSoldUnits]);

  // Function to check if a unit is sold based on Google Sheet
  const isUnitSold = useCallback((unitNumber: number | string): boolean => {
    return soldUnits.has(String(unitNumber));
  }, [soldUnits]);

  // Function to get sold unit info
  const getSoldUnitInfo = useCallback((unitNumber: number | string): SoldUnitInfo | undefined => {
    return soldUnits.get(String(unitNumber));
  }, [soldUnits]);

  return {
    soldUnits,
    soldUnitsCount: soldUnits.size,
    isLoading,
    error,
    refetch: fetchSoldUnits,
    isUnitSold,
    getSoldUnitInfo,
  };
}
