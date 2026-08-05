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
      affiliate_clicks: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          ip_hash: string | null
          visitor_id: string | null
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          visitor_id?: string | null
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          ip_hash?: string | null
          visitor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string | null
          audience_size: string | null
          audience_type: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_branch_code: string | null
          bank_country: string | null
          bank_name: string | null
          country: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          paid_earnings: number
          payment_method: string | null
          paypal_email: string | null
          pending_balance: number
          promotion_method: string | null
          status: string
          tiktok_url: string | null
          total_earnings: number
          updated_at: string
          user_id: string | null
          website: string | null
          youtube_url: string | null
        }
        Insert: {
          affiliate_code?: string | null
          audience_size?: string | null
          audience_type?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_country?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          paid_earnings?: number
          payment_method?: string | null
          paypal_email?: string | null
          pending_balance?: number
          promotion_method?: string | null
          status?: string
          tiktok_url?: string | null
          total_earnings?: number
          updated_at?: string
          user_id?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Update: {
          affiliate_code?: string | null
          audience_size?: string | null
          audience_type?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_branch_code?: string | null
          bank_country?: string | null
          bank_name?: string | null
          country?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          paid_earnings?: number
          payment_method?: string | null
          paypal_email?: string | null
          pending_balance?: number
          promotion_method?: string | null
          status?: string
          tiktok_url?: string | null
          total_earnings?: number
          updated_at?: string
          user_id?: string | null
          website?: string | null
          youtube_url?: string | null
        }
        Relationships: []
      }
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
      commissions: {
        Row: {
          affiliate_id: string
          amount: number
          billing_cycle: string | null
          created_at: string
          id: string
          plan: string | null
          referral_id: string
          status: string
        }
        Insert: {
          affiliate_id: string
          amount?: number
          billing_cycle?: string | null
          created_at?: string
          id?: string
          plan?: string | null
          referral_id: string
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          billing_cycle?: string | null
          created_at?: string
          id?: string
          plan?: string | null
          referral_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_notes: {
        Row: {
          amount: number
          client_name: string
          created_at: string
          credit_number: string | null
          date: string
          id: string
          reason: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_name?: string
          created_at?: string
          credit_number?: string | null
          date?: string
          id?: string
          reason?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string
          credit_number?: string | null
          date?: string
          id?: string
          reason?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          category: string
          created_at: string
          date: string
          description: string | null
          expense_number: string | null
          id: string
          notes: string | null
          payment_method: string | null
          purchase_order_id: string | null
          reference: string | null
          subtotal: number
          supplier_name: string
          tax_amount: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          expense_number?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          purchase_order_id?: string | null
          reference?: string | null
          subtotal?: number
          supplier_name?: string
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          expense_number?: string | null
          id?: string
          notes?: string | null
          payment_method?: string | null
          purchase_order_id?: string | null
          reference?: string | null
          subtotal?: number
          supplier_name?: string
          tax_amount?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
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
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          client_name: string
          created_at: string
          date: string
          id: string
          invoice_id: string | null
          invoice_number: string | null
          method: string | null
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          client_name?: string
          created_at?: string
          date?: string
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          method?: string | null
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          client_name?: string
          created_at?: string
          date?: string
          id?: string
          invoice_id?: string | null
          invoice_number?: string | null
          method?: string | null
          notes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          paid_date: string | null
          status: string
        }
        Insert: {
          affiliate_id: string
          amount?: number
          created_at?: string
          id?: string
          paid_date?: string | null
          status?: string
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          paid_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
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
          billing_country: string | null
          brand_color: string | null
          company_address: string | null
          company_email: string | null
          company_name: string | null
          company_phone: string | null
          company_website: string | null
          created_at: string | null
          free_generations_used: number
          free_invoices_used: number
          free_letterheads_used: number
          free_quotes_used: number
          id: string
          logo_url: string | null
          payfast_subscription_id: string | null
          payfast_token: string | null
          payment_status: string | null
          referred_by_affiliate_id: string | null
          registration_number: string | null
          storage_used: number
          subscription_plan: string | null
          template_style: string | null
          trial_active: boolean
          trial_end_date: string | null
          trial_ends_at: string | null
          trial_start_date: string | null
          trial_used: boolean
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
          billing_country?: string | null
          brand_color?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          free_generations_used?: number
          free_invoices_used?: number
          free_letterheads_used?: number
          free_quotes_used?: number
          id?: string
          logo_url?: string | null
          payfast_subscription_id?: string | null
          payfast_token?: string | null
          payment_status?: string | null
          referred_by_affiliate_id?: string | null
          registration_number?: string | null
          storage_used?: number
          subscription_plan?: string | null
          template_style?: string | null
          trial_active?: boolean
          trial_end_date?: string | null
          trial_ends_at?: string | null
          trial_start_date?: string | null
          trial_used?: boolean
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
          billing_country?: string | null
          brand_color?: string | null
          company_address?: string | null
          company_email?: string | null
          company_name?: string | null
          company_phone?: string | null
          company_website?: string | null
          created_at?: string | null
          free_generations_used?: number
          free_invoices_used?: number
          free_letterheads_used?: number
          free_quotes_used?: number
          id?: string
          logo_url?: string | null
          payfast_subscription_id?: string | null
          payfast_token?: string | null
          payment_status?: string | null
          referred_by_affiliate_id?: string | null
          registration_number?: string | null
          storage_used?: number
          subscription_plan?: string | null
          template_style?: string | null
          trial_active?: boolean
          trial_end_date?: string | null
          trial_ends_at?: string | null
          trial_start_date?: string | null
          trial_used?: boolean
          updated_at?: string | null
          user_id?: string
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_affiliate_id_fkey"
            columns: ["referred_by_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_webhook_events: {
        Row: {
          created_at: string
          event_id: string
          event_type: string | null
          id: string
          provider: string
        }
        Insert: {
          created_at?: string
          event_id: string
          event_type?: string | null
          id?: string
          provider: string
        }
        Update: {
          created_at?: string
          event_id?: string
          event_type?: string | null
          id?: string
          provider?: string
        }
        Relationships: []
      }
      purchase_orders: {
        Row: {
          created_at: string
          currency: string
          discount_amount: number
          expected_delivery_date: string | null
          id: string
          internal_notes: string | null
          issue_date: string
          items: Json
          notes: string | null
          payment_terms: string | null
          po_number: string
          status: string
          subtotal: number
          supplier_address: string | null
          supplier_contact: string | null
          supplier_email: string | null
          supplier_name: string
          supplier_phone: string | null
          supplier_vat_number: string | null
          tax_amount: number
          tax_rate: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          discount_amount?: number
          expected_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          issue_date?: string
          items?: Json
          notes?: string | null
          payment_terms?: string | null
          po_number: string
          status?: string
          subtotal?: number
          supplier_address?: string | null
          supplier_contact?: string | null
          supplier_email?: string | null
          supplier_name?: string
          supplier_phone?: string | null
          supplier_vat_number?: string | null
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          discount_amount?: number
          expected_delivery_date?: string | null
          id?: string
          internal_notes?: string | null
          issue_date?: string
          items?: Json
          notes?: string | null
          payment_terms?: string | null
          po_number?: string
          status?: string
          subtotal?: number
          supplier_address?: string | null
          supplier_contact?: string | null
          supplier_email?: string | null
          supplier_name?: string
          supplier_phone?: string | null
          supplier_vat_number?: string | null
          tax_amount?: number
          tax_rate?: number
          total?: number
          updated_at?: string
          user_id?: string
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
      referrals: {
        Row: {
          affiliate_id: string
          commission_expiry_date: string | null
          commissions_paid: number | null
          created_at: string
          id: string
          is_active: boolean
          referred_user_id: string
          subscription_plan: string | null
          subscription_start_date: string | null
        }
        Insert: {
          affiliate_id: string
          commission_expiry_date?: string | null
          commissions_paid?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          referred_user_id: string
          subscription_plan?: string | null
          subscription_start_date?: string | null
        }
        Update: {
          affiliate_id?: string
          commission_expiry_date?: string | null
          commissions_paid?: number | null
          created_at?: string
          id?: string
          is_active?: boolean
          referred_user_id?: string
          subscription_plan?: string | null
          subscription_start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_start_date: string | null
          cancellation_status: string
          cancelled_at: string | null
          country: string | null
          created_at: string
          currency: string
          id: string
          provider: string
          provider_plan_id: string | null
          provider_reference: string | null
          provider_subscription_id: string | null
          recurring_price: number
          renewal_date: string | null
          selected_plan: string
          subscription_status: string
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_start_date?: string | null
          cancellation_status?: string
          cancelled_at?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          provider: string
          provider_plan_id?: string | null
          provider_reference?: string | null
          provider_subscription_id?: string | null
          recurring_price?: number
          renewal_date?: string | null
          selected_plan: string
          subscription_status?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_start_date?: string | null
          cancellation_status?: string
          cancelled_at?: string | null
          country?: string | null
          created_at?: string
          currency?: string
          id?: string
          provider?: string
          provider_plan_id?: string | null
          provider_reference?: string | null
          provider_subscription_id?: string | null
          recurring_price?: number
          renewal_date?: string | null
          selected_plan?: string
          subscription_status?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
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
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_service_role: { Args: never; Returns: boolean }
      link_referral: { Args: { _affiliate_code: string }; Returns: Json }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    },
  },
} as const
