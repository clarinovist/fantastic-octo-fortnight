export interface LocationBooking {
  lat: number
  lng: number
  address?: string
}

export interface LocationMapContentProps {
  tutorLocation: LocationBooking
  tutorLocationName: string
  studentLocation: LocationBooking | null
  setStudentLocation: (location: LocationBooking | null) => void
  distance: number | null
  getCurrentLocation: () => void
  isGettingLocation: boolean
}

export interface Booking {
  id: string
  bookingDate: string
  bookingTime: string
  timezone: string
  courseTitle: string
  courseDescription: string
  status: string
  expiredAt: string
}
export interface BookingDetail extends Booking {
  tutor: {
    name: string
    gender: string
    email: string
    dateOfBirth: string
    phoneNumber: string
    socialMediaLink: {
      tiktok?: string
      facebook?: string
      twitter?: string
      linkedin?: string
      instagram?: string
    }
    photoProfile: string
  }
  student: {
    name: string
    gender: string | null
    email: string
    dateOfBirth: string | null
    phoneNumber: string
    socialMediaLink: object
    photoProfile: string | null
  }
  course: {
    title: string
    description: string
  }
  notesTutor: string
  notesStudent: string
  classType: string
  latitude: string
  longitude: string
  createdAt: string
  sessionTasks?: SessionTaskDTO[]
  reportBooking?: any
}

export interface TaskSubmissionDTO {
  id: string
  submissionUrl: string | null
  score: number | string
  createdAt: string
}

export interface SessionTaskDTO {
  id: string
  title: string
  description: string | null
  attachmentUrl: string | null
  submission?: TaskSubmissionDTO
  createdAt: string
}

export interface BookingReview {
  courseTitle: string
  id: string
  name: string
  email: string
  photoProfile?: string
  review?: string
  rate: number
  isReviewed: boolean
  createdAt: string
  updatedAt: string
  recommendByStudent: string
}