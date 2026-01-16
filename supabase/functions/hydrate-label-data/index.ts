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

interface VariantResult {
  ndc: string;
  set_id?: string;
  manufacturer: string;
  variant_id: string;
  status: string;
  confidence: number;
  active_ingredients: string[];
  inactive_ingredients: string[];
}

interface HydrateResult {
  success: boolean;
  logs: HydrateLog[];
  med_id: string;
  variants_hydrated: number;
  variant_ids: string[];
  variants?: VariantResult[];
  // Legacy fields for single variant (backward compat)
  ndc?: string;
  set_id?: string;
  active_ingredients?: string[];
  inactive_ingredients?: string[];
  inactive_raw_text?: string;
  status?: string;
  confidence?: number;
  confidence_level?: string;
  status_reason?: string;
  variant_id?: string;
}

interface DbIngredient {
  id: string;
  name: string;
  synonyms: string[] | null;
  default_status: string | null;
  risk: string;
  default_concern_reason: string | null;
}

interface OpenFdaNdcResult {
  ndc: string;
  labeler_name: string;
  brand_name?: string;
  dosage_form?: string;
  strength?: string;
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

// Search openFDA for up to 10 NDC results
async function findAllNdcsFromOpenFda(
  genericName: string,
  dosageForms: string[] | null,
  brandNames: string[] | null,
  logs: HydrateLog[]
): Promise<OpenFdaNdcResult[]> {
  logs.push({
    step: "openfda_search",
    status: "info",
    message: `Searching openFDA for ALL manufacturers of: ${genericName}`,
    data: { genericName, dosageForms, brandNames },
  });

  const results: OpenFdaNdcResult[] = [];

  try {
    const normalizedGeneric = genericName.toLowerCase().replace(/[^a-z0-9\s]/g, "");
    
    // Build proper query with " AND " instead of "+AND+"
    let query = `generic_name:"${normalizedGeneric}"`;
    if (dosageForms && dosageForms.length > 0) {
      const form = dosageForms[0].toLowerCase();
      query += ` AND dosage_form:"${form}"`;
    }

    const url = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(query)}&limit=10`;
    logs.push({
      step: "openfda_request",
      status: "info",
      message: `Requesting: ${url}`,
    });

    const response = await fetch(url);
    
    if (!response.ok) {
      // Try fallback search with just generic name
      const fallbackQuery = `generic_name:"${normalizedGeneric}"`;
      const fallbackUrl = `https://api.fda.gov/drug/ndc.json?search=${encodeURIComponent(fallbackQuery)}&limit=10`;
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
        return results;
      }
      
