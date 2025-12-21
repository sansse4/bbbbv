-- Allow all authenticated employees to insert appointments
CREATE POLICY "Employees can insert appointments"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = created_by);