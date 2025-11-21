-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create table for call center interactions
CREATE TABLE public.call_center_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  appointment_date DATE,
  appointment_time TEXT,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.call_center_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for call center employees
CREATE POLICY "Call center employees can view all interactions"
ON public.call_center_interactions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.department = 'Call Center'
  )
);

CREATE POLICY "Call center employees can insert interactions"
ON public.call_center_interactions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.department = 'Call Center'
  )
);

CREATE POLICY "Call center employees can update their own interactions"
ON public.call_center_interactions
FOR UPDATE
TO authenticated
USING (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.department = 'Call Center'
  )
);

-- Create indexes for faster searching
CREATE INDEX idx_call_center_customer_name ON public.call_center_interactions(customer_name);
CREATE INDEX idx_call_center_customer_phone ON public.call_center_interactions(customer_phone);
CREATE INDEX idx_call_center_created_at ON public.call_center_interactions(created_at DESC);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_call_center_interactions_updated_at
BEFORE UPDATE ON public.call_center_interactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();