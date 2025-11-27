import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneIncoming, PhoneMissed, Loader2 } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { CallCenterForm } from "@/components/CallCenterForm";
import { CallCenterRecentList } from "@/components/CallCenterRecentList";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { CustomerSearch } from "@/components/CustomerSearch";
import { toast } from "sonner";
import { useImportedCalls, ImportedCall } from "@/hooks/useImportedCalls";
import { CallStatusDialog } from "@/components/CallStatusDialog";
const CallCenter = () => {
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
    updateCallStatus
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
  const handleStatusUpdate = (status: "contacted" | "no-answer" | "wrong-number") => {
    if (selectedCall) {
      updateCallStatus(selectedCall.phone, status);
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
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Call Center</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage customer communications
          </p>
        </div>
        <Button className="gap-2 text-slate-50 text-sm">
          <Phone className="h-4 w-4" />
          Make Call
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Calls Today" value="147" change="+8.3%" trend="up" icon={Phone} />
        <MetricCard title="Answered Calls" value="132" change="+12.5%" trend="up" icon={PhoneIncoming} />
        <MetricCard title="Missed Calls" value="15" change="-3.2%" trend="down" icon={PhoneMissed} />
        <MetricCard title="Avg Duration" value="4:25" change="+5.8%" trend="up" icon={PhoneCall} />
      </div>

      <CustomerSearch />

      <CallCenterForm onCallAdded={handleCallAdded} />

      <CallCenterRecentList calls={recentCalls} />

      <Card>
        <CardHeader>
          <CardTitle>المكالمات   </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div> : error ? <div className="text-center py-8 text-destructive">{error}</div> : importedCalls.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              لا توجد مكالمات مستوردة
            </div> : <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>رقم الهاتف</TableHead>
                  <TableHead>وقت التسجيل</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>إجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {importedCalls.map((call, index) => <TableRow key={`${call.phone}-${index}`} className="cursor-pointer hover:bg-muted/50" onClick={() => handleCallClick(call)}>
                    <TableCell className="font-medium">{call.name}</TableCell>
                    <TableCell>{call.phone}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(call.timestamp).toLocaleString("ar-IQ")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(call.status)}>
                        {getStatusLabel(call.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={e => {
                  e.stopPropagation();
                  handleCallClick(call);
                }}>
                        تحديث الحالة
                      </Button>
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>}
        </CardContent>
      </Card>

      {selectedCall && <CallStatusDialog open={dialogOpen} onOpenChange={setDialogOpen} callData={selectedCall} onStatusUpdate={handleStatusUpdate} />}

      <FloatingActionButton icon={Phone} label="Make quick call" onClick={handleQuickCall} position="bottom-right" />
    </div>;
};
export default CallCenter;