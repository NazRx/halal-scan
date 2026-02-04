import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Brand seed data with optional labeler info
const BRAND_SEEDS = [
  { brand_name: "Tylenol", labeler_name: "Johnson & Johnson" },
  { brand_name: "Advil", labeler_name: "Pfizer" },
  { brand_name: "Motrin", labeler_name: "Johnson & Johnson" },
  { brand_name: "Aleve", labeler_name: "Bayer" },
  { brand_name: "Bayer", labeler_name: "Bayer" },
  { brand_name: "Excedrin", labeler_name: "GSK" },
  { brand_name: "Midol", labeler_name: "Bayer" },
  { brand_name: "Zyrtec", labeler_name: "Johnson & Johnson" },
  { brand_name: "Claritin", labeler_name: "Bayer" },
  { brand_name: "Allegra", labeler_name: "Sanofi" },
  { brand_name: "Benadryl", labeler_name: "Johnson & Johnson" },
  { brand_name: "Flonase", labeler_name: "GSK" },
  { brand_name: "Mucinex", labeler_name: "Reckitt Benckiser" },
  { brand_name: "Robitussin", labeler_name: "Pfizer" },
  { brand_name: "Delsym", labeler_name: "Reckitt Benckiser" },
  { brand_name: "Sudafed", labeler_name: "Johnson & Johnson" },
  { brand_name: "DayQuil", labeler_name: "Procter & Gamble" },
  { brand_name: "NyQuil", labeler_name: "Procter & Gamble" },
  { brand_name: "Theraflu", labeler_name: "GSK" },
  { brand_name: "Pepto-Bismol", labeler_name: "Procter & Gamble" },
  { brand_name: "Tums", labeler_name: "GSK" },
  { brand_name: "Pepcid", labeler_name: "Johnson & Johnson" },
  { brand_name: "Prilosec OTC", labeler_name: "Procter & Gamble" },
  { brand_name: "Nexium 24HR", labeler_name: "Pfizer" },
  { brand_name: "Imodium", labeler_name: "Johnson & Johnson" },
  { brand_name: "Miralax", labeler_name: "Bayer" },
  { brand_name: "Gas-X", labeler_name: "GSK" },
  { brand_name: "Preparation H", labeler_name: "Pfizer" },
  { brand_name: "Neosporin", labeler_name: "Johnson & Johnson" },
  { brand_name: "Cortizone-10", labeler_name: "Chattem" },
  { brand_name: "Aquaphor", labeler_name: "Beiersdorf" },
  { brand_name: "Vaseline", labeler_name: "Unilever" },
  { brand_name: "Colgate", labeler_name: "Colgate-Palmolive" },
  { brand_name: "Crest", labeler_name: "Procter & Gamble" },
  { brand_name: "Listerine", labeler_name: "Johnson & Johnson" },
  { brand_name: "Equate", labeler_name: "Walmart", notes: "Walmart store brand" },
  { brand_name: "Kirkland Signature", labeler_name: "Costco", notes: "Costco store brand" },
  { brand_name: "Up&Up", labeler_name: "Target", notes: "Target store brand" },
  { brand_name: "CVS Health", labeler_name: "CVS", notes: "CVS store brand" },
  { brand_name: "Walgreens", labeler_name: "Walgreens", notes: "Walgreens store brand" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let brandsUpserted = 0;
    let linksCreated = 0;
    const productsUnmatched: string[] = [];

    // 1) Upsert all brands
    for (const brand of BRAND_SEEDS) {
      const { error } = await supabase
        .from("otc_brands")
        .upsert(
          {
            brand_name: brand.brand_name,
            labeler_name: brand.labeler_name,
            notes: brand.notes || null,
          },
          { onConflict: "brand_name" }
        );

      if (!error) {
        brandsUpserted++;
      } else {
        console.error(`Error upserting brand ${brand.brand_name}:`, error);
      }
    }

    // 2) Fetch all brands with their IDs
    const { data: allBrands } = await supabase
      .from("otc_brands")
      .select("id, brand_name");

    if (!allBrands) {
      throw new Error("Failed to fetch brands");
    }

    // Create a map for quick lookup (lowercase for case-insensitive matching)
    const brandMap = new Map<string, string>();
    for (const b of allBrands) {
      brandMap.set(b.brand_name.toLowerCase(), b.id);
    }

    // 3) Fetch all OTC products
    const { data: allProducts } = await supabase
      .from("otc_products")
      .select("id, name, display_name, search_terms, brand");

    if (!allProducts) {
      throw new Error("Failed to fetch products");
    }

    // 4) Link brands to products
    for (const product of allProducts) {
      const matchedBrands: Array<{ brandId: string; isPrimary: boolean }> = [];

      // Check display_name for brand match
      const displayName = product.display_name?.toLowerCase() || "";
      const productName = product.name?.toLowerCase() || "";
      const existingBrand = product.brand?.toLowerCase() || "";

      for (const [brandNameLower, brandId] of brandMap) {
        let isPrimary = false;

        // Check if display_name starts with brand
        if (displayName.startsWith(brandNameLower)) {
          isPrimary = true;
        }

        // Check if display_name contains brand as a whole word
        const brandRegex = new RegExp(`\\b${escapeRegex(brandNameLower)}\\b`, "i");
        const matchesDisplay = brandRegex.test(displayName);
        const matchesName = brandRegex.test(productName);

        // Check search_terms
        const searchTerms = product.search_terms || [];
        const matchesSearchTerms = searchTerms.some((term: string) =>
          term.toLowerCase().includes(brandNameLower)
        );

        // Check existing brand field
        const matchesBrandField = existingBrand === brandNameLower;

        if (matchesDisplay || matchesName || matchesSearchTerms || matchesBrandField) {
          // Mark as primary if it's the first token or matches brand field
          if (displayName.split(" ")[0]?.toLowerCase() === brandNameLower || matchesBrandField) {
            isPrimary = true;
          }

          matchedBrands.push({ brandId, isPrimary });
        }
      }

      // Insert links (avoiding duplicates)
      for (const match of matchedBrands) {
        const { error } = await supabase
          .from("otc_product_brands")
          .upsert(
            {
              otc_product_id: product.id,
              otc_brand_id: match.brandId,
              is_primary: match.isPrimary,
            },
            { onConflict: "otc_product_id,otc_brand_id" }
          );

        if (!error) {
          linksCreated++;
        }
      }

      // Track unmatched products
      if (matchedBrands.length === 0) {
        productsUnmatched.push(product.display_name || product.name);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        brandsUpserted,
        linksCreated,
        productsUnmatchedCount: productsUnmatched.length,
        productsUnmatched: productsUnmatched.slice(0, 20), // Limit for response size
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in seed-otc-brands:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
