export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'recruiter' | 'applicant' | 'referent'
export type ReferentStatus = 'created' | 'sent' | 'confirmed' | 'declined'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          role: UserRole
          first_name: string
          last_name: string
          email: string
          company_id: string | null
          job_title: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: UserRole
          first_name: string
          last_name: string
          email: string
          company_id?: string | null
          job_title?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          first_name?: string
          last_name?: string
          email?: string
          company_id?: string | null
          job_title?: string | null
          created_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          org_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          org_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          org_number?: string | null
          created_at?: string
        }
      }
      jobs: {
        Row: {
          id: string
          recruiter_id: string
          company_id: string
          title: string
          invite_token: string
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recruiter_id: string
          company_id: string
          title: string
          invite_token: string
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recruiter_id?: string
          company_id?: string
          title?: string
          invite_token?: string
          is_active?: boolean
          created_at?: string
        }
      }
      reference_requests: {
        Row: {
          id: string
          job_id: string
          applicant_name: string
          applicant_email: string
          created_at: string
        }
        Insert: {
          id?: string
          job_id: string
          applicant_name: string
          applicant_email: string
          created_at?: string
        }
        Update: {
          id?: string
          job_id?: string
          applicant_name?: string
          applicant_email?: string
          created_at?: string
        }
      }
      referents: {
        Row: {
          id: string
          reference_request_id: string
          first_name: string
          last_name: string
          email: string
          relationship: string
          status: ReferentStatus
          confirm_token: string
          confirmed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reference_request_id: string
          first_name: string
          last_name: string
          email: string
          relationship: string
          status?: ReferentStatus
          confirm_token: string
          confirmed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reference_request_id?: string
          first_name?: string
          last_name?: string
          email?: string
          relationship?: string
          status?: ReferentStatus
          confirm_token?: string
          confirmed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// Convenience row types
export type UserRow = Database['public']['Tables']['users']['Row']
export type CompanyRow = Database['public']['Tables']['companies']['Row']
export type JobRow = Database['public']['Tables']['jobs']['Row']
export type ReferenceRequestRow = Database['public']['Tables']['reference_requests']['Row']
export type ReferentRow = Database['public']['Tables']['referents']['Row']
