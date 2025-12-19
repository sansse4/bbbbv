import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbxWlVYJZ1FKg7Tf-xmEnkF6V-TXKsvUjc5tIi3M_SJsky2ExvJzcbqv961ucKiDtHm5Hw/exec";

export interface SheetAppointment {
  customerName: string;
  employeeName: string;
  customerPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: string;
  assignedSalesEmployee: string;
  notes: string;
}

export function useAppointmentsSheet() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SheetAppointment[]>([]);

  // Send appointment data to Google Sheet
  const sendToSheet = async (appointment: SheetAppointment) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        action: "add",
        "اسم العميل": appointment.customerName,
        "اسم الموظف": appointment.employeeName,
        "رقم الهاتف": appointment.customerPhone,
        "تاريخ الموعد": appointment.appointmentDate,
        "وقت الموعد": appointment.appointmentTime,
        "نوع الموعد": appointment.appointmentType || "",
        "موظف المبيعات المسؤول": appointment.assignedSalesEmployee || "",
        "ملاحظات": appointment.notes || ""
      });

      console.log("Sending to Google Sheet:", params.toString());
      
      const response = await fetch(`${SHEET_API_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Google Sheet response:", data);
      
      if (data.success) {
        toast({ title: "تم إرسال البيانات إلى جوجل شيت" });
        return true;
      } else {
        throw new Error(data.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error sending to sheet:", error);
      toast({ 
        title: "خطأ في إرسال البيانات", 
        description: "تعذر الإرسال إلى جوجل شيت",
        variant: "destructive" 
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Search appointments in Google Sheet
  const searchInSheet = async (searchTerm: string) => {
    setIsLoading(true);
    setSearchResults([]);
    try {
      const params = new URLSearchParams({
        action: "search",
        query: searchTerm
      });

      const response = await fetch(`${SHEET_API_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to search");
      }

      const data = await response.json();
      
      if (data.success && data.rows) {
        const appointments: SheetAppointment[] = data.rows.map((row: any) => ({
          customerName: row.customerName || row[0] || "",
          customerPhone: row.customerPhone || row[1] || "",
          appointmentDate: row.appointmentDate || row[2] || "",
          appointmentTime: row.appointmentTime || row[3] || "",
          appointmentType: row.appointmentType || row[4] || "",
          assignedEmployee: row.assignedEmployee || row[5] || "",
          status: row.status || row[6] || "",
          notes: row.notes || row[7] || "",
          createdBy: row.createdBy || row[8] || "",
          createdAt: row.createdAt || row[9] || ""
        }));
        setSearchResults(appointments);
        return appointments;
      }
      
      return [];
    } catch (error) {
      console.error("Error searching sheet:", error);
      toast({ 
        title: "خطأ في البحث", 
        description: "تعذر البحث في جوجل شيت",
        variant: "destructive" 
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all appointments from Google Sheet
  const fetchFromSheet = async () => {
    setIsLoading(true);
    setSearchResults([]);
    try {
      const params = new URLSearchParams({
        action: "getAll"
      });

      const response = await fetch(`${SHEET_API_URL}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await response.json();
      
      if (data.success && data.rows) {
        const appointments: SheetAppointment[] = data.rows.map((row: any) => ({
          customerName: row.customerName || row[0] || "",
          customerPhone: row.customerPhone || row[1] || "",
          appointmentDate: row.appointmentDate || row[2] || "",
          appointmentTime: row.appointmentTime || row[3] || "",
          appointmentType: row.appointmentType || row[4] || "",
          assignedEmployee: row.assignedEmployee || row[5] || "",
          status: row.status || row[6] || "",
          notes: row.notes || row[7] || "",
          createdBy: row.createdBy || row[8] || "",
          createdAt: row.createdAt || row[9] || ""
        }));
        setSearchResults(appointments);
        return appointments;
      }
      
      return [];
    } catch (error) {
      console.error("Error fetching from sheet:", error);
      toast({ 
        title: "خطأ في جلب البيانات", 
        description: "تعذر جلب البيانات من جوجل شيت",
        variant: "destructive" 
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearchResults = () => {
    setSearchResults([]);
  };

  return {
    isLoading,
    searchResults,
    sendToSheet,
    searchInSheet,
    fetchFromSheet,
    clearSearchResults
  };
}
