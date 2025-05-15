export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          grade: string | null
          id: string
          name: string | null
          plan_expires_at: string | null
          plan_type: string | null
          promo_code: string | null
          score_save_count: number
          stripe_customer_id: string | null
          subscription_status: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          grade?: string | null
          id: string
          name?: string | null
          plan_expires_at?: string | null
          plan_type?: string | null
          promo_code?: string | null
          score_save_count?: number
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          grade?: string | null
          id?: string
          name?: string | null
          plan_expires_at?: string | null
          plan_type?: string | null
          promo_code?: string | null
          score_save_count?: number
          stripe_customer_id?: string | null
          subscription_status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      goal_progress: {
        Row: {
          attempts: number
          best_score: number
          last_attempt: string | null
          last_level_up: string | null
          level: string
          operation: string
          profile_id: string
          range: string
        }
        Insert: {
          attempts?: number
          best_score?: number
          last_attempt?: string | null
          last_level_up?: string | null
          level?: string
          operation: string
          profile_id: string
          range: string
        }
        Update: {
          attempts?: number
          best_score?: number
          last_attempt?: string | null
          last_level_up?: string | null
          level?: string
          operation?: string
          profile_id?: string
          range?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          can_generate_reports: boolean
          can_save_score: boolean
          created_at: string
          id: string
          max_profiles: number
          max_saved_scores: number | null
          plan_label: string
          plan_type: string
          price_annual: number | null
          price_monthly: number | null
          price_one_time: number | null
          stripe_price_id_annual: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_one_time: string | null
          stripe_product_id: string | null
          typing_speed_enabled: boolean
          updated_at: string
        }
        Insert: {
          can_generate_reports?: boolean
          can_save_score?: boolean
          created_at?: string
          id?: string
          max_profiles: number
          max_saved_scores?: number | null
          plan_label: string
          plan_type: string
          price_annual?: number | null
          price_monthly?: number | null
          price_one_time?: number | null
          stripe_price_id_annual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_one_time?: string | null
          stripe_product_id?: string | null
          typing_speed_enabled?: boolean
          updated_at?: string
        }
        Update: {
          can_generate_reports?: boolean
          can_save_score?: boolean
          created_at?: string
          id?: string
          max_profiles?: number
          max_saved_scores?: number | null
          plan_label?: string
          plan_type?: string
          price_annual?: number | null
          price_monthly?: number | null
          price_one_time?: number | null
          stripe_price_id_annual?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_one_time?: string | null
          stripe_product_id?: string | null
          typing_speed_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_id: string
          avatar_url: string | null
          created_at: string
          grade: string | null
          id: string
          is_active: boolean | null
          is_owner: boolean
          name: string
          updated_at: string
        }
        Insert: {
          account_id: string
          avatar_url?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          is_active?: boolean | null
          is_owner?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          avatar_url?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          is_active?: boolean | null
          is_owner?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          discount_percent: number
          id: string
          max_uses: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_percent: number
          id?: string
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_percent?: number
          id?: string
          max_uses?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      scores: {
        Row: {
          adjusted_math_speed: number | null
          allow_negatives: boolean | null
          date: string
          duration: number | null
          focus_number: number | null
          id: string
          max1: number
          max2: number
          min1: number
          min2: number
          operation: string
          profile_id: string | null
          score: number
          total_speed: number | null
          typing_speed: number | null
          user_id: string
        }
        Insert: {
          adjusted_math_speed?: number | null
          allow_negatives?: boolean | null
          date?: string
          duration?: number | null
          focus_number?: number | null
          id?: string
          max1: number
          max2: number
          min1: number
          min2: number
          operation: string
          profile_id?: string | null
          score: number
          total_speed?: number | null
          typing_speed?: number | null
          user_id: string
        }
        Update: {
          adjusted_math_speed?: number | null
          allow_negatives?: boolean | null
          date?: string
          duration?: number | null
          focus_number?: number | null
          id?: string
          max1?: number
          max2?: number
          min1?: number
          min2?: number
          operation?: string
          profile_id?: string | null
          score?: number
          total_speed?: number | null
          typing_speed?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_history: {
        Row: {
          account_id: string
          created_at: string
          ended_at: string | null
          id: string
          payment_method: string | null
          plan_type: string
          price_paid: number | null
          started_at: string
          stripe_subscription_id: string | null
          subscription_status: string
        }
        Insert: {
          account_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          payment_method?: string | null
          plan_type: string
          price_paid?: number | null
          started_at?: string
          stripe_subscription_id?: string | null
          subscription_status: string
        }
        Update: {
          account_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          payment_method?: string | null
          plan_type?: string
          price_paid?: number | null
          started_at?: string
          stripe_subscription_id?: string | null
          subscription_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_missing_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_leaderboard: {
        Args: {
          p_operation?: string
          p_min1?: number
          p_max1?: number
          p_min2?: number
          p_max2?: number
          p_grade?: string
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          rank: number
          user_id: string
          profile_id: string
          name: string
          grade: string
          best_score: number
          operation: string
          min1: number
          max1: number
          min2: number
          max2: number
        }[]
      }
      get_leaderboard_count: {
        Args: {
          p_operation?: string
          p_min1?: number
          p_max1?: number
          p_min2?: number
          p_max2?: number
          p_grade?: string
        }
        Returns: number
      }
      get_user_rank: {
        Args: {
          p_profile_id: string
          p_operation?: string
          p_min1?: number
          p_max1?: number
          p_min2?: number
          p_max2?: number
          p_grade?: string
        }
        Returns: number
      }
      increment_count: {
        Args: { table_name: string; column_name: string; row_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
