export type CollegeName =
  | 'College of Agriculture Engineering'
  | 'College of Agriculture'
  | 'College of Community Science'
  | 'College of Basic Science'
  | 'College of Horticulture'
  | 'Food Tech'
  | 'Bio Tech'
  | 'College of Fisheries'
  | 'Other'

export type UserCategory = 'Alumni' | '1st Year' | '2nd Year' | '3rd Year' | '4th Year'

export type AdmissionMode = 'ICAR' | 'CET'

export type ProfileRowPublic = {
  id: string
  full_name: string
  college: CollegeName | null
  other_college_name: string | null
  user_category: UserCategory | null
  batch: string | null
  designation: string | null
  guidance_needed: boolean | null
  profile_photo_path: string | null
  admission_mode?: AdmissionMode | null
  created_at: string
  updated_at: string
}

export type ProfileRowPrivate = ProfileRowPublic & {
  bio: string | null
  phone_no: string | null
  whatsapp_link: string | null
  linkedin_url: string | null
  instagram_url: string | null
  resume_path: string | null
  guidance_topic: string | null
}
