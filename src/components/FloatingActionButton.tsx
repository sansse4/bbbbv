import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  pulse?: boolean;
  className?: string;
}

export function FloatingActionButton({
  icon: Icon,
  label,
  onClick,
  position = "bottom-right",
  pulse = true,
  className,
}: FloatingActionButtonProps) {
  const positionClasses = {
    "bottom-right": "bottom-6 right-6",
    "bottom-left": "bottom-6 left-6",
    "top-right": "top-6 right-6",
    "top-left": "top-6 left-6",
  };

  return (
    <div className={cn("fixed z-50", positionClasses[position])}>
      <Button
        size="lg"
        onClick={onClick}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300",
          pulse && "animate-pulse-soft",
          className
        )}
        aria-label={label}
      >
        <Icon className="h-6 w-6" />
      </Button>
      <div className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
      </div>
    </div>
  );
}
