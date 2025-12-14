-- Add reservation expiry field for 48-hour temporary hold
ALTER TABLE public.units 
ADD COLUMN reservation_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add index for quick lookup of expiring reservations
CREATE INDEX idx_units_reservation_expires ON public.units(reservation_expires_at) WHERE reservation_expires_at IS NOT NULL;