import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneIncoming, PhoneMissed } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { CallCenterForm } from "@/components/CallCenterForm";
import { CallCenterRecentList } from "@/components/CallCenterRecentList";
import { FloatingActionButton } from "@/components/FloatingActionButton";
import { toast } from "sonner";

const CallCenter = () => {
  const [recentCalls, setRecentCalls] = useState<Array<{
    name: string;
    phone: string;
    appointment: string;
    status: string;
    notes?: string;
    timestamp: string;
  }>>([]);

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
        minute: "2-digit",
      }),
    };
    setRecentCalls((prev) => [newCall, ...prev].slice(0, 10));
  };
  const callLogs = [{
    id: 1,
    caller: "Ahmed Hassan",
    type: "inbound",
    duration: "5:32",
    status: "completed",
    time: "10:30 AM"
  }, {
    id: 2,
    caller: "Sara Mohammed",
    type: "outbound",
    duration: "3:45",
    status: "completed",
    time: "10:15 AM"
  }, {
    id: 3,
    caller: "Khaled Ali",
    type: "inbound",
    duration: "0:00",
    status: "missed",
    time: "09:58 AM"
  }, {
    id: 4,
    caller: "Fatima Omar",
    type: "outbound",
    duration: "8:12",
    status: "completed",
    time: "09:45 AM"
  }, {
    id: 5,
    caller: "Ibrahim Mahmoud",
    type: "inbound",
    duration: "6:28",
    status: "completed",
    time: "09:30 AM"
  }];
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground";
      case "missed":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };
  const getTypeIcon = (type: string) => {
    return type === "inbound" ? PhoneIncoming : PhoneCall;
  };

  const handleQuickCall = () => {
    toast.success("Quick call initiated", {
      description: "Opening call interface...",
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

      <CallCenterForm onCallAdded={handleCallAdded} />

      <CallCenterRecentList calls={recentCalls} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Call Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Caller</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {callLogs.map(call => {
              const TypeIcon = getTypeIcon(call.type);
              return <TableRow key={call.id}>
                    <TableCell className="font-medium">{call.caller}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="capitalize">{call.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{call.duration}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(call.status)}>
                        {call.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{call.time}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>;
            })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <FloatingActionButton
        icon={Phone}
        label="Make quick call"
        onClick={handleQuickCall}
        position="bottom-right"
      />
    </div>;
};
export default CallCenter;