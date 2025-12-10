import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  LogIn,
  LogOut,
  User
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  check_in: string | null;
  check_out: string | null;
  notes: string | null;
}

interface AttendanceStats {
  present: number;
  absent: number;
  late: number;
  onLeave: number;
}

export default function MyDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [todayAttendance, setTodayAttendance] = useState<AttendanceRecord | null>(null);
  const [monthlyRecords, setMonthlyRecords] = useState<AttendanceRecord[]>([]);
  const [stats, setStats] = useState<AttendanceStats>({ present: 0, absent: 0, late: 0, onLeave: 0 });
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user?.id) {
      fetchAttendanceData();
    }
  }, [user?.id]);

  const fetchAttendanceData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date();

      // Fetch today's attendance
      const { data: todayData, error: todayError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (todayError) throw todayError;
      setTodayAttendance(todayData);

      // Fetch monthly records
      const { data: monthData, error: monthError } = await supabase
        .from('attendance')
        .select('*')
        .eq('employee_id', user.id)
        .gte('date', format(startOfMonth, 'yyyy-MM-dd'))
        .lte('date', format(endOfMonth, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (monthError) throw monthError;
      setMonthlyRecords(monthData || []);

      // Calculate stats
      const presentCount = monthData?.filter(r => r.status === 'present').length || 0;
      const absentCount = monthData?.filter(r => r.status === 'absent').length || 0;
      const lateCount = monthData?.filter(r => r.status === 'late').length || 0;
      const leaveCount = monthData?.filter(r => r.status === 'on_leave').length || 0;

      setStats({
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        onLeave: leaveCount
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل في جلب بيانات الحضور'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!user?.id) return;

    try {
      setCheckingIn(true);
      const currentTime = format(new Date(), 'HH:mm:ss');

      if (todayAttendance) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ 
            check_in: currentTime,
            status: 'present'
          })
          .eq('id', todayAttendance.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('attendance')
          .insert({
            employee_id: user.id,
            date: today,
            check_in: currentTime,
            status: 'present'
          });

        if (error) throw error;
      }

      toast({
        title: 'تم تسجيل الحضور',
        description: `تم تسجيل دخولك في ${currentTime}`
      });

      fetchAttendanceData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل في تسجيل الحضور'
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user?.id || !todayAttendance) return;

    try {
      setCheckingOut(true);
      const currentTime = format(new Date(), 'HH:mm:ss');

      const { error } = await supabase
        .from('attendance')
        .update({ check_out: currentTime })
        .eq('id', todayAttendance.id);

      if (error) throw error;

      toast({
        title: 'تم تسجيل الانصراف',
        description: `تم تسجيل خروجك في ${currentTime}`
      });

      fetchAttendanceData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل في تسجيل الانصراف'
      });
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'on_leave': return <Calendar className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'present': return 'حاضر';
      case 'absent': return 'غائب';
      case 'late': return 'متأخر';
      case 'on_leave': return 'إجازة';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'present': return 'default';
      case 'absent': return 'destructive';
      case 'late': return 'secondary';
      case 'on_leave': return 'outline';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">مرحباً، {profile?.full_name}</h1>
          <p className="text-muted-foreground">
            {format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar })}
          </p>
        </div>
      </div>

      {/* Today's Attendance Card */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            حضور اليوم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-6 text-center md:text-right">
              <div>
                <p className="text-sm text-muted-foreground">وقت الدخول</p>
                <p className="text-xl font-bold">
                  {todayAttendance?.check_in || '---'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">وقت الخروج</p>
                <p className="text-xl font-bold">
                  {todayAttendance?.check_out || '---'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                {todayAttendance ? (
                  <Badge variant={getStatusVariant(todayAttendance.status) as any}>
                    {getStatusLabel(todayAttendance.status)}
                  </Badge>
                ) : (
                  <Badge variant="secondary">لم يسجل بعد</Badge>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleCheckIn}
                disabled={checkingIn || !!todayAttendance?.check_in}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                {checkingIn ? 'جاري التسجيل...' : 'تسجيل الدخول'}
              </Button>
              <Button
                variant="outline"
                onClick={handleCheckOut}
                disabled={checkingOut || !todayAttendance?.check_in || !!todayAttendance?.check_out}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                {checkingOut ? 'جاري التسجيل...' : 'تسجيل الخروج'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.present}</p>
                <p className="text-sm text-muted-foreground">أيام الحضور</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.absent}</p>
                <p className="text-sm text-muted-foreground">أيام الغياب</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.late}</p>
                <p className="text-sm text-muted-foreground">أيام التأخر</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onLeave}</p>
                <p className="text-sm text-muted-foreground">أيام الإجازة</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            سجل الحضور الشهري
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyRecords.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              لا توجد سجلات حضور هذا الشهر
            </p>
          ) : (
            <div className="space-y-3">
              {monthlyRecords.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div>
                      <p className="font-medium">
                        {format(new Date(record.date), 'EEEE، d MMMM', { locale: ar })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {record.check_in && `دخول: ${record.check_in}`}
                        {record.check_in && record.check_out && ' - '}
                        {record.check_out && `خروج: ${record.check_out}`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(record.status) as any}>
                    {getStatusLabel(record.status)}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
