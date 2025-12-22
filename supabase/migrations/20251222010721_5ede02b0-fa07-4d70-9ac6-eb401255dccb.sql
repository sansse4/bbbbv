-- Create trigger function to notify admin when appointment is created
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_appointment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_record RECORD;
BEGIN
  -- Notify all admins about the new appointment
  FOR admin_record IN 
    SELECT p.id 
    FROM public.profiles p
    JOIN public.user_roles r ON p.id = r.user_id
    WHERE r.role = 'admin'
  LOOP
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      reference_id
    ) VALUES (
      admin_record.id,
      'حجز موعد جديد',
      'تم حجز موعد جديد للعميل: ' || NEW.customer_name || ' بتاريخ ' || NEW.appointment_date || ' الساعة ' || NEW.appointment_time,
      'appointment',
      NEW.id
    );
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger to call the function on new appointment
DROP TRIGGER IF EXISTS notify_admin_appointment_trigger ON public.appointments;
CREATE TRIGGER notify_admin_appointment_trigger
AFTER INSERT ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.notify_admin_on_new_appointment();