-- Create a table to store assistant manager supervised departments
CREATE TABLE public.assistant_manager_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    department department_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, department)
);

-- Enable RLS
ALTER TABLE public.assistant_manager_departments ENABLE ROW LEVEL SECURITY;

-- Only admins can manage assistant manager departments
CREATE POLICY "Admins can view all assistant manager departments"
ON public.assistant_manager_departments
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert assistant manager departments"
ON public.assistant_manager_departments
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update assistant manager departments"
ON public.assistant_manager_departments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete assistant manager departments"
ON public.assistant_manager_departments
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Assistant managers can view their own assigned departments
CREATE POLICY "Assistant managers can view their own departments"
ON public.assistant_manager_departments
FOR SELECT
USING (auth.uid() = user_id);

-- Create function to check if assistant manager supervises a department
CREATE OR REPLACE FUNCTION public.supervises_department(_user_id uuid, _department department_type)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.assistant_manager_departments
    WHERE user_id = _user_id
    AND department = _department
  )
$$;

-- Update profiles policies to allow assistant managers to view profiles in their supervised departments
CREATE POLICY "Assistant managers can view profiles in their departments"
ON public.profiles
FOR SELECT
USING (
  has_role(auth.uid(), 'assistant_manager'::app_role) 
  AND supervises_department(auth.uid(), department)
);

-- Allow assistant managers to update profiles in their supervised departments (but not delete)
CREATE POLICY "Assistant managers can update profiles in their departments"
ON public.profiles
FOR UPDATE
USING (
  has_role(auth.uid(), 'assistant_manager'::app_role) 
  AND supervises_department(auth.uid(), department)
);