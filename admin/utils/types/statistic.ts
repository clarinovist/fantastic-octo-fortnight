export type StatisticSubscriptionAmount = {
  amount: number;
  date: string;
}

export type StatisticSubscription = {
  totalAmount: number;
  amountPerDay: StatisticSubscriptionAmount[];
}

export type StatisticUser = {
  studentsCreatedPerDay: { count: number; date: string }[];
  subscriptionsPerDay: { count: number; date: string }[];
  totalPremiumStudents: number;
  totalStudents: number;
  totalTutors: number;
  tutorsCreatedPerDay: { count: number; date: string }[];
}

export type TopBookedTutor = {
  tutorId: string;
  tutorName: string;
  photoProfile: string;
  bookingCount: number;
}

export type TopViewedTutor = {
  tutorId: string;
  tutorName: string;
  photoProfile: string;
  viewCount: number;
}

export type TopBookingStudent = {
  studentId: string;
  studentName: string;
  photoProfile: string;
  bookingCount: number;
}

export type TopSubjectBooked = {
  categoryId: string;
  categoryName: string;
  bookingCount: number;
}

export type TopSubjectViewed = {
  categoryId: string;
  categoryName: string;
  viewCount: number;
}

export type StatisticCourse = {
  categoryId: string;
  categoryName: string;
  courseCount: number;
}
