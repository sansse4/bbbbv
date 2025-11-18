import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DemoUser {
  email: string;
  password: string;
  full_name: string;
  username: string;
  role: 'admin' | 'employee';
  department?: string;
}

const demoUsers: DemoUser[] = [
  {
    email: 'admin@roaya.com',
    password: 'admin123',
    full_name: 'Admin User',
    username: 'admin',
    role: 'admin',
  },
  {
    email: 'media@roaya.com',
    password: 'media123',
    full_name: 'Media Manager',
    username: 'media_user',
    role: 'employee',
    department: 'Media',
  },
  {
    email: 'sales@roaya.com',
    password: 'sales123',
    full_name: 'Sales Manager',
    username: 'sales_user',
    role: 'employee',
    department: 'Sales',
  },
  {
    email: 'callcenter@roaya.com',
    password: 'callcenter123',
    full_name: 'Call Center Manager',
    username: 'callcenter_user',
    role: 'employee',
    department: 'Call Center',
  },
  {
    email: 'contracts@roaya.com',
    password: 'contracts123',
    full_name: 'Contracts Manager',
    username: 'contracts_user',
    role: 'employee',
    department: 'Contract Registration',
  },
  {
    email: 'analytics@roaya.com',
    password: 'analytics123',
    full_name: 'Analytics Manager',
    username: 'analytics_user',
    role: 'employee',
    department: 'Growth Analytics',
  },
  {
    email: 'reception@roaya.com',
    password: 'reception123',
    full_name: 'Reception Staff',
    username: 'reception_user',
    role: 'employee',
    department: 'Reception',
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results = [];

    for (const user of demoUsers) {
      try {
        // Check if user already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('username')
          .eq('username', user.username)
          .maybeSingle();

        if (existingProfile) {
          results.push({ username: user.username, status: 'already_exists' });
          continue;
        }

        // Create user in auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('User creation failed');

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: user.full_name,
            username: user.username,
            department: user.department || null,
          });

        if (profileError) throw profileError;

        // Create role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: user.role,
          });

        if (roleError) throw roleError;

        results.push({ username: user.username, status: 'created' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({ username: user.username, status: 'error', error: errorMessage });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});