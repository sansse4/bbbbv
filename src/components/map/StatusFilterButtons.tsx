import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getStatusDotColor } from "@/lib/statusUtils";
import { UnitStatus } from "@/hooks/useUnits";

interface StatusFilterButtonsProps {
  currentStatus: UnitStatus | "all";
  onStatusChange: (status: UnitStatus | "all") => void;
  stats?: {
    total: number;
    available: number;
    reserved: number;
    sold: number;
  };
  isLoading?: boolean;
}

type FilterOption = {
  value: UnitStatus | "all";
  label: string;
  count?: number;
};

export function StatusFilterButtons({
  currentStatus,
  onStatusChange,
  stats,
  isLoading = false,
}: StatusFilterButtonsProps) {
  const filterOptions: FilterOption[] = [
    { value: "all", label: "الكل", count: stats?.total },
    { value: "available", label: "متاحة", count: stats?.available },
    { value: "reserved", label: "محجوزة", count: stats?.reserved },
    { value: "sold", label: "مباعة", count: stats?.sold },
  ];

  return (
    <div className="flex flex-wrap gap-1.5">
      {filterOptions.map((option) => {
        const isSelected = currentStatus === option.value;
        
        return (
          <Button
            key={option.value}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onStatusChange(option.value)}
            className={cn(
              "h-8 px-3 text-xs transition-all duration-200 gap-2",
              isSelected && "font-bold shadow-md",
              !isSelected && "hover:bg-muted/80 hover:border-primary/50"
            )}
          >
            {/* Status dot */}
            <span
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                getStatusDotColor(option.value),
                isSelected && option.value !== "all" && "ring-2 ring-white/50"
              )}
            />
            <span>{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}

// Clickable counter component
interface StatusCounterProps {
  label: string;
  count: number;
  status: UnitStatus;
  currentStatus: UnitStatus | "all";
  onClick: () => void;
  isLoading?: boolean;
  colorClass: string;
  bgClass: string;
  icon: React.ReactNode;
}

export function StatusCounter({
  label,
  count,
  status,
  currentStatus,
  onClick,
  isLoading = false,
  colorClass,
  bgClass,
  icon,
}: StatusCounterProps) {
  const isActive = currentStatus === status;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200",
        bgClass,
        colorClass,
        isActive && "ring-2 ring-offset-1 ring-current shadow-md scale-105",
        !isActive && "hover:scale-102 hover:shadow-sm cursor-pointer"
      )}
    >
      {icon}
      <span>{isLoading ? "..." : count}</span>
      <span className="text-muted-foreground">{label}</span>
    </button>
  );
}
