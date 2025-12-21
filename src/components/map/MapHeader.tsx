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
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="group relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-primary/10">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">إجمالي الوحدات</p>
                <p className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : stats?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 via-background to-emerald-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shadow-inner">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">متاح للبيع</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {isLoading ? "..." : stats?.available || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-amber-500/20 bg-gradient-to-br from-amber-500/5 via-background to-amber-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shadow-inner">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-muted-foreground font-medium">محجوز</p>
                <p className="text-2xl font-bold text-amber-600">
                  {isLoading ? "..." : stats?.reserved || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-rose-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-4 relative">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-rose-500/10 flex items-center justify-center shadow-inner">
                <FileText className="h-6 w-6 text-rose-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">مباع</p>
                    <p className="text-2xl font-bold text-rose-600">
                      {isLoading ? "..." : stats?.sold || 0}
                    </p>
                  </div>
                  {!isLoading && stats && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
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

      {/* Filters Row */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
          {/* Search */}
          <div className="relative flex-1 w-full md:max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث برقم الوحدة أو اسم المشتري..."
              value={filters.search || ""}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pr-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={filters.status || "all"}
            onValueChange={(value) => onFiltersChange({ ...filters, status: value as UnitStatus | "all" })}
          >
            <SelectTrigger className="w-full md:w-40">
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
            <SelectTrigger className="w-full md:w-40">
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

          {/* View Toggle & Refresh */}
          <div className="flex gap-2 mr-auto">
            <div className="flex rounded-xl border bg-muted/30 p-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange("map")}
                className={cn(
                  "h-9 px-4 rounded-lg transition-all",
                  view === "map" && "bg-background shadow-sm"
                )}
              >
                <Map className="h-4 w-4 ml-2" />
                خريطة
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange("grid")}
                className={cn(
                  "h-9 px-4 rounded-lg transition-all",
                  view === "grid" && "bg-background shadow-sm"
                )}
              >
                <LayoutGrid className="h-4 w-4 ml-2" />
                شبكة
              </Button>
            </div>

            <Button variant="outline" size="icon" onClick={onRefresh} className="h-11 w-11 rounded-xl">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
