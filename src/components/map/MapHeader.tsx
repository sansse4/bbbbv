import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UnitFilters, UnitStatus } from "@/hooks/useUnits";
import { Search, Map, LayoutGrid, Home, CheckCircle, ShoppingCart, XCircle, RefreshCw } from "lucide-react";
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
  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Home className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">إجمالي الوحدات</p>
                <p className="text-2xl font-bold text-primary">
                  {isLoading ? "..." : stats?.total || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">متاح</p>
                <p className="text-2xl font-bold text-emerald-600">
                  {isLoading ? "..." : stats?.available || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">محجوز</p>
                <p className="text-2xl font-bold text-amber-600">
                  {isLoading ? "..." : stats?.reserved || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-rose-500/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-rose-500/20 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">مباع</p>
                <p className="text-2xl font-bold text-rose-600">
                  {isLoading ? "..." : stats?.sold || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
        {/* Search */}
        <div className="relative flex-1 w-full md:max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث برقم الوحدة، البلوك، أو اسم المشتري..."
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
          <SelectTrigger className="w-full md:w-36">
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
          <SelectTrigger className="w-full md:w-36">
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
          <div className="flex rounded-lg border bg-muted/50 p-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("map")}
              className={cn(
                "h-8 px-3",
                view === "map" && "bg-background shadow-sm"
              )}
            >
              <Map className="h-4 w-4 ml-1" />
              خريطة
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewChange("grid")}
              className={cn(
                "h-8 px-3",
                view === "grid" && "bg-background shadow-sm"
              )}
            >
              <LayoutGrid className="h-4 w-4 ml-1" />
              شبكة
            </Button>
          </div>

          <Button variant="outline" size="icon" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
