import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OtcProduct {
  display_name: string;
  generic_name: string;
  category: string; // Canonical category key
  primary_category: string; // Human-readable label for UI
  common_uses: string;
  search_terms: string; // Semicolon-separated brand names/synonyms
  is_vitamin: boolean;
  is_combo: boolean;
  combo_ingredients: string;
  dosage_form?: string;
  strength?: string;
  route?: string;
}

interface SeedResult {
  productsUpserted: number;
  synonymsInserted: number;
  categoryStats: Record<string, number>;
  errors: string[];
}

// ============================================================
// EXPANDED OTC SEED DATA - ~300 Products
// Organized by canonical category keys
// ============================================================

const OTC_SEED_DATA: OtcProduct[] = [
  // ============================================================
  // PAIN (35 products)
  // ============================================================
  { display_name: "Acetaminophen 325mg Tablet", generic_name: "acetaminophen 325mg tablet", category: "pain", primary_category: "Pain Relief", common_uses: "Pain and fever", search_terms: "Tylenol;Tylenol Regular Strength;APAP;paracetamol", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "325mg", route: "oral" },
  { display_name: "Acetaminophen 500mg Tablet", generic_name: "acetaminophen 500mg tablet", category: "pain", primary_category: "Pain Relief", common_uses: "Pain and fever", search_terms: "Tylenol Extra Strength;APAP 500", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "500mg", route: "oral" },
  { display_name: "Acetaminophen 650mg Extended Release", generic_name: "acetaminophen 650mg er", category: "pain", primary_category: "Pain Relief", common_uses: "Arthritis pain", search_terms: "Tylenol Arthritis;Tylenol 8HR", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "650mg", route: "oral" },
  { display_name: "Acetaminophen Liquid 160mg/5mL", generic_name: "acetaminophen liquid pediatric", category: "pain", primary_category: "Pain Relief", common_uses: "Children's pain and fever", search_terms: "Children's Tylenol;Infants Tylenol;pediatric acetaminophen", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "160mg/5mL", route: "oral" },
  { display_name: "Ibuprofen 200mg Tablet", generic_name: "ibuprofen 200mg tablet", category: "pain", primary_category: "Pain Relief", common_uses: "Pain fever inflammation", search_terms: "Advil;Motrin;Motrin IB;NSAID", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "200mg", route: "oral" },
  { display_name: "Ibuprofen 400mg Tablet", generic_name: "ibuprofen 400mg tablet", category: "pain", primary_category: "Pain Relief", common_uses: "Pain fever inflammation", search_terms: "Advil Dual Action;Motrin 400", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "400mg", route: "oral" },
  { display_name: "Ibuprofen Liquid 100mg/5mL", generic_name: "ibuprofen liquid pediatric", category: "pain", primary_category: "Pain Relief", common_uses: "Children's pain and fever", search_terms: "Children's Advil;Children's Motrin;pediatric ibuprofen", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "100mg/5mL", route: "oral" },
  { display_name: "Naproxen Sodium 220mg", generic_name: "naproxen sodium 220mg", category: "pain", primary_category: "Pain Relief", common_uses: "Pain inflammation", search_terms: "Aleve;Naprosyn;naproxen", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "220mg", route: "oral" },
  { display_name: "Naproxen Sodium 440mg", generic_name: "naproxen sodium 440mg", category: "pain", primary_category: "Pain Relief", common_uses: "Back pain arthritis", search_terms: "Aleve Back & Muscle;Aleve PM", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "440mg", route: "oral" },
  { display_name: "Aspirin 325mg", generic_name: "aspirin 325mg", category: "pain", primary_category: "Pain Relief", common_uses: "Pain fever", search_terms: "Bayer;Bufferin;ASA;acetylsalicylic acid", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "325mg", route: "oral" },
  { display_name: "Aspirin 81mg Low Dose", generic_name: "aspirin 81mg", category: "pain", primary_category: "Pain Relief", common_uses: "Heart health antiplatelet", search_terms: "Baby Aspirin;Bayer Low Dose;ASA 81", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "81mg", route: "oral" },
  { display_name: "Aspirin 500mg", generic_name: "aspirin 500mg", category: "pain", primary_category: "Pain Relief", common_uses: "Pain fever", search_terms: "Bayer Extra Strength;BC Powder", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "500mg", route: "oral" },
  { display_name: "Excedrin Extra Strength", generic_name: "acetaminophen aspirin caffeine", category: "pain", primary_category: "Pain Relief", common_uses: "Headache migraine", search_terms: "Excedrin;Excedrin Migraine;headache relief", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;aspirin;caffeine", dosage_form: "tablet", route: "oral" },
  { display_name: "Excedrin Tension Headache", generic_name: "acetaminophen caffeine", category: "pain", primary_category: "Pain Relief", common_uses: "Tension headache", search_terms: "Excedrin Tension;tension relief", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;caffeine", dosage_form: "tablet", route: "oral" },
  { display_name: "Midol Complete", generic_name: "acetaminophen caffeine pyrilamine", category: "pain", primary_category: "Pain Relief", common_uses: "Menstrual pain", search_terms: "Midol;Pamprin;menstrual relief;period pain", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;caffeine;pyrilamine", dosage_form: "caplet", route: "oral" },
  { display_name: "Goody's Powder", generic_name: "acetaminophen aspirin caffeine powder", category: "pain", primary_category: "Pain Relief", common_uses: "Fast headache relief", search_terms: "Goody's;BC Powder;headache powder", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;aspirin;caffeine", dosage_form: "powder", route: "oral" },
  { display_name: "Diclofenac 1% Gel", generic_name: "diclofenac topical gel", category: "pain", primary_category: "Pain Relief", common_uses: "Joint pain arthritis", search_terms: "Voltaren;Voltaren Gel;arthritis gel", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", strength: "1%", route: "topical" },
  { display_name: "Lidocaine 4% Patch", generic_name: "lidocaine patch", category: "pain", primary_category: "Pain Relief", common_uses: "Local pain relief", search_terms: "Salonpas;Lidoderm;pain patch;lidocaine cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "patch", strength: "4%", route: "topical" },
  { display_name: "Menthol Camphor Topical", generic_name: "menthol camphor topical", category: "pain", primary_category: "Pain Relief", common_uses: "Muscle aches", search_terms: "Icy Hot;IcyHot;Bengay;Tiger Balm;Biofreeze;muscle rub", is_vitamin: false, is_combo: true, combo_ingredients: "menthol;camphor", dosage_form: "cream", route: "topical" },
  { display_name: "Capsaicin Cream 0.025%", generic_name: "capsaicin topical", category: "pain", primary_category: "Pain Relief", common_uses: "Arthritis pain", search_terms: "Capzasin;Zostrix;capsaicin cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "0.025%", route: "topical" },
  { display_name: "Methyl Salicylate Topical", generic_name: "methyl salicylate topical", category: "pain", primary_category: "Pain Relief", common_uses: "Muscle pain", search_terms: "Bengay Ultra;Icy Hot Original;wintergreen oil", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", route: "topical" },
  { display_name: "Arnica Gel", generic_name: "arnica montana topical", category: "pain", primary_category: "Pain Relief", common_uses: "Bruises muscle soreness", search_terms: "Arnicare;arnica cream;Boiron Arnica", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", route: "topical" },
  { display_name: "Magnesium Sulfate Soak", generic_name: "epsom salt", category: "pain", primary_category: "Pain Relief", common_uses: "Muscle soreness soak", search_terms: "Epsom Salt;Dr Teal's;magnesium bath", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "crystals", route: "topical" },
  { display_name: "Acetaminophen PM", generic_name: "acetaminophen diphenhydramine", category: "pain", primary_category: "Pain Relief", common_uses: "Nighttime pain relief", search_terms: "Tylenol PM;nighttime pain relief", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;diphenhydramine", dosage_form: "caplet", route: "oral" },
  { display_name: "Ibuprofen PM", generic_name: "ibuprofen diphenhydramine", category: "pain", primary_category: "Pain Relief", common_uses: "Nighttime pain relief", search_terms: "Advil PM;Motrin PM", is_vitamin: false, is_combo: true, combo_ingredients: "ibuprofen;diphenhydramine", dosage_form: "caplet", route: "oral" },
  { display_name: "Naproxen PM", generic_name: "naproxen diphenhydramine", category: "pain", primary_category: "Pain Relief", common_uses: "Nighttime pain relief", search_terms: "Aleve PM;naproxen sleep", is_vitamin: false, is_combo: true, combo_ingredients: "naproxen;diphenhydramine", dosage_form: "caplet", route: "oral" },
  { display_name: "Salonpas Pain Patch", generic_name: "menthol methyl salicylate patch", category: "pain", primary_category: "Pain Relief", common_uses: "Muscle pain", search_terms: "Salonpas;pain relieving patch", is_vitamin: false, is_combo: true, combo_ingredients: "menthol;methyl salicylate", dosage_form: "patch", route: "topical" },
  { display_name: "ThermaCare Heat Wrap", generic_name: "iron powder heat wrap", category: "pain", primary_category: "Pain Relief", common_uses: "Back pain muscle aches", search_terms: "ThermaCare;heat wrap;heating pad", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "wrap", route: "topical" },
  { display_name: "Blue-Emu Cream", generic_name: "emu oil glucosamine", category: "pain", primary_category: "Pain Relief", common_uses: "Joint pain muscle aches", search_terms: "Blue Emu;BlueEmu;emu oil cream", is_vitamin: false, is_combo: true, combo_ingredients: "emu oil;glucosamine", dosage_form: "cream", route: "topical" },
  { display_name: "Aspercreme with Lidocaine", generic_name: "lidocaine 4% cream", category: "pain", primary_category: "Pain Relief", common_uses: "Pain relief", search_terms: "Aspercreme;lidocaine cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "4%", route: "topical" },
  { display_name: "Acetaminophen Suppository", generic_name: "acetaminophen rectal", category: "pain", primary_category: "Pain Relief", common_uses: "Fever in children", search_terms: "FeverAll;rectal acetaminophen", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "suppository", route: "rectal" },
  { display_name: "Magnesium Salicylate", generic_name: "magnesium salicylate", category: "pain", primary_category: "Pain Relief", common_uses: "Backache arthritis", search_terms: "Doan's;backache pills", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", route: "oral" },
  { display_name: "Acetaminophen Rapid Release", generic_name: "acetaminophen rapid release", category: "pain", primary_category: "Pain Relief", common_uses: "Fast pain relief", search_terms: "Tylenol Rapid Release;fast acting tylenol", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gelcap", strength: "500mg", route: "oral" },
  { display_name: "Ibuprofen Liquid Gel", generic_name: "ibuprofen liquid gel", category: "pain", primary_category: "Pain Relief", common_uses: "Fast pain relief", search_terms: "Advil Liqui-Gels;liquid ibuprofen", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "200mg", route: "oral" },
  { display_name: "Bengay Ultra Strength", generic_name: "menthol methyl salicylate camphor", category: "pain", primary_category: "Pain Relief", common_uses: "Deep muscle pain", search_terms: "Bengay;Ben Gay;muscle cream", is_vitamin: false, is_combo: true, combo_ingredients: "menthol;methyl salicylate;camphor", dosage_form: "cream", route: "topical" },

  // ============================================================
  // ALLERGY (25 products)
  // ============================================================
  { display_name: "Cetirizine 10mg", generic_name: "cetirizine 10mg", category: "allergy", primary_category: "Allergy", common_uses: "Seasonal allergies", search_terms: "Zyrtec;Zyrtec Allergy;24 hour allergy", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "10mg", route: "oral" },
  { display_name: "Cetirizine Liquid", generic_name: "cetirizine liquid", category: "allergy", primary_category: "Allergy", common_uses: "Children's allergies", search_terms: "Children's Zyrtec;Zyrtec syrup", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "5mg/5mL", route: "oral" },
  { display_name: "Loratadine 10mg", generic_name: "loratadine 10mg", category: "allergy", primary_category: "Allergy", common_uses: "Seasonal allergies", search_terms: "Claritin;Claritin 24 Hour;Alavert", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "10mg", route: "oral" },
  { display_name: "Loratadine Liquid", generic_name: "loratadine liquid", category: "allergy", primary_category: "Allergy", common_uses: "Children's allergies", search_terms: "Children's Claritin;Claritin syrup", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "5mg/5mL", route: "oral" },
  { display_name: "Fexofenadine 180mg", generic_name: "fexofenadine 180mg", category: "allergy", primary_category: "Allergy", common_uses: "Seasonal allergies", search_terms: "Allegra;Allegra Allergy;Allegra 24 Hour", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "180mg", route: "oral" },
  { display_name: "Fexofenadine 60mg", generic_name: "fexofenadine 60mg", category: "allergy", primary_category: "Allergy", common_uses: "Allergies", search_terms: "Allegra 12 Hour", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "60mg", route: "oral" },
  { display_name: "Diphenhydramine 25mg", generic_name: "diphenhydramine 25mg", category: "allergy", primary_category: "Allergy", common_uses: "Allergy itch", search_terms: "Benadryl;Benadryl Allergy;diphenhydramine", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "25mg", route: "oral" },
  { display_name: "Diphenhydramine Liquid", generic_name: "diphenhydramine liquid", category: "allergy", primary_category: "Allergy", common_uses: "Children's allergy", search_terms: "Children's Benadryl;Benadryl syrup", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "12.5mg/5mL", route: "oral" },
  { display_name: "Chlorpheniramine 4mg", generic_name: "chlorpheniramine 4mg", category: "allergy", primary_category: "Allergy", common_uses: "Allergy symptoms", search_terms: "Chlor-Trimeton;CTM;chlorpheniramine maleate", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "4mg", route: "oral" },
  { display_name: "Fluticasone Nasal Spray", generic_name: "fluticasone nasal", category: "allergy", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Flonase;Flonase Allergy Relief;fluticasone propionate", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Triamcinolone Nasal Spray", generic_name: "triamcinolone nasal", category: "allergy", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Nasacort;Nasacort Allergy 24HR", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Budesonide Nasal Spray", generic_name: "budesonide nasal", category: "allergy", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Rhinocort;budesonide spray", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Azelastine Nasal Spray", generic_name: "azelastine nasal", category: "allergy", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Astepro;azelastine hydrochloride", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Cromolyn Sodium Nasal", generic_name: "cromolyn sodium nasal", category: "allergy", primary_category: "Allergy", common_uses: "Allergy prevention", search_terms: "NasalCrom;cromolyn nasal spray", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Loratadine-D 12 Hour", generic_name: "loratadine pseudoephedrine", category: "allergy", primary_category: "Allergy", common_uses: "Allergy with congestion", search_terms: "Claritin-D;Claritin D 12 Hour", is_vitamin: false, is_combo: true, combo_ingredients: "loratadine;pseudoephedrine", dosage_form: "tablet", route: "oral" },
  { display_name: "Cetirizine-D", generic_name: "cetirizine pseudoephedrine", category: "allergy", primary_category: "Allergy", common_uses: "Allergy with congestion", search_terms: "Zyrtec-D;Zyrtec D", is_vitamin: false, is_combo: true, combo_ingredients: "cetirizine;pseudoephedrine", dosage_form: "tablet", route: "oral" },
  { display_name: "Fexofenadine-D", generic_name: "fexofenadine pseudoephedrine", category: "allergy", primary_category: "Allergy", common_uses: "Allergy with congestion", search_terms: "Allegra-D;Allegra D 24 Hour", is_vitamin: false, is_combo: true, combo_ingredients: "fexofenadine;pseudoephedrine", dosage_form: "tablet", route: "oral" },
  { display_name: "Levocetirizine 5mg", generic_name: "levocetirizine 5mg", category: "allergy", primary_category: "Allergy", common_uses: "Allergies", search_terms: "Xyzal;Xyzal Allergy 24HR", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "5mg", route: "oral" },
  { display_name: "Olopatadine Nasal", generic_name: "olopatadine nasal", category: "allergy", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Patanase", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Ketotifen Eye Drops", generic_name: "ketotifen ophthalmic", category: "allergy", primary_category: "Allergy", common_uses: "Eye allergy", search_terms: "Zaditor;Alaway;allergy eye drops", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", route: "ophthalmic" },
  { display_name: "Olopatadine Eye Drops", generic_name: "olopatadine ophthalmic", category: "allergy", primary_category: "Allergy", common_uses: "Eye allergy", search_terms: "Pataday;Patanol;allergy eye drops", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", route: "ophthalmic" },
  { display_name: "Pheniramine Naphazoline Eye", generic_name: "pheniramine naphazoline", category: "allergy", primary_category: "Allergy", common_uses: "Red itchy eyes", search_terms: "Visine-A;Opcon-A;allergy eye drops", is_vitamin: false, is_combo: true, combo_ingredients: "pheniramine;naphazoline", dosage_form: "drops", route: "ophthalmic" },
  { display_name: "Diphenhydramine Cream", generic_name: "diphenhydramine topical", category: "allergy", primary_category: "Allergy", common_uses: "Itch relief", search_terms: "Benadryl Cream;anti-itch cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "2%", route: "topical" },
  { display_name: "Cetirizine Dissolving Tabs", generic_name: "cetirizine odt", category: "allergy", primary_category: "Allergy", common_uses: "Allergies", search_terms: "Zyrtec Dissolve Tabs;Zyrtec ODT", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "dissolving tablet", strength: "10mg", route: "oral" },
  { display_name: "Loratadine Reditabs", generic_name: "loratadine odt", category: "allergy", primary_category: "Allergy", common_uses: "Allergies", search_terms: "Claritin RediTabs;Claritin dissolve", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "dissolving tablet", strength: "10mg", route: "oral" },

  // ============================================================
  // COLD & FLU (35 products)
  // ============================================================
  { display_name: "Pseudoephedrine 30mg", generic_name: "pseudoephedrine 30mg", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal congestion", search_terms: "Sudafed;Sudafed PE;nasal decongestant", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "30mg", route: "oral" },
  { display_name: "Pseudoephedrine 120mg ER", generic_name: "pseudoephedrine 120mg er", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal congestion", search_terms: "Sudafed 12 Hour;Sudafed Sinus", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "120mg", route: "oral" },
  { display_name: "Phenylephrine 10mg", generic_name: "phenylephrine 10mg", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal congestion", search_terms: "Sudafed PE;phenylephrine decongestant", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "10mg", route: "oral" },
  { display_name: "Oxymetazoline Nasal Spray", generic_name: "oxymetazoline nasal", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal congestion", search_terms: "Afrin;Afrin No Drip;nasal spray;Mucinex Sinus-Max", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", strength: "0.05%", route: "nasal" },
  { display_name: "Saline Nasal Spray", generic_name: "sodium chloride nasal", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal moisture", search_terms: "Ocean Spray;Ayr Saline;saline mist;Simply Saline", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Saline Nasal Rinse", generic_name: "sodium chloride nasal rinse", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Sinus rinse", search_terms: "NeilMed;Neti Pot;sinus rinse;nasal irrigation", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "solution", route: "nasal" },
  { display_name: "DayQuil Cold & Flu", generic_name: "acetaminophen dextromethorphan phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Multi-symptom cold", search_terms: "DayQuil;Vicks DayQuil;daytime cold medicine", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;phenylephrine", dosage_form: "liquid", route: "oral" },
  { display_name: "NyQuil Cold & Flu", generic_name: "acetaminophen dextromethorphan doxylamine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nighttime cold relief", search_terms: "NyQuil;Vicks NyQuil;nighttime cold medicine", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;doxylamine", dosage_form: "liquid", route: "oral" },
  { display_name: "DayQuil Severe", generic_name: "acetaminophen dextromethorphan guaifenesin phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Severe cold symptoms", search_terms: "DayQuil Severe;Vicks Severe", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;guaifenesin;phenylephrine", dosage_form: "liquid", route: "oral" },
  { display_name: "NyQuil Severe", generic_name: "acetaminophen dextromethorphan doxylamine phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Severe nighttime cold", search_terms: "NyQuil Severe;Vicks Severe Night", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;doxylamine;phenylephrine", dosage_form: "liquid", route: "oral" },
  { display_name: "Theraflu Daytime", generic_name: "acetaminophen dextromethorphan phenylephrine hot liquid", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold and flu", search_terms: "Theraflu;Theraflu Daytime;hot liquid cold", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;phenylephrine", dosage_form: "powder", route: "oral" },
  { display_name: "Theraflu Nighttime", generic_name: "acetaminophen diphenhydramine phenylephrine hot liquid", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nighttime cold flu", search_terms: "Theraflu Nighttime;Theraflu Night", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;diphenhydramine;phenylephrine", dosage_form: "powder", route: "oral" },
  { display_name: "Tylenol Cold & Flu Severe", generic_name: "acetaminophen dextromethorphan guaifenesin phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold and flu", search_terms: "Tylenol Cold;Tylenol Cold & Flu", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;guaifenesin;phenylephrine", dosage_form: "caplet", route: "oral" },
  { display_name: "Advil Cold & Sinus", generic_name: "ibuprofen pseudoephedrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold with pain", search_terms: "Advil Cold;Advil Sinus;ibuprofen decongestant", is_vitamin: false, is_combo: true, combo_ingredients: "ibuprofen;pseudoephedrine", dosage_form: "tablet", route: "oral" },
  { display_name: "Alka-Seltzer Plus Cold", generic_name: "aspirin chlorpheniramine phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold symptoms", search_terms: "Alka-Seltzer Plus;Alka Seltzer Cold", is_vitamin: false, is_combo: true, combo_ingredients: "aspirin;chlorpheniramine;phenylephrine", dosage_form: "effervescent tablet", route: "oral" },
  { display_name: "Coricidin HBP Cold & Flu", generic_name: "acetaminophen chlorpheniramine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold for high blood pressure", search_terms: "Coricidin;Coricidin HBP;high blood pressure cold", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;chlorpheniramine", dosage_form: "tablet", route: "oral" },
  { display_name: "Zicam Rapidmelts", generic_name: "zinc gluconate glycine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold shortening", search_terms: "Zicam;Zicam Cold Remedy;zinc cold", is_vitamin: false, is_combo: true, combo_ingredients: "zinc gluconate;zinc acetate", dosage_form: "dissolving tablet", route: "oral" },
  { display_name: "Cold-EEZE Lozenges", generic_name: "zinc gluconate lozenge", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold symptom relief", search_terms: "Cold-EEZE;ColdEeze;zinc lozenge", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lozenge", route: "oral" },
  { display_name: "Vicks VapoRub", generic_name: "camphor menthol eucalyptus topical", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cough congestion", search_terms: "VapoRub;Vicks;vapor rub;chest rub", is_vitamin: false, is_combo: true, combo_ingredients: "camphor;menthol;eucalyptus", dosage_form: "ointment", route: "topical" },
  { display_name: "Vicks VapoInhaler", generic_name: "levmetamfetamine inhaler", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal congestion", search_terms: "Vicks Inhaler;VapoInhaler;nasal inhaler", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "inhaler", route: "nasal" },
  { display_name: "Afrin Severe Congestion", generic_name: "oxymetazoline menthol", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Severe congestion", search_terms: "Afrin Severe;12 hour nasal spray", is_vitamin: false, is_combo: true, combo_ingredients: "oxymetazoline;menthol", dosage_form: "spray", route: "nasal" },
  { display_name: "Xylometazoline Nasal", generic_name: "xylometazoline nasal", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal congestion", search_terms: "Otrivin;Neo-Synephrine 12 Hour", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Children's Cold & Cough", generic_name: "dextromethorphan chlorpheniramine phenylephrine pediatric", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Children's cold", search_terms: "Children's Dimetapp;Triaminic;kids cold medicine", is_vitamin: false, is_combo: true, combo_ingredients: "dextromethorphan;chlorpheniramine;phenylephrine", dosage_form: "liquid", route: "oral" },
  { display_name: "Mucinex Fast-Max Cold & Flu", generic_name: "acetaminophen dextromethorphan guaifenesin phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold and flu", search_terms: "Mucinex Fast-Max;Mucinex Cold", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;guaifenesin;phenylephrine", dosage_form: "liquid", route: "oral" },
  { display_name: "Sambucol Black Elderberry", generic_name: "elderberry extract", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Immune support cold", search_terms: "Sambucol;elderberry syrup;black elderberry", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "syrup", route: "oral" },
  { display_name: "Airborne Effervescent", generic_name: "vitamin c zinc echinacea", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Immune support", search_terms: "Airborne;immune support tablets", is_vitamin: true, is_combo: true, combo_ingredients: "vitamin c;zinc;echinacea", dosage_form: "effervescent tablet", route: "oral" },
  { display_name: "Emergen-C", generic_name: "vitamin c powder", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Immune support", search_terms: "Emergen-C;EmergenC;vitamin c drink", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "powder", strength: "1000mg", route: "oral" },
  { display_name: "Oscillococcinum", generic_name: "anas barbariae", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Flu symptoms", search_terms: "Oscillococcinum;Oscillo;homeopathic flu", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "pellets", route: "oral" },
  { display_name: "Umcka ColdCare", generic_name: "pelargonium sidoides", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Cold relief", search_terms: "Umcka;Umckaloabo;Nature's Way Umcka", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "syrup", route: "oral" },
  { display_name: "Mucinex Sinus-Max Day", generic_name: "acetaminophen oxymetazoline phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Sinus pressure", search_terms: "Mucinex Sinus-Max;sinus relief", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;oxymetazoline;phenylephrine", dosage_form: "caplet", route: "oral" },
  { display_name: "Sinex Nasal Spray", generic_name: "oxymetazoline nasal moisturizing", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Sinus congestion", search_terms: "Vicks Sinex;Sinex Severe", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Tylenol Sinus Severe", generic_name: "acetaminophen guaifenesin phenylephrine", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Sinus congestion pain", search_terms: "Tylenol Sinus;Tylenol Sinus Severe", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;guaifenesin;phenylephrine", dosage_form: "caplet", route: "oral" },
  { display_name: "Afrin Pure Sea", generic_name: "sea water nasal", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal moisture", search_terms: "Afrin Pure Sea;natural saline", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "nasal" },
  { display_name: "Breathe Right Strips", generic_name: "nasal dilator strip", category: "cold_flu", primary_category: "Cold & Flu", common_uses: "Nasal congestion relief", search_terms: "Breathe Right;nasal strips", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "strip", route: "nasal" },

  // ============================================================
  // COUGH (20 products)
  // ============================================================
  { display_name: "Dextromethorphan 15mg", generic_name: "dextromethorphan 15mg", category: "cough", primary_category: "Cough", common_uses: "Cough suppression", search_terms: "Delsym;Robitussin DM;DM cough;cough suppressant", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "15mg/5mL", route: "oral" },
  { display_name: "Dextromethorphan 30mg ER", generic_name: "dextromethorphan polistirex", category: "cough", primary_category: "Cough", common_uses: "12 hour cough relief", search_terms: "Delsym 12 Hour;extended release cough", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "suspension", strength: "30mg/5mL", route: "oral" },
  { display_name: "Guaifenesin 400mg", generic_name: "guaifenesin 400mg", category: "cough", primary_category: "Cough", common_uses: "Chest congestion", search_terms: "Mucinex;Robitussin Chest Congestion;expectorant", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "400mg", route: "oral" },
  { display_name: "Guaifenesin 1200mg ER", generic_name: "guaifenesin 1200mg er", category: "cough", primary_category: "Cough", common_uses: "Chest congestion", search_terms: "Mucinex Maximum Strength;Mucinex 12 Hour", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "1200mg", route: "oral" },
  { display_name: "Guaifenesin DM", generic_name: "guaifenesin dextromethorphan", category: "cough", primary_category: "Cough", common_uses: "Cough with congestion", search_terms: "Mucinex DM;Robitussin DM;cough and chest", is_vitamin: false, is_combo: true, combo_ingredients: "guaifenesin;dextromethorphan", dosage_form: "tablet", route: "oral" },
  { display_name: "Guaifenesin DM Liquid", generic_name: "guaifenesin dextromethorphan liquid", category: "cough", primary_category: "Cough", common_uses: "Cough with congestion", search_terms: "Robitussin DM;Mucinex DM Liquid;cough syrup", is_vitamin: false, is_combo: true, combo_ingredients: "guaifenesin;dextromethorphan", dosage_form: "liquid", route: "oral" },
  { display_name: "Children's Cough Syrup", generic_name: "dextromethorphan pediatric", category: "cough", primary_category: "Cough", common_uses: "Children's cough", search_terms: "Children's Robitussin;Children's Delsym;kids cough medicine", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", route: "oral" },
  { display_name: "Honey Cough Syrup", generic_name: "honey cough syrup", category: "cough", primary_category: "Cough", common_uses: "Natural cough relief", search_terms: "Zarbee's;Zarbees;honey cough;natural cough", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "syrup", route: "oral" },
  { display_name: "Menthol Cough Drops", generic_name: "menthol lozenge", category: "cough", primary_category: "Cough", common_uses: "Sore throat cough", search_terms: "Halls;Halls Cough Drops;Ricola;cough drops;throat lozenges", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lozenge", route: "oral" },
  { display_name: "Benzocaine Throat Lozenges", generic_name: "benzocaine lozenge", category: "cough", primary_category: "Cough", common_uses: "Sore throat", search_terms: "Cepacol;Chloraseptic;throat numbing", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lozenge", route: "oral" },
  { display_name: "Dyclonine Throat Spray", generic_name: "dyclonine spray", category: "cough", primary_category: "Cough", common_uses: "Sore throat pain", search_terms: "Sucrets;throat spray;sore throat spray", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "oral" },
  { display_name: "Phenol Throat Spray", generic_name: "phenol spray", category: "cough", primary_category: "Cough", common_uses: "Sore throat", search_terms: "Chloraseptic;throat spray;phenol throat", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "oral" },
  { display_name: "Guaifenesin Liquid 100mg/5mL", generic_name: "guaifenesin liquid", category: "cough", primary_category: "Cough", common_uses: "Chest congestion", search_terms: "Robitussin;Mucinex Liquid;liquid expectorant", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "100mg/5mL", route: "oral" },
  { display_name: "Tessalon Perles Generic", generic_name: "benzonatate", category: "cough", primary_category: "Cough", common_uses: "Cough relief", search_terms: "benzonatate;cough pearls", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "100mg", route: "oral" },
  { display_name: "Ivy Leaf Cough Syrup", generic_name: "ivy leaf extract", category: "cough", primary_category: "Cough", common_uses: "Natural cough relief", search_terms: "Prospan;Hedera helix;ivy cough", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "syrup", route: "oral" },
  { display_name: "Honey Lemon Cough Drops", generic_name: "honey menthol lozenge", category: "cough", primary_category: "Cough", common_uses: "Cough soothing", search_terms: "Ricola Honey;Halls Honey;honey drops", is_vitamin: false, is_combo: true, combo_ingredients: "honey;menthol", dosage_form: "lozenge", route: "oral" },
  { display_name: "Eucalyptus Cough Drops", generic_name: "eucalyptus menthol lozenge", category: "cough", primary_category: "Cough", common_uses: "Cough cooling", search_terms: "Halls Mentho-Lyptus;eucalyptus drops", is_vitamin: false, is_combo: true, combo_ingredients: "eucalyptus;menthol", dosage_form: "lozenge", route: "oral" },
  { display_name: "Pectin Throat Lozenges", generic_name: "pectin lozenge", category: "cough", primary_category: "Cough", common_uses: "Throat coating", search_terms: "Luden's;fruit pectin drops", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lozenge", route: "oral" },
  { display_name: "Slippery Elm Lozenges", generic_name: "slippery elm", category: "cough", primary_category: "Cough", common_uses: "Throat soothing", search_terms: "Thayers;slippery elm throat", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lozenge", route: "oral" },
  { display_name: "Buckwheat Honey Cough", generic_name: "buckwheat honey cough syrup", category: "cough", primary_category: "Cough", common_uses: "Children's cough", search_terms: "Zarbee's Naturals;dark honey cough", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "syrup", route: "oral" },

  // ============================================================
  // GI (30 products)
  // ============================================================
  { display_name: "Calcium Carbonate 500mg", generic_name: "calcium carbonate 500mg", category: "gi", primary_category: "Digestive", common_uses: "Heartburn", search_terms: "Tums;Tums Regular;antacid chews", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "chewable", strength: "500mg", route: "oral" },
  { display_name: "Calcium Carbonate 750mg", generic_name: "calcium carbonate 750mg", category: "gi", primary_category: "Digestive", common_uses: "Heartburn", search_terms: "Tums Extra Strength;Tums EX", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "chewable", strength: "750mg", route: "oral" },
  { display_name: "Calcium Carbonate 1000mg", generic_name: "calcium carbonate 1000mg", category: "gi", primary_category: "Digestive", common_uses: "Heartburn", search_terms: "Tums Ultra;Rolaids;Maalox", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "chewable", strength: "1000mg", route: "oral" },
  { display_name: "Famotidine 10mg", generic_name: "famotidine 10mg", category: "gi", primary_category: "Digestive", common_uses: "Heartburn", search_terms: "Pepcid AC;Pepcid", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "10mg", route: "oral" },
  { display_name: "Famotidine 20mg", generic_name: "famotidine 20mg", category: "gi", primary_category: "Digestive", common_uses: "Heartburn GERD", search_terms: "Pepcid AC Maximum Strength;Pepcid Complete", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "20mg", route: "oral" },
  { display_name: "Omeprazole 20mg", generic_name: "omeprazole 20mg", category: "gi", primary_category: "Digestive", common_uses: "GERD", search_terms: "Prilosec OTC;Prilosec;acid reducer", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "20mg", route: "oral" },
  { display_name: "Esomeprazole 20mg", generic_name: "esomeprazole 20mg", category: "gi", primary_category: "Digestive", common_uses: "GERD", search_terms: "Nexium 24HR;Nexium OTC", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "20mg", route: "oral" },
  { display_name: "Lansoprazole 15mg", generic_name: "lansoprazole 15mg", category: "gi", primary_category: "Digestive", common_uses: "GERD", search_terms: "Prevacid 24HR;Prevacid OTC", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "15mg", route: "oral" },
  { display_name: "Bismuth Subsalicylate 262mg", generic_name: "bismuth subsalicylate", category: "gi", primary_category: "Digestive", common_uses: "Diarrhea upset stomach", search_terms: "Pepto-Bismol;Pepto;Kaopectate", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "262mg/15mL", route: "oral" },
  { display_name: "Bismuth Chewable Tablets", generic_name: "bismuth subsalicylate chewable", category: "gi", primary_category: "Digestive", common_uses: "Diarrhea nausea", search_terms: "Pepto-Bismol Chewables;Pepto tablets", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "chewable", strength: "262mg", route: "oral" },
  { display_name: "Loperamide 2mg", generic_name: "loperamide 2mg", category: "gi", primary_category: "Digestive", common_uses: "Diarrhea", search_terms: "Imodium;Imodium AD;anti-diarrheal", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "caplet", strength: "2mg", route: "oral" },
  { display_name: "Loperamide Liquid", generic_name: "loperamide liquid", category: "gi", primary_category: "Digestive", common_uses: "Diarrhea", search_terms: "Imodium Liquid;liquid anti-diarrheal", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "1mg/7.5mL", route: "oral" },
  { display_name: "Simethicone 125mg", generic_name: "simethicone 125mg", category: "gi", primary_category: "Digestive", common_uses: "Gas relief", search_terms: "Gas-X;Gas X;Phazyme;Mylanta Gas", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "125mg", route: "oral" },
  { display_name: "Simethicone Drops", generic_name: "simethicone drops", category: "gi", primary_category: "Digestive", common_uses: "Infant gas", search_terms: "Mylicon;Little Remedies Gas;infant gas drops", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", strength: "20mg/0.3mL", route: "oral" },
  { display_name: "Meclizine 25mg", generic_name: "meclizine 25mg", category: "gi", primary_category: "Digestive", common_uses: "Motion sickness", search_terms: "Bonine;Dramamine Less Drowsy;Travel-Ease", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "25mg", route: "oral" },
  { display_name: "Dimenhydrinate 50mg", generic_name: "dimenhydrinate 50mg", category: "gi", primary_category: "Digestive", common_uses: "Motion sickness nausea", search_terms: "Dramamine;Dramamine Original;motion sickness", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "50mg", route: "oral" },
  { display_name: "Polyethylene Glycol 3350", generic_name: "polyethylene glycol 3350", category: "gi", primary_category: "Digestive", common_uses: "Constipation", search_terms: "MiraLAX;Miralax;GlycoLax;PEG laxative", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "powder", strength: "17g", route: "oral" },
  { display_name: "Psyllium Fiber Powder", generic_name: "psyllium husk", category: "gi", primary_category: "Digestive", common_uses: "Fiber laxative", search_terms: "Metamucil;Konsyl;fiber supplement", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "powder", route: "oral" },
  { display_name: "Psyllium Fiber Capsules", generic_name: "psyllium husk capsules", category: "gi", primary_category: "Digestive", common_uses: "Fiber supplement", search_terms: "Metamucil Capsules;fiber pills", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "capsule", route: "oral" },
  { display_name: "Docusate Sodium 100mg", generic_name: "docusate sodium 100mg", category: "gi", primary_category: "Digestive", common_uses: "Stool softener", search_terms: "Colace;Dulcolax Stool Softener;DSS", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "100mg", route: "oral" },
  { display_name: "Senna 8.6mg", generic_name: "sennosides 8.6mg", category: "gi", primary_category: "Digestive", common_uses: "Stimulant laxative", search_terms: "Senokot;Ex-Lax;senna laxative", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "8.6mg", route: "oral" },
  { display_name: "Bisacodyl 5mg", generic_name: "bisacodyl 5mg", category: "gi", primary_category: "Digestive", common_uses: "Stimulant laxative", search_terms: "Dulcolax;Correctol;bisacodyl tablets", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "5mg", route: "oral" },
  { display_name: "Bisacodyl Suppository", generic_name: "bisacodyl suppository", category: "gi", primary_category: "Digestive", common_uses: "Constipation relief", search_terms: "Dulcolax Suppository;Magic Bullet", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "suppository", strength: "10mg", route: "rectal" },
  { display_name: "Glycerin Suppository", generic_name: "glycerin suppository", category: "gi", primary_category: "Digestive", common_uses: "Constipation", search_terms: "Fleet Glycerin;glycerin laxative", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "suppository", route: "rectal" },
  { display_name: "Magnesium Citrate Liquid", generic_name: "magnesium citrate", category: "gi", primary_category: "Digestive", common_uses: "Constipation", search_terms: "magnesium citrate;saline laxative;mag citrate", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", route: "oral" },
  { display_name: "Milk of Magnesia", generic_name: "magnesium hydroxide", category: "gi", primary_category: "Digestive", common_uses: "Constipation antacid", search_terms: "Phillips Milk of Magnesia;MOM;magnesium laxative", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", route: "oral" },
  { display_name: "Fleet Enema", generic_name: "sodium phosphate enema", category: "gi", primary_category: "Digestive", common_uses: "Constipation bowel prep", search_terms: "Fleet Enema;saline enema", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "enema", route: "rectal" },
  { display_name: "Hydrocortisone Hemorrhoid Cream", generic_name: "hydrocortisone rectal", category: "gi", primary_category: "Digestive", common_uses: "Hemorrhoids", search_terms: "Preparation H;Prep H;hemorrhoid cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "1%", route: "rectal" },
  { display_name: "Witch Hazel Pads", generic_name: "witch hazel pads", category: "gi", primary_category: "Digestive", common_uses: "Hemorrhoid relief", search_terms: "Tucks;Tucks Pads;witch hazel wipes", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "pads", route: "topical" },
  { display_name: "Lactase Enzyme", generic_name: "lactase enzyme", category: "gi", primary_category: "Digestive", common_uses: "Lactose intolerance", search_terms: "Lactaid;lactase pills;dairy digest", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", route: "oral" },

  // ============================================================
  // SLEEP (10 products)
  // ============================================================
  { display_name: "Melatonin 3mg", generic_name: "melatonin 3mg", category: "sleep", primary_category: "Sleep", common_uses: "Sleep aid", search_terms: "melatonin;Natrol Melatonin;sleep supplement", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "3mg", route: "oral" },
  { display_name: "Melatonin 5mg", generic_name: "melatonin 5mg", category: "sleep", primary_category: "Sleep", common_uses: "Sleep aid", search_terms: "melatonin 5;melatonin gummies", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "5mg", route: "oral" },
  { display_name: "Melatonin 10mg", generic_name: "melatonin 10mg", category: "sleep", primary_category: "Sleep", common_uses: "Sleep aid", search_terms: "melatonin max;extra strength melatonin", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "10mg", route: "oral" },
  { display_name: "Melatonin Gummies", generic_name: "melatonin gummies", category: "sleep", primary_category: "Sleep", common_uses: "Sleep aid", search_terms: "Olly Sleep;Zzzquil Gummies;sleep gummies", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "gummy", route: "oral" },
  { display_name: "Diphenhydramine Sleep", generic_name: "diphenhydramine sleep aid", category: "sleep", primary_category: "Sleep", common_uses: "Sleep aid", search_terms: "ZzzQuil;Zzzquil;Sominex;Unisom SleepGels;sleep aid", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "25mg", route: "oral" },
  { display_name: "Doxylamine 25mg", generic_name: "doxylamine 25mg", category: "sleep", primary_category: "Sleep", common_uses: "Sleep aid", search_terms: "Unisom SleepTabs;Unisom;doxylamine succinate", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "25mg", route: "oral" },
  { display_name: "Valerian Root 500mg", generic_name: "valerian root", category: "sleep", primary_category: "Sleep", common_uses: "Natural sleep aid", search_terms: "valerian;valerian root;herbal sleep", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "500mg", route: "oral" },
  { display_name: "Magnesium Glycinate Sleep", generic_name: "magnesium glycinate", category: "sleep", primary_category: "Sleep", common_uses: "Relaxation sleep", search_terms: "magnesium for sleep;Calm magnesium;Natural Calm", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", route: "oral" },
  { display_name: "L-Theanine 200mg", generic_name: "l-theanine", category: "sleep", primary_category: "Sleep", common_uses: "Relaxation", search_terms: "L-theanine;theanine;Suntheanine", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "200mg", route: "oral" },
  { display_name: "Sleep Complex Supplement", generic_name: "melatonin valerian chamomile", category: "sleep", primary_category: "Sleep", common_uses: "Sleep support", search_terms: "sleep complex;Natrol Sleep;herbal sleep blend", is_vitamin: true, is_combo: true, combo_ingredients: "melatonin;valerian;chamomile", dosage_form: "capsule", route: "oral" },

  // ============================================================
  // VITAMINS (35 products)
  // ============================================================
  { display_name: "Vitamin C 500mg", generic_name: "ascorbic acid 500mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Immune support", search_terms: "vitamin c;ascorbic acid;vit c", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "500mg", route: "oral" },
  { display_name: "Vitamin C 1000mg", generic_name: "ascorbic acid 1000mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Immune support", search_terms: "vitamin c 1000;high dose vitamin c", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "1000mg", route: "oral" },
  { display_name: "Vitamin D3 1000 IU", generic_name: "cholecalciferol 1000 iu", category: "vitamins", primary_category: "Vitamins", common_uses: "Bone health", search_terms: "vitamin d3;vitamin d;D3 1000", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "1000 IU", route: "oral" },
  { display_name: "Vitamin D3 2000 IU", generic_name: "cholecalciferol 2000 iu", category: "vitamins", primary_category: "Vitamins", common_uses: "Bone health", search_terms: "vitamin d3 2000;D3", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "2000 IU", route: "oral" },
  { display_name: "Vitamin D3 5000 IU", generic_name: "cholecalciferol 5000 iu", category: "vitamins", primary_category: "Vitamins", common_uses: "Vitamin D deficiency", search_terms: "vitamin d3 5000;high dose D3", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "5000 IU", route: "oral" },
  { display_name: "Vitamin B12 1000mcg", generic_name: "cyanocobalamin 1000mcg", category: "vitamins", primary_category: "Vitamins", common_uses: "Energy metabolism", search_terms: "vitamin b12;B12;cyanocobalamin;methylcobalamin", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "1000mcg", route: "oral" },
  { display_name: "Vitamin B12 Sublingual", generic_name: "methylcobalamin sublingual", category: "vitamins", primary_category: "Vitamins", common_uses: "B12 absorption", search_terms: "sublingual b12;methyl b12", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "sublingual tablet", strength: "1000mcg", route: "sublingual" },
  { display_name: "Folic Acid 400mcg", generic_name: "folic acid 400mcg", category: "vitamins", primary_category: "Vitamins", common_uses: "Prenatal neural tube", search_terms: "folic acid;folate;vitamin b9", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "400mcg", route: "oral" },
  { display_name: "Folic Acid 800mcg", generic_name: "folic acid 800mcg", category: "vitamins", primary_category: "Vitamins", common_uses: "Pregnancy support", search_terms: "folic acid 800;prenatal folate", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "800mcg", route: "oral" },
  { display_name: "Iron 65mg", generic_name: "ferrous sulfate 65mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Iron deficiency", search_terms: "iron;ferrous sulfate;iron supplement", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "65mg", route: "oral" },
  { display_name: "Iron with Vitamin C", generic_name: "ferrous sulfate with vitamin c", category: "vitamins", primary_category: "Vitamins", common_uses: "Iron absorption", search_terms: "iron with c;Vitron-C", is_vitamin: true, is_combo: true, combo_ingredients: "ferrous sulfate;vitamin c", dosage_form: "tablet", route: "oral" },
  { display_name: "Calcium 600mg", generic_name: "calcium carbonate 600mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Bone health", search_terms: "calcium;calcium supplement;Caltrate", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "600mg", route: "oral" },
  { display_name: "Calcium with Vitamin D", generic_name: "calcium vitamin d", category: "vitamins", primary_category: "Vitamins", common_uses: "Bone health", search_terms: "calcium d;Caltrate D;Os-Cal", is_vitamin: true, is_combo: true, combo_ingredients: "calcium;vitamin d", dosage_form: "tablet", route: "oral" },
  { display_name: "Magnesium 250mg", generic_name: "magnesium oxide 250mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Muscle nerve function", search_terms: "magnesium;mag oxide;magnesium supplement", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "250mg", route: "oral" },
  { display_name: "Magnesium 400mg", generic_name: "magnesium oxide 400mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Muscle cramps", search_terms: "magnesium 400;high dose magnesium", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "400mg", route: "oral" },
  { display_name: "Zinc 50mg", generic_name: "zinc gluconate 50mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Immune support", search_terms: "zinc;zinc supplement;zinc gluconate", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "50mg", route: "oral" },
  { display_name: "Multivitamin Adult", generic_name: "multivitamin adult", category: "vitamins", primary_category: "Vitamins", common_uses: "Daily nutrition", search_terms: "multivitamin;Centrum;One A Day;daily vitamin", is_vitamin: true, is_combo: true, combo_ingredients: "multiple vitamins minerals", dosage_form: "tablet", route: "oral" },
  { display_name: "Multivitamin Adult Gummy", generic_name: "multivitamin gummy", category: "vitamins", primary_category: "Vitamins", common_uses: "Daily nutrition", search_terms: "gummy vitamins;Vitafusion;adult gummies", is_vitamin: true, is_combo: true, combo_ingredients: "multiple vitamins minerals", dosage_form: "gummy", route: "oral" },
  { display_name: "Multivitamin Children's", generic_name: "multivitamin pediatric", category: "vitamins", primary_category: "Vitamins", common_uses: "Children's nutrition", search_terms: "Flintstones;kids vitamins;children's multivitamin", is_vitamin: true, is_combo: true, combo_ingredients: "multiple vitamins minerals", dosage_form: "chewable", route: "oral" },
  { display_name: "Prenatal Vitamin", generic_name: "prenatal multivitamin", category: "vitamins", primary_category: "Vitamins", common_uses: "Pregnancy support", search_terms: "prenatal;prenatal vitamin;One A Day Prenatal", is_vitamin: true, is_combo: true, combo_ingredients: "folic acid;iron;dha;calcium", dosage_form: "tablet", route: "oral" },
  { display_name: "Prenatal with DHA", generic_name: "prenatal vitamin dha", category: "vitamins", primary_category: "Vitamins", common_uses: "Pregnancy brain development", search_terms: "prenatal DHA;prenatal omega", is_vitamin: true, is_combo: true, combo_ingredients: "prenatal vitamins;dha", dosage_form: "softgel", route: "oral" },
  { display_name: "Vitamin A 10000 IU", generic_name: "vitamin a retinyl palmitate", category: "vitamins", primary_category: "Vitamins", common_uses: "Vision skin", search_terms: "vitamin a;retinol;retinyl", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "10000 IU", route: "oral" },
  { display_name: "Vitamin E 400 IU", generic_name: "vitamin e alpha tocopherol", category: "vitamins", primary_category: "Vitamins", common_uses: "Antioxidant", search_terms: "vitamin e;tocopherol;E 400", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "400 IU", route: "oral" },
  { display_name: "Vitamin K2 100mcg", generic_name: "vitamin k2 mk7", category: "vitamins", primary_category: "Vitamins", common_uses: "Bone heart health", search_terms: "vitamin k2;K2;MK-7", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "100mcg", route: "oral" },
  { display_name: "Vitamin B Complex", generic_name: "b complex vitamins", category: "vitamins", primary_category: "Vitamins", common_uses: "Energy metabolism", search_terms: "B complex;B vitamins;Super B", is_vitamin: true, is_combo: true, combo_ingredients: "b1;b2;b3;b5;b6;b7;b9;b12", dosage_form: "tablet", route: "oral" },
  { display_name: "B-50 Complex", generic_name: "b-50 complex", category: "vitamins", primary_category: "Vitamins", common_uses: "Energy stress", search_terms: "B-50;B50;stress B", is_vitamin: true, is_combo: true, combo_ingredients: "b vitamins 50mg each", dosage_form: "tablet", route: "oral" },
  { display_name: "Biotin 5000mcg", generic_name: "biotin 5000mcg", category: "vitamins", primary_category: "Vitamins", common_uses: "Hair skin nails", search_terms: "biotin;hair vitamin;Natrol Biotin", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "5000mcg", route: "oral" },
  { display_name: "Biotin 10000mcg", generic_name: "biotin 10000mcg", category: "vitamins", primary_category: "Vitamins", common_uses: "Hair growth", search_terms: "biotin 10000;max biotin;extra strength biotin", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "10000mcg", route: "oral" },
  { display_name: "Potassium 99mg", generic_name: "potassium gluconate 99mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Electrolyte", search_terms: "potassium;potassium supplement", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "99mg", route: "oral" },
  { display_name: "Selenium 200mcg", generic_name: "selenium 200mcg", category: "vitamins", primary_category: "Vitamins", common_uses: "Thyroid antioxidant", search_terms: "selenium;selenomethionine", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "200mcg", route: "oral" },
  { display_name: "Vitamin D3 Drops", generic_name: "vitamin d3 liquid drops", category: "vitamins", primary_category: "Vitamins", common_uses: "Infant vitamin D", search_terms: "D drops;infant vitamin d;baby D3", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "drops", strength: "400 IU", route: "oral" },
  { display_name: "Niacin 500mg", generic_name: "niacin 500mg", category: "vitamins", primary_category: "Vitamins", common_uses: "Cholesterol", search_terms: "niacin;nicotinic acid;vitamin B3", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "500mg", route: "oral" },
  { display_name: "Men's Multivitamin", generic_name: "multivitamin men", category: "vitamins", primary_category: "Vitamins", common_uses: "Men's health", search_terms: "One A Day Men's;Centrum Men;men's daily", is_vitamin: true, is_combo: true, combo_ingredients: "multiple vitamins minerals", dosage_form: "tablet", route: "oral" },
  { display_name: "Women's Multivitamin", generic_name: "multivitamin women", category: "vitamins", primary_category: "Vitamins", common_uses: "Women's health", search_terms: "One A Day Women's;Centrum Women;women's daily", is_vitamin: true, is_combo: true, combo_ingredients: "multiple vitamins minerals iron", dosage_form: "tablet", route: "oral" },
  { display_name: "Senior Multivitamin", generic_name: "multivitamin senior", category: "vitamins", primary_category: "Vitamins", common_uses: "Senior nutrition", search_terms: "Centrum Silver;One A Day 50+;senior vitamin", is_vitamin: true, is_combo: true, combo_ingredients: "multiple vitamins minerals", dosage_form: "tablet", route: "oral" },

  // ============================================================
  // SUPPLEMENTS (35 products)
  // ============================================================
  { display_name: "Fish Oil 1000mg", generic_name: "omega-3 fish oil 1000mg", category: "supplements", primary_category: "Supplements", common_uses: "Heart health", search_terms: "fish oil;omega 3;EPA DHA;Nature Made Fish Oil", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "1000mg", route: "oral" },
  { display_name: "Fish Oil 1200mg", generic_name: "omega-3 fish oil 1200mg", category: "supplements", primary_category: "Supplements", common_uses: "Heart health", search_terms: "fish oil 1200;triple strength fish oil", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "1200mg", route: "oral" },
  { display_name: "Krill Oil 500mg", generic_name: "krill oil 500mg", category: "supplements", primary_category: "Supplements", common_uses: "Omega-3 antioxidant", search_terms: "krill oil;MegaRed;astaxanthin", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "500mg", route: "oral" },
  { display_name: "Glucosamine 1500mg", generic_name: "glucosamine sulfate 1500mg", category: "supplements", primary_category: "Supplements", common_uses: "Joint health", search_terms: "glucosamine;joint supplement;Move Free", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "1500mg", route: "oral" },
  { display_name: "Glucosamine Chondroitin", generic_name: "glucosamine chondroitin", category: "supplements", primary_category: "Supplements", common_uses: "Joint health", search_terms: "glucosamine chondroitin;Osteo Bi-Flex;joint support", is_vitamin: true, is_combo: true, combo_ingredients: "glucosamine;chondroitin", dosage_form: "tablet", route: "oral" },
  { display_name: "Glucosamine Chondroitin MSM", generic_name: "glucosamine chondroitin msm", category: "supplements", primary_category: "Supplements", common_uses: "Joint mobility", search_terms: "triple strength joint;joint with MSM", is_vitamin: true, is_combo: true, combo_ingredients: "glucosamine;chondroitin;msm", dosage_form: "tablet", route: "oral" },
  { display_name: "CoQ10 100mg", generic_name: "coenzyme q10 100mg", category: "supplements", primary_category: "Supplements", common_uses: "Heart health energy", search_terms: "CoQ10;CoQ-10;ubiquinone;ubiquinol", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "100mg", route: "oral" },
  { display_name: "CoQ10 200mg", generic_name: "coenzyme q10 200mg", category: "supplements", primary_category: "Supplements", common_uses: "Heart health", search_terms: "CoQ10 200;high dose CoQ10", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "200mg", route: "oral" },
  { display_name: "Probiotics Daily", generic_name: "probiotic blend", category: "supplements", primary_category: "Supplements", common_uses: "Gut health digestion", search_terms: "probiotic;Culturelle;Align;digestive probiotic;acidophilus", is_vitamin: true, is_combo: true, combo_ingredients: "lactobacillus;bifidobacterium", dosage_form: "capsule", route: "oral" },
  { display_name: "Probiotics 50 Billion CFU", generic_name: "probiotic 50 billion", category: "supplements", primary_category: "Supplements", common_uses: "High potency probiotic", search_terms: "50 billion probiotic;Renew Life;Garden of Life", is_vitamin: true, is_combo: true, combo_ingredients: "multiple probiotic strains", dosage_form: "capsule", route: "oral" },
  { display_name: "Turmeric Curcumin 500mg", generic_name: "turmeric curcumin 500mg", category: "supplements", primary_category: "Supplements", common_uses: "Joint inflammation", search_terms: "turmeric;curcumin;Qunol Turmeric", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "500mg", route: "oral" },
  { display_name: "Turmeric with BioPerine", generic_name: "turmeric curcumin bioperine", category: "supplements", primary_category: "Supplements", common_uses: "Enhanced absorption", search_terms: "turmeric black pepper;bioperine turmeric", is_vitamin: true, is_combo: true, combo_ingredients: "turmeric;black pepper", dosage_form: "capsule", route: "oral" },
  { display_name: "Elderberry 1000mg", generic_name: "elderberry extract 1000mg", category: "supplements", primary_category: "Supplements", common_uses: "Immune support", search_terms: "elderberry;Sambucus;elderberry gummies", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "1000mg", route: "oral" },
  { display_name: "Elderberry Syrup", generic_name: "elderberry syrup", category: "supplements", primary_category: "Supplements", common_uses: "Immune support", search_terms: "Sambucol syrup;elderberry liquid", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "syrup", route: "oral" },
  { display_name: "Echinacea 400mg", generic_name: "echinacea purpurea 400mg", category: "supplements", primary_category: "Supplements", common_uses: "Immune support", search_terms: "echinacea;echincea;purple coneflower", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "400mg", route: "oral" },
  { display_name: "Ginger Root 550mg", generic_name: "ginger root 550mg", category: "supplements", primary_category: "Supplements", common_uses: "Nausea digestion", search_terms: "ginger;ginger supplement;ginger root", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "550mg", route: "oral" },
  { display_name: "Garlic 1000mg", generic_name: "garlic 1000mg", category: "supplements", primary_category: "Supplements", common_uses: "Heart health immunity", search_terms: "garlic;garlic supplement;allicin;Kyolic", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "1000mg", route: "oral" },
  { display_name: "Milk Thistle 175mg", generic_name: "milk thistle silymarin", category: "supplements", primary_category: "Supplements", common_uses: "Liver support", search_terms: "milk thistle;silymarin;liver detox", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "175mg", route: "oral" },
  { display_name: "Ashwagandha 600mg", generic_name: "ashwagandha root 600mg", category: "supplements", primary_category: "Supplements", common_uses: "Stress adaptogen", search_terms: "ashwagandha;KSM-66;withania;stress relief", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "600mg", route: "oral" },
  { display_name: "Rhodiola Rosea 500mg", generic_name: "rhodiola rosea 500mg", category: "supplements", primary_category: "Supplements", common_uses: "Energy adaptogen", search_terms: "rhodiola;adaptogen;arctic root", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "500mg", route: "oral" },
  { display_name: "St. John's Wort 300mg", generic_name: "st johns wort 300mg", category: "supplements", primary_category: "Supplements", common_uses: "Mood support", search_terms: "St. John's Wort;St Johns Wort;hypericum", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "300mg", route: "oral" },
  { display_name: "Saw Palmetto 450mg", generic_name: "saw palmetto 450mg", category: "supplements", primary_category: "Supplements", common_uses: "Prostate health", search_terms: "saw palmetto;prostate supplement", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "450mg", route: "oral" },
  { display_name: "Cranberry 500mg", generic_name: "cranberry extract 500mg", category: "supplements", primary_category: "Supplements", common_uses: "Urinary tract health", search_terms: "cranberry;AZO Cranberry;UTI prevention", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "500mg", route: "oral" },
  { display_name: "Ginkgo Biloba 120mg", generic_name: "ginkgo biloba 120mg", category: "supplements", primary_category: "Supplements", common_uses: "Memory cognitive", search_terms: "ginkgo;ginkgo biloba;brain supplement", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "120mg", route: "oral" },
  { display_name: "Lutein 20mg", generic_name: "lutein 20mg", category: "supplements", primary_category: "Supplements", common_uses: "Eye health", search_terms: "lutein;eye vitamin;macular health;PreserVision", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "softgel", strength: "20mg", route: "oral" },
  { display_name: "Lutein with Zeaxanthin", generic_name: "lutein zeaxanthin", category: "supplements", primary_category: "Supplements", common_uses: "Eye health", search_terms: "AREDS;eye supplement;macular degeneration", is_vitamin: true, is_combo: true, combo_ingredients: "lutein;zeaxanthin", dosage_form: "softgel", route: "oral" },
  { display_name: "Collagen Peptides", generic_name: "hydrolyzed collagen peptides", category: "supplements", primary_category: "Supplements", common_uses: "Skin joint", search_terms: "collagen;collagen peptides;Vital Proteins;Great Lakes", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "powder", route: "oral" },
  { display_name: "Collagen Capsules", generic_name: "collagen type i ii iii", category: "supplements", primary_category: "Supplements", common_uses: "Skin hair nails", search_terms: "collagen capsules;multi collagen", is_vitamin: true, is_combo: true, combo_ingredients: "collagen type i;ii;iii", dosage_form: "capsule", route: "oral" },
  { display_name: "Apple Cider Vinegar Gummies", generic_name: "apple cider vinegar gummies", category: "supplements", primary_category: "Supplements", common_uses: "Digestive support", search_terms: "ACV gummies;Goli;apple cider vinegar", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "gummy", route: "oral" },
  { display_name: "Spirulina 500mg", generic_name: "spirulina 500mg", category: "supplements", primary_category: "Supplements", common_uses: "Superfood nutrition", search_terms: "spirulina;blue-green algae;superfood", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "500mg", route: "oral" },
  { display_name: "Chlorella 500mg", generic_name: "chlorella 500mg", category: "supplements", primary_category: "Supplements", common_uses: "Detox superfood", search_terms: "chlorella;green algae;detox", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "500mg", route: "oral" },
  { display_name: "MCT Oil", generic_name: "medium chain triglycerides", category: "supplements", primary_category: "Supplements", common_uses: "Energy keto", search_terms: "MCT oil;MCT;coconut MCT;keto oil", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "liquid", route: "oral" },
  { display_name: "Quercetin 500mg", generic_name: "quercetin 500mg", category: "supplements", primary_category: "Supplements", common_uses: "Antioxidant allergy", search_terms: "quercetin;flavonoid;antioxidant", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "500mg", route: "oral" },
  { display_name: "Resveratrol 250mg", generic_name: "resveratrol 250mg", category: "supplements", primary_category: "Supplements", common_uses: "Antioxidant aging", search_terms: "resveratrol;anti-aging;red wine extract", is_vitamin: true, is_combo: false, combo_ingredients: "", dosage_form: "capsule", strength: "250mg", route: "oral" },

  // ============================================================
  // SKIN (20 products)
  // ============================================================
  { display_name: "Hydrocortisone 1% Cream", generic_name: "hydrocortisone 1% cream", category: "skin", primary_category: "Skin Care", common_uses: "Itch rash eczema", search_terms: "Cortizone-10;Cortizone;anti-itch cream;hydrocortisone cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "1%", route: "topical" },
  { display_name: "Hydrocortisone 1% Ointment", generic_name: "hydrocortisone 1% ointment", category: "skin", primary_category: "Skin Care", common_uses: "Dry itchy skin", search_terms: "hydrocortisone ointment;anti-itch", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "ointment", strength: "1%", route: "topical" },
  { display_name: "Clotrimazole 1% Cream", generic_name: "clotrimazole 1% cream", category: "skin", primary_category: "Skin Care", common_uses: "Athlete's foot ringworm", search_terms: "Lotrimin;Lotrimin AF;antifungal cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "1%", route: "topical" },
  { display_name: "Miconazole 2% Cream", generic_name: "miconazole 2% cream", category: "skin", primary_category: "Skin Care", common_uses: "Fungal infection", search_terms: "Micatin;Desenex;antifungal cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "2%", route: "topical" },
  { display_name: "Terbinafine 1% Cream", generic_name: "terbinafine 1% cream", category: "skin", primary_category: "Skin Care", common_uses: "Athlete's foot jock itch", search_terms: "Lamisil;Lamisil AT;antifungal", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "1%", route: "topical" },
  { display_name: "Tolnaftate 1% Cream", generic_name: "tolnaftate 1% cream", category: "skin", primary_category: "Skin Care", common_uses: "Athlete's foot prevention", search_terms: "Tinactin;tolnaftate;antifungal powder", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", strength: "1%", route: "topical" },
  { display_name: "Bacitracin Ointment", generic_name: "bacitracin ointment", category: "skin", primary_category: "Skin Care", common_uses: "Minor cuts", search_terms: "bacitracin;antibiotic ointment;first aid", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "ointment", route: "topical" },
  { display_name: "Triple Antibiotic Ointment", generic_name: "neomycin bacitracin polymyxin", category: "skin", primary_category: "Skin Care", common_uses: "Minor cuts scrapes", search_terms: "Neosporin;triple antibiotic;antibiotic cream", is_vitamin: false, is_combo: true, combo_ingredients: "neomycin;bacitracin;polymyxin b", dosage_form: "ointment", route: "topical" },
  { display_name: "Zinc Oxide Ointment", generic_name: "zinc oxide ointment", category: "skin", primary_category: "Skin Care", common_uses: "Diaper rash", search_terms: "Desitin;Boudreaux's;diaper cream;zinc oxide cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "ointment", route: "topical" },
  { display_name: "Petroleum Jelly", generic_name: "petrolatum", category: "skin", primary_category: "Skin Care", common_uses: "Skin protectant", search_terms: "Vaseline;petroleum jelly;skin barrier", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "ointment", route: "topical" },
  { display_name: "Calamine Lotion", generic_name: "calamine lotion", category: "skin", primary_category: "Skin Care", common_uses: "Poison ivy itch", search_terms: "calamine;poison ivy relief;pink lotion", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lotion", route: "topical" },
  { display_name: "Benzoyl Peroxide 2.5%", generic_name: "benzoyl peroxide 2.5%", category: "skin", primary_category: "Skin Care", common_uses: "Acne", search_terms: "benzoyl peroxide;acne treatment;acne wash", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "wash", strength: "2.5%", route: "topical" },
  { display_name: "Benzoyl Peroxide 10%", generic_name: "benzoyl peroxide 10%", category: "skin", primary_category: "Skin Care", common_uses: "Acne", search_terms: "OXY;Clearasil;maximum strength acne", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "wash", strength: "10%", route: "topical" },
  { display_name: "Adapalene 0.1% Gel", generic_name: "adapalene 0.1% gel", category: "skin", primary_category: "Skin Care", common_uses: "Acne", search_terms: "Differin;Differin Gel;retinoid acne", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", strength: "0.1%", route: "topical" },
  { display_name: "Salicylic Acid 2% Pads", generic_name: "salicylic acid 2% pads", category: "skin", primary_category: "Skin Care", common_uses: "Acne", search_terms: "Stridex;Oxy Pads;salicylic acid pads;acne pads", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "pads", strength: "2%", route: "topical" },
  { display_name: "Minoxidil 5% Solution", generic_name: "minoxidil 5% solution", category: "skin", primary_category: "Skin Care", common_uses: "Hair regrowth", search_terms: "Rogaine;Rogaine Men;hair loss treatment;minoxidil", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "solution", strength: "5%", route: "topical" },
  { display_name: "Minoxidil 2% Solution", generic_name: "minoxidil 2% solution", category: "skin", primary_category: "Skin Care", common_uses: "Women's hair regrowth", search_terms: "Rogaine Women;women's minoxidil", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "solution", strength: "2%", route: "topical" },
  { display_name: "Pramoxine Anti-Itch", generic_name: "pramoxine 1%", category: "skin", primary_category: "Skin Care", common_uses: "Itch relief", search_terms: "Sarna;anti-itch lotion;pramoxine", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lotion", strength: "1%", route: "topical" },
  { display_name: "Colloidal Oatmeal Lotion", generic_name: "colloidal oatmeal lotion", category: "skin", primary_category: "Skin Care", common_uses: "Dry itchy skin", search_terms: "Aveeno;oatmeal lotion;eczema relief", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lotion", route: "topical" },
  { display_name: "Aloe Vera Gel", generic_name: "aloe vera gel", category: "skin", primary_category: "Skin Care", common_uses: "Sunburn soothing", search_terms: "aloe gel;aloe vera;after sun;sunburn relief", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", route: "topical" },

  // ============================================================
  // EYE & EAR (10 products)
  // ============================================================
  { display_name: "Artificial Tears", generic_name: "carboxymethylcellulose eye drops", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Dry eyes", search_terms: "Refresh Tears;Systane;artificial tears;lubricating eye drops", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", route: "ophthalmic" },
  { display_name: "Artificial Tears Preservative Free", generic_name: "carboxymethylcellulose pf", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Sensitive dry eyes", search_terms: "Refresh Optive PF;preservative free drops", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", route: "ophthalmic" },
  { display_name: "Lubricant Eye Gel", generic_name: "lubricant eye gel", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Severe dry eyes", search_terms: "GenTeal Gel;eye gel;nighttime eye drops", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", route: "ophthalmic" },
  { display_name: "Tetrahydrozoline Eye Drops", generic_name: "tetrahydrozoline 0.05%", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Red eye relief", search_terms: "Visine;Visine Original;redness relief", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", strength: "0.05%", route: "ophthalmic" },
  { display_name: "Naphazoline Eye Drops", generic_name: "naphazoline 0.012%", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Red eye relief", search_terms: "Clear Eyes;naphazoline;redness reliever", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", strength: "0.012%", route: "ophthalmic" },
  { display_name: "Eye Wash Solution", generic_name: "sterile eye wash", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Eye irrigation", search_terms: "eye wash;Bausch Lomb eye wash;eye rinse", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "solution", route: "ophthalmic" },
  { display_name: "Carbamide Peroxide Ear Drops", generic_name: "carbamide peroxide 6.5%", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Ear wax removal", search_terms: "Debrox;ear drops;ear wax removal;carbamide ear", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "drops", strength: "6.5%", route: "otic" },
  { display_name: "Swimmer's Ear Drops", generic_name: "isopropyl alcohol acetic acid", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Swimmer's ear prevention", search_terms: "Swim Ear;swimmer's ear drops;ear drying", is_vitamin: false, is_combo: true, combo_ingredients: "isopropyl alcohol;acetic acid", dosage_form: "drops", route: "otic" },
  { display_name: "Ear Pain Relief Drops", generic_name: "benzocaine antipyrine ear", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Ear pain", search_terms: "Aurodex;ear pain drops;Americaine Otic", is_vitamin: false, is_combo: true, combo_ingredients: "benzocaine;antipyrine", dosage_form: "drops", route: "otic" },
  { display_name: "Homeopathic Ear Drops", generic_name: "garlic mullein ear drops", category: "eye_ear", primary_category: "Eye & Ear", common_uses: "Natural ear relief", search_terms: "Similasan;garlic ear drops;natural ear", is_vitamin: false, is_combo: true, combo_ingredients: "garlic;mullein", dosage_form: "drops", route: "otic" },

  // ============================================================
  // FIRST AID (15 products)
  // ============================================================
  { display_name: "Hydrogen Peroxide 3%", generic_name: "hydrogen peroxide 3%", category: "first_aid", primary_category: "First Aid", common_uses: "Wound cleaning", search_terms: "hydrogen peroxide;antiseptic;wound cleaner", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "3%", route: "topical" },
  { display_name: "Isopropyl Alcohol 70%", generic_name: "isopropyl alcohol 70%", category: "first_aid", primary_category: "First Aid", common_uses: "Wound cleaning antiseptic", search_terms: "rubbing alcohol;isopropyl;alcohol wipes", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "70%", route: "topical" },
  { display_name: "Povidone Iodine Solution", generic_name: "povidone iodine 10%", category: "first_aid", primary_category: "First Aid", common_uses: "Antiseptic", search_terms: "Betadine;iodine;antiseptic solution", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "solution", strength: "10%", route: "topical" },
  { display_name: "Benzalkonium Chloride Wipes", generic_name: "benzalkonium chloride wipes", category: "first_aid", primary_category: "First Aid", common_uses: "Wound antiseptic", search_terms: "BZK wipes;antiseptic wipes;first aid wipes", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "wipes", route: "topical" },
  { display_name: "Burn Gel with Lidocaine", generic_name: "lidocaine burn gel", category: "first_aid", primary_category: "First Aid", common_uses: "Minor burn relief", search_terms: "Solarcaine;burn gel;sunburn relief", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", route: "topical" },
  { display_name: "Silver Sulfadiazine Alternative", generic_name: "colloidal silver gel", category: "first_aid", primary_category: "First Aid", common_uses: "Wound care", search_terms: "silver gel;wound gel;first aid gel", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", route: "topical" },
  { display_name: "Liquid Bandage", generic_name: "liquid bandage", category: "first_aid", primary_category: "First Aid", common_uses: "Seal small cuts", search_terms: "New-Skin;liquid bandage;skin protectant", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", route: "topical" },
  { display_name: "Styptic Pencil", generic_name: "aluminum sulfate styptic", category: "first_aid", primary_category: "First Aid", common_uses: "Stop bleeding shaving cuts", search_terms: "styptic pencil;nick stick;shaving cut", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "pencil", route: "topical" },
  { display_name: "Antiseptic Spray", generic_name: "benzocaine benzethonium spray", category: "first_aid", primary_category: "First Aid", common_uses: "Cut scrape relief", search_terms: "Bactine;antiseptic spray;first aid spray", is_vitamin: false, is_combo: true, combo_ingredients: "benzocaine;benzethonium", dosage_form: "spray", route: "topical" },
  { display_name: "Antibiotic + Pain Relief", generic_name: "neomycin bacitracin pramoxine", category: "first_aid", primary_category: "First Aid", common_uses: "Cuts with pain relief", search_terms: "Neosporin Plus Pain;antibiotic pain relief", is_vitamin: false, is_combo: true, combo_ingredients: "neomycin;bacitracin;pramoxine", dosage_form: "cream", route: "topical" },
  { display_name: "Insect Bite Relief", generic_name: "diphenhydramine zinc acetate topical", category: "first_aid", primary_category: "First Aid", common_uses: "Bug bite itch", search_terms: "After Bite;bug bite relief;insect bite cream", is_vitamin: false, is_combo: true, combo_ingredients: "diphenhydramine;zinc acetate", dosage_form: "stick", route: "topical" },
  { display_name: "Hydrocortisone Bite Stick", generic_name: "hydrocortisone 1% stick", category: "first_aid", primary_category: "First Aid", common_uses: "Itch relief on-the-go", search_terms: "Cortizone stick;itch stick", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "stick", strength: "1%", route: "topical" },
  { display_name: "Campho-Phenique", generic_name: "camphor phenol", category: "first_aid", primary_category: "First Aid", common_uses: "Cold sores cuts", search_terms: "Campho-Phenique;cold sore treatment", is_vitamin: false, is_combo: true, combo_ingredients: "camphor;phenol", dosage_form: "liquid", route: "topical" },
  { display_name: "Wound Wash Saline", generic_name: "sterile saline wound wash", category: "first_aid", primary_category: "First Aid", common_uses: "Wound irrigation", search_terms: "wound wash;saline spray;wound care", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "topical" },
  { display_name: "Tegaderm Transparent Dressing", generic_name: "transparent film dressing", category: "first_aid", primary_category: "First Aid", common_uses: "Wound protection", search_terms: "Tegaderm;transparent bandage;waterproof dressing", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "dressing", route: "topical" },

  // ============================================================
  // FEMININE CARE (10 products)
  // ============================================================
  { display_name: "Miconazole 7-Day", generic_name: "miconazole vaginal 7-day", category: "feminine", primary_category: "Feminine Care", common_uses: "Yeast infection", search_terms: "Monistat 7;miconazole 7;yeast infection 7 day", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", route: "vaginal" },
  { display_name: "Miconazole 3-Day", generic_name: "miconazole vaginal 3-day", category: "feminine", primary_category: "Feminine Care", common_uses: "Yeast infection", search_terms: "Monistat 3;miconazole 3;yeast infection 3 day", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", route: "vaginal" },
  { display_name: "Miconazole 1-Day", generic_name: "miconazole vaginal 1-day", category: "feminine", primary_category: "Feminine Care", common_uses: "Yeast infection", search_terms: "Monistat 1;miconazole 1;yeast infection 1 day", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "ovule", route: "vaginal" },
  { display_name: "Clotrimazole 7-Day Vaginal", generic_name: "clotrimazole vaginal 7-day", category: "feminine", primary_category: "Feminine Care", common_uses: "Yeast infection", search_terms: "Gyne-Lotrimin;clotrimazole 7;vaginal cream", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", route: "vaginal" },
  { display_name: "Tioconazole 1-Day", generic_name: "tioconazole 6.5%", category: "feminine", primary_category: "Feminine Care", common_uses: "Yeast infection", search_terms: "Vagistat-1;1-day yeast treatment", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "ointment", strength: "6.5%", route: "vaginal" },
  { display_name: "Boric Acid Vaginal", generic_name: "boric acid suppository", category: "feminine", primary_category: "Feminine Care", common_uses: "Vaginal pH balance", search_terms: "boric acid;pH balance;vaginal suppository", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "suppository", route: "vaginal" },
  { display_name: "Feminine Wash", generic_name: "gentle feminine wash", category: "feminine", primary_category: "Feminine Care", common_uses: "Intimate hygiene", search_terms: "Summer's Eve;feminine wash;intimate wash;vaginal wash", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", route: "topical" },
  { display_name: "Feminine Wipes", generic_name: "feminine cleansing wipes", category: "feminine", primary_category: "Feminine Care", common_uses: "On-the-go freshness", search_terms: "Summer's Eve wipes;feminine wipes;intimate wipes", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "wipes", route: "topical" },
  { display_name: "Vaginal Moisturizer", generic_name: "vaginal moisturizer", category: "feminine", primary_category: "Feminine Care", common_uses: "Vaginal dryness", search_terms: "Replens;vaginal lubricant;vaginal dryness", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", route: "vaginal" },
  { display_name: "AZO Urinary Pain Relief", generic_name: "phenazopyridine 95mg", category: "feminine", primary_category: "Feminine Care", common_uses: "UTI pain relief", search_terms: "AZO;Pyridium;UTI relief;urinary pain", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "tablet", strength: "95mg", route: "oral" },

  // ============================================================
  // ORAL CARE (10 products)
  // ============================================================
  { display_name: "Benzocaine Oral Gel", generic_name: "benzocaine 20% gel", category: "oral_care", primary_category: "Oral Care", common_uses: "Toothache", search_terms: "Orajel;Anbesol;toothache gel;oral pain relief", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", strength: "20%", route: "oral" },
  { display_name: "Baby Teething Gel", generic_name: "benzocaine 7.5% baby gel", category: "oral_care", primary_category: "Oral Care", common_uses: "Baby teething", search_terms: "Baby Orajel;teething gel;infant oral pain", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", strength: "7.5%", route: "oral" },
  { display_name: "Fluoride Rinse", generic_name: "sodium fluoride rinse", category: "oral_care", primary_category: "Oral Care", common_uses: "Cavity prevention", search_terms: "ACT;fluoride mouthwash;ACT Rinse", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "0.02%", route: "oral" },
  { display_name: "Antiseptic Mouthwash", generic_name: "essential oils mouthwash", category: "oral_care", primary_category: "Oral Care", common_uses: "Gum health plaque", search_terms: "Listerine;mouthwash;antiseptic rinse", is_vitamin: false, is_combo: true, combo_ingredients: "thymol;eucalyptol;menthol;methyl salicylate", dosage_form: "liquid", route: "oral" },
  { display_name: "Hydrogen Peroxide Whitening Rinse", generic_name: "hydrogen peroxide oral rinse", category: "oral_care", primary_category: "Oral Care", common_uses: "Whitening", search_terms: "Colgate Peroxyl;whitening mouthwash;hydrogen peroxide rinse", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "1.5%", route: "oral" },
  { display_name: "Chlorhexidine Mouthwash", generic_name: "chlorhexidine gluconate oral", category: "oral_care", primary_category: "Oral Care", common_uses: "Gingivitis", search_terms: "Peridex;chlorhexidine rinse;gum disease", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", strength: "0.12%", route: "oral" },
  { display_name: "Dry Mouth Rinse", generic_name: "xylitol dry mouth rinse", category: "oral_care", primary_category: "Oral Care", common_uses: "Dry mouth relief", search_terms: "Biotene;dry mouth;saliva substitute", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "liquid", route: "oral" },
  { display_name: "Dry Mouth Spray", generic_name: "xylitol dry mouth spray", category: "oral_care", primary_category: "Oral Care", common_uses: "Dry mouth on-the-go", search_terms: "Biotene spray;mouth spray;dry mouth relief", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "spray", route: "oral" },
  { display_name: "Canker Sore Gel", generic_name: "benzocaine canker sore treatment", category: "oral_care", primary_category: "Oral Care", common_uses: "Canker sore pain", search_terms: "Kanka;canker sore gel;mouth sore relief", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gel", route: "oral" },
  { display_name: "Denture Adhesive", generic_name: "denture adhesive cream", category: "oral_care", primary_category: "Oral Care", common_uses: "Denture fit", search_terms: "Fixodent;Poligrip;denture cream;denture glue", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "cream", route: "oral" },

  // ============================================================
  // SMOKING CESSATION (5 products)
  // ============================================================
  { display_name: "Nicotine Patch 21mg", generic_name: "nicotine patch 21mg", category: "smoking_cessation", primary_category: "Smoking Cessation", common_uses: "Quit smoking Step 1", search_terms: "NicoDerm CQ;Habitrol;nicotine patch;21mg patch", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "patch", strength: "21mg", route: "transdermal" },
  { display_name: "Nicotine Patch 14mg", generic_name: "nicotine patch 14mg", category: "smoking_cessation", primary_category: "Smoking Cessation", common_uses: "Quit smoking Step 2", search_terms: "NicoDerm CQ Step 2;14mg patch", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "patch", strength: "14mg", route: "transdermal" },
  { display_name: "Nicotine Patch 7mg", generic_name: "nicotine patch 7mg", category: "smoking_cessation", primary_category: "Smoking Cessation", common_uses: "Quit smoking Step 3", search_terms: "NicoDerm CQ Step 3;7mg patch", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "patch", strength: "7mg", route: "transdermal" },
  { display_name: "Nicotine Gum 4mg", generic_name: "nicotine gum 4mg", category: "smoking_cessation", primary_category: "Smoking Cessation", common_uses: "Quit smoking", search_terms: "Nicorette;nicotine gum;4mg gum;quit smoking gum", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "gum", strength: "4mg", route: "oral" },
  { display_name: "Nicotine Lozenge 4mg", generic_name: "nicotine lozenge 4mg", category: "smoking_cessation", primary_category: "Smoking Cessation", common_uses: "Quit smoking", search_terms: "Nicorette Lozenge;Commit;nicotine lozenge;quit smoking lozenge", is_vitamin: false, is_combo: false, combo_ingredients: "", dosage_form: "lozenge", strength: "4mg", route: "oral" },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function normalize(str: string): string {
  return str.toLowerCase().trim().replace(/\s+/g, ' ');
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

// ============================================================
// MAIN HANDLER
// ============================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ============ AUTH CHECK ============
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create client with user's token to verify
    const authClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false }
    });
    
    const { data: { user }, error: userError } = await authClient.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[seed-otc] Auth error:', JSON.stringify(userError, null, 2));
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token', details: userError }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = user.id;
    console.log(`[seed-otc] Authenticated user: ${userId}`);

    // ============ ADMIN AUTHORIZATION CHECK ============
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (roleError) {
      console.error('[seed-otc] Role check error:', JSON.stringify(roleError, null, 2));
    }

    if (!roles || roles.length === 0) {
      console.log(`[seed-otc] Forbidden: User ${userId} is not an admin`);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[seed-otc] Admin verified: ${userId}`);

    // ============ SEED OTC PRODUCTS ============
    const result: SeedResult = {
      productsUpserted: 0,
      synonymsInserted: 0,
      categoryStats: {},
      errors: []
    };

    console.log(`[seed-otc] Starting seed of ${OTC_SEED_DATA.length} products...`);

    // Track category counts
    for (const product of OTC_SEED_DATA) {
      result.categoryStats[product.category] = (result.categoryStats[product.category] || 0) + 1;
    }
    console.log('[seed-otc] Category distribution:', JSON.stringify(result.categoryStats, null, 2));

    // Prepare all product rows
    const productRows = OTC_SEED_DATA.map(product => ({
      name: (product.display_name || product.generic_name).trim(),
      display_name: product.display_name.trim(),
      generic_name: normalize(product.generic_name),
      category: product.category, // Canonical category key (NOT NULL)
      primary_category: product.primary_category, // Human-readable for UI
      common_uses: product.common_uses,
      search_terms: product.search_terms ? product.search_terms.split(';').map(s => s.trim()).filter(Boolean) : [],
      is_vitamin: product.is_vitamin,
      is_combo: product.is_combo,
      combo_ingredients: product.combo_ingredients ? product.combo_ingredients.split(';').map(s => s.trim()).filter(Boolean) : []
    }));

    // Batch upsert products (50 at a time)
    const productBatches = chunk(productRows, 50);
    const upsertedProducts: { id: string; generic_name: string; display_name: string }[] = [];

    for (const batch of productBatches) {
      const { data: batchResult, error: batchError } = await supabase
        .from('otc_products')
        .upsert(batch, { onConflict: 'generic_name' })
        .select('id, generic_name, display_name');

      if (batchError) {
        console.error('[seed-otc] Batch upsert error:', JSON.stringify(batchError, null, 2));
        result.errors.push(`Product batch error: ${batchError.message} (code: ${batchError.code}, details: ${batchError.details})`);
      } else if (batchResult) {
        upsertedProducts.push(...batchResult);
        result.productsUpserted += batchResult.length;
      }
    }

    console.log(`[seed-otc] Upserted ${result.productsUpserted} products`);

    // Build synonym rows for all products
    const allSynonymRows: { otc_product_id: string; synonym: string; synonym_type: string }[] = [];

    for (const product of OTC_SEED_DATA) {
      const normalizedGenericName = normalize(product.generic_name);
      const upsertedProduct = upsertedProducts.find(p => p.generic_name === normalizedGenericName);
      
      if (!upsertedProduct) {
        continue;
      }

      const productId = upsertedProduct.id;
      const synonymSet = new Set<string>();

      // Add display_name as synonym
      synonymSet.add(normalize(product.display_name));
      
      // Add generic_name as synonym
      synonymSet.add(normalizedGenericName);
      
      // Add all search terms (brand names, etc.)
      if (product.search_terms) {
        product.search_terms.split(';').forEach(term => {
          const normalized = normalize(term);
          if (normalized && normalized.length > 1) synonymSet.add(normalized);
        });
      }

      // Create synonym rows
      for (const synonym of synonymSet) {
        allSynonymRows.push({
          otc_product_id: productId,
          synonym: synonym,
          synonym_type: synonym === normalizedGenericName ? 'generic' : 
                        synonym === normalize(product.display_name) ? 'display' : 'brand'
        });
      }
    }

    console.log(`[seed-otc] Preparing ${allSynonymRows.length} synonym rows...`);

    // Batch upsert synonyms (50 at a time)
    const synonymBatches = chunk(allSynonymRows, 50);
    
    for (const batch of synonymBatches) {
      const { data: synResult, error: synError } = await supabase
        .from('otc_synonyms')
        .upsert(batch, { 
          onConflict: 'otc_product_id,synonym',
          ignoreDuplicates: true 
        })
        .select('id');

      if (synError) {
        // Only log non-duplicate errors
        if (!synError.message?.includes('duplicate')) {
          console.error('[seed-otc] Synonym batch error:', JSON.stringify(synError, null, 2));
          result.errors.push(`Synonym batch error: ${synError.message} (code: ${synError.code})`);
        }
      } else if (synResult) {
        result.synonymsInserted += synResult.length;
      }
    }

    // Final summary
    console.log(`[seed-otc] ============ SEEDING COMPLETE ============`);
    console.log(`[seed-otc] Products upserted: ${result.productsUpserted}`);
    console.log(`[seed-otc] Synonyms inserted: ${result.synonymsInserted}`);
    console.log(`[seed-otc] Category breakdown:`);
    Object.entries(result.categoryStats).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`[seed-otc]   ${cat}: ${count}`);
    });
    if (result.errors.length > 0) {
      console.log(`[seed-otc] Errors (${result.errors.length}): ${result.errors.join(', ')}`);
    }

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[seed-otc] Error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
