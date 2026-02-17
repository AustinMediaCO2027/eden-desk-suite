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
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          progress_percentage: number | null
          target_date: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          progress_percentage?: number | null
          target_date?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          progress_percentage?: number | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          created_at: string | null
          date: string | null
          due_date: string | null
          id: string
          invoice_number: string
          items: Json | null
          notes: string | null
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          date?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json | null
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          date?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          items?: Json | null
          notes?: string | null
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      letterheads: {
        Row: {
          body: string | null
          closing: string | null
          created_at: string | null
          date: string | null
          id: string
          recipient_address: string | null
          recipient_company: string | null
          recipient_email: string | null
          recipient_name: string | null
          recipient_phone: string | null
          recipient_title: string | null
          sender_name: string | null
          sender_title: string | null
          signature_url: string | null
          subject: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          closing?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          recipient_address?: string | null
          recipient_company?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_title?: string | null
          sender_name?: string | null
          sender_title?: string | null
          signature_url?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          closing?: string | null
          created_at?: string | null
          date?: string | null
          id?: string
          recipient_address?: string | null
          recipient_company?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          recipient_title?: string | null
          sender_name?: string | null
          sender_title?: string | null
          signature_url?: string | null
          subject?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          client_name: string | null
          created_at: string | null
          date: string
          duration: number | null
          id: string
          location_type: string | null
          meeting_link: string | null
          notes: string | null
          reminder_enabled: boolean | null
          reminder_sent: boolean | null
          reminder_time: string | null
          time: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string | null
          date?: string
          duration?: number | null
          id?: string
          location_type?: string | null
          meeting_link?: string | null
          notes?: string | null
          reminder_enabled?: boolean | null
          reminder_sent?: boolean | null
          reminder_time?: string | null
          time?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_name?: string | null
          created_at?: string | null
          date?: string
          duration?: number | null
          id?: string
          location_type?: string | null
          meeting_link?: string | null
          notes?: string | null
          reminder_enabled?: boolean | null
          reminder_sent?: boolean | null
          reminder_time?: string | null
          time?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          add_on_storage: number
          ai_prompts_reset_date: string | null
          ai_prompts_used_today: number | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_account_type: string | null
          bank_branch_code: string | null
          bank_name: string | null
          brand_color: string | null
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string | null
          free_generations_used: number
          id: string
          logo_url: string | null
          registration_number: string | null
          storage_used: number
          subscription_plan: string | null
          template_style: string | null
          trial_ends_at: string | null
          updated_at: string | null
          user_id: string
          vat_number: string | null
        }
        Insert: {
          add_on_storage?: number
          ai_prompts_reset_date?: string | null
          ai_prompts_used_today?: number | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch_code?: string | null
          bank_name?: string | null
          brand_color?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          free_generations_used?: number
          id?: string
          logo_url?: string | null
          registration_number?: string | null
          storage_used?: number
          subscription_plan?: string | null
          template_style?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id: string
          vat_number?: string | null
        }
        Update: {
          add_on_storage?: number
          ai_prompts_reset_date?: string | null
          ai_prompts_used_today?: number | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_account_type?: string | null
          bank_branch_code?: string | null
          bank_name?: string | null
          brand_color?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          free_generations_used?: number
          id?: string
          logo_url?: string | null
          registration_number?: string | null
          storage_used?: number
          subscription_plan?: string | null
          template_style?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          client_address: string | null
          client_email: string | null
          client_name: string
          created_at: string | null
          date: string | null
          id: string
          items: Json | null
          notes: string | null
          quote_number: string
          status: string | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          date?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_address?: string | null
          client_email?: string | null
          client_name?: string
          created_at?: string | null
          date?: string | null
          id?: string
          items?: Json | null
          notes?: string | null
          quote_number?: string
          status?: string | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          due_date: string | null
          due_time: string | null
          goal_id: string | null
          id: string
          priority: string | null
          recurring: string | null
          reminder_enabled: boolean | null
          reminder_sent: boolean | null
          reminder_time: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          goal_id?: string | null
          id?: string
          priority?: string | null
          recurring?: string | null
          reminder_enabled?: boolean | null
          reminder_sent?: boolean | null
          reminder_time?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          due_date?: string | null
          due_time?: string | null
          goal_id?: string | null
          id?: string
          priority?: string | null
          recurring?: string | null
          reminder_enabled?: boolean | null
          reminder_sent?: boolean | null
          reminder_time?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_files: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          folder_id: string | null
          id: string
          share_expiry: string | null
          share_token: string | null
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          share_expiry?: string | null
          share_token?: string | null
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          share_expiry?: string | null
          share_token?: string | null
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
