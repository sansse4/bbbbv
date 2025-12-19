-- Add reminder_minutes column to appointments table (default 60 minutes = 1 hour)
ALTER TABLE public.appointments 
ADD COLUMN reminder_minutes integer NOT NULL DEFAULT 60;