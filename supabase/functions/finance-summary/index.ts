import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache configuration
let cachedData: FinanceSummary | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION_MS = 60000; // 60 seconds

interface FinanceSummary {
  total_real_price: number;
  total_sale_price: number;
  total_down_payment: number;
  total_admin_commission: number;
  total_roaya_commission: number;
  net_income: number;
  cached_at?: string;
}

// Google Sheets endpoint - using the same sheet as the Map section
const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbwSMozG5H01u1uVrX4wgXWyr6CHocUuqkAofnowdqBaZSVDJkoj2rOe1g58l4gQ6TPw/exec";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Finance summary request received");

    // Check cache
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION_MS) {
      console.log("Returning cached data");
      return new Response(
        JSON.stringify({ ...cachedData, cached: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log("Fetching fresh data from Google Sheets");
    
    // Fetch data from Google Sheets
    const response = await fetch(GOOGLE_SHEETS_URL);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from Google Sheets: ${response.status}`);
    }

    const data = await response.json();
    console.log("Google Sheets response received");

    // Extract rows from the response
    const rows = data.rows || data.data || [];
    
    // Calculate totals
    let total_real_price = 0;
    let total_sale_price = 0;
    let total_down_payment = 0;
    let total_admin_commission = 0;
    let total_roaya_commission = 0;

    // If totals are provided directly from the Google Sheet API
    if (data.totals) {
      total_real_price = parseNumber(data.totals.realPrice || data.totals["السعر الحقيقي"]);
      total_sale_price = parseNumber(data.totals.salePrice || data.totals["سعر البيع"]);
      total_down_payment = parseNumber(data.totals.downPayment || data.totals["قيمة المقدمة"]);
      total_admin_commission = parseNumber(data.totals.adminCommission || data.totals["العمولة الإدارية"]);
      total_roaya_commission = parseNumber(data.totals.roayaCommission || data.totals["عمولة شركة رؤية"]);
    } else if (Array.isArray(rows) && rows.length > 0) {
      // Calculate from individual rows
      for (const row of rows) {
        if (!row || typeof row !== 'object') continue;
        
        total_real_price += parseNumber(row.realPrice || row["السعر الحقيقي"] || row.real_price);
        total_sale_price += parseNumber(row.salePrice || row["سعر البيع"] || row.sale_price);
        total_down_payment += parseNumber(row.downPayment || row["قيمة المقدمة"] || row.down_payment);
        total_admin_commission += parseNumber(row.adminCommission || row["العمولة الإدارية"] || row.admin_commission);
        total_roaya_commission += parseNumber(row.roayaCommission || row["عمولة شركة رؤية"] || row.roaya_commission);
      }
    }

    // Calculate net income
    const net_income = total_sale_price - total_admin_commission - total_roaya_commission;

    const result: FinanceSummary = {
      total_real_price,
      total_sale_price,
      total_down_payment,
      total_admin_commission,
      total_roaya_commission,
      net_income,
      cached_at: new Date().toISOString(),
    };

    // Update cache
    cachedData = result;
    cacheTimestamp = now;

    console.log("Finance summary calculated:", result);

    return new Response(
      JSON.stringify({ ...result, cached: false }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in finance-summary:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch finance summary";
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

function parseNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove commas and other non-numeric characters except decimal point and minus
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
