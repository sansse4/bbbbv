-- Add admin policies for call_center_interactions table
-- Admins should have full access to all call center interactions

-- Allow admins to view all interactions
CREATE POLICY "Admins can view all interactions"
ON public.call_center_interactions
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to insert interactions
CREATE POLICY "Admins can insert interactions"
ON public.call_center_interactions
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to update all interactions
CREATE POLICY "Admins can update all interactions"
ON public.call_center_interactions
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete interactions
CREATE POLICY "Admins can delete interactions"
ON public.call_center_interactions
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));