import { Badge } from "@/components/ui/badge";
import { UnitStatus } from "@/hooks/useUnits";
import { cn } from "@/lib/utils";

interface UnitStatusBadgeProps {
  status: UnitStatus;
  className?: string;
}

export function UnitStatusBadge({ status, className }: UnitStatusBadgeProps) {
  const statusConfig = {
    available: {
      label: "متاح",
      variant: "default" as const,
      className: "bg-emerald-500 hover:bg-emerald-600 text-white",
    },
    reserved: {
      label: "محجوز",
      variant: "default" as const,
      className: "bg-amber-500 hover:bg-amber-600 text-white",
    },
    sold: {
      label: "مباع",
      variant: "default" as const,
      className: "bg-rose-500 hover:bg-rose-600 text-white",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

export function getStatusColor(status: UnitStatus): string {
  switch (status) {
    case "available":
      return "hsl(152, 69%, 40%)"; // emerald-500
    case "reserved":
      return "hsl(38, 92%, 50%)"; // amber-500
    case "sold":
      return "hsl(350, 89%, 60%)"; // rose-500
    default:
      return "hsl(var(--muted))";
  }
}

export function getStatusBgClass(status: UnitStatus): string {
  switch (status) {
    case "available":
      return "bg-emerald-500 hover:bg-emerald-600";
    case "reserved":
      return "bg-amber-500 hover:bg-amber-600";
    case "sold":
      return "bg-rose-500 hover:bg-rose-600";
    default:
      return "bg-muted";
  }
}
