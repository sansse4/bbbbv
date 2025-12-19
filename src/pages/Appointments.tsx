import { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Plus, Edit, Trash2, CalendarDays, List, LayoutGrid, Search, FileSpreadsheet, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { AppointmentsCalendar } from "@/components/AppointmentsCalendar";
import { useAppointmentsSheet, SheetAppointment } from "@/hooks/useAppointmentsSheet";

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
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [sheetSearchTerm, setSheetSearchTerm] = useState("");
  const [showSheetResults, setShowSheetResults] = useState(false);
  
  // Google Sheet integration
  const { 
    isLoading: sheetLoading, 
    searchResults: sheetResults, 
    sendToSheet, 
    searchInSheet, 
    fetchFromSheet,
    clearSearchResults 
  } = useAppointmentsSheet();
  
  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [assignedEmployee, setAssignedEmployee] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("scheduled");

  // Fetch appointments with creator info
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

  // Fetch all profiles for displaying names
  const { data: allProfiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, department");
      
      if (error) throw error;
      return data as Profile[];
    }
  });

  // Filter sales employees for assignment
  const salesEmployees = allProfiles.filter(p => p.department === "Sales");

  // Send notification to sales employee
  const sendNotification = async (employeeId: string, appointmentData: { customer_name: string; appointment_date: string; appointment_time: string }) => {
    try {
      await supabase.from("notifications").insert({
        user_id: employeeId,
        title: "موعد جديد",
        message: `تم تعيين موعد جديد لك مع العميل ${appointmentData.customer_name} بتاريخ ${appointmentData.appointment_date} الساعة ${appointmentData.appointment_time}`,
        type: "appointment",
        reference_id: null
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

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
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      
      // Send notification if sales employee is assigned
      if (variables.assigned_sales_employee) {
        await sendNotification(variables.assigned_sales_employee, {
          customer_name: variables.customer_name,
          appointment_date: variables.appointment_date,
          appointment_time: variables.appointment_time
        });
      }
      
      // Send to Google Sheet
      const sheetData: SheetAppointment = {
        customerName: variables.customer_name,
        customerPhone: variables.customer_phone,
        appointmentDate: variables.appointment_date,
        appointmentTime: variables.appointment_time,
        appointmentType: variables.appointment_type || "",
        assignedEmployee: getSalesEmployeeName(variables.assigned_sales_employee),
        status: variables.status,
        notes: variables.notes || "",
        createdBy: getCreatorName(variables.created_by),
        createdAt: new Date().toISOString()
      };
      await sendToSheet(sheetData);
      
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
    onSuccess: async (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      
      // Send notification if sales employee changed
      if (variables.assigned_sales_employee && 
          editingAppointment?.assigned_sales_employee !== variables.assigned_sales_employee) {
        await sendNotification(variables.assigned_sales_employee, {
          customer_name: variables.customer_name || editingAppointment?.customer_name || "",
          appointment_date: variables.appointment_date || editingAppointment?.appointment_date || "",
          appointment_time: variables.appointment_time || editingAppointment?.appointment_time || ""
        });
      }
      
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

  const getCreatorName = (creatorId: string) => {
    const creator = allProfiles.find(p => p.id === creatorId);
    return creator?.full_name || "-";
  };

  // Count appointments by status
  const statusCounts = appointmentStatuses.map(s => ({
    ...s,
    count: appointments.filter(a => a.status === s.value).length
  }));

  // Handle sheet search
  const handleSheetSearch = async () => {
    if (!sheetSearchTerm.trim()) {
      toast({ title: "يرجى إدخال كلمة البحث", variant: "destructive" });
      return;
    }
    await searchInSheet(sheetSearchTerm);
    setShowSheetResults(true);
  };

  const handleFetchAllFromSheet = async () => {
    await fetchFromSheet();
    setShowSheetResults(true);
  };

  // Handle adding new appointment from calendar
  const handleAddNewAppointment = (date: string) => {
    setEditingAppointment(null);
    resetForm();
    setAppointmentDate(date);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">حجز المواعيد</h1>
          <p className="text-muted-foreground">إدارة مواعيد العملاء</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex border rounded-lg p-1">
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="gap-1"
            >
              <LayoutGrid className="h-4 w-4" />
              تقويم
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-1"
            >
              <List className="h-4 w-4" />
              جدول
            </Button>
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

      {/* Google Sheet Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            البحث في جوجل شيت
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="ابحث باسم العميل أو رقم الهاتف..."
                value={sheetSearchTerm}
                onChange={(e) => setSheetSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSheetSearch()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSheetSearch} disabled={sheetLoading} className="gap-2">
                {sheetLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                بحث
              </Button>
              <Button variant="outline" onClick={handleFetchAllFromSheet} disabled={sheetLoading}>
                عرض الكل
              </Button>
              {showSheetResults && (
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowSheetResults(false);
                    clearSearchResults();
                    setSheetSearchTerm("");
                  }}
                >
                  إخفاء
                </Button>
              )}
            </div>
          </div>

          {/* Sheet Search Results */}
          {showSheetResults && (
            <div className="mt-4">
              {sheetLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  جاري البحث...
                </div>
              ) : sheetResults.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  لا توجد نتائج
                </div>
              ) : (
                <div className="overflow-x-auto border rounded-lg">
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
                        <TableHead>تم الحجز بواسطة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sheetResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{result.customerName}</TableCell>
                          <TableCell>{result.customerPhone}</TableCell>
                          <TableCell>{result.appointmentDate}</TableCell>
                          <TableCell>{result.appointmentTime}</TableCell>
                          <TableCell>{result.appointmentType || "-"}</TableCell>
                          <TableCell>{result.assignedEmployee || "-"}</TableCell>
                          <TableCell>{result.status}</TableCell>
                          <TableCell className="text-muted-foreground">{result.createdBy}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Calendar or Table View */}
      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            جاري التحميل...
          </CardContent>
        </Card>
      ) : viewMode === "calendar" ? (
        <AppointmentsCalendar
          appointments={appointments}
          onSelectAppointment={handleEdit}
          onAddNewAppointment={handleAddNewAppointment}
          getSalesEmployeeName={getSalesEmployeeName}
          getCreatorName={getCreatorName}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              قائمة المواعيد
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
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
                      <TableHead>تم الحجز بواسطة</TableHead>
                      <TableHead>موظف المبيعات المعين</TableHead>
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
                        <TableCell className="text-muted-foreground">{getCreatorName(appointment.created_by)}</TableCell>
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
      )}
    </div>
  );
}
