export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'recruiter' | 'applicant' | 'referent'
export type ReferentStatus = 'created' | 'sent' | 'confirmed' | 'declined'

// How strongly a referent's identity has been verified.
// Each level is additive — higher levels imply lower ones.
// email   → confirmed email ownership (OTP)
// phone   → confirmed phone ownership (SMS OTP)
// linkedin → self-asserted LinkedIn URL (not OAuth; social proof)
// bankid  → verified national identity via Swedish BankID (strongest)
export type VerificationLevel = 'none' | 'email' | 'phone' | 'linkedin' | 'bankid'

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
          // Verification — all nullable; filled progressively after the referent confirms
          email_verified: boolean
          email_verified_at: string | null
          phone: string | null
          phone_verified: boolean
          phone_verified_at: string | null
          linkedin_url: string | null          // self-asserted; social proof without OAuth
          bankid_verified: boolean
          bankid_verified_at: string | null
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
          email_verified?: boolean
          email_verified_at?: string | null
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          linkedin_url?: string | null
          bankid_verified?: boolean
          bankid_verified_at?: string | null
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
          email_verified?: boolean
          email_verified_at?: string | null
          phone?: string | null
          phone_verified?: boolean
          phone_verified_at?: string | null
          linkedin_url?: string | null
          bankid_verified?: boolean
          bankid_verified_at?: string | null
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

// Returns the highest verification level achieved by a referent row.
// Order of trust (ascending): none → email → phone → linkedin → bankid
export function verificationLevel(r: Pick<ReferentRow, 'email_verified' | 'phone_verified' | 'linkedin_url' | 'bankid_verified'>): VerificationLevel {
  if (r.bankid_verified) return 'bankid'
  if (r.linkedin_url)    return 'linkedin'
  if (r.phone_verified)  return 'phone'
  if (r.email_verified)  return 'email'
  return 'none'
}
