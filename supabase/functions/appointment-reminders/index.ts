import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date and time
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    
    // Get current time in minutes from midnight
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinutes;
    
    console.log(`Checking appointments for reminders on ${currentDate}, current time: ${currentHour}:${currentMinutes}`);

    // Query all today's appointments that haven't had a reminder sent and are not cancelled
    const { data: upcomingAppointments, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("appointment_date", currentDate)
      .eq("reminder_sent", false)
      .neq("status", "cancelled");

    if (fetchError) {
      console.error("Error fetching appointments:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${upcomingAppointments?.length || 0} potential appointments to check`);

    const notifications: any[] = [];
    const appointmentIds: string[] = [];

    // Filter appointments based on their individual reminder_minutes
    const appointmentsToRemind = (upcomingAppointments || []).filter(appointment => {
      const [aptHour, aptMin] = appointment.appointment_time.split(':').map(Number);
      const appointmentTotalMinutes = aptHour * 60 + aptMin;
      const reminderMinutes = appointment.reminder_minutes || 60; // Default 60 minutes
      
      // Calculate when reminder should be sent
      const reminderTime = appointmentTotalMinutes - reminderMinutes;
      
      // Check if current time is within the reminder window (reminder time to appointment time)
      // Add 15 min buffer for cron timing
      const isInReminderWindow = currentTotalMinutes >= reminderTime && 
                                  currentTotalMinutes <= appointmentTotalMinutes;
      
      console.log(`Appointment ${appointment.id}: time=${appointment.appointment_time}, reminderMinutes=${reminderMinutes}, reminderTime=${reminderTime}, currentTime=${currentTotalMinutes}, inWindow=${isInReminderWindow}`);
      
      return isInReminderWindow;
    });

    console.log(`${appointmentsToRemind.length} appointments need reminders now`);

    for (const appointment of appointmentsToRemind) {
      const reminderMinutes = appointment.reminder_minutes || 60;
      const reminderText = reminderMinutes < 60 
        ? `${reminderMinutes} دقيقة` 
        : reminderMinutes === 60 
          ? "ساعة واحدة" 
          : `${reminderMinutes / 60} ساعات`;
      
      // Send notification to the employee who created the appointment
      if (appointment.created_by) {
        notifications.push({
          user_id: appointment.created_by,
          title: "تذكير بموعد",
          message: `لديك موعد قادم مع العميل ${appointment.customer_name} الساعة ${appointment.appointment_time} (قبل ${reminderText})`,
          type: "reminder",
          reference_id: appointment.id,
        });
      }

      // Also notify assigned sales employee if different from creator
      if (appointment.assigned_sales_employee && 
          appointment.assigned_sales_employee !== appointment.created_by) {
        notifications.push({
          user_id: appointment.assigned_sales_employee,
          title: "تذكير بموعد",
          message: `لديك موعد قادم مع العميل ${appointment.customer_name} الساعة ${appointment.appointment_time} (قبل ${reminderText})`,
          type: "reminder",
          reference_id: appointment.id,
        });
      }

      appointmentIds.push(appointment.id);
    }

    // Insert notifications
    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from("notifications")
        .insert(notifications);

      if (notifError) {
        console.error("Error inserting notifications:", notifError);
        throw notifError;
      }

      console.log(`Sent ${notifications.length} reminder notifications`);
    }

    // Mark appointments as reminder_sent
    if (appointmentIds.length > 0) {
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ reminder_sent: true })
        .in("id", appointmentIds);

      if (updateError) {
        console.error("Error updating appointments:", updateError);
        throw updateError;
      }

      console.log(`Updated ${appointmentIds.length} appointments as reminder_sent`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        appointmentsProcessed: appointmentIds.length,
        notificationsSent: notifications.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in appointment-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
