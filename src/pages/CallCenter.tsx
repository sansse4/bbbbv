import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneIncoming, PhoneMissed, Loader2, RefreshCw } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { CallCenterForm } from "@/components/CallCenterForm";
import { CallCenterRecentList } from "@/components/CallCenterRecentList";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CustomerSearch } from "@/components/CustomerSearch";
import { CallCard } from "@/components/CallCard";
import { toast } from "sonner";
import { useImportedCalls, ImportedCall } from "@/hooks/useImportedCalls";
import { CallStatusDialog } from "@/components/CallStatusDialog";
import { useIsMobile } from "@/hooks/use-mobile";
const CallCenter = () => {
  const isMobile = useIsMobile();
  const [recentCalls, setRecentCalls] = useState<Array<{
    name: string;
    phone: string;
    appointment: string;
    status: string;
    notes?: string;
    timestamp: string;
  }>>([]);
  const [selectedCall, setSelectedCall] = useState<ImportedCall | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const {
    calls: importedCalls,
    isLoading,
    error,
    updateCallStatus,
    refetch
  } = useImportedCalls();
  const handleCallAdded = (call: {
    name: string;
    phone: string;
    appointment: string;
    status: string;
    notes?: string;
  }) => {
    const newCall = {
      ...call,
      timestamp: new Date().toLocaleString("ar-IQ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      })
    };
    setRecentCalls(prev => [newCall, ...prev].slice(0, 10));
  };
  const handleCallClick = (call: ImportedCall) => {
    setSelectedCall(call);
    setDialogOpen(true);
  };
  
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedCall(null);
    }
  };
  
  const handleStatusUpdate = (status: "contacted" | "no-answer" | "wrong-number") => {
    if (selectedCall) {
      updateCallStatus(selectedCall.phone, status);
      setSelectedCall(null);
    }
  };
  const getStatusColor = (status: ImportedCall["status"]) => {
    switch (status) {
      case "contacted":
        return "bg-success text-success-foreground";
      case "no-answer":
        return "bg-destructive text-destructive-foreground";
      case "wrong-number":
        return "bg-muted text-muted-foreground";
      case "pending":
        return "bg-destructive/80 text-destructive-foreground font-bold";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };
  const getStatusLabel = (status: ImportedCall["status"]) => {
    switch (status) {
      case "contacted":
        return "تم الاتصال";
      case "no-answer":
        return "لم يتم الرد";
      case "wrong-number":
        return "رقم خطأ";
      case "pending":
        return "لم يتم الاتصال";
      default:
        return status;
    }
  };
  const handleQuickCall = () => {
    toast.success("Quick call initiated", {
      description: "Opening call interface..."
    });
  };
  return <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Call Center</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Monitor and manage customer communications
          </p>
        </div>
        <Button className="gap-2 text-slate-50 text-sm w-full md:w-auto">
          <Phone className="h-4 w-4" />
          Make Call
        </Button>
      </div>

      <CustomerSearch />

      <CallCenterForm onCallAdded={handleCallAdded} />

      <CallCenterRecentList calls={recentCalls} />

      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <CardTitle className="text-lg md:text-xl">المكالمات</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={isLoading}
            className="gap-2 w-full md:w-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </CardHeader>
        <CardContent className="p-0 md:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-destructive px-4">{error}</div>
          ) : importedCalls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground px-4">
              لا توجد مكالمات مستوردة
            </div>
          ) : isMobile ? (
            <div className="space-y-3 p-4">
              {importedCalls.map((call, index) => (
                <CallCard
                  key={`${call.phone}-${index}`}
                  call={call}
                  onStatusUpdate={handleCallClick}
                  getStatusColor={getStatusColor}
                  getStatusLabel={getStatusLabel}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">الاسم</TableHead>
                    <TableHead className="whitespace-nowrap">رقم الهاتف</TableHead>
                    <TableHead className="whitespace-nowrap">حالة الزبون</TableHead>
                    <TableHead className="whitespace-nowrap">ملاحظات</TableHead>
                    <TableHead className="whitespace-nowrap">وقت التسجيل</TableHead>
                    <TableHead className="whitespace-nowrap">الحالة</TableHead>
                    <TableHead className="whitespace-nowrap">إجراء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importedCalls.map((call, index) => (
                    <TableRow
                      key={`${call.phone}-${index}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleCallClick(call)}
                    >
                      <TableCell className="font-medium whitespace-nowrap">{call.name}</TableCell>
                      <TableCell className="whitespace-nowrap">{call.phone}</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{call.customerStatus || "-"}</TableCell>
                      <TableCell className="text-sm max-w-[150px] md:max-w-[200px] truncate">{call.notes || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(call.timestamp).toLocaleString("ar-IQ")}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Badge className={getStatusColor(call.status)}>
                          {getStatusLabel(call.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCallClick(call);
                          }}
                        >
                          تحديث الحالة
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCall && <CallStatusDialog open={dialogOpen} onOpenChange={handleDialogOpenChange} callData={selectedCall} onStatusUpdate={handleStatusUpdate} />}

      <FloatingActionButton icon={Phone} label="Make quick call" onClick={handleQuickCall} position="bottom-right" />
    </div>;
};
export default CallCenter;