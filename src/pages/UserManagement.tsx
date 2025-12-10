import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, KeyRound, Building2 } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = {
  id: string;
  username: string;
  full_name: string;
  department: Database['public']['Enums']['department_type'] | null;
  role: Database['public']['Enums']['app_role'] | null;
  supervised_departments?: Database['public']['Enums']['department_type'][];
};

const departments: Database['public']['Enums']['department_type'][] = [
  'Media',
  'Sales',
  'Call Center',
  'Contract Registration',
  'Growth Analytics',
  'Reception',
];

const departmentLabels: Record<Database['public']['Enums']['department_type'], string> = {
  'Media': 'الإعلام',
  'Sales': 'المبيعات',
  'Call Center': 'مركز الاتصال',
  'Contract Registration': 'تسجيل العقود',
  'Growth Analytics': 'تحليلات النمو',
  'Reception': 'الاستقبال',
};

export default function UserManagement() {
  const { role } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDepartmentsDialogOpen, setIsDepartmentsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<Database['public']['Enums']['department_type'][]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    full_name: '',
    department: '' as Database['public']['Enums']['department_type'] | '',
    role: 'employee' as Database['public']['Enums']['app_role'],
  });

  const isAdmin = role?.role === 'admin';
  const isAssistantManager = role?.role === 'assistant_manager';

  useEffect(() => {
    if (isAdmin || isAssistantManager) {
      fetchUsers();
    }
  }, [role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Fetch supervised departments for assistant managers
      const { data: supervisedDepts, error: supervisedError } = await supabase
        .from('assistant_manager_departments')
        .select('*');

      if (supervisedError && supervisedError.code !== 'PGRST116') {
        console.error('Error fetching supervised departments:', supervisedError);
      }

      const usersWithRoles = profiles?.map(profile => {
        const userRole = roles?.find(r => r.user_id === profile.id)?.role || null;
        const userSupervisedDepts = supervisedDepts
          ?.filter(d => d.user_id === profile.id)
          .map(d => d.department) || [];
        
        return {
          ...profile,
          role: userRole,
          supervised_departments: userSupervisedDepts,
        };
      }) || [];

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.functions.invoke('seed-demo-users', {
        body: {
          users: [{
            email: formData.email,
            password: formData.password,
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role,
            department: formData.department || null,
          }],
        },
      });

      if (error) throw error;

      toast({
        title: 'نجاح',
        description: 'تم إنشاء المستخدم بنجاح',
      });

      setIsAddDialogOpen(false);
      setFormData({
        email: '',
        password: '',
        username: '',
        full_name: '',
        department: '',
        role: 'employee',
      });
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
          department: formData.department || null,
        })
        .eq('id', selectedUser.id);

      if (profileError) throw profileError;

      // Only admin can change roles
      if (isAdmin) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', selectedUser.id);

        if (roleError) throw roleError;
      }

      toast({
        title: 'نجاح',
        description: 'تم تحديث بيانات المستخدم بنجاح',
      });

      setIsEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setFormData({
      email: '',
      password: '',
      username: user.username,
      full_name: user.full_name,
      department: user.department || '',
      role: user.role || 'employee',
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const openPasswordDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordDialogOpen(true);
  };

  const openDepartmentsDialog = (user: UserProfile) => {
    setSelectedUser(user);
    setSelectedDepartments(user.supervised_departments || []);
    setIsDepartmentsDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      toast({
        title: 'خطأ',
        description: 'كلمة السر يجب أن تكون 6 أحرف على الأقل',
        variant: 'destructive',
      });
      return;
    }

    setPasswordLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: { userId: selectedUser.id, newPassword },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: 'نجاح',
        description: 'تم تغيير كلمة السر بنجاح',
      });

      setIsPasswordDialogOpen(false);
      setSelectedUser(null);
      setNewPassword('');
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSaveDepartments = async () => {
    if (!selectedUser) return;

    setDepartmentsLoading(true);
    try {
      // First, delete all existing department assignments for this user
      const { error: deleteError } = await supabase
        .from('assistant_manager_departments')
        .delete()
        .eq('user_id', selectedUser.id);

      if (deleteError) throw deleteError;

      // Then, insert the new department assignments
      if (selectedDepartments.length > 0) {
        const { error: insertError } = await supabase
          .from('assistant_manager_departments')
          .insert(
            selectedDepartments.map(dept => ({
              user_id: selectedUser.id,
              department: dept,
            }))
          );

        if (insertError) throw insertError;
      }

      toast({
        title: 'نجاح',
        description: 'تم تحديث الأقسام المشرف عليها بنجاح',
      });

      setIsDepartmentsDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const toggleDepartment = (dept: Database['public']['Enums']['department_type']) => {
    setSelectedDepartments(prev => 
      prev.includes(dept) 
        ? prev.filter(d => d !== dept)
        : [...prev, dept]
    );
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { userId: selectedUser.id },
      });

      if (error) throw error;

      toast({
        title: 'نجاح',
        description: 'تم حذف المستخدم بنجاح',
      });

      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        title: 'خطأ',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin && !isAssistantManager) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">غير مصرح بالوصول. للمدراء فقط.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>إدارة المستخدمين</CardTitle>
              <CardDescription>إدارة حسابات الموظفين والأدوار والأقسام</CardDescription>
            </div>
            {isAdmin && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    إضافة مستخدم
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                    <DialogDescription>إنشاء حساب موظف جديد</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddUser} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">كلمة السر</Label>
                      <Input
                        id="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">اسم المستخدم</Label>
                      <Input
                        id="username"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="full_name">الاسم الكامل</Label>
                      <Input
                        id="full_name"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">الدور</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => setFormData({ ...formData, role: value as Database['public']['Enums']['app_role'] })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">موظف</SelectItem>
                          <SelectItem value="assistant_manager">مساعد مدير</SelectItem>
                          <SelectItem value="admin">مدير</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">القسم</Label>
                      <Select
                        value={formData.department}
                        onValueChange={(value) => setFormData({ ...formData, department: value as Database['public']['Enums']['department_type'] })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر القسم" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {departmentLabels[dept]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button type="submit" className="w-full">إنشاء المستخدم</Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>اسم المستخدم</TableHead>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>الأقسام المشرف عليها</TableHead>
                  <TableHead>الدور</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.department ? departmentLabels[user.department] : '-'}</TableCell>
                    <TableCell>
                      {user.role === 'assistant_manager' && user.supervised_departments && user.supervised_departments.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.supervised_departments.map((dept) => (
                            <span 
                              key={dept} 
                              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600"
                            >
                              {departmentLabels[dept]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-primary/10 text-primary' 
                          : user.role === 'assistant_manager'
                            ? 'bg-amber-500/10 text-amber-600'
                            : 'bg-secondary text-secondary-foreground'
                      }`}>
                        {user.role === 'admin' ? 'مدير' : user.role === 'assistant_manager' ? 'مساعد مدير' : 'موظف'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(user)}
                          title="تعديل"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {isAdmin && user.role === 'assistant_manager' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDepartmentsDialog(user)}
                            title="إدارة الأقسام"
                          >
                            <Building2 className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPasswordDialog(user)}
                            title="تغيير كلمة السر"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                        )}
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(user)}
                            title="حذف"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تعديل المستخدم</DialogTitle>
            <DialogDescription>تحديث بيانات المستخدم</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit_username">اسم المستخدم</Label>
              <Input
                id="edit_username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_full_name">الاسم الكامل</Label>
              <Input
                id="edit_full_name"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>
            {isAdmin && (
              <div className="space-y-2">
                <Label htmlFor="edit_role">الدور</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value as Database['public']['Enums']['app_role'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="assistant_manager">مساعد مدير</SelectItem>
                    <SelectItem value="admin">مدير</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit_department">القسم</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => setFormData({ ...formData, department: value as Database['public']['Enums']['department_type'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {departmentLabels[dept]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">تحديث المستخدم</Button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف حساب المستخدم {selectedUser?.full_name} ({selectedUser?.username}) بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تغيير كلمة السر</DialogTitle>
            <DialogDescription>
              تغيير كلمة السر للمستخدم: {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">كلمة السر الجديدة</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="أدخل كلمة السر الجديدة"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">يجب أن تكون كلمة السر 6 أحرف على الأقل</p>
            </div>
            <Button 
              onClick={handleChangePassword} 
              className="w-full"
              disabled={passwordLoading || !newPassword || newPassword.length < 6}
            >
              {passwordLoading ? 'جاري التحديث...' : 'تحديث كلمة السر'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Departments Management Dialog */}
      <Dialog open={isDepartmentsDialogOpen} onOpenChange={setIsDepartmentsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>إدارة الأقسام المشرف عليها</DialogTitle>
            <DialogDescription>
              اختر الأقسام التي يشرف عليها: {selectedUser?.full_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              {departments.map((dept) => (
                <div key={dept} className="flex items-center space-x-3 space-x-reverse">
                  <Checkbox
                    id={`dept-${dept}`}
                    checked={selectedDepartments.includes(dept)}
                    onCheckedChange={() => toggleDepartment(dept)}
                  />
                  <Label 
                    htmlFor={`dept-${dept}`} 
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {departmentLabels[dept]}
                  </Label>
                </div>
              ))}
            </div>
            <Button 
              onClick={handleSaveDepartments} 
              className="w-full"
              disabled={departmentsLoading}
            >
              {departmentsLoading ? 'جاري الحفظ...' : 'حفظ الأقسام'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
