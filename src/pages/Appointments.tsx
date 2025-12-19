import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, Plus, Edit, Trash2, CalendarDays } from "lucide-react";
import { format } from "date-fns";
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

interface Profile {
  id: string;
  full_name: string;
  department: string | null;
}

const appointmentTypes = [
  "زيارة الموقع",
  "استشارة",
  "متابعة",
  "توقيع عقد",
  "أخرى"
];

const appointmentStatuses = [
  { value: "scheduled", label: "مجدول", color: "bg-blue-500" },
  { value: "confirmed", label: "مؤكد", color: "bg-green-500" },
  { value: "completed", label: "مكتمل", color: "bg-gray-500" },
  { value: "cancelled", label: "ملغي", color: "bg-red-500" },
  { value: "no_show", label: "لم يحضر", color: "bg-yellow-500" }
];

export default function Appointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [assignedEmployee, setAssignedEmployee] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("scheduled");

  // Fetch appointments
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("appointment_date", { ascending: true });
      
      if (error) throw error;
      return data as Appointment[];
    }
  });

  // Fetch sales employees for assignment
  const { data: salesEmployees = [] } = useQuery({
    queryKey: ["sales-employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, department")
        .eq("department", "Sales");
      
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Create appointment mutation
  const createMutation = useMutation({
    mutationFn: async (appointment: Omit<Appointment, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("appointments")
        .insert(appointment)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "تم إضافة الموعد بنجاح" });
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: "خطأ في إضافة الموعد", description: error.message, variant: "destructive" });
    }
  });

  // Update appointment mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, ...appointment }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(appointment)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "تم تحديث الموعد بنجاح" });
      resetForm();
      setIsDialogOpen(false);
      setEditingAppointment(null);
    },
    onError: (error) => {
      toast({ title: "خطأ في تحديث الموعد", description: error.message, variant: "destructive" });
    }
  });

  // Delete appointment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "تم حذف الموعد بنجاح" });
    },
    onError: (error) => {
      toast({ title: "خطأ في حذف الموعد", description: error.message, variant: "destructive" });
    }
  });

  const resetForm = () => {
    setCustomerName("");
    setCustomerPhone("");
    setAppointmentDate("");
    setAppointmentTime("");
    setAppointmentType("");
    setAssignedEmployee("");
    setNotes("");
    setStatus("scheduled");
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setCustomerName(appointment.customer_name);
    setCustomerPhone(appointment.customer_phone);
    setAppointmentDate(appointment.appointment_date);
    setAppointmentTime(appointment.appointment_time);
    setAppointmentType(appointment.appointment_type || "");
    setAssignedEmployee(appointment.assigned_sales_employee || "");
    setNotes(appointment.notes || "");
    setStatus(appointment.status);
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone || !appointmentDate || !appointmentTime) {
      toast({ title: "يرجى ملء جميع الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const appointmentData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      appointment_type: appointmentType || null,
      assigned_sales_employee: assignedEmployee || null,
      notes: notes || null,
      status,
      created_by: user?.id || ""
    };

    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, ...appointmentData });
    } else {
      createMutation.mutate(appointmentData);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = appointmentStatuses.find(s => s.value === status);
    return (
      <Badge className={`${statusConfig?.color || "bg-gray-500"} text-white`}>
        {statusConfig?.label || status}
      </Badge>
    );
  };

  const getSalesEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return "-";
    const employee = salesEmployees.find(e => e.id === employeeId);
    return employee?.full_name || "-";
  };

  // Count appointments by status
  const statusCounts = appointmentStatuses.map(s => ({
    ...s,
    count: appointments.filter(a => a.status === s.value).length
  }));

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">حجز المواعيد</h1>
          <p className="text-muted-foreground">إدارة مواعيد العملاء</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            resetForm();
            setEditingAppointment(null);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              موعد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingAppointment ? "تعديل الموعد" : "إضافة موعد جديد"}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">اسم العميل *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">رقم الهاتف *</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="أدخل رقم الهاتف"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentDate">تاريخ الموعد *</Label>
                  <Input
                    id="appointmentDate"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="appointmentTime">وقت الموعد *</Label>
                  <Input
                    id="appointmentTime"
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="appointmentType">نوع الموعد</Label>
                  <Select value={appointmentType} onValueChange={setAppointmentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الموعد" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointmentStatuses.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedEmployee">موظف المبيعات المسؤول</Label>
                <Select value={assignedEmployee} onValueChange={setAssignedEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر موظف المبيعات" />
                  </SelectTrigger>
                  <SelectContent>
                    {salesEmployees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظات..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingAppointment ? "تحديث" : "إضافة"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {statusCounts.map((status) => (
          <Card key={status.value}>
            <CardContent className="p-4 text-center">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${status.color} text-white mb-2`}>
                <CalendarDays className="h-5 w-5" />
              </div>
              <p className="text-2xl font-bold">{status.count}</p>
              <p className="text-sm text-muted-foreground">{status.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Appointments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            قائمة المواعيد
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا توجد مواعيد</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>موظف المبيعات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell className="font-medium">{appointment.customer_name}</TableCell>
                      <TableCell>
                        <a href={`tel:${appointment.customer_phone}`} className="text-primary hover:underline">
                          {appointment.customer_phone}
                        </a>
                      </TableCell>
                      <TableCell>
                        {format(new Date(appointment.appointment_date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>{appointment.appointment_time}</TableCell>
                      <TableCell>{appointment.appointment_type || "-"}</TableCell>
                      <TableCell>{getSalesEmployeeName(appointment.assigned_sales_employee)}</TableCell>
                      <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (confirm("هل أنت متأكد من حذف هذا الموعد؟")) {
                                deleteMutation.mutate(appointment.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
