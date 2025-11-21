-- Create attendance table
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'on_leave')),
  check_in TIME,
  check_out TIME,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  block_number TEXT NOT NULL,
  house_number TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  remaining_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(12, 2) GENERATED ALWAYS AS (paid_amount + remaining_amount) STORED,
  status TEXT NOT NULL CHECK (status IN ('won', 'pending', 'cancelled')),
  sale_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;

-- Attendance policies
CREATE POLICY "Users can view their own attendance"
ON public.attendance FOR SELECT
USING (auth.uid() = employee_id);

CREATE POLICY "Admins can view all attendance"
ON public.attendance FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert attendance"
ON public.attendance FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update attendance"
ON public.attendance FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete attendance"
ON public.attendance FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Sales policies
CREATE POLICY "Users can view their own sales"
ON public.sales FOR SELECT
USING (auth.uid() = employee_id);

CREATE POLICY "Admins can view all sales"
ON public.sales FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sales employees can insert their own sales"
ON public.sales FOR INSERT
WITH CHECK (
  auth.uid() = employee_id 
  AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND department = 'Sales'
  )
);

CREATE POLICY "Admins can insert sales"
ON public.sales FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sales"
ON public.sales FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sales"
ON public.sales FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_attendance_updated_at
BEFORE UPDATE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_sales_updated_at
BEFORE UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_attendance_employee_date ON public.attendance(employee_id, date DESC);
CREATE INDEX idx_sales_employee_date ON public.sales(employee_id, sale_date DESC);
CREATE INDEX idx_sales_status ON public.sales(status);