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
      academic_resources: {
        Row: {
          created_at: string | null
          created_by: string | null
          download_count: number | null
          file_size: string | null
          file_url: string | null
          id: string
          name: string
          owner: string | null
          parent_id: string | null
          resource_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          name: string
          owner?: string | null
          parent_id?: string | null
          resource_type?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          download_count?: number | null
          file_size?: string | null
          file_url?: string | null
          id?: string
          name?: string
          owner?: string | null
          parent_id?: string | null
          resource_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academic_resources_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "academic_resources"
            referencedColumns: ["id"]
          },
        ]
      }
      administrations: {
        Row: {
          alias: string | null
          created_at: string | null
          id: string
          motto: string | null
          notable_events: string | null
          president: string
          session: string
          status: string | null
          team: Json | null
        }
        Insert: {
          alias?: string | null
          created_at?: string | null
          id?: string
          motto?: string | null
          notable_events?: string | null
          president: string
          session: string
          status?: string | null
          team?: Json | null
        }
        Update: {
          alias?: string | null
          created_at?: string | null
          id?: string
          motto?: string | null
          notable_events?: string | null
          president?: string
          session?: string
          status?: string | null
          team?: Json | null
        }
        Relationships: []
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          title?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clubs: {
        Row: {
          acronym: string | null
          activities: string[] | null
          category: string
          color: string | null
          created_at: string | null
          description: string | null
          email: string | null
          founded: string | null
          header_image_url: string | null
          icon_name: string | null
          id: string
          image_url: string | null
          meeting_location: string | null
          meeting_schedule: string | null
          motto: string | null
          name: string
          president: string | null
          social_links: Json | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          acronym?: string | null
          activities?: string[] | null
          category: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded?: string | null
          header_image_url?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          meeting_location?: string | null
          meeting_schedule?: string | null
          motto?: string | null
          name: string
          president?: string | null
          social_links?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          acronym?: string | null
          activities?: string[] | null
          category?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          founded?: string | null
          header_image_url?: string | null
          icon_name?: string | null
          id?: string
          image_url?: string | null
          meeting_location?: string | null
          meeting_schedule?: string | null
          motto?: string | null
          name?: string
          president?: string | null
          social_links?: Json | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      committees: {
        Row: {
          chairperson: string | null
          created_at: string
          description: string | null
          icon_name: string | null
          id: string
          is_active: boolean | null
          mandate: string[] | null
          meeting_schedule: string | null
          members: string[] | null
          secretary: string | null
          slug: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          chairperson?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          mandate?: string[] | null
          meeting_schedule?: string | null
          members?: string[] | null
          secretary?: string | null
          slug: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          chairperson?: string | null
          created_at?: string
          description?: string | null
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          mandate?: string[] | null
          meeting_schedule?: string | null
          members?: string[] | null
          secretary?: string | null
          slug?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          responded_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          responded_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          responded_at?: string | null
        }
        Relationships: []
      }
      cv_templates: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          file_url: string | null
          format: string
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          format: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          file_url?: string | null
          format?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string | null
          description: string | null
          doc_type: string
          file_size: string | null
          file_url: string | null
          id: string
          is_public: boolean | null
          share_token: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          doc_type: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          share_token?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          doc_type?: string
          file_size?: string | null
          file_url?: string | null
          id?: string
          is_public?: boolean | null
          share_token?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          year?: number
        }
        Relationships: []
      }
      event_rsvps: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          location: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type: string
          id?: string
          location?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          location?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gpa_records: {
        Row: {
          academic_year: string
          courses: Json
          created_at: string | null
          gpa: number | null
          id: string
          semester: string
          total_units: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          academic_year: string
          courses?: Json
          created_at?: string | null
          gpa?: number | null
          id?: string
          semester: string
          total_units?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          academic_year?: string
          courses?: Json
          created_at?: string | null
          gpa?: number | null
          id?: string
          semester?: string
          total_units?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      halls: {
        Row: {
          alias: string | null
          capacity: number | null
          color: string | null
          created_at: string | null
          description: string | null
          established_year: number | null
          gallery_images: string[] | null
          hall_type: string | null
          history: string | null
          id: string
          image_url: string | null
          leaders: Json | null
          lore: string | null
          motto: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          alias?: string | null
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          gallery_images?: string[] | null
          hall_type?: string | null
          history?: string | null
          id?: string
          image_url?: string | null
          leaders?: Json | null
          lore?: string | null
          motto?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          alias?: string | null
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          description?: string | null
          established_year?: number | null
          gallery_images?: string[] | null
          hall_type?: string | null
          history?: string | null
          id?: string
          image_url?: string | null
          leaders?: Json | null
          lore?: string | null
          motto?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ink_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          piece_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          piece_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          piece_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ink_comments_piece_id_fkey"
            columns: ["piece_id"]
            isOneToOne: false
            referencedRelation: "ink_pieces"
            referencedColumns: ["id"]
          },
        ]
      }
      ink_likes: {
        Row: {
          created_at: string | null
          id: string
          piece_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          piece_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          piece_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ink_likes_piece_id_fkey"
            columns: ["piece_id"]
            isOneToOne: false
            referencedRelation: "ink_pieces"
            referencedColumns: ["id"]
          },
        ]
      }
      ink_pieces: {
        Row: {
          author_name: string
          author_role: string | null
          content: Json
          cover_image: string | null
          created_at: string | null
          id: string
          is_published: boolean | null
          summary: string | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
          view_count: number | null
        }
        Insert: {
          author_name: string
          author_role?: string | null
          content?: Json
          cover_image?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          summary?: string | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Update: {
          author_name?: string
          author_role?: string | null
          content?: Json
          cover_image?: string | null
          created_at?: string | null
          id?: string
          is_published?: boolean | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
          view_count?: number | null
        }
        Relationships: []
      }
      job_listings: {
        Row: {
          application_url: string | null
          company: string
          created_at: string | null
          deadline: string | null
          description: string | null
          id: string
          industry: string
          is_active: boolean | null
          is_approved: boolean | null
          job_type: string
          location: string
          requirements: string[] | null
          salary: string | null
          submitted_by: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          application_url?: string | null
          company: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          industry: string
          is_active?: boolean | null
          is_approved?: boolean | null
          job_type: string
          location: string
          requirements?: string[] | null
          salary?: string | null
          submitted_by?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          application_url?: string | null
          company?: string
          created_at?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          industry?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          job_type?: string
          location?: string
          requirements?: string[] | null
          salary?: string | null
          submitted_by?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      leaders: {
        Row: {
          bio: string | null
          category: string
          constituency: string | null
          created_at: string | null
          email: string | null
          id: string
          image: string | null
          is_active: boolean | null
          level: string | null
          name: string
          role: string
          socials: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          category: string
          constituency?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          level?: string | null
          name: string
          role: string
          socials?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          category?: string
          constituency?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          level?: string | null
          name?: string
          role?: string
          socials?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          source: string | null
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          source?: string | null
          subscribed_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          clubs: string[] | null
          created_at: string | null
          department: string | null
          email: string | null
          email_notifications: Json | null
          faculty: string | null
          full_name: string | null
          hall_of_residence: string | null
          id: string
          level: string | null
          socials: Json | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          clubs?: string[] | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          email_notifications?: Json | null
          faculty?: string | null
          full_name?: string | null
          hall_of_residence?: string | null
          id: string
          level?: string | null
          socials?: Json | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          clubs?: string[] | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          email_notifications?: Json | null
          faculty?: string | null
          full_name?: string | null
          hall_of_residence?: string | null
          id?: string
          level?: string | null
          socials?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          category: string
          course_code: string | null
          created_at: string | null
          department: string | null
          description: string | null
          download_count: number | null
          external_url: string | null
          faculty: string | null
          file_url: string | null
          id: string
          is_folder: boolean | null
          is_public: boolean | null
          level: string | null
          parent_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploaded_by: string | null
          view_count: number | null
        }
        Insert: {
          category: string
          course_code?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          download_count?: number | null
          external_url?: string | null
          faculty?: string | null
          file_url?: string | null
          id?: string
          is_folder?: boolean | null
          is_public?: boolean | null
          level?: string | null
          parent_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploaded_by?: string | null
          view_count?: number | null
        }
        Update: {
          category?: string
          course_code?: string | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          download_count?: number | null
          external_url?: string | null
          faculty?: string | null
          file_url?: string | null
          id?: string
          is_folder?: boolean | null
          is_public?: boolean | null
          level?: string | null
          parent_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploaded_by?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "resources_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      scholarships: {
        Row: {
          amount: string
          application_url: string | null
          category: string
          created_at: string | null
          created_by: string | null
          deadline: string
          description: string | null
          eligibility: string[] | null
          id: string
          is_active: boolean | null
          provider: string
          title: string
          updated_at: string | null
        }
        Insert: {
          amount: string
          application_url?: string | null
          category: string
          created_at?: string | null
          created_by?: string | null
          deadline: string
          description?: string | null
          eligibility?: string[] | null
          id?: string
          is_active?: boolean | null
          provider: string
          title: string
          updated_at?: string | null
        }
        Update: {
          amount?: string
          application_url?: string | null
          category?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string
          description?: string | null
          eligibility?: string[] | null
          id?: string
          is_active?: boolean | null
          provider?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      get_user_role: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_moderator_or_admin: { Args: { _user_id: string }; Returns: boolean }
      sync_profile_emails: { Args: never; Returns: undefined }
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
