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

  return (
    <div className="border rounded-xl bg-card overflow-hidden">
      <ScrollArea className="h-[calc(100vh-380px)] min-h-[400px]">
        <div className="grid grid-cols-3 md:grid-cols-7 lg:grid-cols-11 xl:grid-cols-21 gap-0">
          {Object.entries(unitsByBlock).map(([block, blockUnits]) => (
            <div key={block} className="border-l last:border-l-0 min-w-[80px]">
              {/* Block Header */}
              <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm border-b p-2 text-center">
                <span className="text-xs font-bold text-muted-foreground">
                  بلوك {block}
                </span>
                <span className="block text-[10px] text-muted-foreground/70">
                  ({blockUnits.length})
                </span>
              </div>

              {/* Units */}
              <div className="p-1 space-y-1">
                {blockUnits.map((unit) => (
                  <Tooltip key={unit.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onUnitClick(unit)}
                        className={cn(
                          "w-full p-1.5 rounded-md text-white text-xs font-medium transition-all",
                          "hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/50",
                          getStatusBgClass(unit.status)
                        )}
                      >
                        {unit.unit_number}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                      <div className="text-xs space-y-1">
                        <p className="font-bold">وحدة #{unit.unit_number}</p>
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
                        {unit.buyer_name && <p>المشتري: {unit.buyer_name}</p>}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
