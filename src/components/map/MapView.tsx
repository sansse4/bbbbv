import { useMemo, useState, useCallback } from "react";
import { Unit } from "@/hooks/useUnits";
import { getStatusColor } from "./UnitStatusBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Home, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MapViewProps {
  units: Unit[];
  onUnitClick: (unit: Unit) => void;
}

export function MapView({ units, onUnitClick }: MapViewProps) {
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Group units by block
  const unitsByBlock = useMemo(() => {
    const grouped: Record<number, Unit[]> = {};
    
    // Initialize all 21 blocks
    for (let i = 1; i <= 21; i++) {
      grouped[i] = [];
    }
    
    units.forEach((unit) => {
      if (grouped[unit.block_number]) {
        grouped[unit.block_number].push(unit);
      }
    });
    
    Object.keys(grouped).forEach((key) => {
      grouped[Number(key)].sort((a, b) => a.unit_number - b.unit_number);
    });
    
    return grouped;
  }, [units]);

  // Calculate block statistics
  const blockStats = useMemo(() => {
    const stats: Record<number, { total: number; available: number; reserved: number; sold: number }> = {};
    
    Object.entries(unitsByBlock).forEach(([block, blockUnits]) => {
      stats[Number(block)] = {
        total: blockUnits.length,
        available: blockUnits.filter(u => u.status === "available").length,
        reserved: blockUnits.filter(u => u.status === "reserved").length,
        sold: blockUnits.filter(u => u.status === "sold").length,
      };
    });
    
    return stats;
  }, [unitsByBlock]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const getBlockStatusColor = useCallback((block: number) => {
    const stats = blockStats[block];
    if (!stats || stats.total === 0) return "bg-muted";
    
    const availablePercent = (stats.available / stats.total) * 100;
    const soldPercent = (stats.sold / stats.total) * 100;
    
    if (soldPercent === 100) return "bg-rose-500/80";
    if (availablePercent === 100) return "bg-emerald-500/80";
    if (availablePercent >= 50) return "bg-emerald-500/60";
    if (soldPercent >= 50) return "bg-rose-500/60";
    return "bg-amber-500/60";
  }, [blockStats]);

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300",
      isFullscreen ? "fixed inset-4 z-50" : ""
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <span className="font-semibold">عرض الخريطة التفاعلية</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Main Content */}
      <div className={cn(
        "p-4 overflow-auto",
        isFullscreen ? "h-[calc(100%-120px)]" : "h-[500px]"
      )}>
        {/* Blocks Grid Layout */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {Object.entries(unitsByBlock).map(([blockNum, blockUnits]) => {
            const block = Number(blockNum);
            const stats = blockStats[block];
            const isHovered = hoveredBlock === block;
            
            if (blockUnits.length === 0) {
              return (
                <div
                  key={block}
                  className="p-3 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/20 text-center"
                >
                  <span className="text-xs text-muted-foreground">بلوك {block}</span>
                  <p className="text-[10px] text-muted-foreground/50 mt-1">لا توجد وحدات</p>
                </div>
              );
            }

            return (
              <div
                key={block}
                className={cn(
                  "relative rounded-xl border transition-all duration-200 cursor-pointer",
                  "hover:shadow-lg hover:scale-[1.02]",
                  isHovered ? "ring-2 ring-primary shadow-lg" : "",
                  getBlockStatusColor(block)
                )}
                onMouseEnter={() => setHoveredBlock(block)}
                onMouseLeave={() => setHoveredBlock(null)}
              >
                {/* Block Header */}
                <div className="p-2 text-center border-b border-white/20">
                  <span className="text-sm font-bold text-white drop-shadow">
                    بلوك {block}
                  </span>
                  <div className="flex justify-center gap-1 mt-1">
                    <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-white/20 text-white border-0">
                      {stats.total} وحدة
                    </Badge>
                  </div>
                </div>

                {/* Units Grid */}
                <div className="p-2">
                  <div className="grid grid-cols-3 gap-1">
                    {blockUnits.slice(0, 9).map((unit) => (
                      <Tooltip key={unit.id}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onUnitClick(unit);
                            }}
                            className={cn(
                              "w-full aspect-square rounded-md transition-all text-[10px] font-bold text-white",
                              "hover:scale-110 hover:z-10 hover:shadow-lg",
                              "focus:outline-none focus:ring-2 focus:ring-white/50",
                              "flex items-center justify-center"
                            )}
                            style={{ backgroundColor: getStatusColor(unit.status) }}
                          >
                            {unit.unit_number}
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] z-[100]">
                          <div className="text-xs space-y-1">
                            <p className="font-bold">وحدة #{unit.unit_number}</p>
                            <p>المساحة: {unit.area_m2} م²</p>
                            <p>السعر: {formatCurrency(unit.price)} د.ع</p>
                            <p>
                              الحالة:{" "}
                              <span className={cn(
                                "font-semibold",
                                unit.status === "available" && "text-emerald-600",
                                unit.status === "reserved" && "text-amber-600",
                                unit.status === "sold" && "text-rose-600"
                              )}>
                                {unit.status === "available" ? "متاح" : unit.status === "reserved" ? "محجوز" : "مباع"}
                              </span>
                            </p>
                            {unit.buyer_name && <p>المشتري: {unit.buyer_name}</p>}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                  
                  {blockUnits.length > 9 && (
                    <div className="mt-2 text-center">
                      <button
                        onClick={() => {
                          // Click first remaining unit
                          if (blockUnits[9]) onUnitClick(blockUnits[9]);
                        }}
                        className="text-[10px] text-white/80 hover:text-white underline"
                      >
                        +{blockUnits.length - 9} وحدات أخرى
                      </button>
                    </div>
                  )}
                </div>

                {/* Block Stats Footer */}
                <div className="p-2 border-t border-white/20 flex justify-center gap-2">
                  {stats.available > 0 && (
                    <span className="text-[9px] text-white/90 flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      {stats.available}
                    </span>
                  )}
                  {stats.reserved > 0 && (
                    <span className="text-[9px] text-white/90 flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      {stats.reserved}
                    </span>
                  )}
                  {stats.sold > 0 && (
                    <span className="text-[9px] text-white/90 flex items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                      {stats.sold}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-emerald-500 shadow-sm" />
            <span className="text-muted-foreground">متاح</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-amber-500 shadow-sm" />
            <span className="text-muted-foreground">محجوز</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-md bg-rose-500 shadow-sm" />
            <span className="text-muted-foreground">مباع</span>
          </div>
        </div>
      </div>
      
      {/* Fullscreen Overlay Background */}
      {isFullscreen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </Card>
  );
}
