import { useState, useMemo, useCallback } from "react";
import { useUnits, useUnitStats, UnitFilters, Unit } from "@/hooks/useUnits";
import { useSoldUnitsFromSheet } from "@/hooks/useSoldUnitsFromSheet";
import { MapHeader } from "@/components/map/MapHeader";
import { MapView } from "@/components/map/MapView";
import { GridView } from "@/components/map/GridView";
import { UnitDetailDrawer } from "@/components/map/UnitDetailDrawer";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function Map() {
  const [view, setView] = useState<"map" | "grid">("grid");
  const [filters, setFilters] = useState<UnitFilters>({
    search: "",
    status: "all",
    block: "all",
  });
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Debounce search input for performance
  const debouncedSearch = useDebouncedValue(filters.search, 300);

  // Fetch ALL units without status filter - we'll filter after merging with Google Sheet
  const dbFilters = useMemo(
    () => ({
      search: debouncedSearch,
      block: filters.block,
      // Don't filter by status at DB level - we need to merge with Google Sheet first
      status: "all" as const,
    }),
    [filters.block, debouncedSearch]
  );

  const { data: units, isLoading: unitsLoading, refetch: refetchUnits } = useUnits(dbFilters);
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useUnitStats();
  const { soldUnits, isLoading: sheetLoading, refetch: refetchSheet, getSoldUnitInfo } = useSoldUnitsFromSheet();

  const queryClient = useQueryClient();

  // Merge units with Google Sheet data - mark as sold if unit number exists in sheet
  const allMergedUnits = useMemo(() => {
    if (!units) return [];
    
    return units.map(unit => {
      const sheetInfo = getSoldUnitInfo(unit.unit_number);
      if (sheetInfo) {
        return {
          ...unit,
          status: "sold" as const,
          buyer_name: sheetInfo.buyerName || unit.buyer_name,
          sales_employee: sheetInfo.salesPerson || unit.sales_employee,
          accountant_name: sheetInfo.accountantName || unit.accountant_name,
          // Store sale date in notes if available
          sheet_sale_date: sheetInfo.saleDate,
        };
      }
      return unit;
    });
  }, [units, getSoldUnitInfo]);

  // Apply status filter AFTER merging with Google Sheet data
  const mergedUnits = useMemo(() => {
    if (filters.status === "all") return allMergedUnits;
    return allMergedUnits.filter(unit => unit.status === filters.status);
  }, [allMergedUnits, filters.status]);

  // Calculate stats based on ALL merged units (not filtered)
  const mergedStats = useMemo(() => {
    if (!allMergedUnits.length) return stats;
    
    // Count from ALL merged units (which already has Google Sheet data applied)
    const residential = allMergedUnits.filter(u => u.is_residential);
    const total = residential.length;
    const sold = residential.filter(u => u.status === "sold").length;
    const reserved = residential.filter(u => u.status === "reserved").length;
    const available = residential.filter(u => u.status === "available").length;
    
    return { total, available, reserved, sold };
  }, [allMergedUnits, stats]);

  const handleRefresh = useCallback(() => {
    refetchUnits();
    refetchStats();
    refetchSheet();
  }, [refetchUnits, refetchStats, refetchSheet]);

  const handleUnitClick = useCallback((unit: Unit) => {
    setSelectedUnit(unit);
    setDrawerOpen(true);
  }, []);

  const handleDrawerClose = useCallback((open: boolean) => {
    setDrawerOpen(open);
    if (!open) {
      // Refresh data when drawer closes in case of updates
      queryClient.invalidateQueries({ queryKey: ["units"] });
      queryClient.invalidateQueries({ queryKey: ["units-stats"] });
    }
  }, [queryClient]);

  return (
    <div className="min-h-screen pb-4">
      {/* Compact Header with Stats & Filters */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b shadow-sm -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2 pb-2">
        <MapHeader
          stats={mergedStats}
          isLoading={statsLoading || sheetLoading}
          filters={filters}
          onFiltersChange={setFilters}
          view={view}
          onViewChange={setView}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Main View - الخريطة - Takes most of the screen */}
      <div className="mt-2 scroll-smooth flex-1">
        {unitsLoading || sheetLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[calc(100vh-180px)] w-full rounded-xl" />
          </div>
        ) : mergedUnits && mergedUnits.length > 0 ? (
          view === "map" ? (
            <MapView units={mergedUnits} onUnitClick={handleUnitClick} />
          ) : (
            <GridView units={mergedUnits} onUnitClick={handleUnitClick} getSoldUnitInfo={getSoldUnitInfo} />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <p className="text-muted-foreground text-lg">لا توجد وحدات تطابق معايير البحث</p>
            <p className="text-sm text-muted-foreground/70 mt-1">حاول تغيير الفلاتر أو مصطلح البحث</p>
          </div>
        )}
      </div>

      {/* Unit Detail Drawer */}
      <UnitDetailDrawer
        unit={selectedUnit}
        open={drawerOpen}
        onOpenChange={handleDrawerClose}
        getSoldUnitInfo={getSoldUnitInfo}
      />
    </div>
  );
}
