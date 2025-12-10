-- Add policy to allow employees to insert their own attendance
CREATE POLICY "Employees can insert their own attendance" 
ON public.attendance 
FOR INSERT 
WITH CHECK (auth.uid() = employee_id);

-- Add policy to allow employees to update their own attendance
CREATE POLICY "Employees can update their own attendance" 
ON public.attendance 
FOR UPDATE 
USING (auth.uid() = employee_id);