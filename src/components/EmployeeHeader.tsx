import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Briefcase, Calendar } from 'lucide-react';

interface EmployeeHeaderProps {
  employee: {
    id: string;
    full_name: string;
    username: string;
    department: string | null;
    created_at: string;
    role: string;
  };
}

export function EmployeeHeader({ employee }: EmployeeHeaderProps) {
  const initials = employee.full_name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div>
              <h1 className="text-3xl font-bold">{employee.full_name}</h1>
              <p className="text-muted-foreground mt-1">@{employee.username}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {employee.department && (
                <Badge variant="secondary" className="gap-1">
                  <Briefcase className="h-3 w-3" />
                  {employee.department}
                </Badge>
              )}
              
              <Badge variant={employee.role === 'admin' ? 'default' : 'outline'} className="gap-1">
                <User className="h-3 w-3" />
                {employee.role === 'admin' ? 'مدير' : 'موظف'}
              </Badge>

              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3" />
                انضم في {new Date(employee.created_at).toLocaleDateString('ar-EG', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
