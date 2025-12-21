-- Create function to notify assigned sales employee on new appointment
CREATE OR REPLACE FUNCTION public.notify_on_new_appointment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only create notification if there's an assigned sales employee
  IF NEW.assigned_sales_employee IS NOT NULL THEN
    INSERT INTO public.notifications (
      user_id,
      title,
      message,
      type,
      reference_id
    ) VALUES (
      NEW.assigned_sales_employee,
      'موعد جديد',
      'تم تعيين موعد جديد لك مع العميل: ' || NEW.customer_name || ' في تاريخ ' || NEW.appointment_date || ' الساعة ' || NEW.appointment_time,
      'appointment',
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for new appointments
CREATE TRIGGER trigger_notify_on_new_appointment
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_on_new_appointment();