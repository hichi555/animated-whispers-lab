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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      characters: {
        Row: {
          age: string | null
          appearance: string | null
          art_style: string
          body_shape: string | null
          created_at: string
          expression: string | null
          face_shape: string | null
          hair_style: string | null
          id: string
          kind: string
          name: string
          outfit: string | null
          palette: string | null
          personality: string | null
          portrait_url: string | null
          reference_url: string | null
          silhouette: string | null
          updated_at: string
          user_id: string
          voice_profile_id: string | null
        }
        Insert: {
          age?: string | null
          appearance?: string | null
          art_style?: string
          body_shape?: string | null
          created_at?: string
          expression?: string | null
          face_shape?: string | null
          hair_style?: string | null
          id?: string
          kind?: string
          name: string
          outfit?: string | null
          palette?: string | null
          personality?: string | null
          portrait_url?: string | null
          reference_url?: string | null
          silhouette?: string | null
          updated_at?: string
          user_id?: string
          voice_profile_id?: string | null
        }
        Update: {
          age?: string | null
          appearance?: string | null
          art_style?: string
          body_shape?: string | null
          created_at?: string
          expression?: string | null
          face_shape?: string | null
          hair_style?: string | null
          id?: string
          kind?: string
          name?: string
          outfit?: string | null
          palette?: string | null
          personality?: string | null
          portrait_url?: string | null
          reference_url?: string | null
          silhouette?: string | null
          updated_at?: string
          user_id?: string
          voice_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "characters_voice_profile_id_fkey"
            columns: ["voice_profile_id"]
            isOneToOne: false
            referencedRelation: "voice_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          age_range: string
          art_style: string
          character_ids: string[]
          cover_url: string | null
          created_at: string
          id: string
          idea: string | null
          status: string
          theme: string | null
          title: string
          tone: string | null
          updated_at: string
          user_id: string
          voice: string
          voice_profile_id: string | null
        }
        Insert: {
          age_range?: string
          art_style?: string
          character_ids?: string[]
          cover_url?: string | null
          created_at?: string
          id?: string
          idea?: string | null
          status?: string
          theme?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
          voice?: string
          voice_profile_id?: string | null
        }
        Update: {
          age_range?: string
          art_style?: string
          character_ids?: string[]
          cover_url?: string | null
          created_at?: string
          id?: string
          idea?: string | null
          status?: string
          theme?: string | null
          title?: string
          tone?: string | null
          updated_at?: string
          user_id?: string
          voice?: string
          voice_profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_voice_profile_id_fkey"
            columns: ["voice_profile_id"]
            isOneToOne: false
            referencedRelation: "voice_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_pages: {
        Row: {
          audio_url: string | null
          camera_motion: string
          created_at: string
          duration_seconds: number
          id: string
          image_prompt: string | null
          image_url: string | null
          motion_status: string
          motion_url: string | null
          page_number: number
          shot_type: string
          story_id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          camera_motion?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          motion_status?: string
          motion_url?: string | null
          page_number: number
          shot_type?: string
          story_id: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          audio_url?: string | null
          camera_motion?: string
          created_at?: string
          duration_seconds?: number
          id?: string
          image_prompt?: string | null
          image_url?: string | null
          motion_status?: string
          motion_url?: string | null
          page_number?: number
          shot_type?: string
          story_id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_pages_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_profiles: {
        Row: {
          consent_confirmed: boolean
          consent_text: string | null
          created_at: string
          id: string
          name: string
          provider: string
          provider_voice_id: string
          sample_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_confirmed?: boolean
          consent_text?: string | null
          created_at?: string
          id?: string
          name: string
          provider?: string
          provider_voice_id: string
          sample_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Update: {
          consent_confirmed?: boolean
          consent_text?: string | null
          created_at?: string
          id?: string
          name?: string
          provider?: string
          provider_voice_id?: string
          sample_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
