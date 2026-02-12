export type Tutor = {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  status: "active" | "inactive"
  email: string;
  createdAt: string;
  updatedAt: string;
  photoProfile?: string;
}
export type TutorDetail = {
  id: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  email: string;
  phoneNumber: string;
  status: "active" | "inactive"
  levelPoint: number;
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
export type TutorDocument = {
  id: string;
  tutorId: string;
  status: "active" | "pending_created" | "pending_deleted" | "inactive";
  url: string;
}
export type TutorCourse = {
  id: string;
  title: string;
  status: string;
}
