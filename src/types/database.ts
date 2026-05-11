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
          hobbies: string[];
          life_context: string[];
          social_goals: string[];
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
          hobbies?: string[];
          life_context?: string[];
          social_goals?: string[];
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
          hobbies?: string[];
          life_context?: string[];
          social_goals?: string[];
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
          reporter_id: string | null;
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
          reporter_id?: string | null;
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
      push_tokens: {
        Row: {
          id: string;
          user_id: string;
          expo_push_token: string;
          device_platform: "ios" | "android" | "web" | "unknown";
          device_name: string | null;
          active: boolean;
          last_seen_at: string;
          disabled_at: string | null;
          disabled_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expo_push_token: string;
          device_platform: "ios" | "android" | "web" | "unknown";
          device_name?: string | null;
          active?: boolean;
          last_seen_at?: string;
          disabled_at?: string | null;
          disabled_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          expo_push_token?: string;
          device_platform?: "ios" | "android" | "web" | "unknown";
          device_name?: string | null;
          active?: boolean;
          last_seen_at?: string;
          disabled_at?: string | null;
          disabled_reason?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "push_tokens_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          master_enabled: boolean;
          chat_messages: boolean;
          event_reminders: boolean;
          host_updates: boolean;
          joins: boolean;
          safety_updates: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          master_enabled?: boolean;
          chat_messages?: boolean;
          event_reminders?: boolean;
          host_updates?: boolean;
          joins?: boolean;
          safety_updates?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          master_enabled?: boolean;
          chat_messages?: boolean;
          event_reminders?: boolean;
          host_updates?: boolean;
          joins?: boolean;
          safety_updates?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "notification_preferences_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_deliveries: {
        Row: {
          id: string;
          delivery_key: string;
          notification_type:
            | "event_chat"
            | "event_joined"
            | "event_update"
            | "event_cancelled"
            | "event_reminder"
            | "report_update";
          recipient_id: string;
          push_token_id: string | null;
          expo_push_token: string | null;
          event_id: string | null;
          message_id: string | null;
          report_id: string | null;
          reminder_offset_minutes: number | null;
          title: string;
          body: string;
          data: Json;
          status: "queued" | "sent" | "error" | "skipped";
          expo_ticket_id: string | null;
          expo_error: string | null;
          sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          delivery_key: string;
          notification_type:
            | "event_chat"
            | "event_joined"
            | "event_update"
            | "event_cancelled"
            | "event_reminder"
            | "report_update";
          recipient_id: string;
          push_token_id?: string | null;
          expo_push_token?: string | null;
          event_id?: string | null;
          message_id?: string | null;
          report_id?: string | null;
          reminder_offset_minutes?: number | null;
          title: string;
          body: string;
          data?: Json;
          status?: "queued" | "sent" | "error" | "skipped";
          expo_ticket_id?: string | null;
          expo_error?: string | null;
          sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: "queued" | "sent" | "error" | "skipped";
          expo_ticket_id?: string | null;
          expo_error?: string | null;
          sent_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "notification_deliveries_recipient_id_fkey";
            columns: ["recipient_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_deliveries_push_token_id_fkey";
            columns: ["push_token_id"];
            referencedRelation: "push_tokens";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_deliveries_event_id_fkey";
            columns: ["event_id"];
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_deliveries_message_id_fkey";
            columns: ["message_id"];
            referencedRelation: "event_messages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notification_deliveries_report_id_fkey";
            columns: ["report_id"];
            referencedRelation: "reports";
            referencedColumns: ["id"];
          }
        ];
      };
      subscription_status: {
        Row: {
          user_id: string;
          revenuecat_app_user_id: string;
          entitlement_id: string;
          is_active: boolean;
          product_id: string | null;
          store: string | null;
          environment: string | null;
          expiration_at: string | null;
          latest_event_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          revenuecat_app_user_id: string;
          entitlement_id?: string;
          is_active?: boolean;
          product_id?: string | null;
          store?: string | null;
          environment?: string | null;
          expiration_at?: string | null;
          latest_event_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          revenuecat_app_user_id?: string;
          entitlement_id?: string;
          is_active?: boolean;
          product_id?: string | null;
          store?: string | null;
          environment?: string | null;
          expiration_at?: string | null;
          latest_event_type?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscription_status_user_id_fkey";
            columns: ["user_id"];
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
      ensure_notification_preferences: {
        Args: { target_user_id: string };
        Returns: undefined;
      };
      get_event_participant_counts: {
        Args: { target_event_ids: string[] };
        Returns: {
          event_id: string;
          participant_count: number;
        }[];
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