      const fallbackData = await fallbackResponse.json();
      if (fallbackData.results && fallbackData.results.length > 0) {
        for (const result of fallbackData.results) {
          // Prefer packaging[].package_ndc if present
          const ndc = result.packaging?.[0]?.package_ndc || result.product_ndc;
          const labeler = result.labeler_name || result.openfda?.manufacturer_name?.[0] || "Unknown";
          
          // Avoid duplicates by labeler
          if (!results.some(r => r.labeler_name === labeler && r.ndc === ndc)) {
            results.push({
              ndc,
              labeler_name: labeler,
              brand_name: result.brand_name,
              dosage_form: result.dosage_form,
              strength: result.active_ingredients?.[0]?.strength,
            });
          }
        }
        logs.push({
          step: "openfda_search",
          status: "success",
          message: `Found ${results.length} NDCs via fallback`,
          data: results.map(r => ({ ndc: r.ndc, labeler: r.labeler_name })),
        });
      }
      return results;
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      logs.push({
        step: "openfda_search",
        status: "warning",
        message: "No results found in openFDA",
      });
      return results;
    }

    // Process all results (up to 10)
    for (const result of data.results) {
      // Prefer packaging[].package_ndc if present
      const ndc = result.packaging?.[0]?.package_ndc || result.product_ndc;
      const labeler = result.labeler_name || result.openfda?.manufacturer_name?.[0] || "Unknown";
      
      // Avoid exact duplicates
      if (!results.some(r => r.labeler_name === labeler && r.ndc === ndc)) {
        results.push({
          ndc,
          labeler_name: labeler,
          brand_name: result.brand_name,
          dosage_form: result.dosage_form,
          strength: result.active_ingredients?.[0]?.strength,
        });
      }
    }

    logs.push({
      step: "openfda_search",
      status: "success",
      message: `Found ${results.length} unique NDCs from ${data.results.length} results`,
      data: results.map(r => ({ ndc: r.ndc, labeler: r.labeler_name })),
    });
    
    return results;
  } catch (error) {
    logs.push({
      step: "openfda_search",
      status: "error",
      message: `openFDA error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return results;
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

// STRICT "keyword window extraction" for inactive ingredients
function extractInactivesByKeywordWindow(xmlText: string, logs: HydrateLog[]): { ingredients: string[]; rawText: string } {
  // STEP 1: Keywords to find inactive ingredient section
  const keywords = [
    "inactive ingredient",
    "inactive ingredients",
    "each tablet contains",
    "each capsule contains",
    "contains:",
    "excipients",
  ];
  
  // STEP 1: Strong section boundaries to stop extraction
  const sectionBoundaries = [
    "the mechanism of action",
    "indications",
    "warnings",
    "dosage",
    "clinical pharmacology",
    "contraindications",
    "adverse reactions",
  ];

  // Search case-insensitive for first occurrence of any keyword
  let matchIndex = -1;
  let matchedKeyword = "";
  
  const lowerXml = xmlText.toLowerCase();
  for (const kw of keywords) {
    const idx = lowerXml.indexOf(kw.toLowerCase());
    if (idx !== -1 && (matchIndex === -1 || idx < matchIndex)) {
      matchIndex = idx;
      matchedKeyword = kw;
    }
  }
  
  if (matchIndex === -1) {
    logs.push({
      step: "keyword_extraction",
      status: "warning",
      message: "No inactive keyword found in XML",
    });
    return { ingredients: [], rawText: "" };
  }

  logs.push({
    step: "keyword_extraction",
    status: "info",
    message: `Found keyword "${matchedKeyword}" at position ${matchIndex}`,
  });

  // Take window of 2500 chars after match
  let window = xmlText.substring(matchIndex, matchIndex + 2500);
  
  // STEP 1: Truncate at FIRST occurrence of any section boundary
  const lowerWindow = window.toLowerCase();
  let earliestBoundary = window.length;
  let boundaryFound = "";
  
  for (const boundary of sectionBoundaries) {
    const idx = lowerWindow.indexOf(boundary);
    if (idx !== -1 && idx > 20 && idx < earliestBoundary) {
      earliestBoundary = idx;
      boundaryFound = boundary;
    }
  }
  
  if (earliestBoundary < window.length) {
    window = window.substring(0, earliestBoundary);
    logs.push({
      step: "keyword_extraction",
      status: "info",
      message: `Truncated at section boundary: "${boundaryFound}"`,
    });
  }

  // STEP 2: Normalize the inactive text
  // Remove XML/HTML tags
  let cleanText = window.replace(/<[^>]+>/g, " ");
  
  // Decode common entities
  cleanText = cleanText
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#\d+;/g, "")
    .replace(/&nbsp;/g, " ");
  
  // Collapse multiple spaces into one
  cleanText = cleanText.replace(/\s+/g, " ").trim();
  
  // Remove leading phrases (case-insensitive)
  const leadingPhrases = [
    "inactive ingredients:",
    "inactive ingredients",
    "inactive ingredient:",
    "inactive ingredient",
    "each tablet contains:",
    "each tablet contains",
    "each capsule contains:",
    "each capsule contains",
    "contains:",
  ];
  
  let lowerClean = cleanText.toLowerCase();
  for (const phrase of leadingPhrases) {
    if (lowerClean.startsWith(phrase)) {
      cleanText = cleanText.substring(phrase.length).trim();
      lowerClean = cleanText.toLowerCase();
    }
  }
  
  // STEP 6: Save raw text for debugging (500-800 chars)
  const rawText = cleanText.substring(0, 800);

  // STEP 3: Split into candidate ingredients
  // Split by commas, semicolons, and the word "and" (as separator)
  const parts = cleanText.split(/[,;]|\s+and\s+/i);
  
  const ingredients: string[] = [];
  
  for (const part of parts) {
    // Trim whitespace and trailing punctuation
    let candidate = part.trim().replace(/[.,;:]+$/, "").trim();
    
    // STEP 4: Apply STRICT ingredient filters
    
    // Character rules: Only letters, spaces, or hyphens
    if (!/^[a-zA-Z\s-]+$/.test(candidate)) {
      continue;
    }
    
    // Reject if contains any digits
    if (/\d/.test(candidate)) {
      continue;
    }
    
    // Reject if contains %
    if (candidate.includes("%")) {
      continue;
    }
    
    // Length rules: 2-40 characters
    if (candidate.length < 2 || candidate.length > 40) {
      continue;
    }
    
    // Maximum 4 words
    const wordCount = candidate.split(/\s+/).length;
    if (wordCount > 4) {
      continue;
    }
    
    // Content rules: Reject if starts with specific words
    const rejectStartsWith = [
      "undergo",
      "plasma",
      "peak",
      "study",
      "without food",
      "respectively",
      "the",
      "this",
      "each",
      "may",
      "also",
      "including",
      "such as",
      "other",
      "none",
      "no ",
      "not ",
      "is ",
      "are ",
      "was ",
      "were ",
      "have ",
      "has ",
      "had ",
      "be ",
      "been ",
      "being ",
      "it ",
      "its ",
      "with ",
      "from ",
      "for ",
      "by ",
      "at ",
      "in ",
      "on ",
      "to ",
      "as ",
    ];
    
    const lowerCandidate = candidate.toLowerCase();
    let rejected = false;
    
    for (const prefix of rejectStartsWith) {
      if (lowerCandidate.startsWith(prefix)) {
        rejected = true;
        break;
      }
    }
    if (rejected) continue;
    
    // Content rules: Reject if contains specific words
    const rejectContains = [
      "concentration",
      "metabolism",
      "radiolabeled",
      "absorption",
      "pharmacokinetic",
      "bioavailability",
      "half-life",
      "clearance",
      "distribution",
      "elimination",
      "excretion",
      "binding",
      "protein",
      "steady state",
      "auc",
      "cmax",
      "tmax",
      "plasma level",
      "systemic",
      "oral administration",
      "intravenous",
      "patients",
      "subjects",
      "volunteers",
      "studies",
      "clinical",
      "trial",
      "dose",
      "dosing",
      "administered",
      "treatment",
      "therapy",
      "efficacy",
      "effect",
      "response",
      "indicated",
      "recommended",
    ];
    
    for (const word of rejectContains) {
      if (lowerCandidate.includes(word)) {
        rejected = true;
        break;
      }
    }
    if (rejected) continue;
    
    // Reject single common words that aren't ingredients
    const singleWordRejects = [
      "and", "or", "the", "a", "an", "is", "are", "was", "were",
      "be", "been", "being", "have", "has", "had", "do", "does",
      "did", "will", "would", "could", "should", "may", "might",
      "must", "shall", "can", "need", "dare", "ought", "used",
      "mg", "ml", "mcg", "g", "kg", "l", "mm", "cm", "m",
      "oral", "tablet", "capsule", "solution", "injection",
    ];
    
    if (wordCount === 1 && singleWordRejects.includes(lowerCandidate)) {
      continue;
    }
    
    ingredients.push(candidate);
  }
  
  // STEP 5: Deduplicate (preserve original casing)
  const seen = new Set<string>();
  const uniqueIngredients: string[] = [];
  
  for (const ing of ingredients) {
    const normalized = ing.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      uniqueIngredients.push(ing);
    }
  }

  logs.push({
    step: "keyword_extraction",
    status: uniqueIngredients.length > 0 ? "success" : "warning",
    message: `Extracted ${uniqueIngredients.length} ingredients via strict filtering`,
    data: uniqueIngredients.slice(0, 15),
  });

  return { ingredients: uniqueIngredients, rawText };
}

// Fetch and parse SPL content for ingredients with improved extraction
async function fetchSplIngredients(
  setId: string,
  logs: HydrateLog[]
): Promise<{ active: string[]; inactive: string[]; inactiveRawText: string } | null> {
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

    // --- Inactive ingredients: tighter parsing with hard boundaries + strict filters ---
    const inactiveIngredients: string[] = [];

    // 1) Try to capture the "inactive ingredients:" sentence from plain text first
    // Pull a short window after the phrase, then cut at the first strong boundary.
    const plainText = xmlText
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#\d+;/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const keyIdx = plainText.toLowerCase().indexOf("inactive ingredients");
    let inactiveRawText = "";
    
    if (keyIdx !== -1) {
      // Take a limited window after the keyword (prevents "entire label" bleed)
      const window = plainText.slice(keyIdx, Math.min(plainText.length, keyIdx + 600));

      // Strong boundaries: stop as soon as we hit clinical sections
      const boundaries = [
        "the mechanism of action",
        "indications",
        "warnings",
        "dosage",
        "clinical pharmacology",
        "contraindications",
        "adverse reactions",
      ];

      let cut = window.length;
      const lowerWin = window.toLowerCase();
      for (const b of boundaries) {
        const bi = lowerWin.indexOf(b);
        if (bi !== -1) cut = Math.min(cut, bi);
      }
      const snippet = window.slice(0, cut);
      inactiveRawText = snippet;

      // Extract after ":" if present
      const afterColon = snippet.includes(":") ? snippet.split(":").slice(1).join(":") : snippet;

      // Split candidates
      const rawParts = afterColon.split(/[,;]|\band\b/gi).map(s => s.trim());

      // Strict filters
      const rejectStarts = [
        "undergo",
        "plasma",
        "peak",
        "study",
        "without food",
        "respectively",
      ];

      for (const part of rawParts) {
        const cleaned = part
          .replace(/\.$/, "")
          .replace(/^inactive ingredients?/i, "")
          .trim();

        const lower = cleaned.toLowerCase();

        // Minimal effective filter rules
        if (!cleaned) continue;
        if (cleaned.length < 2 || cleaned.length > 40) continue;
        if (/\d|%/.test(cleaned)) continue;              // reject numbers/% like 84% 116%
        if (!/^[a-zA-Z\s-]+$/.test(cleaned)) continue;   // letters/spaces/hyphens only
        if (cleaned.split(/\s+/).length > 4) continue;   // max 4 words
        if (rejectStarts.some(rs => lower.startsWith(rs))) continue;

        if (!inactiveIngredients.includes(cleaned)) inactiveIngredients.push(cleaned);
      }
    }

    // 2) Also collect explicit inactiveIngredient tags (these are usually clean)
    const inactiveMatches = xmlText.matchAll(
      /<inactiveIngredient>[\s\S]*?<name>([^<]+)<\/name>[\s\S]*?<\/inactiveIngredient>/gi
    );
    for (const match of inactiveMatches) {
      const val = match[1]?.trim();
      if (!val) continue;
      const cleaned = val.replace(/\s+/g, " ").trim();
      if (!inactiveIngredients.includes(cleaned)) inactiveIngredients.push(cleaned);
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
      inactiveRawText,
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

// Improved ingredient matching with contains logic
function matchIngredient(ingName: string, dbIngredients: DbIngredient[]): DbIngredient | null {
  const normalized = normalizeIngredientName(ingName);
  
  // First try exact match
  const exactMatch = dbIngredients.find((ing) => {
    const nameMatch = normalizeIngredientName(ing.name) === normalized;
    const synonymMatch = ing.synonyms?.some(
      (syn: string) => normalizeIngredientName(syn) === normalized
    );
    return nameMatch || synonymMatch;
  });
  
  if (exactMatch) return exactMatch;
  
  // Then try contains matching
  const containsMatch = dbIngredients.find((ing) => {
    const dbNormalized = normalizeIngredientName(ing.name);
    // Check if ingredient name contains db name or vice versa
    const nameContains = normalized.includes(dbNormalized) || dbNormalized.includes(normalized);
    // Check synonyms
    const synonymContains = ing.synonyms?.some((syn: string) => {
      const synNormalized = normalizeIngredientName(syn);
      return normalized.includes(synNormalized) || synNormalized.includes(normalized);
    });
    return nameContains || synonymContains;
  });
  
  return containsMatch || null;
}

// Improved status computation with numeric confidence
async function computeStatus(
  activeIngredients: string[],
  inactiveIngredients: string[],
  supabaseUrl: string,
  supabaseKey: string,
  logs: HydrateLog[]
): Promise<{ status: string; confidence: number; reason: string; matchedIngredients: { name: string; id: string; role: string }[] }> {
  logs.push({
    step: "status_compute",
    status: "info",
    message: "Computing status based on ingredients",
  });

  const matchedIngredients: { name: string; id: string; role: string }[] = [];

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
        confidence: 10,
        reason: "Failed to match ingredients against database",
        matchedIngredients: [],
      };
    }

    const dbIngredients = (ingredients || []) as DbIngredient[];
    
    // Status based primarily on INACTIVE ingredients
    // If no inactive ingredients, force needs_verification
    if (inactiveIngredients.length === 0) {
      logs.push({
        step: "status_compute",
        status: "warning",
        message: "No inactive ingredients found - cannot determine halal status",
      });
      return {
        status: "needs_verification",
        confidence: 10,
        reason: "No inactive ingredient data available - cannot determine halal status. Please consult the original label or contact the manufacturer.",
        matchedIngredients: [],
      };
    }

    const matchResults: { name: string; matched: boolean; status?: string; concern?: string; id?: string }[] = [];
    
    let hasHaram = false;
    let hasMushbooh = false;
    let hasUnmatched = false;
    const concerningIngredients: string[] = [];

    // Match active ingredients first
    for (const ingName of activeIngredients) {
      const match = matchIngredient(ingName, dbIngredients);
      if (match) {
        matchedIngredients.push({ name: ingName, id: match.id, role: "active" });
        matchResults.push({
          name: ingName,
          matched: true,
          status: match.default_status || undefined,
          id: match.id,
        });
      } else {
        matchResults.push({ name: ingName, matched: false });
      }
    }

    // Status based on INACTIVE ingredients
    for (const ingName of inactiveIngredients) {
      const match = matchIngredient(ingName, dbIngredients);

      if (match) {
        matchedIngredients.push({ name: ingName, id: match.id, role: "inactive" });
        matchResults.push({
          name: ingName,
          matched: true,
          status: match.default_status || undefined,
          concern: match.default_concern_reason || undefined,
          id: match.id,
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

    // Determine status with proper numeric confidence
    let status: string;
    let confidence: number;
    let reason: string;

    if (hasHaram) {
      status = "haram";
      confidence = 90;
      reason = `Contains prohibited ingredient(s): ${concerningIngredients.join(", ")}`;
    } else if (hasMushbooh) {
      status = "mushbooh";
      confidence = 60;
      reason = `Contains questionable ingredient(s): ${concerningIngredients.join(", ")}`;
    } else if (hasUnmatched) {
      status = "needs_verification";
      confidence = 30;
      reason = `Some ingredients could not be verified (${totalCount - matchedCount} of ${inactiveIngredients.length} unmatched)`;
    } else {
      status = "halal";
      confidence = 85;
      reason = "All inactive ingredients verified as halal-compliant";
    }

    logs.push({
      step: "status_result",
      status: "success",
      message: `Status: ${status}, Confidence: ${confidence}%`,
      data: { status, confidence, reason },
    });

    return { status, confidence, reason, matchedIngredients };
  } catch (error) {
    logs.push({
      step: "status_compute",
      status: "error",
      message: `Status computation error: ${error instanceof Error ? error.message : String(error)}`,
    });
    return {
      status: "needs_verification",
      confidence: 10,
      reason: "Error during status computation",
      matchedIngredients: [],
    };
  }
}

// Create/update rx_variants, rx_variant_ingredients, rx_verdicts
// Now keyed by (rx_med_id, manufacturer, ndc) to allow multiple variants per med
async function upsertVariantData(
  supabase: any,
  medId: string,
  ndc: string,
  labelerName: string | null,
  dosageForm: string | null,
  strengthText: string | null,
  splSetId: string | null,
  status: string,
  confidence: number,
  reason: string,
  matchedIngredients: { name: string; id: string; role: string }[],
  logs: HydrateLog[]
): Promise<string | null> {
  const manufacturer = labelerName || "Unknown Manufacturer";
  
  logs.push({
    step: "upsert_variant",
    status: "info",
    message: `Creating/updating variant for manufacturer: ${manufacturer}, NDC: ${ndc}`,
  });

  try {
    // Check if variant exists for this med_id, manufacturer AND has this NDC in ndc_list
    const { data: existingVariants } = await supabase
      .from("rx_variants")
      .select("id, ndc_list")
      .eq("rx_med_id", medId)
      .eq("manufacturer", manufacturer);

    let variantId: string | null = null;
    let existingVariant: any = null;

    // Find variant that contains this NDC or exact manufacturer match
    if (existingVariants && existingVariants.length > 0) {
      // First try to find one with matching NDC
      existingVariant = existingVariants.find((v: any) => 
        v.ndc_list && v.ndc_list.includes(ndc)
      );
      
      // If not found by NDC, use the first one for this manufacturer
      if (!existingVariant) {
        existingVariant = existingVariants[0];
      }
    }

    if (existingVariant) {
      variantId = existingVariant.id;
      // Update existing variant - add NDC to list if not present
      const currentNdcList = existingVariant.ndc_list || [];
      const updatedNdcList = currentNdcList.includes(ndc) 
        ? currentNdcList 
        : [...currentNdcList, ndc];
      
      const { error: updateError } = await supabase
        .from("rx_variants")
        .update({
          ndc_list: updatedNdcList,
          dosage_form: dosageForm || undefined,
          strength_text: strengthText || undefined,
          spl_set_id: splSetId || undefined,
          data_source: "hydrate-label-data",
          updated_at: new Date().toISOString(),
        })
        .eq("id", variantId);

      if (updateError) {
        logs.push({
          step: "upsert_variant",
          status: "error",
          message: `Failed to update variant: ${updateError.message}`,
        });
        return null;
      }
      logs.push({
        step: "upsert_variant",
        status: "success",
        message: `Updated existing variant: ${variantId}`,
      });
    } else {
      // Create new variant for this manufacturer
      const { data: newVariant, error: insertError } = await supabase
        .from("rx_variants")
        .insert({
          rx_med_id: medId,
          manufacturer,
          ndc_list: [ndc],
          dosage_form: dosageForm,
          strength_text: strengthText,
          spl_set_id: splSetId,
          data_source: "hydrate-label-data",
        })
        .select("id")
        .single();

      if (insertError || !newVariant) {
        logs.push({
          step: "upsert_variant",
          status: "error",
          message: `Failed to create variant: ${insertError?.message}`,
        });
        return null;
      }
      variantId = newVariant.id;
      logs.push({
        step: "upsert_variant",
        status: "success",
        message: `Created new variant for ${manufacturer}: ${variantId}`,
      });
    }

    // Delete existing rx_variant_ingredients for this variant
    await supabase
      .from("rx_variant_ingredients")
      .delete()
      .eq("variant_id", variantId);

    // Insert rx_variant_ingredients
    if (matchedIngredients.length > 0) {
      const ingredientRows = matchedIngredients.map(ing => ({
        variant_id: variantId,
        ingredient_id: ing.id,
        role: ing.role,
        notes: null,
      }));

      const { error: ingError } = await supabase
        .from("rx_variant_ingredients")
        .insert(ingredientRows);

      if (ingError) {
        logs.push({
          step: "upsert_ingredients",
          status: "warning",
          message: `Failed to insert some ingredients: ${ingError.message}`,
        });
      } else {
        logs.push({
          step: "upsert_ingredients",
          status: "success",
          message: `Inserted ${ingredientRows.length} variant ingredients`,
        });
      }
    }

    // Upsert rx_verdicts
    const { data: existingVerdict } = await supabase
      .from("rx_verdicts")
      .select("id")
      .eq("variant_id", variantId)
      .maybeSingle();

    if (existingVerdict) {
      const { error: verdictError } = await supabase
        .from("rx_verdicts")
        .update({
          status,
          confidence,
          classification_rationale: reason,
          summary_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingVerdict.id);

      if (verdictError) {
        logs.push({
          step: "upsert_verdict",
          status: "error",
          message: `Failed to update verdict: ${verdictError.message}`,
        });
      } else {
        logs.push({
          step: "upsert_verdict",
          status: "success",
          message: `Updated verdict for variant: ${variantId}`,
        });
      }
    } else {
      const { error: verdictError } = await supabase
        .from("rx_verdicts")
        .insert({
          variant_id: variantId,
          status,
          confidence,
          classification_rationale: reason,
          summary_reason: reason,
        });

      if (verdictError) {
        logs.push({
          step: "upsert_verdict",
          status: "error",
          message: `Failed to create verdict: ${verdictError.message}`,
        });
      } else {
        logs.push({
          step: "upsert_verdict",
          status: "success",
          message: `Created verdict for variant: ${variantId}`,
        });
      }
    }

    return variantId;
  } catch (error) {
    logs.push({
      step: "upsert_variant",
      status: "error",
      message: `Error in upsertVariantData: ${error instanceof Error ? error.message : String(error)}`,
    });
    return null;
  }
}

// Ensure ingredients exist in DB
async function ensureIngredientsExist(
  supabase: any,
  ingredientNames: string[],
  logs: HydrateLog[]
): Promise<void> {
  if (ingredientNames.length === 0) return;

  try {
    // Get existing ingredients
    const { data: existing } = await supabase
      .from("ingredients")
      .select("name");

    const existingNames = new Set((existing || []).map((i: any) => normalizeIngredientName(i.name)));
    
    // Find missing ingredients
    const missing = ingredientNames.filter(name => !existingNames.has(normalizeIngredientName(name)));
    
    if (missing.length > 0) {
      // We don't auto-create ingredients - they need to be reviewed
      logs.push({
        step: "check_ingredients",
        status: "info",
        message: `${missing.length} ingredients not in database (will show as unmatched)`,
        data: missing.slice(0, 10),
      });
    }
  } catch (error) {
    logs.push({
      step: "check_ingredients",
      status: "warning",
      message: `Error checking ingredients: ${error instanceof Error ? error.message : String(error)}`,
    });
  }
}

// Process a single NDC result
async function processNdcResult(
  supabase: any,
  medId: string,
  ndcResult: OpenFdaNdcResult,
  supabaseUrl: string,
  supabaseKey: string,
  logs: HydrateLog[]
): Promise<VariantResult | null> {
  const { ndc, labeler_name, dosage_form, strength } = ndcResult;
  
  logs.push({
    step: "process_ndc",
    status: "info",
    message: `Processing NDC ${ndc} for manufacturer: ${labeler_name}`,
  });

  // Get DailyMed set_id
  const setId = await getSetIdFromNdc(ndc, logs);
  
  let activeIngredients: string[] = [];
  let inactiveIngredients: string[] = [];
  let inactiveRawText = "";
  let status = "needs_verification";
  let confidence = 10;
  let reason = "Inactive ingredients not available for this NDC yet.";
  let matchedIngredients: { name: string; id: string; role: string }[] = [];
  
  if (setId) {
    // Fetch and parse SPL ingredients
    const ingredients = await fetchSplIngredients(setId, logs);
    
    if (ingredients) {
      activeIngredients = ingredients.active;
      inactiveIngredients = ingredients.inactive;
      inactiveRawText = ingredients.inactiveRawText;
      
      // Ensure ingredients exist check
      await ensureIngredientsExist(
        supabase,
        [...activeIngredients, ...inactiveIngredients],
        logs
      );
      
      // Compute status
      const statusResult = await computeStatus(
        activeIngredients,
        inactiveIngredients,
        supabaseUrl,
        supabaseKey,
        logs
      );
      
      status = statusResult.status;
      confidence = statusResult.confidence;
      reason = statusResult.reason;
      matchedIngredients = statusResult.matchedIngredients;
    }
  } else {
    // No set_id found - still create variant but with needs_verification
    logs.push({
      step: "process_ndc",
      status: "warning",
      message: `No DailyMed set_id found for NDC ${ndc} - creating variant with needs_verification`,
    });
  }

  // Upsert variant data
  const variantId = await upsertVariantData(
    supabase,
    medId,
    ndc,
    labeler_name,
    dosage_form || null,
    strength || null,
    setId,
    status,
    confidence,
    reason,
    matchedIngredients,
    logs
  );

  if (!variantId) {
    return null;
  }

  return {
    ndc,
    set_id: setId || undefined,
    manufacturer: labeler_name,
    variant_id: variantId,
    status,
    confidence,
    active_ingredients: activeIngredients,
    inactive_ingredients: inactiveIngredients,
  };
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
      variants_hydrated: 0,
      variant_ids: [],
      variants: [],
    };

    logs.push({
      step: "start",
      status: "info",
      message: `Starting multi-variant hydration for med_id: ${med_id}`,
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

    // Step 1: Find ALL NDCs from openFDA (up to 10)
    const ndcResults = await findAllNdcsFromOpenFda(
      med.generic_name,
      med.dosage_forms,
      med.brand_names,
      logs
    );

    if (ndcResults.length === 0) {
      logs.push({
        step: "complete",
        status: "warning",
        message: "No NDCs found in openFDA - cannot hydrate variants",
      });
      result.logs = logs;
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logs.push({
      step: "hydrate_variants",
      status: "info",
      message: `Processing ${ndcResults.length} NDC results to create/update variants`,
    });

    // Step 2: Process each NDC result to create/update variants
    const variantResults: VariantResult[] = [];
    
    // Collect raw text and ingredient info for rx_meds update
    let allInactiveIngredients: string[] = [];
    let allActiveIngredients: string[] = [];
    let firstInactiveRawText = "";
    let firstNdc = "";
    let firstSetId = "";
    
    for (const ndcResult of ndcResults) {
      const variantResult = await processNdcResult(
        supabase,
        med_id,
        ndcResult,
        supabaseUrl,
        supabaseServiceKey,
        logs
      );
      
      if (variantResult) {
        variantResults.push(variantResult);
        result.variant_ids.push(variantResult.variant_id);
        
        // Collect all unique ingredients
        for (const ing of variantResult.active_ingredients) {
          if (!allActiveIngredients.includes(ing)) {
            allActiveIngredients.push(ing);
          }
        }
        for (const ing of variantResult.inactive_ingredients) {
          if (!allInactiveIngredients.includes(ing)) {
            allInactiveIngredients.push(ing);
          }
        }
        
        // Keep first successful NDC/set_id for rx_meds record
        if (!firstNdc && variantResult.ndc) {
          firstNdc = variantResult.ndc;
        }
        if (!firstSetId && variantResult.set_id) {
          firstSetId = variantResult.set_id;
        }
      }
    }

    result.variants_hydrated = variantResults.length;
    result.variants = variantResults;

    // Set legacy single-variant fields for backward compatibility
    if (variantResults.length > 0) {
      const firstVariant = variantResults[0];
      result.ndc = firstVariant.ndc;
      result.set_id = firstVariant.set_id;
      result.active_ingredients = firstVariant.active_ingredients;
      result.inactive_ingredients = firstVariant.inactive_ingredients;
      result.status = firstVariant.status;
      result.confidence = firstVariant.confidence;
      result.variant_id = firstVariant.variant_id;
    }

    // Step 3: Update rx_meds record with aggregated info
    if (variantResults.length > 0) {
      // Determine best overall status for rx_meds.default_status
      let bestStatus = "needs_verification";
      let bestConfidence = 10;
      let bestReason = "Multiple variants available - check individual manufacturers";
      
      // Find the best (most favorable) status among variants
      const statusPriority = { "halal": 4, "mushbooh": 3, "needs_verification": 2, "haram": 1 };
      for (const v of variantResults) {
        const currentPriority = statusPriority[v.status as keyof typeof statusPriority] || 0;
        const bestPriority = statusPriority[bestStatus as keyof typeof statusPriority] || 0;
        if (currentPriority > bestPriority) {
          bestStatus = v.status;
          bestConfidence = v.confidence;
        }
      }
      
      if (allInactiveIngredients.length === 0) {
        bestStatus = "needs_verification";
        bestConfidence = 10;
        bestReason = "No inactive ingredient data available across variants";
      }

      const confidenceLevel = bestConfidence >= 80 ? "high" : bestConfidence >= 50 ? "medium" : "low";
      
      const { error: updateError } = await supabase
        .from("rx_meds")
        .update({
          ndc: firstNdc || null,
          dailymed_set_id: firstSetId || null,
          active_ingredients: allActiveIngredients,
          inactive_ingredients: allInactiveIngredients,
          confidence_level: confidenceLevel,
          status_reason: bestReason,
          default_status: bestStatus,
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
          message: `Updated rx_meds with ${variantResults.length} variants hydrated`,
        });
        result.success = true;
      }
      
      result.confidence_level = confidenceLevel;
      result.status_reason = bestReason;
    }

    logs.push({
      step: "complete",
      status: result.success ? "success" : "warning",
      message: result.success 
        ? `Hydration completed: ${variantResults.length} variants created/updated` 
        : "Hydration completed with issues - some data may be missing",
      data: {
        variants_hydrated: variantResults.length,
        variant_ids: result.variant_ids,
      },
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
        variants_hydrated: 0,
        variant_ids: [],
        logs: [{ step: "error", status: "error", message: String(error) }],
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
