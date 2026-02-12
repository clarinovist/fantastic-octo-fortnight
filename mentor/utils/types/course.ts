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

export interface CourseSaved {
    id: string;
    title: string;
    description: string;
    tutorDescription: string;
    levelEducationCourses: string[];
    courseCategory: CourseCategory;
    subCategoryIDs: string[];
    isFreeFirstCourse: boolean;
    onlineChannel: string[];
    classType: "offline" | "online" | "all";
    courseSchedulesOffline: {
        [day: string]: { startTime: string; timezone: string; classType: "offline" }[];
    };
    courseSchedulesOnline: {
        [day: string]: { startTime: string; timezone: string; classType: "online" }[];
    };
    coursePrices: {
        offline: { durationInHour: number; price: string }[];
        online: { durationInHour: number; price: string }[];
    };
    status: string;
    statusNotes: string | null;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
    price: string;
}

export interface CourseDetailSaved extends CourseSaved {
    draft: CourseSaved;
}

export interface CourseCreateResponse {
    id: string;
    title: string;
    description: string;
    tutorDescription: string;
    levelEducationCourses: string[];
    courseCategory: CourseCategory;
    subCategoryIDs: string[];
    isFreeFirstCourse: boolean;
    onlineChannel: string[];
    classType: "offline" | "online" | "all";
    coursePrices: {
        offline: { durationInHour: number; price: string }[];
        online: { durationInHour: number; price: string }[];
    };
    status: string;
    statusNotes: string | null;
    isPublished: boolean;
    draft: CourseCreateResponse | null;
    createdAt: string;
    updatedAt: string;
}

export interface CoursePayload {
    title: string;
    description: string;
    tutorDescription: string;
    courseCategoryID: string;
    subCategoryIDs: string[];
    levelEducationCourses: string[];
    classType: "offline" | "online" | "all";
    onlineChannel: string[];
    coursePrices: {
        offline: { durationInHour: number; price: number }[];
        online: { durationInHour: number; price: number }[];
    };
    courseSchedulesOffline: {
        [day: string]: { startTime: string; timezone: string }[];
    };
    courseSchedulesOnline: {
        [day: string]: { startTime: string; timezone: string }[];
    };
    isFreeFirstCourse: boolean;
}
