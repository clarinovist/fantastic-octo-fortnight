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
