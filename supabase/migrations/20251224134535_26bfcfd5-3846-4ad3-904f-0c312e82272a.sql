-- Add policy to allow all authenticated users to view Sales department profiles
-- This is needed so employees can select sales employees when booking appointments
CREATE POLICY "Authenticated users can view sales profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (department = 'Sales'::department_type);