import { useMemo, useState, useCallback } from "react";
import { Unit } from "@/hooks/useUnits";
import { getStatusBgClass } from "./UnitStatusBadge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayoutGrid, Timer, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface GridViewProps {
  units: Unit[];
  onUnitClick: (unit: Unit) => void;
}

export function GridView({ units, onUnitClick }: GridViewProps) {
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7]));

  // Group units by block
  const unitsByBlock = useMemo(() => {
    const grouped: Record<number, Unit[]> = {};
    
    for (let i = 1; i <= 21; i++) {
      grouped[i] = [];
    }
    
    units.forEach((unit) => {
      if (grouped[unit.block_number]) {
        grouped[unit.block_number].push(unit);
      }
    });
    
    // Sort units within each block
    Object.keys(grouped).forEach((key) => {
      grouped[Number(key)].sort((a, b) => a.unit_number - b.unit_number);
    });
    
    return grouped;
  }, [units]);

  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const isReservationExpired = useCallback((unit: Unit) => {
    if (!unit.reservation_expires_at) return false;
    return new Date(unit.reservation_expires_at) < new Date();
  }, []);

  const getTimeRemaining = useCallback((expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
  }, []);

  const toggleBlock = useCallback((block: number) => {
    setExpandedBlocks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(block)) {
        newSet.delete(block);
      } else {
        newSet.add(block);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedBlocks(new Set(Array.from({ length: 21 }, (_, i) => i + 1)));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedBlocks(new Set());
  }, []);

  // Calculate stats for each block
  const getBlockStats = useCallback((blockUnits: Unit[]) => {
    return {
      total: blockUnits.length,
      available: blockUnits.filter(u => u.status === "available").length,
      reserved: blockUnits.filter(u => u.status === "reserved").length,
      sold: blockUnits.filter(u => u.status === "sold").length,
    };
  }, []);

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-5 w-5 text-primary" />
          <span className="font-semibold">عرض الشبكة</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={expandAll}
            className="text-xs text-primary hover:underline"
          >
            توسيع الكل
          </button>
          <span className="text-muted-foreground">|</span>
          <button
            onClick={collapseAll}
            className="text-xs text-primary hover:underline"
          >
            طي الكل
          </button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-420px)] min-h-[400px]">
        <div className="p-4 space-y-3">
          {Object.entries(unitsByBlock).map(([block, blockUnits]) => {
            const blockNum = Number(block);
            const isExpanded = expandedBlocks.has(blockNum);
            const stats = getBlockStats(blockUnits);
            
            if (blockUnits.length === 0) return null;

            return (
              <Collapsible
                key={block}
                open={isExpanded}
                onOpenChange={() => toggleBlock(blockNum)}
              >
                {/* Block Header */}
                <CollapsibleTrigger asChild>
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                    "bg-gradient-to-l from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15",
                    "border border-primary/20"
                  )}>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-primary">بلوك {block}</span>
                      <div className="flex gap-1.5">
                        {stats.available > 0 && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-0 text-xs">
                            {stats.available} متاح
                          </Badge>
                        )}
                        {stats.reserved > 0 && (
                          <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-0 text-xs">
                            {stats.reserved} محجوز
                          </Badge>
                        )}
                        {stats.sold > 0 && (
                          <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-0 text-xs">
                            {stats.sold} مباع
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{stats.total} وحدة</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </CollapsibleTrigger>

                {/* Units Grid */}
                <CollapsibleContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 p-3 mt-2 bg-muted/20 rounded-lg border">
                    {blockUnits.map((unit) => {
                      const hasTemporaryHold = unit.status === "reserved" && unit.reservation_expires_at && !isReservationExpired(unit);
                      const timeRemaining = unit.reservation_expires_at ? getTimeRemaining(unit.reservation_expires_at) : null;
                      
                      return (
                        <Tooltip key={unit.id}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => onUnitClick(unit)}
                              className={cn(
                                "w-full p-3 rounded-xl text-white font-semibold transition-all",
                                "hover:scale-[1.03] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50",
                                "flex flex-col items-center justify-center min-h-[90px] gap-1.5",
                                "shadow-sm",
                                getStatusBgClass(unit.status)
                              )}
                            >
                              <span className="text-xl font-bold">{unit.unit_number}</span>
                              <span className="text-[11px] opacity-90">{unit.area_m2} م²</span>
                              {hasTemporaryHold && timeRemaining && (
                                <span className="text-[10px] bg-white/25 rounded-full px-2 py-0.5 flex items-center gap-1">
                                  <Timer className="h-3 w-3" />
                                  {timeRemaining}
                                </span>
                              )}
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[220px] z-[100]">
                            <div className="text-xs space-y-1.5">
                              <p className="font-bold text-sm">وحدة #{unit.unit_number}</p>
                              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                                <p className="text-muted-foreground">بلوك:</p>
                                <p>{unit.block_number}</p>
                                <p className="text-muted-foreground">المساحة:</p>
                                <p>{unit.area_m2} م²</p>
                                <p className="text-muted-foreground">السعر:</p>
                                <p>{formatCurrency(unit.price)} د.ع</p>
                                <p className="text-muted-foreground">الحالة:</p>
                                <p className={cn(
                                  "font-semibold",
                                  unit.status === "available" && "text-emerald-600",
                                  unit.status === "reserved" && "text-amber-600",
                                  unit.status === "sold" && "text-rose-600"
                                )}>
                                  {unit.status === "available" ? "متاح" : unit.status === "reserved" ? "محجوز" : "مباع"}
                                </p>
                              </div>
                              {hasTemporaryHold && timeRemaining && (
                                <p className="text-amber-600 font-medium pt-1 border-t">
                                  ⏱️ حجز مؤقت: {timeRemaining} متبقي
                                </p>
                              )}
                              {unit.buyer_name && (
                                <p className="pt-1 border-t">المشتري: {unit.buyer_name}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* Legend Footer */}
      <div className="p-4 border-t bg-muted/30">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
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
    </Card>
  );
}
