import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Employee {
  id: string;
  full_name: string;
  username: string;
  department: string | null;
  role: string;
  created_at: string;
}

export default function Employees() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profilesError) throw profilesError;

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const rolesMap = new Map(rolesData.map(r => [r.user_id, r.role]));

      const employeesWithRoles = profilesData.map(profile => ({
        ...profile,
        role: rolesMap.get(profile.id) || 'employee'
      }));

      setEmployees(employeesWithRoles);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch employees'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (employeeId: string) => {
    navigate(`/employees/${employeeId}`);
  };

  const getDepartmentColor = (dept: string | null) => {
    if (!dept) return 'secondary';
    const colors: Record<string, string> = {
      'Sales': 'default',
      'Call Center': 'secondary',
      'Media': 'outline',
      'Reception': 'outline',
      'Contract Registration': 'secondary',
      'Growth Analytics': 'default'
    };
    return colors[dept] || 'secondary';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">الموظفون</h1>
          <p className="text-muted-foreground mt-1">
            إدارة بيانات الموظفين والأداء
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead className="text-center">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.full_name}</TableCell>
                  <TableCell>{employee.username}</TableCell>
                  <TableCell>
                    {employee.department ? (
                      <Badge variant={getDepartmentColor(employee.department) as any}>
                        {employee.department}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'}>
                      {employee.role === 'admin' ? 'مدير' : 'موظف'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(employee.created_at).toLocaleDateString('ar-EG')}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewProfile(employee.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      عرض الملف
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
