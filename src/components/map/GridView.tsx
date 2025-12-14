import { useMemo } from "react";
import { Unit } from "@/hooks/useUnits";
import { getStatusBgClass } from "./UnitStatusBadge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface GridViewProps {
  units: Unit[];
  onUnitClick: (unit: Unit) => void;
}

export function GridView({ units, onUnitClick }: GridViewProps) {
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("ar-IQ", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isReservationExpired = (unit: Unit) => {
    if (!unit.reservation_expires_at) return false;
    return new Date(unit.reservation_expires_at) < new Date();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}س ${minutes}د`;
  };

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-10 gap-2 p-3">
          {Object.entries(unitsByBlock).map(([block, blockUnits]) => (
            <div key={block} className="space-y-2">
              {/* Block Header */}
              <div className="sticky top-0 z-10 bg-muted/90 backdrop-blur-sm rounded-lg p-2 text-center shadow-sm">
                <span className="text-sm font-bold text-foreground">
                  بلوك {block}
                </span>
                <span className="block text-xs text-muted-foreground">
                  ({blockUnits.length} وحدة)
                </span>
              </div>

              {/* Units */}
              <div className="space-y-2">
                {blockUnits.map((unit) => {
                  const hasTemporaryHold = unit.status === "reserved" && unit.reservation_expires_at && !isReservationExpired(unit);
                  const timeRemaining = unit.reservation_expires_at ? getTimeRemaining(unit.reservation_expires_at) : null;
                  
                  return (
                    <Tooltip key={unit.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onUnitClick(unit)}
                          className={cn(
                            "w-full p-3 rounded-lg text-white font-semibold transition-all",
                            "hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50",
                            "flex flex-col items-center justify-center min-h-[80px] gap-1",
                            getStatusBgClass(unit.status)
                          )}
                        >
                          <span className="text-lg">{unit.unit_number}</span>
                          <span className="text-[10px] opacity-80">{unit.area_m2} م²</span>
                          {hasTemporaryHold && timeRemaining && (
                            <span className="text-[9px] bg-white/20 rounded px-1.5 py-0.5 mt-1">
                              ⏱️ {timeRemaining}
                            </span>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[220px]">
                        <div className="text-xs space-y-1">
                          <p className="font-bold text-sm">وحدة #{unit.unit_number}</p>
                          <p>بلوك: {unit.block_number}</p>
                          <p>المساحة: {unit.area_m2} م²</p>
                          <p>السعر: {formatCurrency(unit.price)} د.ع</p>
                          <p>
                            الحالة:{" "}
                            {unit.status === "available"
                              ? "متاح"
                              : unit.status === "reserved"
                              ? "محجوز"
                              : "مباع"}
                          </p>
                          {hasTemporaryHold && timeRemaining && (
                            <p className="text-amber-600 font-medium">حجز مؤقت: {timeRemaining} متبقي</p>
                          )}
                          {unit.buyer_name && <p>المشتري: {unit.buyer_name}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
