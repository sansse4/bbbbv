import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ar } from "date-fns/locale";

interface Appointment {
  id: string;
  customer_name: string;
  customer_phone: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string | null;
  assigned_sales_employee: string | null;
  notes: string | null;
  status: string;
  created_by: string;
  created_at: string;
}

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  getSalesEmployeeName: (id: string | null) => string;
  getCreatorName: (id: string) => string;
}

const statusColors: Record<string, string> = {
  scheduled: "bg-blue-500",
  confirmed: "bg-green-500",
  completed: "bg-gray-500",
  cancelled: "bg-red-500",
  no_show: "bg-yellow-500"
};

const statusLabels: Record<string, string> = {
  scheduled: "مجدول",
  confirmed: "مؤكد",
  completed: "مكتمل",
  cancelled: "ملغي",
  no_show: "لم يحضر"
};

const weekDays = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

export function AppointmentsCalendar({ 
  appointments, 
  onSelectAppointment,
  getSalesEmployeeName,
  getCreatorName
}: AppointmentsCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the starting day of the week for proper alignment
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  // Group appointments by date
  const appointmentsByDate = useMemo(() => {
    const grouped: Record<string, Appointment[]> = {};
    appointments.forEach(apt => {
      const dateKey = apt.appointment_date;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(apt);
    });
    return grouped;
  }, [appointments]);

  const getAppointmentsForDate = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    return appointmentsByDate[dateKey] || [];
  };

  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              التقويم
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <span className="font-semibold min-w-[140px] text-center">
                {format(currentMonth, "MMMM yyyy", { locale: ar })}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Week days header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for alignment */}
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            
            {/* Days */}
            {daysInMonth.map(day => {
              const dayAppointments = getAppointmentsForDate(day);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const hasAppointments = dayAppointments.length > 0;
              
              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square p-1 rounded-lg border transition-all relative
                    ${isSelected ? "border-primary bg-primary/10 ring-2 ring-primary" : "border-transparent hover:bg-muted"}
                    ${isToday(day) ? "bg-accent" : ""}
                    ${!isSameMonth(day, currentMonth) ? "text-muted-foreground/50" : ""}
                  `}
                >
                  <span className={`text-sm ${isToday(day) ? "font-bold" : ""}`}>
                    {format(day, "d")}
                  </span>
                  {hasAppointments && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                      {dayAppointments.slice(0, 3).map((apt, idx) => (
                        <div
                          key={idx}
                          className={`w-1.5 h-1.5 rounded-full ${statusColors[apt.status] || "bg-gray-400"}`}
                        />
                      ))}
                      {dayAppointments.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{dayAppointments.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t">
            {Object.entries(statusLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-full ${statusColors[key]}`} />
                <span className="text-xs text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected date appointments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedDate 
              ? `مواعيد ${format(selectedDate, "dd MMMM yyyy", { locale: ar })}`
              : "اختر يوماً لعرض المواعيد"
            }
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedDate ? (
            <p className="text-muted-foreground text-center py-8">
              اضغط على يوم في التقويم لعرض المواعيد
            </p>
          ) : selectedDateAppointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              لا توجد مواعيد في هذا اليوم
            </p>
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {selectedDateAppointments
                .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time))
                .map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onSelectAppointment(apt)}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{apt.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{apt.appointment_time}</p>
                        {apt.appointment_type && (
                          <p className="text-xs text-muted-foreground mt-1">{apt.appointment_type}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          حجز بواسطة: {getCreatorName(apt.created_by)}
                        </p>
                        {apt.assigned_sales_employee && (
                          <p className="text-xs text-primary mt-1">
                            معين إلى: {getSalesEmployeeName(apt.assigned_sales_employee)}
                          </p>
                        )}
                      </div>
                      <Badge className={`${statusColors[apt.status]} text-white text-xs shrink-0`}>
                        {statusLabels[apt.status] || apt.status}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
