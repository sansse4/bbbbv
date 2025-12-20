import { useState, useEffect, useCallback } from "react";

const SALES_SHEET_URL = "https://script.google.com/macros/s/AKfycbwSMozG5H01u1uVrX4wgXWyr6CHocUuqkAofnowdqBaZSVDJkoj2rOe1g58l4gQ6TPw/exec";

// Raw row from Google Sheet with Arabic keys
interface RawSalesRow {
  "اسم المشتري"?: string;
  "عمولة شركة رؤية"?: number | string;
  "العمولة الادارية"?: number | string;
  "موظف المبيعات"?: string;
  "رقم الوحدة"?: number | string;
  "سعر الحقيقي"?: number | string;
  "المساحة"?: number | string;
  "سعر البيع"?: number | string;
  "قيمة المقدمة"?: number | string;
  "طريقة الدفع"?: string;
  "اسم المحاسب"?: string;
  "الفئة"?: string;
  "تاريخ الاستلام"?: string;
}

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

// Helper to parse number from string or number
const parseNumber = (value: number | string | undefined): number => {
  if (value === undefined || value === "" || value === null) return 0;
  if (typeof value === "number") return value;
  const parsed = parseFloat(value.replace(/,/g, ""));
  return isNaN(parsed) ? 0 : parsed;
};

// Map Arabic keys to English interface
const mapRowToInterface = (row: RawSalesRow, index: number): SalesRow => ({
  serial: index + 1,
  buyerName: row["اسم المشتري"] || "",
  roayaCommission: row["عمولة شركة رؤية"] || 0,
  adminCommission: row["العمولة الادارية"] || 0,
  salesPerson: row["موظف المبيعات"] || "",
  unitNo: row["رقم الوحدة"] || "",
  realPrice: row["سعر الحقيقي"] || 0,
  area: parseNumber(row["المساحة"]),
  salePrice: parseNumber(row["سعر البيع"]),
  downPayment: row["قيمة المقدمة"] || 0,
  paymentType: row["طريقة الدفع"] || "",
  accountantName: row["اسم المحاسب"] || "",
  category: row["الفئة"] || "",
  deliveryDate: row["تاريخ الاستلام"] || "",
});

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
      
      if (result.success !== false) {
        // Map raw rows to our interface
        const rawRows: RawSalesRow[] = result.rows || result.data || [];
        const mappedRows = rawRows.map(mapRowToInterface);
        
        // Calculate totals from rows if not provided
        const totals: SalesTotals = result.totals || {
          realPrice: mappedRows.reduce((sum, r) => sum + parseNumber(r.realPrice), 0),
          salePrice: mappedRows.reduce((sum, r) => sum + parseNumber(r.salePrice), 0),
          downPayment: mappedRows.reduce((sum, r) => sum + parseNumber(r.downPayment), 0),
          adminCommission: mappedRows.reduce((sum, r) => sum + parseNumber(r.adminCommission), 0),
          roayaCommission: mappedRows.reduce((sum, r) => sum + parseNumber(r.roayaCommission), 0),
        };
        
        // Count unique buyer names (excluding empty names)
        const uniqueBuyerNames = new Set(
          mappedRows
            .map(r => r.buyerName?.toString().trim())
            .filter(name => name && name.length > 0)
        );
        
        setData({
          success: true,
          totals,
          customersCount: uniqueBuyerNames.size,
          rows: mappedRows,
        });
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
