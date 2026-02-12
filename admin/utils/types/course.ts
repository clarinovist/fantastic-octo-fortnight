export type CourseStatus = "Draft" | "Waiting for Approval" | "Accepted" | "Rejected";

export type ClassType = "online" | "offline" | "all";

export type CourseCategory = {
  id: string;
  name: string;
  slug?: string;
};


export type Course = {
  id: string;
  updatedAt: string;
  tutorName: string;
  courseTitle: string;
  classType: ClassType;
  isFreeFirstCourse: boolean;
  status: CourseStatus;
}

export type CoursePrices = {
  offline: {
    durationInHour: number;
    price: string;
  }[];
  online: {
    durationInHour: number;
    price: string;
  }[];
}

export type CourseSchedule = Record<string, { startTime: string; timezone: string; classType: ClassType }[]>

export type CourseTutorRating = {
  studentName: string;
  studentEmail: string;
  studentPhoto: string;
  rating: number;
  review: string;
}

export type CourseTutor = {
  id: string;
  name: string;
  photoProfile: string;
  description: string;
  classType: ClassType;
  onlineChannel: {
    channel: string;
    imageURL: string;
  }[];
  socialMediaLinks: {
    image: string;
    link: string;
    socialMedia: string;
  }[];
  latitude: string;
  longitude: string;
  level: string;
  levelOfEducation: string;
  responseTime: string | null;
  rating: string;
  totalRating: number;
  location: {
    id: string;
    name: string;
    fullName: string;
    shortName: string;
    type: string;
  };
  ratings: CourseTutorRating[];
};

export type CourseDetail = {
  id: string;
  courseCategory: {
    id: string;
    name: string;
  };
  subCourseCategories: {
    id: string;
    course_category_id: string;
    name: string;
  }[];
  title: string;
  levelEducationCourse: string[];
  relatedCourses: string[];
  totalStudentEnrollment: number;
  tutor: CourseTutor;
  isFreeFirstCourse: boolean;
  onlineChannel: string[];
  description: string;
  coursePrices: CoursePrices;
  courseSchedulesOnline: CourseSchedule;
  courseSchedulesOffline: CourseSchedule;
  price: string;
  isBooked: boolean;
  status: CourseStatus;
}

export type CoursePayload = {
  classType: ClassType;
  courseCategoryID: string;
  coursePrices: CoursePrices;
  courseSchedulesOffline: CourseSchedule;
  courseSchedulesOnline: CourseSchedule;
  description: string;
  isFreeFirstCourse: boolean;
  levelEducationCourses: string[];
  onlineChannel: string[];
  subCategoryIDs: string[];
  title: string;
  tutorDescription: string;
}
