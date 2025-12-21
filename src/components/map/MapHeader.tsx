import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UnitFilters, UnitStatus } from "@/hooks/useUnits";
import { Search, Map, LayoutGrid, Home, CheckCircle, Clock, FileText, RefreshCw, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapHeaderProps {
  stats: { total: number; available: number; reserved: number; sold: number } | undefined;
  isLoading: boolean;
  filters: UnitFilters;
  onFiltersChange: (filters: UnitFilters) => void;
  view: "map" | "grid";
  onViewChange: (view: "map" | "grid") => void;
  onRefresh: () => void;
}

const BLOCKS = Array.from({ length: 21 }, (_, i) => i + 1);

export function MapHeader({
  stats,
  isLoading,
  filters,
  onFiltersChange,
  view,
  onViewChange,
  onRefresh,
}: MapHeaderProps) {
  const soldPercentage = stats ? Math.round((stats.sold / stats.total) * 100) : 0;
  
  return (
    <div className="space-y-2">
      {/* Compact Stats Row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
          <Home className="h-6 w-6" />
          <span>{isLoading ? "..." : stats?.total || 0}</span>
          <span className="text-muted-foreground">إجمالي</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 text-sm font-medium whitespace-nowrap">
          <CheckCircle className="h-6 w-6" />
          <span>{isLoading ? "..." : stats?.available || 0}</span>
          <span className="text-muted-foreground">متاح</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-amber-500/10 text-amber-600 text-sm font-medium whitespace-nowrap">
          <Clock className="h-6 w-6" />
          <span>{isLoading ? "..." : stats?.reserved || 0}</span>
          <span className="text-muted-foreground">محجوز</span>
        </div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-rose-500/10 text-rose-600 text-sm font-medium whitespace-nowrap">
          <FileText className="h-6 w-6" />
          <span>{isLoading ? "..." : stats?.sold || 0}</span>
          <span className="text-muted-foreground">مباع</span>
        </div>
      </div>

      {/* Compact Filters Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pr-8 h-8 text-xs"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => onFiltersChange({ ...filters, status: value as UnitStatus | "all" })}
        >
          <SelectTrigger className="w-[90px] h-8 text-xs">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="available">متاح</SelectItem>
            <SelectItem value="reserved">محجوز</SelectItem>
            <SelectItem value="sold">مباع</SelectItem>
          </SelectContent>
        </Select>

        {/* Block Filter */}
        <Select
          value={filters.block?.toString() || "all"}
          onValueChange={(value) => onFiltersChange({ ...filters, block: value === "all" ? "all" : Number(value) })}
        >
          <SelectTrigger className="w-[90px] h-8 text-xs">
            <SelectValue placeholder="البلوك" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل البلوكات</SelectItem>
            {BLOCKS.map((block) => (
              <SelectItem key={block} value={block.toString()}>
                بلوك {block}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Toggle & Refresh */}
        <div className="flex gap-1 mr-auto">
          <div className="flex rounded-lg border bg-muted/30 p-0.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("map")}
              className={cn(
                "h-7 px-2 rounded-md transition-all text-xs",
                view === "map" && "bg-background shadow-sm"
              )}
            >
              <Map className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("grid")}
              className={cn(
                "h-7 px-2 rounded-md transition-all text-xs",
                view === "grid" && "bg-background shadow-sm"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5 ml-1" />
              <span>الخريطة</span>
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={onRefresh} className="h-7 w-7 rounded-lg">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
