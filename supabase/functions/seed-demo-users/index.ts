import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserInput {
  email: string;
  password: string;
  full_name: string;
  username: string;
  role: 'admin' | 'employee' | 'assistant_manager';
  department?: string;
}

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

    // Parse request body
    const body = await req.json();
    const usersToCreate: UserInput[] = body.users || [];

    if (usersToCreate.length === 0) {
      return new Response(JSON.stringify({ error: 'No users provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results = [];

    for (const user of usersToCreate) {
      try {
        // Validate required fields
        if (!user.email || !user.password || !user.full_name || !user.username || !user.role) {
          results.push({ 
            username: user.username || 'unknown', 
            status: 'error', 
            error: 'Missing required fields' 
          });
          continue;
        }

        // Check if username already exists
        const { data: existingProfile } = await supabaseAdmin
          .from('profiles')
          .select('username')
          .eq('username', user.username)
          .maybeSingle();

        if (existingProfile) {
          results.push({ username: user.username, status: 'error', error: 'Username already exists' });
          continue;
        }

        // Check if email already exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const emailExists = existingUsers?.users?.some(u => u.email === user.email);
        
        if (emailExists) {
          results.push({ username: user.username, status: 'error', error: 'Email already exists' });
          continue;
        }

        console.log(`Creating user: ${user.username} with email: ${user.email}`);

        // Create user in auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        });

        if (authError) {
          console.error(`Auth error for ${user.username}:`, authError);
          throw authError;
        }
        
        if (!authData.user) {
          throw new Error('User creation failed - no user returned');
        }

        console.log(`Auth user created with ID: ${authData.user.id}`);

        // Create profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: user.full_name,
            username: user.username,
            department: user.department || null,
          });

        if (profileError) {
          console.error(`Profile error for ${user.username}:`, profileError);
          // Rollback: delete auth user
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          throw profileError;
        }

        console.log(`Profile created for ${user.username}`);

        // Create role
        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: user.role,
          });

        if (roleError) {
          console.error(`Role error for ${user.username}:`, roleError);
          // Rollback: delete profile and auth user
          await supabaseAdmin.from('profiles').delete().eq('id', authData.user.id);
          await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
          throw roleError;
        }

        console.log(`User ${user.username} created successfully with role: ${user.role}`);
        results.push({ username: user.username, status: 'created' });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error creating user ${user.username}:`, errorMessage);
        results.push({ username: user.username, status: 'error', error: errorMessage });
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Function error:', errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
