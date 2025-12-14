import { useMemo, useState } from "react";
import { Unit } from "@/hooks/useUnits";
import { getStatusColor } from "./UnitStatusBadge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import masterplanImage from "@/assets/masterplan.jpg";
import { cn } from "@/lib/utils";

interface MapViewProps {
  units: Unit[];
  onUnitClick: (unit: Unit) => void;
}

// Block positions on the masterplan (approximate positioning based on the image)
// These will need fine-tuning based on the actual masterplan layout
const BLOCK_POSITIONS: Record<number, { x: number; y: number; width: number; height: number; cols: number }> = {
  1: { x: 5, y: 10, width: 12, height: 35, cols: 2 },
  2: { x: 5, y: 48, width: 12, height: 40, cols: 2 },
  3: { x: 18, y: 10, width: 12, height: 35, cols: 2 },
  4: { x: 18, y: 48, width: 14, height: 45, cols: 2 },
  5: { x: 32, y: 10, width: 14, height: 42, cols: 2 },
  6: { x: 32, y: 55, width: 14, height: 40, cols: 2 },
  7: { x: 47, y: 10, width: 14, height: 42, cols: 2 },
  8: { x: 47, y: 55, width: 12, height: 35, cols: 2 },
  9: { x: 60, y: 10, width: 14, height: 42, cols: 2 },
  10: { x: 60, y: 55, width: 10, height: 25, cols: 2 },
  11: { x: 60, y: 82, width: 10, height: 15, cols: 2 },
  12: { x: 71, y: 10, width: 14, height: 42, cols: 2 },
  13: { x: 71, y: 55, width: 12, height: 30, cols: 2 },
  14: { x: 71, y: 87, width: 14, height: 10, cols: 3 },
  15: { x: 83, y: 10, width: 12, height: 30, cols: 2 },
  16: { x: 83, y: 42, width: 12, height: 28, cols: 2 },
  17: { x: 83, y: 72, width: 12, height: 25, cols: 2 },
  18: { x: 92, y: 10, width: 6, height: 20, cols: 1 },
  19: { x: 92, y: 32, width: 6, height: 20, cols: 1 },
  20: { x: 92, y: 54, width: 6, height: 28, cols: 2 },
  21: { x: 92, y: 84, width: 6, height: 12, cols: 2 },
};

export function MapView({ units, onUnitClick }: MapViewProps) {
  const [hoveredUnit, setHoveredUnit] = useState<Unit | null>(null);

  // Group units by block
  const unitsByBlock = useMemo(() => {
    const grouped: Record<number, Unit[]> = {};
    units.forEach((unit) => {
      if (!grouped[unit.block_number]) {
        grouped[unit.block_number] = [];
      }
      grouped[unit.block_number].push(unit);
    });
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
    <div className="relative border rounded-xl overflow-hidden bg-muted/20">
      {/* Masterplan Background */}
      <div className="relative w-full" style={{ paddingTop: "70%" }}>
        <img
          src={masterplanImage}
          alt="Compound Masterplan"
          className="absolute inset-0 w-full h-full object-contain"
        />

        {/* Overlay Units */}
        <div className="absolute inset-0">
          {Object.entries(unitsByBlock).map(([blockNum, blockUnits]) => {
            const block = Number(blockNum);
            const position = BLOCK_POSITIONS[block];
            if (!position) return null;

            const unitsPerCol = Math.ceil(blockUnits.length / position.cols);
            const unitWidth = position.width / position.cols;
            const unitHeight = position.height / unitsPerCol;

            return (
              <div
                key={block}
                className="absolute"
                style={{
                  left: `${position.x}%`,
                  top: `${position.y}%`,
                  width: `${position.width}%`,
                  height: `${position.height}%`,
                }}
              >
                <div
                  className="grid h-full w-full gap-[1px]"
                  style={{
                    gridTemplateColumns: `repeat(${position.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${unitsPerCol}, 1fr)`,
                  }}
                >
                  {blockUnits.map((unit) => (
                    <Tooltip key={unit.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onUnitClick(unit)}
                          onMouseEnter={() => setHoveredUnit(unit)}
                          onMouseLeave={() => setHoveredUnit(null)}
                          className={cn(
                            "w-full h-full rounded-[2px] transition-all text-[6px] md:text-[8px] font-bold text-white/90",
                            "hover:scale-110 hover:z-10 hover:shadow-lg focus:outline-none focus:ring-1 focus:ring-white/50",
                            "flex items-center justify-center"
                          )}
                          style={{ backgroundColor: getStatusColor(unit.status) }}
                        >
                          {unit.unit_number}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px] z-50">
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
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-500" />
            <span>متاح</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-500" />
            <span>محجوز</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-rose-500" />
            <span>مباع</span>
          </div>
        </div>
      </div>
    </div>
  );
}
