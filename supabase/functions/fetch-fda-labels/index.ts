import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FDALabelResult {
  warnings: string[];
  indications: string | null;
  contraindications: string | null;
  drugInteractions: string[];
  boxedWarning: string | null;
}

interface FDALabelResponse {
  results?: Array<{
    warnings?: string[];
    indications_and_usage?: string[];
    contraindications?: string[];
    drug_interactions?: string[];
    boxed_warning?: string[];
  }>;
  error?: { message: string };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized: No auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Unauthorized: Invalid token', claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Authenticated user: ${claimsData.claims.sub}`);
    // ============ END AUTH CHECK ============

    const { genericName } = await req.json();

    if (!genericName) {
      return new Response(
        JSON.stringify({ error: 'genericName is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching FDA label data for: ${genericName}`);

    // Query openFDA drug label endpoint
    const labelUrl = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(genericName)}"&limit=1`;
    
    console.log(`Querying openFDA labels: ${labelUrl}`);
    
    const response = await fetch(labelUrl);
    const data: FDALabelResponse = await response.json();

    if (data.error || !data.results || data.results.length === 0) {
      console.log(`No label data found for ${genericName}`);
      return new Response(
        JSON.stringify({ 
          genericName, 
          labelData: null,
          message: data.error?.message || 'No label data found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const label = data.results[0];
    
    const labelData: FDALabelResult = {
      warnings: label.warnings || [],
      indications: label.indications_and_usage?.[0] || null,
      contraindications: label.contraindications?.[0] || null,
      drugInteractions: label.drug_interactions || [],
      boxedWarning: label.boxed_warning?.[0] || null
    };

    console.log(`Found label data for ${genericName}: ${labelData.warnings.length} warnings`);

    return new Response(
      JSON.stringify({ 
        genericName, 
        labelData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in fetch-fda-labels:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
