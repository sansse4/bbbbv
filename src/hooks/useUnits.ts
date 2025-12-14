import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type UnitStatus = "available" | "reserved" | "sold";

export interface Unit {
  id: string;
  unit_number: number;
  block_number: number;
  area_m2: number;
  price: number;
  status: UnitStatus;
  buyer_name: string | null;
  buyer_phone: string | null;
  sales_employee: string | null;
  accountant_name: string | null;
  notes: string | null;
  is_residential: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnitFilters {
  search?: string;
  status?: UnitStatus | "all";
  block?: number | "all";
}

export function useUnits(filters?: UnitFilters) {
  return useQuery({
    queryKey: ["units", filters],
    queryFn: async () => {
      let query = supabase
        .from("units")
        .select("*")
        .order("unit_number", { ascending: true });

      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.block && filters.block !== "all") {
        query = query.eq("block_number", filters.block);
      }

      if (filters?.search) {
        const searchTerm = filters.search.trim();
        // Search by unit number, block number, or buyer name
        query = query.or(
          `unit_number.eq.${parseInt(searchTerm) || 0},block_number.eq.${parseInt(searchTerm) || 0},buyer_name.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data as Unit[];
    },
  });
}

export function useUnitStats() {
  return useQuery({
    queryKey: ["units-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("units")
        .select("status, is_residential");

      if (error) {
        throw error;
      }

      const residential = data.filter((u) => u.is_residential);
      const total = residential.length;
      const available = residential.filter((u) => u.status === "available").length;
      const reserved = residential.filter((u) => u.status === "reserved").length;
      const sold = residential.filter((u) => u.status === "sold").length;

      return { total, available, reserved, sold };
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (unit: Partial<Unit> & { id: string }) => {
      const { id, ...updates } = unit;
      const { data, error } = await supabase
        .from("units")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["units-stats"] });
      toast.success("تم تحديث الوحدة بنجاح");
    },
    onError: (error: Error) => {
      toast.error("فشل في تحديث الوحدة: " + error.message);
    },
  });
}
