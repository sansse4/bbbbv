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
    
    // Calculate time range (current time to 1 hour from now)
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    
    // Format current time
    const currentTimeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
    
    // Calculate time 1 hour and 15 minutes from now (buffer for cron timing)
    const futureTime = new Date(now.getTime() + 75 * 60 * 1000); // 1 hour 15 min
    const futureHour = futureTime.getHours();
    const futureMinutes = futureTime.getMinutes();
    const futureTimeStr = `${String(futureHour).padStart(2, '0')}:${String(futureMinutes).padStart(2, '0')}`;

    console.log(`Checking appointments between ${currentTimeStr} and ${futureTimeStr} on ${currentDate}`);

    // Query appointments that:
    // 1. Are scheduled for today
    // 2. Are within the next hour
    // 3. Haven't had a reminder sent
    // 4. Are not cancelled
    const { data: upcomingAppointments, error: fetchError } = await supabase
      .from("appointments")
      .select("*")
      .eq("appointment_date", currentDate)
      .eq("reminder_sent", false)
      .neq("status", "cancelled")
      .gte("appointment_time", currentTimeStr)
      .lte("appointment_time", futureTimeStr);

    if (fetchError) {
      console.error("Error fetching appointments:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${upcomingAppointments?.length || 0} appointments needing reminders`);

    const notifications: any[] = [];
    const appointmentIds: string[] = [];

    for (const appointment of upcomingAppointments || []) {
      // Send notification to the employee who created the appointment
      if (appointment.created_by) {
        notifications.push({
          user_id: appointment.created_by,
          title: "تذكير بموعد",
          message: `لديك موعد قادم مع العميل ${appointment.customer_name} الساعة ${appointment.appointment_time}`,
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
          message: `لديك موعد قادم مع العميل ${appointment.customer_name} الساعة ${appointment.appointment_time}`,
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
