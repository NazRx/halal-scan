
-- Create otc_brand_aliases table for fallback synonym generation
CREATE TABLE IF NOT EXISTS public.otc_brand_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generic_name_normalized TEXT NOT NULL,
  brand TEXT NOT NULL,
  alias TEXT,
  country TEXT DEFAULT 'US',
  category TEXT,
  priority INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(generic_name_normalized, brand)
);

-- Enable RLS
ALTER TABLE public.otc_brand_aliases ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view brand aliases"
  ON public.otc_brand_aliases
  FOR SELECT
  USING (true);

-- Admin management
CREATE POLICY "Admins can manage brand aliases"
  ON public.otc_brand_aliases
  FOR ALL
  USING (is_admin(auth.uid()));

-- Index for lookup by generic name
CREATE INDEX IF NOT EXISTS idx_otc_brand_aliases_generic 
  ON public.otc_brand_aliases(generic_name_normalized);

-- Insert high-priority brand aliases for Pain, Allergy, GI categories
INSERT INTO public.otc_brand_aliases (generic_name_normalized, brand, category, priority) VALUES
-- PAIN (highest priority)
('acetaminophen 325mg tablet', 'Tylenol', 'pain', 100),
('acetaminophen 325mg tablet', 'Tylenol Regular Strength', 'pain', 100),
('acetaminophen 500mg tablet', 'Tylenol Extra Strength', 'pain', 100),
('acetaminophen 650mg er', 'Tylenol Arthritis', 'pain', 100),
('acetaminophen liquid pediatric', 'Childrens Tylenol', 'pain', 100),
('acetaminophen liquid pediatric', 'Infants Tylenol', 'pain', 100),
('ibuprofen 200mg tablet', 'Advil', 'pain', 100),
('ibuprofen 200mg tablet', 'Motrin', 'pain', 100),
('ibuprofen 200mg tablet', 'Motrin IB', 'pain', 100),
('ibuprofen 400mg tablet', 'Advil Dual Action', 'pain', 100),
('ibuprofen liquid pediatric', 'Childrens Advil', 'pain', 100),
('ibuprofen liquid pediatric', 'Childrens Motrin', 'pain', 100),
('naproxen sodium 220mg', 'Aleve', 'pain', 100),
('naproxen sodium 440mg', 'Aleve Back Muscle', 'pain', 100),
('aspirin 325mg', 'Bayer', 'pain', 100),
('aspirin 325mg', 'Bufferin', 'pain', 100),
('aspirin 81mg', 'Baby Aspirin', 'pain', 100),
('aspirin 81mg', 'Bayer Low Dose', 'pain', 100),
('acetaminophen aspirin caffeine', 'Excedrin', 'pain', 100),
('acetaminophen aspirin caffeine', 'Excedrin Migraine', 'pain', 100),
('diclofenac topical gel', 'Voltaren', 'pain', 100),
('diclofenac topical gel', 'Voltaren Gel', 'pain', 100),
('menthol camphor topical', 'Icy Hot', 'pain', 90),
('menthol camphor topical', 'Bengay', 'pain', 90),
('menthol camphor topical', 'Tiger Balm', 'pain', 90),
('menthol camphor topical', 'Biofreeze', 'pain', 90),
('lidocaine patch', 'Salonpas', 'pain', 90),

