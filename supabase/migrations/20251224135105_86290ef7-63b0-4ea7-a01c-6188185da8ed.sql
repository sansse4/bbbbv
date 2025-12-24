-- Drop all existing policies on appointments table
DROP POLICY IF EXISTS "Admins can delete appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "Admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Call center can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Call center can update own appointments" ON public.appointments;
DROP POLICY IF EXISTS "Call center can view appointments" ON public.appointments;
DROP POLICY IF EXISTS "Employees can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Sales can view assigned appointments" ON public.appointments;

-- Create new PERMISSIVE policies for all authenticated users

-- SELECT: All authenticated users can read all appointments
CREATE POLICY "employees_can_read_appointments" 
ON public.appointments 
FOR SELECT 
TO authenticated
USING (true);

-- INSERT: All authenticated users can create appointments
CREATE POLICY "employees_can_insert_appointments" 
ON public.appointments 
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- UPDATE: All authenticated users can update appointments
CREATE POLICY "employees_can_update_appointments" 
ON public.appointments 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- DELETE: All authenticated users can delete appointments
CREATE POLICY "employees_can_delete_appointments" 
ON public.appointments 
FOR DELETE 
TO authenticated
USING (true);