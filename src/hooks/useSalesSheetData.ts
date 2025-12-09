import { useState, useEffect, useCallback } from "react";

const SALES_SHEET_URL = "https://script.google.com/macros/s/AKfycbxbB7cwLB1e4hjA_PoOl4wYdAf-grjGueA7kRGL2L2akYneeB1UzglbyGABYkR5L9OVuw/exec";

export interface SalesRow {
  serial: number | string;
  salesPerson: string;
  buyerName: string;
  accountantName: string;
  unitNo: number | string;
  area: number;
  category: string;
  realPrice: number | string;
  salePrice: number;
  downPayment: number | string;
  adminCommission: number | string;
  roayaCommission: number | string;
  paymentType: string;
  deliveryDate: string;
  purchaseType: string;
}

export interface SalesTotals {
  realPrice: number;
  salePrice: number;
  downPayment: number;
  adminCommission: number;
  roayaCommission: number;
}

export interface SalesSheetData {
  success: boolean;
  totals: SalesTotals;
  customersCount: number;
  rows: SalesRow[];
}

export const useSalesSheetData = () => {
  const [data, setData] = useState<SalesSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(SALES_SHEET_URL, {
        method: 'GET',
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setData(result);
      } else {
        throw new Error("Failed to fetch sales data");
      }
    } catch (err) {
      console.error("Error fetching sales sheet data:", err);
      setError("فشل تحميل بيانات المبيعات");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totals: data?.totals || null,
    customersCount: data?.customersCount || 0,
    rows: data?.rows || [],
    isLoading,
    error,
    refetch: fetchData,
  };
};