-- ALLERGY (high priority)
('cetirizine 10mg', 'Zyrtec', 'allergy', 100),
('cetirizine 10mg', 'Zyrtec Allergy', 'allergy', 100),
('cetirizine liquid', 'Childrens Zyrtec', 'allergy', 100),
('loratadine 10mg', 'Claritin', 'allergy', 100),
('loratadine 10mg', 'Claritin 24 Hour', 'allergy', 100),
('loratadine 10mg', 'Alavert', 'allergy', 90),
('loratadine liquid', 'Childrens Claritin', 'allergy', 100),
('fexofenadine 180mg', 'Allegra', 'allergy', 100),
('fexofenadine 180mg', 'Allegra Allergy', 'allergy', 100),
('fexofenadine 180mg', 'Allegra 24 Hour', 'allergy', 100),
('diphenhydramine 25mg', 'Benadryl', 'allergy', 100),
('diphenhydramine 25mg', 'Benadryl Allergy', 'allergy', 100),
('diphenhydramine liquid', 'Childrens Benadryl', 'allergy', 100),
('fluticasone nasal', 'Flonase', 'allergy', 100),
('fluticasone nasal', 'Flonase Allergy Relief', 'allergy', 100),
('triamcinolone nasal', 'Nasacort', 'allergy', 100),
('triamcinolone nasal', 'Nasacort Allergy 24HR', 'allergy', 100),
('budesonide nasal', 'Rhinocort', 'allergy', 100),
('levocetirizine 5mg', 'Xyzal', 'allergy', 100),
('loratadine pseudoephedrine', 'Claritin-D', 'allergy', 90),
('cetirizine pseudoephedrine', 'Zyrtec-D', 'allergy', 90),
('fexofenadine pseudoephedrine', 'Allegra-D', 'allergy', 90),

-- GI (high priority)
('famotidine 20mg', 'Pepcid', 'gi', 100),
('famotidine 20mg', 'Pepcid AC', 'gi', 100),
('famotidine 40mg', 'Pepcid Complete', 'gi', 100),
('omeprazole 20mg', 'Prilosec', 'gi', 100),
('omeprazole 20mg', 'Prilosec OTC', 'gi', 100),
('esomeprazole 20mg', 'Nexium', 'gi', 100),
('esomeprazole 20mg', 'Nexium 24HR', 'gi', 100),
('lansoprazole 15mg', 'Prevacid', 'gi', 100),
('lansoprazole 15mg', 'Prevacid 24HR', 'gi', 100),
('ranitidine 150mg', 'Zantac', 'gi', 90),
('calcium carbonate antacid', 'Tums', 'gi', 100),
('calcium carbonate antacid', 'Rolaids', 'gi', 100),
('bismuth subsalicylate liquid', 'Pepto-Bismol', 'gi', 100),
('bismuth subsalicylate liquid', 'Pepto', 'gi', 100),
('bismuth subsalicylate chewable', 'Pepto Bismol Chewables', 'gi', 100),
('loperamide 2mg', 'Imodium', 'gi', 100),
('loperamide 2mg', 'Imodium AD', 'gi', 100),
('polyethylene glycol 3350', 'MiraLAX', 'gi', 100),
('polyethylene glycol 3350', 'Miralax', 'gi', 100),
('docusate sodium 100mg', 'Colace', 'gi', 100),
('docusate sodium 100mg', 'Dulcolax Stool Softener', 'gi', 90),
('bisacodyl 5mg', 'Dulcolax', 'gi', 100),
('bisacodyl 5mg', 'Correctol', 'gi', 90),
('sennosides 8.6mg', 'Senokot', 'gi', 100),
('sennosides 8.6mg', 'Ex-Lax', 'gi', 90),
('simethicone 80mg', 'Gas-X', 'gi', 100),
('simethicone 80mg', 'Mylanta Gas', 'gi', 90),
('ondansetron 4mg', 'Zofran', 'gi', 90),
('meclizine 25mg', 'Dramamine Less Drowsy', 'gi', 90),
('dimenhydrinate 50mg', 'Dramamine', 'gi', 100),
('dimenhydrinate 50mg', 'Dramamine Original', 'gi', 100),

-- Cold/Flu (medium priority)
('dextromethorphan 15mg', 'Robitussin', 'cold_flu', 90),
('guaifenesin 400mg', 'Mucinex', 'cold_flu', 100),
('guaifenesin 400mg', 'Mucinex Expectorant', 'cold_flu', 100),
('pseudoephedrine 30mg', 'Sudafed', 'cold_flu', 100),
('phenylephrine 10mg', 'Sudafed PE', 'cold_flu', 100),
('oxymetazoline nasal', 'Afrin', 'cold_flu', 100)
ON CONFLICT (generic_name_normalized, brand) DO NOTHING;
