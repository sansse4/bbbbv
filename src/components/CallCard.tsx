import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Calendar, User, MessageSquare } from "lucide-react";
import { ImportedCall } from "@/hooks/useImportedCalls";

interface CallCardProps {
  call: ImportedCall;
  onStatusUpdate: (call: ImportedCall) => void;
  getStatusColor: (status: ImportedCall["status"]) => string;
  getStatusLabel: (status: ImportedCall["status"]) => string;
}

export function CallCard({ call, onStatusUpdate, getStatusColor, getStatusLabel }: CallCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold text-foreground">{call.name}</span>
          </div>
          <Badge className={getStatusColor(call.status)}>
            {getStatusLabel(call.status)}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a href={`tel:${call.phone}`} className="text-primary hover:underline">
            {call.phone}
          </a>
        </div>

        {call.customerStatus && (
          <div className="flex items-start gap-2 text-sm">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">
              <span className="font-medium">حالة الزبون:</span> {call.customerStatus}
            </span>
          </div>
        )}

        {call.notes && (
          <div className="text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
            <span className="font-medium">ملاحظات:</span> {call.notes}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          {new Date(call.timestamp).toLocaleString("ar-IQ", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })}
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-2"
          onClick={() => onStatusUpdate(call)}
        >
          <Phone className="h-4 w-4" />
          تحديث الحالة
        </Button>
      </CardContent>
    </Card>
  );
}
