-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Call center employees can view all interactions" ON public.call_center_interactions;

-- Create new policy that restricts employees to their own interactions
CREATE POLICY "Call center employees can view own interactions" 
ON public.call_center_interactions 
FOR SELECT 
USING (
  created_by = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.department = 'Call Center'::department_type
  )
);