import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UnitFilters, UnitStatus } from "@/hooks/useUnits";
import { Search, Map, LayoutGrid, Home, CheckCircle, Clock, FileText, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusFilterButtons } from "./StatusFilterButtons";

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
  const handleStatusChange = (status: UnitStatus | "all") => {
    onFiltersChange({ ...filters, status });
  };

  const handleCounterClick = (status: UnitStatus) => {
    onFiltersChange({ ...filters, status });
  };
  
  return (
    <div className="space-y-2">
      {/* Clickable Stats Row */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide items-center">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium whitespace-nowrap">
          <Home className="h-5 w-5" />
          <span>{isLoading ? "..." : stats?.total || 0}</span>
          <span className="text-muted-foreground text-xs">إجمالي</span>
        </div>
        
        {/* Clickable Available Counter */}
        <button
          onClick={() => handleCounterClick("available")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
            "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20",
            filters.status === "available" && "ring-2 ring-emerald-500 ring-offset-1 shadow-md scale-105"
          )}
        >
          <CheckCircle className="h-5 w-5" />
          <span>{isLoading ? "..." : stats?.available || 0}</span>
          <span className="text-muted-foreground text-xs">متاح</span>
        </button>
        
        {/* Clickable Reserved Counter */}
        <button
          onClick={() => handleCounterClick("reserved")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
            "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20",
            filters.status === "reserved" && "ring-2 ring-amber-500 ring-offset-1 shadow-md scale-105"
          )}
        >
          <Clock className="h-5 w-5" />
          <span>{isLoading ? "..." : stats?.reserved || 0}</span>
          <span className="text-muted-foreground text-xs">محجوز</span>
        </button>
        
        {/* Clickable Sold Counter */}
        <button
          onClick={() => handleCounterClick("sold")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
            "bg-rose-500/10 text-rose-600 hover:bg-rose-500/20",
            filters.status === "sold" && "ring-2 ring-rose-500 ring-offset-1 shadow-md scale-105"
          )}
        >
          <FileText className="h-5 w-5" />
          <span>{isLoading ? "..." : stats?.sold || 0}</span>
          <span className="text-muted-foreground text-xs">مباع</span>
        </button>
      </div>

      {/* Filter Buttons Row */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status Filter Buttons */}
        <StatusFilterButtons
          currentStatus={filters.status || "all"}
          onStatusChange={handleStatusChange}
          stats={stats}
          isLoading={isLoading}
        />

        {/* Separator */}
        <div className="h-6 w-px bg-border mx-1" />

        {/* Search */}
        <div className="relative flex-1 min-w-[120px] max-w-[200px]">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pr-8 h-8 text-xs"
          />
        </div>

        {/* Block Filter */}
        <Select
          value={filters.block?.toString() || "all"}
          onValueChange={(value) => onFiltersChange({ ...filters, block: value === "all" ? "all" : Number(value) })}
        >
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="البلوك" />
          </SelectTrigger>
          <SelectContent className="bg-background border shadow-lg z-50">
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
