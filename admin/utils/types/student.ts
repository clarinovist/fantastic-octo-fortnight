export type Student = {
  id: string;
  name: string;
  email: string;
  userId: string;
  premiumSubscription: 'Non Active' | 'Active' | string;
  createdAt: string;
  updatedAt: string;
}
export type StudentDetail = {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  premiumUntil: string;
  socialMediaLinks?: {
    tiktok?: string;
  };
  latitude: string;
  longitude: string;
  studentToTutorReview: Array<{
    id: string;
    name: string;
    courseTitle: string;
    courseDescription: string;
    review: string | null;
    rating: number | null;
    recommendByStudent: "yes" | "no" | null;
  }>;
  tutorToStudentReview: Array<{
    id: string;
    name: string;
    courseTitle: string;
    courseDescription: string;
    review: string | null;
    rating: number | null;
    recommendByStudent: "yes" | "no" | null;
  }>;
  photoProfile: string;
  rating: number;
}
