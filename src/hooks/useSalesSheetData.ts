import { useState, useEffect, useCallback } from "react";

const SALES_SHEET_URL = "https://script.google.com/macros/s/AKfycbwSMozG5H01u1uVrX4wgXWyr6CHocUuqkAofnowdqBaZSVDJkoj2rOe1g58l4gQ6TPw/exec";

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

export interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  salesPerson?: string;
}

export const useSalesSheetData = (filters?: SalesFilters) => {
  const [data, setData] = useState<SalesSheetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build URL with filter parameters
      const url = new URL(SALES_SHEET_URL);
      if (filters?.dateFrom) {
        url.searchParams.append('dateFrom', filters.dateFrom);
      }
      if (filters?.dateTo) {
        url.searchParams.append('dateTo', filters.dateTo);
      }
      if (filters?.salesPerson) {
        url.searchParams.append('salesPerson', filters.salesPerson);
      }
      
      const response = await fetch(url.toString(), {
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
  }, [filters?.dateFrom, filters?.dateTo, filters?.salesPerson]);

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
