export interface Course {
  id: string;
  courseCategory: CourseCategory;
  tutor: Tutor;
  isFreeFirstCourse: boolean;
  price: string;
  description: string;
  isBooked: boolean
}

export interface CourseCategory {
  id: string;
  name: string;
}

export interface Tutor {
  id: string;
  name: string;
  photoProfile: string | null;
  classType: "offline" | "online" | "all";
  latitude: number;
  longitude: number;
  level: string;
  levelOfEducation: string;
  responseTime: number;
  rating: string;
  totalRating: number;
  description: string;
  onlineChannel: {
    channel: string;
    imageURL: string;
  }[];
  location: {
    id: string;
    name: string;
    fullName: string;
    type: string;
  };
}
export interface CourseDetail {
  id: string;
  courseCategory: CourseCategory;
  levelEducationCourse: string[];
  totalStudentEnrollment: number;
  relatedCourses: string[];
  title: string;
  isBooked: boolean;
  tutor: Tutor & {
    ratings: {
      studentPhoto: string | null;
      studentName: string;
      studentEmail: string;
      rating: string;
      review: string;
    }[];
    location: {
      id: string;
      name: string;
      fullName: string;
      shortName?: string;
      type: string;
    };
  };
  coursePrices: {
    offline: { durationInHour: number; price: string }[];
    online: { durationInHour: number; price: string }[];
  };
  isFreeFirstCourse: boolean;
  description: string;
  courseSchedulesOffline: {
    [day: string]: { startTime: string; timezone: string; classType: "offline" }[];
  };
  courseSchedulesOnline: {
    [day: string]: { startTime: string; timezone: string; classType: "online" }[];
  };
  price: string;
}
export interface CourseBookedDate {
  [dateTime: string]: {
    status: boolean
    classType: "online" | "offline"
  }
}
