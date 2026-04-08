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
        };
        Insert: {
          id: string;
          username: string;
          top_languages?: Json | null;
          starred_categories?: Json | null;
          contributed_repos?: Json | null;
          last_synced_at?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          top_languages?: Json | null;
          starred_categories?: Json | null;
          contributed_repos?: Json | null;
          last_synced_at?: string | null;
        };
      };
      user_settings: {
        Row: {
          user_id: string;
          repositories: Json;
          custom_labels: Json;
          saved_issues: Json;
          notification_frequency: string;
          hide_closed_issues: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          repositories?: Json;
          custom_labels?: Json;
          saved_issues?: Json;
          notification_frequency?: string;
          hide_closed_issues?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          repositories?: Json;
          custom_labels?: Json;
          saved_issues?: Json;
          notification_frequency?: string;
          hide_closed_issues?: boolean;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
