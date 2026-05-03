import type { EventCategory, EventStatus, PriceType } from "./domain";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          username: string;
          avatar_url: string | null;
          bio: string | null;
          city: string;
          age_range: string | null;
          interests: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string;
          age_range?: string | null;
          interests?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          full_name?: string;
          username?: string;
          avatar_url?: string | null;
          bio?: string | null;
          city?: string;
          age_range?: string | null;
          interests?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          category: EventCategory;
          vibe: string;
          location_name: string;
          latitude: number;
          longitude: number;
          city: string;
          start_time: string;
          end_time: string | null;
          max_participants: number;
          price_type: PriceType;
          price_amount: number | null;
          host_id: string;
          status: EventStatus;
          safety_note: string | null;
          moderation_flags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          category: EventCategory;
          vibe: string;
          location_name: string;
          latitude: number;
          longitude: number;
          city?: string;
          start_time: string;
          end_time?: string | null;
          max_participants: number;
          price_type?: PriceType;
          price_amount?: number | null;
          host_id: string;
          status?: EventStatus;
          safety_note?: string | null;
          moderation_flags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "events_host_id_fkey";
            columns: ["host_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      event_participants: {
        Row: {
          event_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_participants_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      event_favorites: {
        Row: {
          event_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          event_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "event_favorites_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_favorites_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      event_messages: {
        Row: {
          id: string;
          event_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          sender_id: string;
          body: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "event_messages_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_messages_sender_id_fkey";
            columns: ["sender_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_event_id: string | null;
          reported_user_id: string | null;
          report_type: string;
          reason: string;
          details: string | null;
          status: "open" | "reviewed" | "dismissed";
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_event_id?: string | null;
          reported_user_id?: string | null;
          report_type: string;
          reason: string;
          details?: string | null;
          status?: "open" | "reviewed" | "dismissed";
          created_at?: string;
        };
        Update: {
          status?: "open" | "reviewed" | "dismissed";
        };
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reported_event_id_fkey";
            columns: ["reported_event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reports_reported_user_id_fkey";
            columns: ["reported_user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      can_join_event: {
        Args: { target_event_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      event_category: EventCategory;
      event_status: EventStatus;
      price_type: PriceType;
    };
    CompositeTypes: Record<string, never>;
  };
};
