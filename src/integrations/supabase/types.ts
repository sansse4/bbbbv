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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          appointment_type: string | null
          assigned_sales_employee: string | null
          created_at: string
          created_by: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          reminder_minutes: number
          reminder_sent: boolean | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          appointment_type?: string | null
          assigned_sales_employee?: string | null
          created_at?: string
          created_by: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          reminder_minutes?: number
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          appointment_type?: string | null
          assigned_sales_employee?: string | null
          created_at?: string
          created_by?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          reminder_minutes?: number
          reminder_sent?: boolean | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_assigned_sales_employee_fkey"
            columns: ["assigned_sales_employee"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_manager_departments: {
        Row: {
          created_at: string | null
          department: Database["public"]["Enums"]["department_type"]
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department: Database["public"]["Enums"]["department_type"]
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"]
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      call_center_interactions: {
        Row: {
          appointment_date: string | null
          appointment_time: string | null
          created_at: string
          created_by: string
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date?: string | null
          appointment_time?: string | null
          created_at?: string
          created_by: string
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          status: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string | null
          appointment_time?: string | null
          created_at?: string
          created_by?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string
          created_at: string
          created_by: string
          customer_address: string | null
          customer_name: string
          customer_phone: string
          family_members: number | null
          house_category: string | null
          house_number: string | null
          id: string
          profession: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          created_at?: string
          created_by: string
          customer_address?: string | null
          customer_name: string
          customer_phone: string
          family_members?: number | null
          house_category?: string | null
          house_number?: string | null
          id?: string
          profession?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          created_at?: string
          created_by?: string
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string
          family_members?: number | null
          house_category?: string | null
          house_number?: string | null
          id?: string
          profession?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          reference_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          reference_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          department: Database["public"]["Enums"]["department_type"] | null
          full_name: string
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          full_name: string
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          created_at?: string | null
          department?: Database["public"]["Enums"]["department_type"] | null
          full_name?: string
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      sales: {
        Row: {
          block_number: string
          created_at: string | null
          created_by: string
          customer_name: string
          customer_phone: string | null
          employee_id: string
          house_number: string
          id: string
          notes: string | null
          paid_amount: number
          payment_method: string
          remaining_amount: number
          sale_date: string
          status: string
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          block_number: string
          created_at?: string | null
          created_by: string
          customer_name: string
          customer_phone?: string | null
          employee_id: string
          house_number: string
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_method: string
          remaining_amount?: number
          sale_date?: string
          status: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          block_number?: string
          created_at?: string | null
          created_by?: string
          customer_name?: string
          customer_phone?: string | null
          employee_id?: string
          house_number?: string
          id?: string
          notes?: string | null
          paid_amount?: number
          payment_method?: string
          remaining_amount?: number
          sale_date?: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      units: {
        Row: {
          accountant_name: string | null
          area_m2: number
          block_number: number
          buyer_name: string | null
          buyer_phone: string | null
          created_at: string
          id: string
          is_residential: boolean
          notes: string | null
          price: number
          reservation_expires_at: string | null
          sales_employee: string | null
          status: Database["public"]["Enums"]["unit_status"]
          unit_number: number
          updated_at: string
        }
        Insert: {
          accountant_name?: string | null
          area_m2: number
          block_number: number
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          id?: string
          is_residential?: boolean
          notes?: string | null
          price?: number
          reservation_expires_at?: string | null
          sales_employee?: string | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number: number
          updated_at?: string
        }
        Update: {
          accountant_name?: string | null
          area_m2?: number
          block_number?: number
          buyer_name?: string | null
          buyer_phone?: string | null
          created_at?: string
          id?: string
          is_residential?: boolean
          notes?: string | null
          price?: number
          reservation_expires_at?: string | null
          sales_employee?: string | null
          status?: Database["public"]["Enums"]["unit_status"]
          unit_number?: number
          updated_at?: string
        }
        Relationships: []
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
      create_demo_user: {
        Args: {
          p_department?: Database["public"]["Enums"]["department_type"]
          p_email: string
          p_full_name: string
          p_password: string
          p_role: Database["public"]["Enums"]["app_role"]
          p_username: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      supervises_department: {
        Args: {
          _department: Database["public"]["Enums"]["department_type"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "employee" | "assistant_manager"
      department_type:
        | "Media"
        | "Sales"
        | "Call Center"
        | "Contract Registration"
        | "Growth Analytics"
        | "Reception"
      unit_status: "available" | "reserved" | "sold"
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
      app_role: ["admin", "employee", "assistant_manager"],
      department_type: [
        "Media",
        "Sales",
        "Call Center",
        "Contract Registration",
        "Growth Analytics",
        "Reception",
      ],
      unit_status: ["available", "reserved", "sold"],
    },
  },
} as const
