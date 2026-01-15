import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HydrateLog {
  step: string;
  status: "success" | "warning" | "error" | "info";
  message: string;
  data?: unknown;
}

interface HydrateResult {
  success: boolean;
  logs: HydrateLog[];
  med_id: string;
  ndc?: string;
  set_id?: string;
  active_ingredients?: string[];
  inactive_ingredients?: string[];
  status?: string;
  confidence_level?: string;
  status_reason?: string;
}

interface DbIngredient {
  id: string;
  name: string;
  synonyms: string[] | null;
  default_status: string | null;
  risk: string;
  default_concern_reason: string | null;
}

// Normalize ingredient name for matching
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Search openFDA for NDC based on medication info
async function findNdcFromOpenFda(
  genericName: string,
  dosageForms: string[] | null,
  brandNames: string[] | null,
  logs: HydrateLog[]
): Promise<string | null> {
  logs.push({
    step: "openfda_search",
    status: "info",
    message: `Searching openFDA for: ${genericName}`,
    data: { genericName, dosageForms, brandNames },
  });

  try {
    // Build search query - prioritize generic name
    const searchTerms: string[] = [];
    
    // Add generic name search
    const normalizedGeneric = genericName.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    searchTerms.push(`generic_name:"${normalizedGeneric}"`);
    
    // Build the query
    let query = searchTerms.join("+AND+");
    
    // Add dosage form if available
    if (dosageForms && dosageForms.length > 0) {
      const form = dosageForms[0].toLowerCase();
      query += `+AND+dosage_form:"${form}"`;
    }

    const url = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(query)}&limit=5`;
    logs.push({
      step: "openfda_request",
      status: "info",
      message: `Requesting: ${url}`,
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      // Try fallback search with just generic name
      const fallbackUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(normalizedGeneric)}"&limit=5`;
      logs.push({
        step: "openfda_fallback",
        status: "warning",
        message: `Primary search failed, trying fallback: ${fallbackUrl}`,
      });
      
      const fallbackResponse = await fetch(fallbackUrl);
      if (!fallbackResponse.ok) {
        logs.push({
          step: "openfda_search",
          status: "error",
          message: `openFDA search failed: ${fallbackResponse.status}`,
        });
        return null;
      }
      
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.results && fallbackData.results.length > 0) {
        const ndc = fallbackData.results[0].product_ndc;
        logs.push({
          step: "openfda_search",
          status: "success",
          message: `Found NDC via fallback: ${ndc}`,
          data: fallbackData.results[0],
        });
        return ndc;
      }
      return null;
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      logs.push({
        step: "openfda_search",
        status: "warning",
        message: "No results found in openFDA",
      });
      return null;
    }

    // Try to find best match - prefer one that matches brand if available
    let bestMatch = data.results[0];
    
    if (brandNames && brandNames.length > 0) {
      const brandLower = brandNames.map((b: string) => b.toLowerCase());
      const brandMatch = data.results.find((r: { brand_name?: string }) => 
        r.brand_name && brandLower.some((b: string) => r.brand_name!.toLowerCase().includes(b))
      );
      if (brandMatch) {
        bestMatch = brandMatch;
        logs.push({
          step: "openfda_search",
          status: "info",
          message: `Found brand match: ${bestMatch.brand_name}`,
        });
      }
    }

    const ndc = bestMatch.product_ndc;
    logs.push({
      step: "openfda_search",
      status: "success",
      message: `Found NDC: ${ndc}`,
      data: { brand: bestMatch.brand_name, generic: bestMatch.generic_name },
    });
    
    return ndc;
  } catch (error) {
    logs.push({
      step: "openfda_search",
      status: "error",
      message: `openFDA error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return null;
  }
}

// Get DailyMed set_id from NDC
async function getSetIdFromNdc(ndc: string, logs: HydrateLog[]): Promise<string | null> {
  logs.push({
    step: "dailymed_setid",
    status: "info",
    message: `Looking up DailyMed set_id for NDC: ${ndc}`,
  });

  try {
    // Format NDC for DailyMed (remove dashes)
    const ndcClean = ndc.replace(/-/g, "");
    
    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?ndc=${ndcClean}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      logs.push({
        step: "dailymed_setid",
        status: "error",
        message: `DailyMed lookup failed: ${response.status}`,
      });
      return null;
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      // Try with original NDC format
      const url2 = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls.json?ndc=${ndc}`;
      const response2 = await fetch(url2);
      
      if (response2.ok) {
        const data2 = await response2.json();
        if (data2.data && data2.data.length > 0) {
          const setId = data2.data[0].setid;
          logs.push({
            step: "dailymed_setid",
            status: "success",
            message: `Found set_id: ${setId}`,
          });
          return setId;
        }
      }
      
      logs.push({
        step: "dailymed_setid",
        status: "warning",
        message: "No SPL found for this NDC",
      });
      return null;
    }

    const setId = data.data[0].setid;
    logs.push({
      step: "dailymed_setid",
      status: "success",
      message: `Found set_id: ${setId}`,
    });
    
    return setId;
  } catch (error) {
    logs.push({
      step: "dailymed_setid",
      status: "error",
      message: `DailyMed error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return null;
  }
}

// Fetch and parse SPL content for ingredients
async function fetchSplIngredients(
  setId: string,
  logs: HydrateLog[]
): Promise<{ active: string[]; inactive: string[] } | null> {
  logs.push({
    step: "spl_fetch",
    status: "info",
    message: `Fetching SPL content for set_id: ${setId}`,
  });

  try {
    const url = `https://dailymed.nlm.nih.gov/dailymed/services/v2/spls/${setId}.xml`;
    const response = await fetch(url);
    
    if (!response.ok) {
      logs.push({
        step: "spl_fetch",
        status: "error",
        message: `SPL fetch failed: ${response.status}`,
      });
      return null;
    }

    const xmlText = await response.text();
    
    // Parse active ingredients
    const activeIngredients: string[] = [];
    const activeMatches = xmlText.matchAll(/<activeIngredient>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/activeIngredient>/gi);
    for (const match of activeMatches) {
      if (match[1]) {
        activeIngredients.push(match[1].trim());
      }
    }
    
    // Also try activeMoiety
    const moietyMatches = xmlText.matchAll(/<activeMoiety>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/activeMoiety>/gi);
    for (const match of moietyMatches) {
      if (match[1] && !activeIngredients.includes(match[1].trim())) {
        activeIngredients.push(match[1].trim());
      }
    }

    logs.push({
      step: "spl_active",
      status: activeIngredients.length > 0 ? "success" : "warning",
      message: `Found ${activeIngredients.length} active ingredients`,
      data: activeIngredients,
    });

    // Parse inactive ingredients section
    const inactiveIngredients: string[] = [];
    
    // Look for inactive ingredient section
    const inactiveSection = xmlText.match(/<component>[\s\S]*?<title[^>]*>[\s\S]*?INACTIVE[\s\S]*?INGREDIENT[\s\S]*?<\/title>[\s\S]*?<text>([\s\S]*?)<\/text>/i);
    
    if (inactiveSection && inactiveSection[1]) {
      // Extract text content, removing XML tags
      let textContent = inactiveSection[1]
        .replace(/<[^>]+>/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#\d+;/g, "");
      
      // Split by common delimiters
      const parts = textContent.split(/[,;]|\band\b/i);
      
      for (const part of parts) {
        const cleaned = part.trim().replace(/\.$/, "").trim();
        if (cleaned.length > 2 && cleaned.length < 100) {
          // Filter out common non-ingredient text
          if (!cleaned.match(/^(the|this|each|contains|may contain|inactive ingredients|include)/i)) {
            inactiveIngredients.push(cleaned);
          }
        }
      }
    }
    
    // Also try inactiveIngredient tags
    const inactiveMatches = xmlText.matchAll(/<inactiveIngredient>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/inactiveIngredient>/gi);
    for (const match of inactiveMatches) {
      if (match[1] && !inactiveIngredients.includes(match[1].trim())) {
        inactiveIngredients.push(match[1].trim());
      }
    }

    logs.push({
      step: "spl_inactive",
      status: inactiveIngredients.length > 0 ? "success" : "warning",
      message: `Found ${inactiveIngredients.length} inactive ingredients`,
      data: inactiveIngredients,
    });

    return {
      active: activeIngredients,
      inactive: inactiveIngredients,
    };
  } catch (error) {
    logs.push({
      step: "spl_fetch",
      status: "error",
      message: `SPL parse error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return null;
  }
}

// Match ingredients against rulings and compute status
async function computeStatus(
  activeIngredients: string[],
  inactiveIngredients: string[],
  supabaseUrl: string,
  supabaseKey: string,
  logs: HydrateLog[]
): Promise<{ status: string; confidence: string; reason: string }> {
  logs.push({
    step: "status_compute",
    status: "info",
    message: "Computing status based on ingredients",
  });

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Fetch all ingredients from database
    const { data: ingredients, error } = await supabase
      .from("ingredients")
      .select("id, name, synonyms, default_status, risk, default_concern_reason");
    
    if (error) {
      logs.push({
        step: "status_compute",
        status: "error",
        message: `Failed to fetch ingredients: ${error.message}`,
      });
      return {
        status: "needs_verification",
        confidence: "low",
        reason: "Failed to match ingredients against database",
      };
    }

    const dbIngredients = (ingredients || []) as DbIngredient[];
    const allIngredients = [...activeIngredients, ...inactiveIngredients];
    const matchResults: { name: string; matched: boolean; status?: string; concern?: string }[] = [];
    
    let hasHaram = false;
    let hasMushbooh = false;
    let hasUnmatched = false;
    const concerningIngredients: string[] = [];

    for (const ingName of allIngredients) {
      const normalized = normalizeIngredientName(ingName);
      
      // Try to match
      const match = dbIngredients.find((ing) => {
        const nameMatch = normalizeIngredientName(ing.name) === normalized;
        const synonymMatch = ing.synonyms?.some(
          (syn: string) => normalizeIngredientName(syn) === normalized
        );
        return nameMatch || synonymMatch;
      });

      if (match) {
        matchResults.push({
          name: ingName,
          matched: true,
          status: match.default_status || undefined,
          concern: match.default_concern_reason || undefined,
        });

        if (match.default_status === "haram") {
          hasHaram = true;
          concerningIngredients.push(`${ingName} (prohibited)`);
        } else if (match.default_status === "mushbooh") {
          hasMushbooh = true;
          concerningIngredients.push(`${ingName} (questionable)`);
        }
      } else {
        matchResults.push({ name: ingName, matched: false });
        hasUnmatched = true;
      }
    }

    const matchedCount = matchResults.filter((r) => r.matched).length;
    const totalCount = matchResults.length;
    const matchRate = totalCount > 0 ? matchedCount / totalCount : 0;

    logs.push({
      step: "status_compute",
      status: "success",
      message: `Matched ${matchedCount}/${totalCount} ingredients (${Math.round(matchRate * 100)}%)`,
      data: matchResults,
    });

    // Determine status
    let status: string;
    let confidence: string;
    let reason: string;

    if (hasHaram) {
      status = "haram";
      confidence = "high";
      reason = `Contains prohibited ingredient(s): ${concerningIngredients.join(", ")}`;
    } else if (hasMushbooh) {
      status = "mushbooh";
      confidence = matchRate >= 0.8 ? "medium" : "low";
      reason = `Contains questionable ingredient(s): ${concerningIngredients.join(", ")}`;
    } else if (inactiveIngredients.length === 0) {
      status = "needs_verification";
      confidence = "low";
      reason = "No inactive ingredient data available - cannot determine halal status";
    } else if (hasUnmatched) {
      status = "needs_verification";
      confidence = "low";
      reason = `Some ingredients could not be verified (${totalCount - matchedCount} unmatched)`;
    } else {
      status = "halal";
      confidence = matchRate >= 0.8 ? "high" : "medium";
      reason = "All ingredients verified as halal-compliant";
    }

    logs.push({
      step: "status_result",
      status: "success",
      message: `Status: ${status}, Confidence: ${confidence}`,
      data: { status, confidence, reason },
    });

    return { status, confidence, reason };
  } catch (error) {
    logs.push({
      step: "status_compute",
      status: "error",
      message: `Status computation error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return {
      status: "needs_verification",
      confidence: "low",
      reason: "Error during status computation",
    };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify user is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .single();

    if (!roles) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { med_id } = await req.json();
    
    if (!med_id) {
      return new Response(
        JSON.stringify({ error: "med_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const logs: HydrateLog[] = [];
    const result: HydrateResult = {
      success: false,
      logs,
      med_id,
    };

    logs.push({
      step: "start",
      status: "info",
      message: `Starting hydration for med_id: ${med_id}`,
    });

    // Fetch medication info
    const { data: med, error: medError } = await supabase
      .from("rx_meds")
      .select("*")
      .eq("id", med_id)
      .single();

    if (medError || !med) {
      logs.push({
        step: "fetch_med",
        status: "error",
        message: `Medication not found: ${medError?.message || "No data"}`,
      });
      result.logs = logs;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logs.push({
      step: "fetch_med",
      status: "success",
      message: `Found medication: ${med.generic_name}`,
      data: { generic_name: med.generic_name, brand_names: med.brand_names, dosage_forms: med.dosage_forms },
    });

    // Step 1: Find NDC from openFDA
    const ndc = await findNdcFromOpenFda(
      med.generic_name,
      med.dosage_forms,
      med.brand_names,
      logs
    );

    if (ndc) {
      result.ndc = ndc;
      
      // Step 2: Get DailyMed set_id
      const setId = await getSetIdFromNdc(ndc, logs);
      
      if (setId) {
        result.set_id = setId;
        
        // Step 3: Fetch and parse SPL ingredients
        const ingredients = await fetchSplIngredients(setId, logs);
        
        if (ingredients) {
          result.active_ingredients = ingredients.active;
          result.inactive_ingredients = ingredients.inactive;
          
          // Step 4: Compute status
          const statusResult = await computeStatus(
            ingredients.active,
            ingredients.inactive,
            supabaseUrl,
            supabaseServiceKey,
            logs
          );
          
          result.status = statusResult.status;
          result.confidence_level = statusResult.confidence;
          result.status_reason = statusResult.reason;
          
          // Step 5: Update rx_meds record
          const { error: updateError } = await supabase
            .from("rx_meds")
            .update({
              ndc,
              dailymed_set_id: setId,
              active_ingredients: ingredients.active,
              inactive_ingredients: ingredients.inactive,
              confidence_level: statusResult.confidence,
              status_reason: statusResult.reason,
              default_status: statusResult.status,
              spl_last_fetched_at: new Date().toISOString(),
            })
            .eq("id", med_id);

          if (updateError) {
            logs.push({
              step: "update_db",
              status: "error",
              message: `Failed to update rx_meds: ${updateError.message}`,
            });
          } else {
            logs.push({
              step: "update_db",
              status: "success",
              message: "Successfully updated rx_meds record",
            });
            result.success = true;
          }
        }
      }
    }

    logs.push({
      step: "complete",
      status: result.success ? "success" : "warning",
      message: result.success 
        ? "Hydration completed successfully" 
        : "Hydration completed with issues - some data may be missing",
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Hydrate label data error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
        logs: [{ step: "error", status: "error", message: String(error) }],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
