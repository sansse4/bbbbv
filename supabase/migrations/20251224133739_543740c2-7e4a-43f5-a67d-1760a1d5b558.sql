-- Drop existing restrictive INSERT policies on appointments
DROP POLICY IF EXISTS "Admins can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Call center can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Employees can insert appointments" ON public.appointments;

-- Create new PERMISSIVE INSERT policies (any ONE policy passing allows the action)
CREATE POLICY "Admins can insert appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Call center can insert appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (
  (auth.uid() = created_by) 
  AND (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.department = 'Call Center'::department_type
  ))
);

CREATE POLICY "Employees can insert appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = created_by);