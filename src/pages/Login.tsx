import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import roayaLogo from '@/assets/roaya-logo.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, role, isDataLoaded, getDefaultRoute, signOut } = useAuth();
  const navigate = useNavigate();

  // Clear any stale sessions on component mount
  useEffect(() => {
    const clearStaleSession = async () => {
      const storedSession = localStorage.getItem('sb-xtxxgjrkggnjdbjnjskm-auth-token');
      if (storedSession) {
        try {
          const parsed = JSON.parse(storedSession);
          const expiresAt = parsed?.expires_at;
          if (expiresAt && new Date(expiresAt * 1000) < new Date()) {
            // Session expired, clear it
            localStorage.removeItem('sb-xtxxgjrkggnjdbjnjskm-auth-token');
            await signOut();
          }
        } catch {
          // Invalid session data, clear it
          localStorage.removeItem('sb-xtxxgjrkggnjdbjnjskm-auth-token');
        }
      }
    };
    clearStaleSession();
  }, [signOut]);

  useEffect(() => {
    // Only redirect when user exists AND role data is fully loaded
    if (user && isDataLoaded && role) {
      navigate(getDefaultRoute(), { replace: true });
    }
  }, [user, role, isDataLoaded, navigate, getDefaultRoute]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim()) {
      setError('يرجى إدخال اسم المستخدم');
      return;
    }
    
    if (!password.trim()) {
      setError('يرجى إدخال كلمة المرور');
      return;
    }
    
    setLoading(true);

    const { error: signInError } = await signIn(username.trim(), password.trim());

    if (signInError) {
      // Translate common error messages to Arabic
      let errorMessage = signInError.message;
      if (errorMessage.includes('Incorrect username or password') || 
          errorMessage.includes('Invalid login credentials')) {
        errorMessage = 'اسم المستخدم أو كلمة المرور غير صحيحة';
      } else if (errorMessage.includes('User not found')) {
        errorMessage = 'المستخدم غير موجود';
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        errorMessage = 'خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت';
      }
      setError(errorMessage);
      setLoading(false);
    }
    // Navigation will happen automatically via useEffect when user state changes
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={roayaLogo} alt="Roaya Real Estate" className="h-16 w-auto" />
          </div>
          <CardTitle className="text-2xl">مرحباً بك</CardTitle>
          <CardDescription>
            قم بتسجيل الدخول للوصول إلى لوحة تحكم رؤيا العقارية
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">اسم المستخدم</Label>
              <Input
                id="username"
                type="text"
                placeholder="أدخل اسم المستخدم"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="text-right"
                autoComplete="username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                placeholder="أدخل كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="text-right"
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;