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
    <div className="space-y-3">
      {/* Stats Cards - Horizontal scroll on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:overflow-visible sm:pb-0">
        <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10 min-w-[140px] sm:min-w-0 flex-shrink-0">
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner flex-shrink-0">
                <Home className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">إجمالي الوحدات</p>
                <p className="text-xl sm:text-2xl font-bold text-primary">
                  {isLoading ? "..." : stats?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-emerald-500/10 min-w-[140px] sm:min-w-0 flex-shrink-0">
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shadow-inner flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">متاح للبيع</p>
                <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                  {isLoading ? "..." : stats?.available || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10 min-w-[140px] sm:min-w-0 flex-shrink-0">
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shadow-inner flex-shrink-0">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate">محجوز</p>
                <p className="text-xl sm:text-2xl font-bold text-amber-600">
                  {isLoading ? "..." : stats?.reserved || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-rose-500/10 min-w-[140px] sm:min-w-0 flex-shrink-0">
          <CardContent className="p-3 sm:p-4 relative">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-rose-500/10 flex items-center justify-center shadow-inner flex-shrink-0">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">مباع</p>
                    <p className="text-xl sm:text-2xl font-bold text-rose-600">
                      {isLoading ? "..." : stats?.sold || 0}
                    </p>
                  </div>
                  {!isLoading && stats && (
                    <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span>{soldPercentage}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row - More compact on mobile */}
      <Card className="p-2 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Search - Full width */}
          <div className="relative w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الوحدة أو المشتري..."
              value={filters.search || ""}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pr-10 h-10 sm:h-11 text-sm"
            />
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Status Filter */}
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => onFiltersChange({ ...filters, status: value as UnitStatus | "all" })}
            >
              <SelectTrigger className="w-[100px] sm:w-32 h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
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
              <SelectTrigger className="w-[100px] sm:w-32 h-9 sm:h-10 text-xs sm:text-sm">
                <SelectValue placeholder="البلوك" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع البلوكات</SelectItem>
                {BLOCKS.map((block) => (
                  <SelectItem key={block} value={block.toString()}>
                    بلوك {block}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View Toggle & Refresh - Push to end */}
            <div className="flex gap-1.5 sm:gap-2 mr-auto">
              <div className="flex rounded-lg sm:rounded-xl border bg-muted/30 p-0.5 sm:p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange("map")}
                  className={cn(
                    "h-8 sm:h-9 px-2 sm:px-4 rounded-md sm:rounded-lg transition-all text-xs sm:text-sm",
                    view === "map" && "bg-background shadow-sm"
                  )}
                >
                  <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:ml-2" />
                  <span className="hidden sm:inline">خريطة</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewChange("grid")}
                  className={cn(
                    "h-8 sm:h-9 px-2 sm:px-4 rounded-md sm:rounded-lg transition-all text-xs sm:text-sm",
                    view === "grid" && "bg-background shadow-sm"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:ml-2" />
                  <span className="hidden sm:inline">شبكة</span>
                </Button>
              </div>

              <Button variant="outline" size="icon" onClick={onRefresh} className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl">
                <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
