// Status normalization helper
export type NormalizedStatus = "available" | "reserved" | "sold";

export function normalizeStatus(status: string | undefined | null): NormalizedStatus {
  if (!status) return "available";
  
  const normalized = status.toLowerCase().trim();
  
  // Available variations
  if (["available", "متاحة", "متاح"].includes(normalized)) {
    return "available";
  }
  
  // Reserved variations
  if (["reserved", "محجوزة", "محجوز"].includes(normalized)) {
    return "reserved";
  }
  
  // Sold variations
  if (["sold", "مباعة", "مباع"].includes(normalized)) {
    return "sold";
  }
  
  return "available";
}

export function getStatusLabel(status: NormalizedStatus): string {
  switch (status) {
    case "available":
      return "متاح";
    case "reserved":
      return "محجوز";
    case "sold":
      return "مباع";
    default:
      return "متاح";
  }
}

export function getStatusDotColor(status: NormalizedStatus | "all"): string {
  switch (status) {
    case "available":
      return "bg-emerald-500";
    case "reserved":
      return "bg-amber-500";
    case "sold":
      return "bg-rose-500";
    case "all":
    default:
      return "bg-muted-foreground";
  }
}
