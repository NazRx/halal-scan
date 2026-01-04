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
          category: string | null
          created_at: string
          id: string
          manufacturer: string | null
          name: string
          notes: string | null
          upc: string | null
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          manufacturer?: string | null
          name: string
          notes?: string | null
          upc?: string | null
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category?: string | null
          created_at?: string
          id?: string
          manufacturer?: string | null
          name?: string
          notes?: string | null
          upc?: string | null
          updated_at?: string
        }
        Relationships: []
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
          brand_names: string[] | null
          category: string | null
          created_at: string
          dosage_forms: string[] | null
          generic_name: string
          id: string
          notes: string | null
          route: string | null
          rx_otc: string | null
          updated_at: string
        }
        Insert: {
          brand_names?: string[] | null
          category?: string | null
          created_at?: string
          dosage_forms?: string[] | null
          generic_name: string
          id?: string
          notes?: string | null
          route?: string | null
          rx_otc?: string | null
          updated_at?: string
        }
        Update: {
          brand_names?: string[] | null
          category?: string | null
          created_at?: string
          dosage_forms?: string[] | null
          generic_name?: string
          id?: string
          notes?: string | null
          route?: string | null
          rx_otc?: string | null
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
          dosage_form: string | null
          id: string
          manufacturer: string | null
          ndc_list: string[] | null
          notes: string | null
          rx_med_id: string
          strength_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosage_form?: string | null
          id?: string
          manufacturer?: string | null
          ndc_list?: string[] | null
          notes?: string | null
          rx_med_id: string
          strength_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosage_form?: string | null
          id?: string
          manufacturer?: string | null
          ndc_list?: string[] | null
          notes?: string | null
          rx_med_id?: string
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
          ref_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: Database["public"]["Enums"]["usage_event_type"]
          id?: string
          ref_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: Database["public"]["Enums"]["usage_event_type"]
          id?: string
          ref_id?: string | null
          user_id?: string
        }
        Relationships: []
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
      [_ in never]: never
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
