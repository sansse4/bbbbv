import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmployeeHeader } from '@/components/EmployeeHeader';
import { AttendanceSection } from '@/components/AttendanceSection';
import { SalesSection } from '@/components/SalesSection';

interface EmployeeData {
  id: string;
  full_name: string;
  username: string;
  department: string | null;
  created_at: string;
  role: string;
}

export default function EmployeeProfile() {
  const { employeeId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<EmployeeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  });

  useEffect(() => {
    if (!employeeId) return;

    // Check access permissions
    if (role?.role !== 'admin' && user?.id !== employeeId) {
      toast({
        variant: 'destructive',
        title: 'غير مصرح',
        description: 'لا يمكنك عرض ملف موظف آخر'
      });
      navigate(`/employees/${user?.id}`);
      return;
    }

    fetchEmployeeData();
  }, [employeeId, user, role]);

  const fetchEmployeeData = async () => {
    if (!employeeId) return;

    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (profileError) throw profileError;

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', employeeId)
        .single();

      if (roleError) throw roleError;

      setEmployee({
        ...profileData,
        role: roleData.role
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'خطأ',
        description: error.message || 'فشل في جلب بيانات الموظف'
      });
    } finally {
      setLoading(false);
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

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">لم يتم العثور على الموظف</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/employees')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          العودة للقائمة
        </Button>
      </div>

      <EmployeeHeader employee={employee} />

      <Tabs defaultValue="attendance" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="attendance">
            <Calendar className="h-4 w-4 mr-2" />
            الحضور والغياب
          </TabsTrigger>
          <TabsTrigger value="sales">
            <TrendingUp className="h-4 w-4 mr-2" />
            أداء المبيعات
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="mt-6">
          <AttendanceSection 
            employeeId={employee.id} 
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </TabsContent>

        <TabsContent value="sales" className="mt-6">
          <SalesSection 
            employeeId={employee.id}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
