export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ingredients: {
        Row: {
          created_at: string
          default_concern_reason: string | null
          default_status: Database["public"]["Enums"]["halal_status"] | null
          id: string
          name: string
          risk: Database["public"]["Enums"]["risk_level"]
          risk_tags: string[] | null
          synonyms: string[] | null
          updated_at: string
          what_would_verify: string | null
        }
        Insert: {
          created_at?: string
          default_concern_reason?: string | null
          default_status?: Database["public"]["Enums"]["halal_status"] | null
          id?: string
          name: string
          risk?: Database["public"]["Enums"]["risk_level"]
          risk_tags?: string[] | null
          synonyms?: string[] | null
          updated_at?: string
          what_would_verify?: string | null
        }
        Update: {
          created_at?: string
          default_concern_reason?: string | null
          default_status?: Database["public"]["Enums"]["halal_status"] | null
          id?: string
          name?: string
          risk?: Database["public"]["Enums"]["risk_level"]
          risk_tags?: string[] | null
          synonyms?: string[] | null
          updated_at?: string
          what_would_verify?: string | null
        }
        Relationships: []
      }
      ndc_inactive_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_name_normalized: string
          ingredient_text_raw: string
          match_confidence: string | null
          matched_ingredient_id: string | null
          matched_status: Database["public"]["Enums"]["halal_status"] | null
          ndc: string
          notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          unii_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_name_normalized: string
          ingredient_text_raw: string
          match_confidence?: string | null
          matched_ingredient_id?: string | null
          matched_status?: Database["public"]["Enums"]["halal_status"] | null
          ndc: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          unii_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_name_normalized?: string
          ingredient_text_raw?: string
          match_confidence?: string | null
          matched_ingredient_id?: string | null
          matched_status?: Database["public"]["Enums"]["halal_status"] | null
          ndc?: string
          notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          unii_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ndc_inactive_ingredients_matched_ingredient_id_fkey"
            columns: ["matched_ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ndc_inactive_ingredients_ndc_fkey"
            columns: ["ndc"]
            isOneToOne: false
            referencedRelation: "ndc_products"
            referencedColumns: ["ndc"]
          },
        ]
      }
      ndc_products: {
        Row: {
          brand_name: string | null
          created_at: string
          dosage_form: string | null
          generic_name: string | null
          labeler_name: string | null
          last_ingested_at: string | null
          ndc: string
          route: string | null
          set_id: string | null
          spl_version: string | null
          strength: string | null
          updated_at: string
        }
        Insert: {
          brand_name?: string | null
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          labeler_name?: string | null
          last_ingested_at?: string | null
          ndc: string
          route?: string | null
          set_id?: string | null
          spl_version?: string | null
          strength?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string | null
          created_at?: string
          dosage_form?: string | null
          generic_name?: string | null
          labeler_name?: string | null
          last_ingested_at?: string | null
          ndc?: string
          route?: string | null
          set_id?: string | null
          spl_version?: string | null
          strength?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          org_id: string
          role: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          org_id: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          org_id?: string
          role?: Database["public"]["Enums"]["org_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      otc_brand_aliases: {
        Row: {
          alias: string | null
          brand: string
          category: string | null
          country: string | null
          created_at: string
          generic_name_normalized: string
          id: string
          priority: number | null
        }
        Insert: {
          alias?: string | null
          brand: string
          category?: string | null
          country?: string | null
          created_at?: string
          generic_name_normalized: string
          id?: string
          priority?: number | null
        }
        Update: {
          alias?: string | null
          brand?: string
          category?: string | null
          country?: string | null
          created_at?: string
          generic_name_normalized?: string
          id?: string
          priority?: number | null
        }
        Relationships: []
      }
      otc_ingredient_profiles: {
        Row: {
          active_ingredients: Json | null
          created_at: string
          default_status: string | null
          dosage_form: string | null
          flags: Json | null
          id: string
          otc_product_id: string
          rationale_long: string | null
          rationale_short: string | null
          risk_ingredients: Json | null
          route: string | null
          sources: Json | null
          updated_at: string
        }
        Insert: {
          active_ingredients?: Json | null
          created_at?: string
          default_status?: string | null
          dosage_form?: string | null
          flags?: Json | null
          id?: string
          otc_product_id: string
          rationale_long?: string | null
          rationale_short?: string | null
          risk_ingredients?: Json | null
          route?: string | null
          sources?: Json | null
          updated_at?: string
        }
        Update: {
          active_ingredients?: Json | null
          created_at?: string
          default_status?: string | null
          dosage_form?: string | null
          flags?: Json | null
          id?: string
          otc_product_id?: string
          rationale_long?: string | null
          rationale_short?: string | null
          risk_ingredients?: Json | null
          route?: string | null
          sources?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "otc_ingredient_profiles_otc_product_id_fkey"
            columns: ["otc_product_id"]
            isOneToOne: true
            referencedRelation: "otc_products"
            referencedColumns: ["id"]
          },
        ]
      }
      otc_product_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          notes: string | null
          product_id: string
          source_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          notes?: string | null
          product_id: string
          source_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          notes?: string | null
          product_id?: string
          source_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otc_product_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otc_product_ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "otc_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "otc_product_ingredients_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      otc_products: {
        Row: {
          brand: string | null
          category: string
          combo_ingredients: string[] | null
          common_uses: string | null
          created_at: string
          display_name: string | null
          generic_name: string
          id: string
          is_combo: boolean | null
          is_vitamin: boolean | null
          manufacturer: string | null
          name: string
          notes: string | null
          primary_category: string | null
          search_terms: string[] | null
          upc: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string
          combo_ingredients?: string[] | null
          common_uses?: string | null
          created_at?: string
          display_name?: string | null
          generic_name: string
          id?: string
          is_combo?: boolean | null
          is_vitamin?: boolean | null
          manufacturer?: string | null
          name: string
          notes?: string | null
          primary_category?: string | null
          search_terms?: string[] | null
          upc?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string
          combo_ingredients?: string[] | null
          common_uses?: string | null
          created_at?: string
          display_name?: string | null
          generic_name?: string
          id?: string
          is_combo?: boolean | null
          is_vitamin?: boolean | null
          manufacturer?: string | null
          name?: string
          notes?: string | null
          primary_category?: string | null
          search_terms?: string[] | null
          upc?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      otc_synonyms: {
        Row: {
          created_at: string | null
          id: string
          otc_product_id: string
          synonym: string
          synonym_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          otc_product_id: string
          synonym: string
          synonym_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          otc_product_id?: string
          synonym?: string
          synonym_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otc_synonyms_otc_product_id_fkey"
            columns: ["otc_product_id"]
            isOneToOne: false
            referencedRelation: "otc_products"
            referencedColumns: ["id"]
          },
        ]
      }
      otc_user_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          otc_product_id: string
          pasted_text: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          submission_type: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          otc_product_id: string
          pasted_text: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_type?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          otc_product_id?: string
          pasted_text?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          submission_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otc_user_submissions_otc_product_id_fkey"
            columns: ["otc_product_id"]
            isOneToOne: false
            referencedRelation: "otc_products"
            referencedColumns: ["id"]
          },
        ]
      }
      otc_verdicts: {
        Row: {
          clinical_breakdown: string | null
          confidence: number
          darura_context: string | null
          halal_alternatives: string[] | null
          id: string
          pharmacist_note: string | null
          product_id: string
          status: Database["public"]["Enums"]["halal_status"]
          summary_reason: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          clinical_breakdown?: string | null
          confidence?: number
          darura_context?: string | null
          halal_alternatives?: string[] | null
          id?: string
          pharmacist_note?: string | null
          product_id: string
          status?: Database["public"]["Enums"]["halal_status"]
          summary_reason?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          clinical_breakdown?: string | null
          confidence?: number
          darura_context?: string | null
          halal_alternatives?: string[] | null
          id?: string
          pharmacist_note?: string | null
          product_id?: string
          status?: Database["public"]["Enums"]["halal_status"]
          summary_reason?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "otc_verdicts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "otc_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          purchased_credits: number
          rx_scans_used: number
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          purchased_credits?: number
          rx_scans_used?: number
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          purchased_credits?: number
          rx_scans_used?: number
          updated_at?: string
        }
        Relationships: []
      }
      review_requests: {
        Row: {
          created_at: string
          id: string
          message: string | null
          query_text: string | null
          rx_fields: Json | null
          status: Database["public"]["Enums"]["review_request_status"]
          type: Database["public"]["Enums"]["review_request_type"]
          upc: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          query_text?: string | null
          rx_fields?: Json | null
          status?: Database["public"]["Enums"]["review_request_status"]
          type: Database["public"]["Enums"]["review_request_type"]
          upc?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          query_text?: string | null
          rx_fields?: Json | null
          status?: Database["public"]["Enums"]["review_request_status"]
          type?: Database["public"]["Enums"]["review_request_type"]
          upc?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rx_meds: {
        Row: {
          active_ingredients: string[] | null
          brand_names: string[] | null
          category: string | null
          confidence_level: string | null
          created_at: string
          dailymed_set_id: string | null
          default_status: Database["public"]["Enums"]["halal_status"] | null
          dosage_forms: string[] | null
          drug_class: string | null
          fda_contraindications: string | null
          fda_drug_interactions: string[] | null
          fda_indications: string | null
          fda_warnings: string[] | null
          generic_name: string
          hydrate_attempts: number
          id: string
          inactive_ingredients: string[] | null
          inactive_raw_text: string | null
          last_hydrate_error: string | null
          ndc: string | null
          notes: string | null
          popularity_rank: number | null
          route: string | null
          rx_otc: string | null
          source: string | null
          spl_last_fetched_at: string | null
          status_reason: string | null
          updated_at: string
        }
        Insert: {
          active_ingredients?: string[] | null
          brand_names?: string[] | null
          category?: string | null
          confidence_level?: string | null
          created_at?: string
          dailymed_set_id?: string | null
          default_status?: Database["public"]["Enums"]["halal_status"] | null
          dosage_forms?: string[] | null
          drug_class?: string | null
          fda_contraindications?: string | null
          fda_drug_interactions?: string[] | null
          fda_indications?: string | null
          fda_warnings?: string[] | null
          generic_name: string
          hydrate_attempts?: number
          id?: string
          inactive_ingredients?: string[] | null
          inactive_raw_text?: string | null
          last_hydrate_error?: string | null
          ndc?: string | null
          notes?: string | null
          popularity_rank?: number | null
          route?: string | null
          rx_otc?: string | null
          source?: string | null
          spl_last_fetched_at?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Update: {
          active_ingredients?: string[] | null
          brand_names?: string[] | null
          category?: string | null
          confidence_level?: string | null
          created_at?: string
          dailymed_set_id?: string | null
          default_status?: Database["public"]["Enums"]["halal_status"] | null
          dosage_forms?: string[] | null
          drug_class?: string | null
          fda_contraindications?: string | null
          fda_drug_interactions?: string[] | null
          fda_indications?: string | null
          fda_warnings?: string[] | null
          generic_name?: string
          hydrate_attempts?: number
          id?: string
          inactive_ingredients?: string[] | null
          inactive_raw_text?: string | null
          last_hydrate_error?: string | null
          ndc?: string | null
          notes?: string | null
          popularity_rank?: number | null
          route?: string | null
          rx_otc?: string | null
          source?: string | null
          spl_last_fetched_at?: string | null
          status_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rx_variant_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          notes: string | null
          role: Database["public"]["Enums"]["ingredient_role"]
          source_id: string | null
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          notes?: string | null
          role?: Database["public"]["Enums"]["ingredient_role"]
          source_id?: string | null
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          notes?: string | null
          role?: Database["public"]["Enums"]["ingredient_role"]
          source_id?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rx_variant_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_variant_ingredients_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rx_variant_ingredients_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "rx_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_variants: {
        Row: {
          created_at: string
          data_source: string | null
          dosage_form: string | null
          has_active_recall: boolean | null
          id: string
          is_brand: boolean | null
          is_promoted: boolean | null
          labeler_code: string | null
          manufacturer: string | null
          manufacturer_normalized: string | null
          marketing_category: string | null
          ndc_list: string[] | null
          notes: string | null
          promoted_until: string | null
          recall_info: Json | null
          rx_med_id: string
          rxcui: string | null
          seed_attempts: number | null
          seed_last_error: string | null
          seed_next_retry_at: string | null
          seed_status: string | null
          spl_set_id: string | null
          strength_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_source?: string | null
          dosage_form?: string | null
          has_active_recall?: boolean | null
          id?: string
          is_brand?: boolean | null
          is_promoted?: boolean | null
          labeler_code?: string | null
          manufacturer?: string | null
          manufacturer_normalized?: string | null
          marketing_category?: string | null
          ndc_list?: string[] | null
          notes?: string | null
          promoted_until?: string | null
          recall_info?: Json | null
          rx_med_id: string
          rxcui?: string | null
          seed_attempts?: number | null
          seed_last_error?: string | null
          seed_next_retry_at?: string | null
          seed_status?: string | null
          spl_set_id?: string | null
          strength_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_source?: string | null
          dosage_form?: string | null
          has_active_recall?: boolean | null
          id?: string
          is_brand?: boolean | null
          is_promoted?: boolean | null
          labeler_code?: string | null
          manufacturer?: string | null
          manufacturer_normalized?: string | null
          marketing_category?: string | null
          ndc_list?: string[] | null
          notes?: string | null
          promoted_until?: string | null
          recall_info?: Json | null
          rx_med_id?: string
          rxcui?: string | null
          seed_attempts?: number | null
          seed_last_error?: string | null
          seed_next_retry_at?: string | null
          seed_status?: string | null
          spl_set_id?: string | null
          strength_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rx_variants_rx_med_id_fkey"
            columns: ["rx_med_id"]
            isOneToOne: false
            referencedRelation: "rx_meds"
            referencedColumns: ["id"]
          },
        ]
      }
      rx_verdicts: {
        Row: {
          classification_rationale: string | null
          clinical_breakdown: string | null
          confidence: number
          darura_context: string | null
          halal_alternatives: string[] | null
          id: string
          pharmacist_note: string | null
          status: Database["public"]["Enums"]["halal_status"]
          summary_reason: string | null
          updated_at: string
          updated_by: string | null
          variant_id: string
        }
        Insert: {
          classification_rationale?: string | null
          clinical_breakdown?: string | null
          confidence?: number
          darura_context?: string | null
          halal_alternatives?: string[] | null
          id?: string
          pharmacist_note?: string | null
          status?: Database["public"]["Enums"]["halal_status"]
          summary_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          variant_id: string
        }
        Update: {
          classification_rationale?: string | null
          clinical_breakdown?: string | null
          confidence?: number
          darura_context?: string | null
          halal_alternatives?: string[] | null
          id?: string
          pharmacist_note?: string | null
          status?: Database["public"]["Enums"]["halal_status"]
          summary_reason?: string | null
          updated_at?: string
          updated_by?: string | null
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rx_verdicts_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: true
            referencedRelation: "rx_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_manufacturers: {
        Row: {
          created_at: string
          id: string
          nickname: string | null
          notes: string | null
          user_id: string
          variant_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          nickname?: string | null
          notes?: string | null
          user_id: string
          variant_id: string
        }
        Update: {
          created_at?: string
          id?: string
          nickname?: string | null
          notes?: string | null
          user_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_manufacturers_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "rx_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_reports: {
        Row: {
          id: string
          notes: string | null
          otc_verdict_id: string | null
          report_type: string
          rx_verdict_id: string | null
          saved_at: string
          user_id: string
        }
        Insert: {
          id?: string
          notes?: string | null
          otc_verdict_id?: string | null
          report_type: string
          rx_verdict_id?: string | null
          saved_at?: string
          user_id: string
        }
        Update: {
          id?: string
          notes?: string | null
          otc_verdict_id?: string | null
          report_type?: string
          rx_verdict_id?: string | null
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_reports_otc_verdict_id_fkey"
            columns: ["otc_verdict_id"]
            isOneToOne: false
            referencedRelation: "otc_verdicts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_reports_rx_verdict_id_fkey"
            columns: ["rx_verdict_id"]
            isOneToOne: false
            referencedRelation: "rx_verdicts"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          citation_text: string | null
          created_at: string
          date_accessed: string | null
          id: string
          source_type: Database["public"]["Enums"]["source_type"]
          title: string
          url: string | null
        }
        Insert: {
          citation_text?: string | null
          created_at?: string
          date_accessed?: string | null
          id?: string
          source_type: Database["public"]["Enums"]["source_type"]
          title: string
          url?: string | null
        }
        Update: {
          citation_text?: string | null
          created_at?: string
          date_accessed?: string | null
          id?: string
          source_type?: Database["public"]["Enums"]["source_type"]
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          plan: Database["public"]["Enums"]["plan_type"]
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["plan_type"]
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      uploads: {
        Row: {
          created_at: string
          file_path: string
          file_type: string | null
          id: string
          review_request_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_path: string
          file_type?: string | null
          id?: string
          review_request_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_path?: string
          file_type?: string | null
          id?: string
          review_request_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploads_review_request_id_fkey"
            columns: ["review_request_id"]
            isOneToOne: false
            referencedRelation: "review_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_events: {
        Row: {
          created_at: string
          event_type: Database["public"]["Enums"]["usage_event_type"]
          id: string
          metadata: Json | null
          ref_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["usage_event_type"]
          id?: string
          metadata?: Json | null
          ref_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["usage_event_type"]
          id?: string
          metadata?: Json | null
          ref_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_feedback: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string | null
          feedback_type: Database["public"]["Enums"]["feedback_type"]
          id: string
          message: string
          page_url: string | null
          related_medication_id: string | null
          related_product_upc: string | null
          status: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          id?: string
          message: string
          page_url?: string | null
          related_medication_id?: string | null
          related_product_upc?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string | null
          feedback_type?: Database["public"]["Enums"]["feedback_type"]
          id?: string
          message?: string
          page_url?: string | null
          related_medication_id?: string | null
          related_product_upc?: string | null
          status?: Database["public"]["Enums"]["feedback_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feedback_related_medication_id_fkey"
            columns: ["related_medication_id"]
            isOneToOne: false
            referencedRelation: "rx_meds"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      ndc_ingredient_summary: {
        Row: {
          halal_count: number | null
          haram_count: number | null
          matched_count: number | null
          ndc: string | null
          overall_status: string | null
          questionable_count: number | null
          total_inactive_count: number | null
          unmatched_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ndc_inactive_ingredients_ndc_fkey"
            columns: ["ndc"]
            isOneToOne: false
            referencedRelation: "ndc_products"
            referencedColumns: ["ndc"]
          },
        ]
      }
    }
    Functions: {
      has_org_role: {
        Args: {
          _org_id: string
          _roles: Database["public"]["Enums"]["org_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      feedback_status: "new" | "reviewed" | "resolved" | "dismissed"
      feedback_type:
        | "correction"
        | "suggestion"
        | "compliment"
        | "question"
        | "other"
      halal_status: "halal" | "mushbooh" | "haram" | "needs_verification"
      ingredient_role: "active" | "inactive"
      org_role: "owner" | "admin" | "member"
      plan_type: "free" | "pro" | "clinic"
      review_request_status: "new" | "in_progress" | "resolved"
      review_request_type: "otc_not_found" | "rx_not_found" | "variant_unclear"
      risk_level: "low" | "medium" | "high"
      source_type: "manufacturer" | "certifier" | "reference"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
      usage_event_type:
        | "otc_scan"
        | "rx_search"
        | "report_view"
        | "report_download"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      feedback_status: ["new", "reviewed", "resolved", "dismissed"],
      feedback_type: [
        "correction",
        "suggestion",
        "compliment",
        "question",
        "other",
      ],
      halal_status: ["halal", "mushbooh", "haram", "needs_verification"],
      ingredient_role: ["active", "inactive"],
      org_role: ["owner", "admin", "member"],
      plan_type: ["free", "pro", "clinic"],
      review_request_status: ["new", "in_progress", "resolved"],
      review_request_type: ["otc_not_found", "rx_not_found", "variant_unclear"],
      risk_level: ["low", "medium", "high"],
      source_type: ["manufacturer", "certifier", "reference"],
      subscription_status: [
        "active",
        "canceled",
        "past_due",
        "trialing",
        "incomplete",
      ],
      usage_event_type: [
        "otc_scan",
        "rx_search",
        "report_view",
        "report_download",
      ],
    },
  },
} as const
