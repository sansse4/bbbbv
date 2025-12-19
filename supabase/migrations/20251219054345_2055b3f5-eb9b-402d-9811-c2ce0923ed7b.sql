-- Create appointments table
CREATE TABLE public.appointments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    appointment_type TEXT,
    assigned_sales_employee UUID REFERENCES public.profiles(id),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can view all appointments"
ON public.appointments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert appointments"
ON public.appointments FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update appointments"
ON public.appointments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete appointments"
ON public.appointments FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Call center employees can manage appointments
CREATE POLICY "Call center can view appointments"
ON public.appointments FOR SELECT
USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.department = 'Call Center'::department_type
));

CREATE POLICY "Call center can insert appointments"
ON public.appointments FOR INSERT
WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.department = 'Call Center'::department_type
    )
);

CREATE POLICY "Call center can update own appointments"
ON public.appointments FOR UPDATE
USING (
    created_by = auth.uid() AND
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.department = 'Call Center'::department_type
    )
);

-- Sales employees can view their assigned appointments
CREATE POLICY "Sales can view assigned appointments"
ON public.appointments FOR SELECT
USING (assigned_sales_employee = auth.uid());

-- Create index for performance
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_created_by ON public.appointments(created_by);
CREATE INDEX idx_appointments_assigned ON public.appointments(assigned_sales_employee);