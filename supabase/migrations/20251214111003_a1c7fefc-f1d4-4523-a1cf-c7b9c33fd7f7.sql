
-- Create enum for unit status
CREATE TYPE public.unit_status AS ENUM ('available', 'reserved', 'sold');

-- Create units table for compound map
CREATE TABLE public.units (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  unit_number INTEGER NOT NULL UNIQUE,
  block_number INTEGER NOT NULL,
  area_m2 NUMERIC NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  status unit_status NOT NULL DEFAULT 'available',
  buyer_name TEXT,
  buyer_phone TEXT,
  sales_employee TEXT,
  accountant_name TEXT,
  notes TEXT,
  is_residential BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_units_block_number ON public.units(block_number);
CREATE INDEX idx_units_status ON public.units(status);
CREATE INDEX idx_units_unit_number ON public.units(unit_number);

-- Enable Row Level Security
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;

-- RLS Policies for units table
-- Everyone authenticated can view basic unit info
CREATE POLICY "Authenticated users can view units"
ON public.units
FOR SELECT
TO authenticated
USING (true);

-- Only admins can insert units
CREATE POLICY "Admins can insert units"
ON public.units
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can update units
CREATE POLICY "Admins can update units"
ON public.units
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete units
CREATE POLICY "Admins can delete units"
ON public.units
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_units_updated_at
BEFORE UPDATE ON public.units
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the 536 units based on the block structure from the masterplan
-- Block 1: Units 1-22 (22 units) - 250m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(1, 22), 1, 250, 0, 'available';

-- Block 2: Units 23-48 (26 units) - 300m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(23, 48), 2, 300, 0, 'available';

-- Block 3: Units 49-76 (28 units) - 220m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(49, 76), 3, 220, 0, 'available';

-- Block 4: Units 77-107 (31 units) - 200m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(77, 107), 4, 200, 0, 'available';

-- Block 5: Units 108-140 (33 units) - 220m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(108, 140), 5, 220, 0, 'available';

-- Block 6: Units 141-174 (34 units) - 215m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(141, 174), 6, 215, 0, 'available';

-- Block 7: Units 175-207 (33 units) - 225m² (average)
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(175, 207), 7, 225, 0, 'available';

-- Block 8: Units 208-235 (28 units) - 250m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(208, 235), 8, 250, 0, 'available';

-- Block 9: Units 236-269 (34 units) - 200m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(236, 269), 9, 200, 0, 'available';

-- Block 10: Units 270-285 (16 units) - 220m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(270, 285), 10, 220, 0, 'available';

-- Block 11: Units 286-301 (16 units) - 200m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(286, 301), 11, 200, 0, 'available';

-- Block 12: Units 302-333 (32 units) - 220m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(302, 333), 12, 220, 0, 'available';

-- Block 13: Units 334-355 (22 units) - 215m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(334, 355), 13, 215, 0, 'available';

-- Block 14: Units 356-385 (30 units) - 268m² (average of 225-311)
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(356, 385), 14, 268, 0, 'available';

-- Block 15: Units 386-407 (22 units) - 250m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(386, 407), 15, 250, 0, 'available';

-- Block 16: Units 408-431 (24 units) - 200m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(408, 431), 16, 200, 0, 'available';

-- Block 17: Units 432-455 (24 units) - 220m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(432, 455), 17, 220, 0, 'available';

-- Block 18: Units 456-469 (14 units) - 200m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(456, 469), 18, 200, 0, 'available';

-- Block 19: Units 470-483 (14 units) - 220m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(470, 483), 19, 220, 0, 'available';

-- Block 20: Units 484-507 (24 units) - 215m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(484, 507), 20, 215, 0, 'available';

-- Block 21: Units 508-537 (30 units) - 225m²
INSERT INTO public.units (unit_number, block_number, area_m2, price, status)
SELECT generate_series(508, 537), 21, 225, 0, 'available';
