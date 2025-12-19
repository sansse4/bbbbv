-- Add column to track if reminder was sent
ALTER TABLE public.appointments 
ADD COLUMN reminder_sent boolean DEFAULT false;

-- Add index for efficient querying
CREATE INDEX idx_appointments_reminder ON public.appointments (appointment_date, appointment_time, reminder_sent) 
WHERE reminder_sent = false;