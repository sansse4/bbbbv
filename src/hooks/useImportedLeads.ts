import { useState, useEffect } from "react";

export interface ImportedLead {
  id: string;
  name: string;
  phone: string;
  category: string;
  house: string;
}

const LEADS_SHEET_URL = "https://script.google.com/macros/s/AKfycbwEOffxzz-GzLOX_AyCjRsvGsgmE6zD-kIhWhrEWGVextncIfZnGBxHiVHjTnLc6k6Q/exec";

export const useImportedLeads = () => {
  const [leads, setLeads] = useState<ImportedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeads = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try fetching with action=getAll first
      const response = await fetch(`${LEADS_SHEET_URL}?action=getAll`, {
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
        console.log("Leads response:", text);
        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON response");
        }
      }
      
      // Check if response indicates an error
      if (data && data.success === false) {
        console.log("API returned error:", data.message);
        setLeads([]);
        setError(null);
        return;
      }
      
      // Handle both array and object responses
      const dataArray = Array.isArray(data) ? data : (data.rows || data.data || data.values || []);
      
      if (!Array.isArray(dataArray) || dataArray.length === 0) {
        setLeads([]);
        setError(null);
        return;
      }
      
      // Transform the data to match our interface
      const transformedLeads = dataArray
        .filter((item: any) => item && (item.name || item.Name || item.الاسم || item.phone || item.Number || item.رقم))
        .map((item: any, index: number) => ({
          id: String(index + 1),
          name: item.name || item.Name || item.الاسم || "",
          phone: item.phone || item.Number || item.number || item.الهاتف || item.رقم || "",
          category: item.category || item.Category || item.الفئة || item.فئة || "",
          house: item.house || item.House || item.الدار || item.دار || "",
        }));

      setLeads(transformedLeads);
      setError(null);
    } catch (err) {
      console.error("Error fetching leads:", err);
      setError("فشل تحميل البيانات من Google Sheet");
      setLeads([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return {
    leads,
    isLoading,
    error,
    refetch: fetchLeads,
  };
};
