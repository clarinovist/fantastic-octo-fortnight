export interface MeResponse {
  id: string
  name: string
  role: string
  email: string
  photo_profile: string
  gender: string
  date_of_birth: string
  phone_number: string
  social_media_link: Record<string, string>
  latitude: number
  longitude: number
  level_point: number
  level: string
  finish_update_profile: boolean
  isPremium: boolean
  location: {
    id: string
    name: string
    fullName: string
    shortName: string
    type: string
  }
}
export interface MeRequest {
  dateOfBirth: string
  gender: string
  name: string
  phoneNumber: string
  photoProfile: string
  socialMediaLink: Record<string, string>
}
export interface TutorDocumentResponse {
  id: string
  url: string
  status: string
  created_at: string
  updated_at: string
}
export interface MyCourseResponse {
  id: string
  title: string
  description: string
  isPublished: boolean
  status: string
}
