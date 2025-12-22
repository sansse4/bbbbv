import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, User, Phone, ChevronLeft } from "lucide-react";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string | null;
  status: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  scheduled: { label: "مجدول", color: "bg-blue-500" },
  confirmed: { label: "مؤكد", color: "bg-green-500" },
  completed: { label: "مكتمل", color: "bg-gray-500" },
  cancelled: { label: "ملغي", color: "bg-red-500" },
  no_show: { label: "لم يحضر", color: "bg-yellow-500" },
};

export function DashboardAppointmentsList() {
  const navigate = useNavigate();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["dashboard-appointments"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("appointments")
        .select("id, customer_name, customer_phone, appointment_date, appointment_time, appointment_type, status")
        .gte("appointment_date", today)
        .in("status", ["scheduled", "confirmed"])
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true })
        .limit(10);

      if (error) throw error;
      return data as Appointment[];
    },
  });

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "اليوم";
    if (isTomorrow(date)) return "غداً";
    return format(date, "EEEE dd MMM", { locale: ar });
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: status, color: "bg-gray-500" };
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          المواعيد القادمة
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/appointments")}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          عرض الكل
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p>لا توجد مواعيد قادمة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors cursor-pointer"
                onClick={() => navigate("/appointments")}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium truncate">{appointment.customer_name}</span>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getDateLabel(appointment.appointment_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {appointment.appointment_time}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {appointment.customer_phone}
                    </span>
                  </div>
                  {appointment.appointment_type && (
                    <span className="text-xs text-muted-foreground mt-1 block">
                      {appointment.appointment_type}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
