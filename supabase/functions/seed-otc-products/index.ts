import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OtcProduct {
  display_name: string;
  generic_name: string;
  primary_category: string;
  common_uses: string;
  search_terms: string;
  is_vitamin: boolean;
  is_combo: boolean;
  combo_ingredients: string;
}

interface SeedResult {
  productsUpserted: number;
  synonymsInserted: number;
  errors: string[];
}

// Seed data - Top 100 OTC generics + vitamins/supplements
const OTC_SEED_DATA: OtcProduct[] = [
  // Pain/Fever
  { display_name: "Acetaminophen", generic_name: "acetaminophen", primary_category: "Pain/Fever", common_uses: "Pain and fever", search_terms: "Tylenol;APAP", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Ibuprofen", generic_name: "ibuprofen", primary_category: "Pain/Fever", common_uses: "Pain fever inflammation", search_terms: "Advil;Motrin;NSAID", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Naproxen Sodium", generic_name: "naproxen sodium", primary_category: "Pain/Fever", common_uses: "Pain inflammation", search_terms: "Aleve;NSAID", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Aspirin", generic_name: "aspirin", primary_category: "Pain/Fever", common_uses: "Pain fever antiplatelet", search_terms: "Bayer;ASA", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Diclofenac Topical", generic_name: "diclofenac topical", primary_category: "Pain/Fever", common_uses: "Topical joint pain", search_terms: "Voltaren", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Lidocaine Topical", generic_name: "lidocaine topical", primary_category: "Pain/Fever", common_uses: "Local pain relief", search_terms: "lidocaine patch;cream", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Menthol Topical", generic_name: "menthol topical", primary_category: "Pain/Fever", common_uses: "Muscle aches", search_terms: "Icy Hot;Bengay", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Methyl Salicylate Topical", generic_name: "methyl salicylate topical", primary_category: "Pain/Fever", common_uses: "Muscle aches", search_terms: "Bengay", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Allergy
  { display_name: "Cetirizine", generic_name: "cetirizine", primary_category: "Allergy", common_uses: "Seasonal allergies", search_terms: "Zyrtec", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Loratadine", generic_name: "loratadine", primary_category: "Allergy", common_uses: "Seasonal allergies", search_terms: "Claritin", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Fexofenadine", generic_name: "fexofenadine", primary_category: "Allergy", common_uses: "Seasonal allergies", search_terms: "Allegra", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Diphenhydramine", generic_name: "diphenhydramine", primary_category: "Allergy", common_uses: "Allergy itch sleep", search_terms: "Benadryl;sleep aid", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Chlorpheniramine", generic_name: "chlorpheniramine", primary_category: "Allergy", common_uses: "Allergy", search_terms: "Chlor-Trimeton", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Fluticasone Nasal", generic_name: "fluticasone nasal", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Flonase", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Triamcinolone Nasal", generic_name: "triamcinolone nasal", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Nasacort", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Budesonide Nasal", generic_name: "budesonide nasal", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Rhinocort", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Azelastine Nasal", generic_name: "azelastine nasal", primary_category: "Allergy", common_uses: "Nasal allergy", search_terms: "Astepro", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Sinus/Cold
  { display_name: "Pseudoephedrine", generic_name: "pseudoephedrine", primary_category: "Sinus/Cold", common_uses: "Nasal congestion", search_terms: "Sudafed", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Phenylephrine", generic_name: "phenylephrine", primary_category: "Sinus/Cold", common_uses: "Nasal congestion", search_terms: "decongestant", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Oxymetazoline Nasal", generic_name: "oxymetazoline nasal", primary_category: "Sinus/Cold", common_uses: "Nasal congestion", search_terms: "Afrin", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Saline Nasal Spray", generic_name: "saline nasal spray", primary_category: "Sinus/Cold", common_uses: "Nasal moisture", search_terms: "sodium chloride", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Cough/Cold
  { display_name: "Dextromethorphan", generic_name: "dextromethorphan", primary_category: "Cough/Cold", common_uses: "Cough suppression", search_terms: "DM;Robitussin DM;Delsym", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Guaifenesin", generic_name: "guaifenesin", primary_category: "Cough/Cold", common_uses: "Chest congestion", search_terms: "Mucinex", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Benzocaine Lozenges", generic_name: "benzocaine lozenges", primary_category: "Cough/Cold", common_uses: "Sore throat", search_terms: "Cepacol", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Menthol Lozenges", generic_name: "menthol lozenges", primary_category: "Cough/Cold", common_uses: "Sore throat", search_terms: "Halls", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Camphor Topical", generic_name: "camphor topical", primary_category: "Cough/Cold", common_uses: "Chest rub", search_terms: "Vicks", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Daytime Cold Combo", generic_name: "acetaminophen dextromethorphan phenylephrine", primary_category: "Cough/Cold", common_uses: "Multi-symptom cold", search_terms: "DayQuil", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;dextromethorphan;phenylephrine" },
  { display_name: "Nighttime Cold Combo", generic_name: "acetaminophen doxylamine dextromethorphan", primary_category: "Cough/Cold", common_uses: "Night cold relief", search_terms: "NyQuil", is_vitamin: false, is_combo: true, combo_ingredients: "acetaminophen;doxylamine;dextromethorphan" },
  
  // GI
  { display_name: "Calcium Carbonate", generic_name: "calcium carbonate", primary_category: "GI", common_uses: "Heartburn", search_terms: "Tums", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Famotidine", generic_name: "famotidine", primary_category: "GI", common_uses: "Heartburn GERD", search_terms: "Pepcid", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Omeprazole", generic_name: "omeprazole", primary_category: "GI", common_uses: "GERD", search_terms: "Prilosec OTC", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Esomeprazole", generic_name: "esomeprazole", primary_category: "GI", common_uses: "GERD", search_terms: "Nexium 24HR", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Lansoprazole", generic_name: "lansoprazole", primary_category: "GI", common_uses: "GERD", search_terms: "Prevacid 24HR", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Bismuth Subsalicylate", generic_name: "bismuth subsalicylate", primary_category: "GI", common_uses: "Diarrhea upset stomach", search_terms: "Pepto-Bismol", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Loperamide", generic_name: "loperamide", primary_category: "GI", common_uses: "Diarrhea", search_terms: "Imodium", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Simethicone", generic_name: "simethicone", primary_category: "GI", common_uses: "Gas relief", search_terms: "Gas-X", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Meclizine", generic_name: "meclizine", primary_category: "GI", common_uses: "Motion sickness", search_terms: "Bonine;Dramamine Less Drowsy", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Dimenhydrinate", generic_name: "dimenhydrinate", primary_category: "GI", common_uses: "Motion sickness", search_terms: "Dramamine", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Polyethylene Glycol 3350", generic_name: "polyethylene glycol 3350", primary_category: "GI", common_uses: "Constipation", search_terms: "MiraLAX", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Psyllium Husk", generic_name: "psyllium", primary_category: "GI", common_uses: "Fiber laxative", search_terms: "Metamucil", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Docusate Sodium", generic_name: "docusate sodium", primary_category: "GI", common_uses: "Stool softener", search_terms: "Colace", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Senna", generic_name: "senna", primary_category: "GI", common_uses: "Stimulant laxative", search_terms: "Senokot", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Bisacodyl", generic_name: "bisacodyl", primary_category: "GI", common_uses: "Stimulant laxative", search_terms: "Dulcolax", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Magnesium Citrate", generic_name: "magnesium citrate", primary_category: "GI", common_uses: "Constipation", search_terms: "saline laxative", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Glycerin Suppository", generic_name: "glycerin suppository", primary_category: "GI", common_uses: "Constipation", search_terms: "suppository", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Hydrocortisone Rectal", generic_name: "hydrocortisone rectal", primary_category: "GI", common_uses: "Hemorrhoids", search_terms: "Preparation H", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Witch Hazel Pads", generic_name: "witch hazel", primary_category: "GI", common_uses: "Hemorrhoid relief", search_terms: "Tucks", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Sleep/Stress
  { display_name: "Melatonin", generic_name: "melatonin", primary_category: "Sleep/Stress", common_uses: "Sleep aid", search_terms: "sleep aid", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Doxylamine", generic_name: "doxylamine", primary_category: "Sleep/Stress", common_uses: "Sleep aid", search_terms: "Unisom", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Skin
  { display_name: "Hydrocortisone Topical", generic_name: "hydrocortisone topical", primary_category: "Skin", common_uses: "Itch rash", search_terms: "Cortizone-10", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Clotrimazole Topical", generic_name: "clotrimazole topical", primary_category: "Skin", common_uses: "Fungal infection", search_terms: "Lotrimin", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Miconazole Topical", generic_name: "miconazole topical", primary_category: "Skin", common_uses: "Fungal infection", search_terms: "antifungal", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Terbinafine Topical", generic_name: "terbinafine topical", primary_category: "Skin", common_uses: "Fungal infection", search_terms: "Lamisil", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Neosporin Triple Antibiotic", generic_name: "neomycin bacitracin polymyxin b", primary_category: "Skin", common_uses: "Minor cuts", search_terms: "Neosporin", is_vitamin: false, is_combo: true, combo_ingredients: "neomycin;bacitracin;polymyxin b" },
  { display_name: "Polysporin", generic_name: "bacitracin polymyxin b", primary_category: "Skin", common_uses: "Minor cuts", search_terms: "Polysporin", is_vitamin: false, is_combo: true, combo_ingredients: "bacitracin;polymyxin b" },
  { display_name: "Zinc Oxide", generic_name: "zinc oxide", primary_category: "Skin", common_uses: "Diaper rash", search_terms: "Desitin", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Petrolatum", generic_name: "petrolatum", primary_category: "Skin", common_uses: "Skin protectant", search_terms: "Vaseline", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Calamine", generic_name: "calamine", primary_category: "Skin", common_uses: "Itch", search_terms: "poison ivy", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Benzoyl Peroxide", generic_name: "benzoyl peroxide", primary_category: "Skin", common_uses: "Acne", search_terms: "acne wash", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Adapalene", generic_name: "adapalene topical", primary_category: "Skin", common_uses: "Acne", search_terms: "Differin", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Salicylic Acid Topical", generic_name: "salicylic acid topical", primary_category: "Skin", common_uses: "Acne warts", search_terms: "Stridex", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Minoxidil Topical", generic_name: "minoxidil topical", primary_category: "Skin", common_uses: "Hair loss", search_terms: "Rogaine", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Eye/Ear/Mouth
  { display_name: "Artificial Tears", generic_name: "artificial tears", primary_category: "Eye/Ear/Mouth", common_uses: "Dry eyes", search_terms: "lubricating eye drops", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Ketotifen Eye Drops", generic_name: "ketotifen", primary_category: "Eye/Ear/Mouth", common_uses: "Eye allergy", search_terms: "Zaditor", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Carbamide Peroxide Ear Drops", generic_name: "carbamide peroxide", primary_category: "Eye/Ear/Mouth", common_uses: "Ear wax removal", search_terms: "Debrox", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Benzocaine Oral Gel", generic_name: "benzocaine oral", primary_category: "Eye/Ear/Mouth", common_uses: "Tooth pain", search_terms: "Orajel", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Smoking Cessation
  { display_name: "Nicotine Patch", generic_name: "nicotine patch", primary_category: "Smoking Cessation", common_uses: "Quit smoking", search_terms: "Nicoderm", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Nicotine Gum", generic_name: "nicotine gum", primary_category: "Smoking Cessation", common_uses: "Quit smoking", search_terms: "Nicorette", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  { display_name: "Nicotine Lozenge", generic_name: "nicotine lozenge", primary_category: "Smoking Cessation", common_uses: "Quit smoking", search_terms: "Commit", is_vitamin: false, is_combo: false, combo_ingredients: "" },
  
  // Vitamins & Minerals
  { display_name: "Vitamin C", generic_name: "ascorbic acid", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "ascorbate;vitamin c;vit c", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin D3", generic_name: "cholecalciferol", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin d3;d3;vitamin d", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin D2", generic_name: "ergocalciferol", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin d2;d2", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin B12", generic_name: "cyanocobalamin", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "b12;methylcobalamin;vitamin b12", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Folic Acid", generic_name: "folic acid", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "folate;vitamin b9", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Iron", generic_name: "ferrous sulfate", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "ferrous;iron;anemia", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Calcium Supplement", generic_name: "calcium supplement", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "calcium;bone health", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Magnesium Supplement", generic_name: "magnesium oxide", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "magnesium;mag", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Zinc Supplement", generic_name: "zinc gluconate", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "zinc", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Multivitamin", generic_name: "multivitamin", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "centrum;one a day;daily vitamin", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin A", generic_name: "retinol", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin a;retinyl palmitate", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin E", generic_name: "tocopherol", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin e;alpha tocopherol", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin K", generic_name: "phytonadione", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin k;k1;k2", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin B1", generic_name: "thiamine", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "thiamin;vitamin b1;b1", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin B2", generic_name: "riboflavin", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin b2;b2", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin B3", generic_name: "niacin", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin b3;b3;niacinamide", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin B5", generic_name: "pantothenic acid", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin b5;b5;pantothenate", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Vitamin B6", generic_name: "pyridoxine", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin b6;b6", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Biotin", generic_name: "biotin", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "vitamin b7;b7;hair vitamin", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Potassium Supplement", generic_name: "potassium chloride", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "potassium;kcl", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Selenium", generic_name: "selenium", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "selenium;selenomethionine", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Chromium", generic_name: "chromium picolinate", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "chromium", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Copper", generic_name: "copper gluconate", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "copper", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Manganese", generic_name: "manganese sulfate", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "manganese", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Iodine", generic_name: "potassium iodide", primary_category: "Vitamins & Minerals", common_uses: "Supplement", search_terms: "iodine;iodide", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  
  // Supplements
  { display_name: "Omega-3 Fish Oil", generic_name: "omega-3", primary_category: "Supplements", common_uses: "General health", search_terms: "fish oil;epa;dha;omega 3", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Probiotic", generic_name: "probiotic", primary_category: "Supplements", common_uses: "Gut health", search_terms: "lactobacillus;bifidobacterium;culturelle;align", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Creatine Monohydrate", generic_name: "creatine monohydrate", primary_category: "Supplements", common_uses: "Fitness", search_terms: "creatine", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Collagen Peptides", generic_name: "collagen peptides", primary_category: "Supplements", common_uses: "Skin joints", search_terms: "collagen;hydrolyzed collagen", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Turmeric", generic_name: "curcumin", primary_category: "Supplements", common_uses: "Anti-inflammatory", search_terms: "turmeric;curcumin", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "CoQ10", generic_name: "ubiquinone", primary_category: "Supplements", common_uses: "Supplement", search_terms: "coenzyme q10;coq10;ubiquinol", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Ashwagandha", generic_name: "ashwagandha", primary_category: "Supplements", common_uses: "Stress", search_terms: "adaptogen;withania", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Elderberry", generic_name: "elderberry", primary_category: "Supplements", common_uses: "Immune support", search_terms: "sambucus;elderberry extract", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Echinacea", generic_name: "echinacea", primary_category: "Supplements", common_uses: "Immune support", search_terms: "echinacea purpurea", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Glucosamine", generic_name: "glucosamine sulfate", primary_category: "Supplements", common_uses: "Joint health", search_terms: "glucosamine;joint supplement", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Chondroitin", generic_name: "chondroitin sulfate", primary_category: "Supplements", common_uses: "Joint health", search_terms: "chondroitin", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "MSM", generic_name: "methylsulfonylmethane", primary_category: "Supplements", common_uses: "Joint health", search_terms: "msm", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Ginger Root", generic_name: "ginger", primary_category: "Supplements", common_uses: "Digestive health", search_terms: "ginger root;zingiber", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Garlic", generic_name: "garlic extract", primary_category: "Supplements", common_uses: "Heart health", search_terms: "garlic;allicin", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Milk Thistle", generic_name: "silymarin", primary_category: "Supplements", common_uses: "Liver support", search_terms: "milk thistle;silymarin", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Valerian Root", generic_name: "valerian", primary_category: "Supplements", common_uses: "Sleep support", search_terms: "valerian root;valeriana", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "St. John's Wort", generic_name: "hypericum perforatum", primary_category: "Supplements", common_uses: "Mood support", search_terms: "st johns wort;st. john's wort", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Saw Palmetto", generic_name: "saw palmetto", primary_category: "Supplements", common_uses: "Prostate health", search_terms: "serenoa repens", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Ginkgo Biloba", generic_name: "ginkgo biloba", primary_category: "Supplements", common_uses: "Cognitive support", search_terms: "ginkgo;ginkgo extract", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "L-Theanine", generic_name: "l-theanine", primary_category: "Supplements", common_uses: "Relaxation", search_terms: "theanine", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "5-HTP", generic_name: "5-hydroxytryptophan", primary_category: "Supplements", common_uses: "Mood support", search_terms: "5htp;5-htp", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "GABA", generic_name: "gamma-aminobutyric acid", primary_category: "Supplements", common_uses: "Relaxation", search_terms: "gaba", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Spirulina", generic_name: "spirulina", primary_category: "Supplements", common_uses: "Superfood", search_terms: "blue green algae", is_vitamin: true, is_combo: false, combo_ingredients: "" },
  { display_name: "Chlorella", generic_name: "chlorella", primary_category: "Supplements", common_uses: "Detox", search_terms: "chlorella algae", is_vitamin: true, is_combo: false, combo_ingredients: "" },
];

function normalize(str: string): string {
  return str.toLowerCase().trim();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ============ AUTHENTICATION CHECK ============
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Unauthorized: No auth header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create client with user's token for auth verification
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.log('Unauthorized: Invalid token', claimsError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log(`Authenticated user: ${userId}`);

    // ============ ADMIN AUTHORIZATION CHECK ============
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin');

    if (roleError || !roles || roles.length === 0) {
      console.log(`Forbidden: User ${userId} is not an admin`);
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Admin verified: ${userId}`);

    // ============ SEED OTC PRODUCTS ============
    const result: SeedResult = {
      productsUpserted: 0,
      synonymsInserted: 0,
      errors: []
    };

    console.log(`[seed-otc] Starting seed of ${OTC_SEED_DATA.length} products...`);

    for (const product of OTC_SEED_DATA) {
      const normalizedGenericName = normalize(product.generic_name);
      
      // Prepare product row
      const productRow = {
        display_name: product.display_name,
        generic_name: normalizedGenericName,
        primary_category: product.primary_category,
        common_uses: product.common_uses,
        search_terms: product.search_terms ? product.search_terms.split(';').map(s => s.trim()).filter(Boolean) : [],
        is_vitamin: product.is_vitamin,
        is_combo: product.is_combo,
        combo_ingredients: product.combo_ingredients ? product.combo_ingredients.split(';').map(s => s.trim()).filter(Boolean) : []
      };

      // Upsert product
      const { data: upsertedProduct, error: upsertError } = await supabase
        .from('otc_products')
        .upsert(productRow, { onConflict: 'generic_name' })
        .select('id')
        .single();

      if (upsertError) {
        console.error(`[seed-otc] Error upserting ${product.display_name}:`, upsertError);
        result.errors.push(`${product.display_name}: ${upsertError.message}`);
        continue;
      }

      result.productsUpserted++;
      const productId = upsertedProduct.id;

      // Build synonyms list (de-duplicated)
      const synonymSet = new Set<string>();
      
      // Add display_name
      synonymSet.add(normalize(product.display_name));
      
      // Add generic_name
      synonymSet.add(normalizedGenericName);
      
      // Add search terms
      if (product.search_terms) {
        product.search_terms.split(';').forEach(term => {
          const normalized = normalize(term);
          if (normalized) synonymSet.add(normalized);
        });
      }

      // Prepare synonym rows
      const synonymRows = Array.from(synonymSet).map(synonym => ({
        otc_product_id: productId,
        synonym: synonym,
        synonym_type: synonym === normalizedGenericName ? 'generic' : 
                      synonym === normalize(product.display_name) ? 'display' : 'brand'
      }));

      // Insert synonyms with conflict handling
      for (const synonymRow of synonymRows) {
        const { error: synonymError } = await supabase
          .from('otc_synonyms')
          .upsert(synonymRow, { onConflict: 'otc_product_id,synonym' });

        if (synonymError) {
          // Only log actual errors, not duplicates
          if (!synonymError.message.includes('duplicate')) {
            console.error(`[seed-otc] Synonym error for ${product.display_name}:`, synonymError);
          }
        } else {
          result.synonymsInserted++;
        }
      }
    }

    console.log(`[seed-otc] Complete: ${result.productsUpserted} products, ${result.synonymsInserted} synonyms`);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error: any) {
    console.error('[seed-otc] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
