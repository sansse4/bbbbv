import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Users, Phone, MapPin, Calendar, RefreshCw } from "lucide-react";

interface Lead {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  profession: string | null;
  family_members: number | null;
  house_category: string | null;
  house_number: string | null;
  source: string | null;
  status: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "قيد الانتظار", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
  { value: "contacted", label: "تم التواصل", color: "bg-blue-500/20 text-blue-700 dark:text-blue-400" },
  { value: "meeting_scheduled", label: "تم جدولة موعد", color: "bg-purple-500/20 text-purple-700 dark:text-purple-400" },
  { value: "converted", label: "تم التحويل", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
  { value: "lost", label: "خسارة", color: "bg-red-500/20 text-red-700 dark:text-red-400" },
];

export const LeadsTracker = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("assigned_to", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error("فشل في تحميل العملاء المحتملين");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [user]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;

      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
      
      const statusLabel = STATUS_OPTIONS.find(s => s.value === newStatus)?.label;
      toast.success(`تم تحديث الحالة إلى: ${statusLabel}`);
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast.error("فشل في تحديث الحالة");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = STATUS_OPTIONS.find((s) => s.value === status);
    return (
      <Badge className={statusOption?.color || "bg-muted text-muted-foreground"}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            العملاء المحتملين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          العملاء المحتملين ({leads.length})
        </CardTitle>
        <Button variant="outline" size="sm" onClick={fetchLeads}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </CardHeader>
      <CardContent>
        {leads.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا يوجد عملاء محتملين حالياً
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>المصدر</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تغيير الحالة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.customer_name}</TableCell>
                      <TableCell dir="ltr">{lead.customer_phone}</TableCell>
                      <TableCell>{lead.customer_address || "-"}</TableCell>
                      <TableCell>{lead.source || "-"}</TableCell>
                      <TableCell>{formatDate(lead.created_at)}</TableCell>
                      <TableCell>{getStatusBadge(lead.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={lead.status}
                          onValueChange={(value) => handleStatusChange(lead.id, value)}
                          disabled={updatingId === lead.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {leads.map((lead) => (
                <Card key={lead.id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{lead.customer_name}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Phone className="h-3 w-3" />
                        <span dir="ltr">{lead.customer_phone}</span>
                      </div>
                    </div>
                    {getStatusBadge(lead.status)}
                  </div>
                  
                  {lead.customer_address && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3 w-3" />
                      {lead.customer_address}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <Calendar className="h-3 w-3" />
                    {formatDate(lead.created_at)}
                    {lead.source && <span className="mx-2">•</span>}
                    {lead.source}
                  </div>

                  <Select
                    value={lead.status}
                    onValueChange={(value) => handleStatusChange(lead.id, value)}
                    disabled={updatingId === lead.id}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="تغيير الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
