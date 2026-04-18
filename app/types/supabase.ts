export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          username: string;
          top_languages: Json | null;
          starred_categories: Json | null;
          contributed_repos: Json | null;
          last_synced_at: string | null;
          is_public: boolean;
          public_fields: Json | null;
        };
        Insert: {
          id: string;
          username: string;
          top_languages?: Json | null;
          starred_categories?: Json | null;
          contributed_repos?: Json | null;
          last_synced_at?: string | null;
          is_public?: boolean;
          public_fields?: Json | null;
        };
        Update: {
          id?: string;
          username?: string;
          top_languages?: Json | null;
          starred_categories?: Json | null;
          contributed_repos?: Json | null;
          last_synced_at?: string | null;
          is_public?: boolean;
          public_fields?: Json | null;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          repositories: Json;
          custom_labels: Json;
          picked_issues: Json;
          notification_frequency: string;
          hide_closed_issues: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          repositories?: Json;
          custom_labels?: Json;
          picked_issues?: Json;
          notification_frequency?: string;
          hide_closed_issues?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          repositories?: Json;
          custom_labels?: Json;
          picked_issues?: Json;
          notification_frequency?: string;
          hide_closed_issues?: boolean;
          updated_at?: string;
        };
      };
      user_activity_events: {
        Row: {
          id: string;
          user_id: string;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          event_type: string;
          payload?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          event_type?: string;
          payload?: Json;
          created_at?: string;
        };
      };
      picked_issues: {
        Row: {
          id: string;
          user_id: string;
          issue_id: string;
          issue_number: number;
          issue_url: string;
          repository_owner: string;
          repository_name: string;
          title: string;
          state: string;
          labels: Json;
          assignee: string | null;
          user_tags: Json;
          picked_at: string;
          last_known_state: string;
          last_checked_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          issue_id: string;
          issue_number: number;
          issue_url: string;
          repository_owner: string;
          repository_name: string;
          title: string;
          state?: string;
          labels?: Json;
          assignee?: string | null;
          user_tags?: Json;
          picked_at?: string;
          last_known_state?: string;
          last_checked_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          issue_id?: string;
          issue_number?: number;
          issue_url?: string;
          repository_owner?: string;
          repository_name?: string;
          title?: string;
          state?: string;
          labels?: Json;
          assignee?: string | null;
          user_tags?: Json;
          picked_at?: string;
          last_known_state?: string;
          last_checked_at?: string;
        };
      };
    };
    Views: {
      picked_issues_counts: {
        Row: {
          issue_url: string;
          repository_owner: string;
          repository_name: string;
          title: string;
          pick_count: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
