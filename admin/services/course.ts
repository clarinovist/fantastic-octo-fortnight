"use server"

import type { BaseResponse, ClassType, Course, CourseDetail, CoursePayload, CourseStatus, CourseSchedule, CourseCategory } from "@/utils/types";
import { fetcherBase } from "./base";

type CoursesParams = {
  page?: number;
  pageSize?: number;
  isFreeFirstCourse?: boolean;
  classType?: ClassType;
  status?: CourseStatus;
  sort?: string;
  sortDirection?: string;
}

export async function getCourses(params?: CoursesParams): Promise<BaseResponse<Course[]>> {
  const qs = new URLSearchParams();
  if (params?.page) qs.append('page', params.page.toString());
  if (params?.pageSize) qs.append('pageSize', params.pageSize.toString());
  if (params?.isFreeFirstCourse !== undefined) qs.append('isFreeFirstCourse', params.isFreeFirstCourse.toString());
  if (params?.classType) qs.append('classType', params.classType);
  if (params?.status) qs.append('status', params.status);
  qs.append('sortBy', params?.sort || "updated_at");
  qs.append('sortOrder', params?.sortDirection || "DESC");
  return fetcherBase<Course[]>("/v1/admin/courses?" + qs.toString(), {
    next: { tags: ["courses"] },
  });
}

export async function getCourseDetail(courseId: string): Promise<BaseResponse<CourseDetail>> {
  return fetcherBase<CourseDetail>(`/v1/admin/courses/${courseId}`, {
    next: { tags: ["course"] },
  });
}

export async function updateCourse(courseId: string, payload: CoursePayload): Promise<BaseResponse<CourseDetail>> {
  return fetcherBase<CourseDetail>(`/v1/admin/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function approveCourse(courseId: string, reviewNotes: string): Promise<BaseResponse<null>> {
  return fetcherBase<null>(`/v1/admin/courses/${courseId}/approve`, {
    method: "POST",
    body: JSON.stringify({ reviewNotes }),
  });
}

export async function rejectCourse(courseId: string, reviewNotes: string): Promise<BaseResponse<null>> {
  return fetcherBase<null>(`/v1/admin/courses/${courseId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reviewNotes }),
  });
}

export type CreateCoursePayload = {
  classType: ClassType;
  courseCategoryID: string;
  coursePrices: {
    offline: { durationInHour: number; price: number }[];
    online: { durationInHour: number; price: number }[];
  };
  courseSchedulesOffline: CourseSchedule;
  courseSchedulesOnline: CourseSchedule;
  description?: string;
  isFreeFirstCourse?: boolean;
  levelEducationCourses?: string[];
  onlineChannel?: string[];
  subCategoryIDs?: string[];
  title: string;
  tutorDescription?: string;
  tutorId: string;
}

export async function createCourse(payload: CreateCoursePayload): Promise<BaseResponse<CourseDetail>> {
  return fetcherBase<CourseDetail>("/v1/admin/courses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteCourse(courseId: string): Promise<BaseResponse<string>> {
  return fetcherBase<string>(`/v1/admin/courses/${courseId}`, {
    method: "DELETE",
  });
}

export async function getCategories(): Promise<BaseResponse<CourseCategory[]>> {
  return fetcherBase<CourseCategory[]>("/v1/course-categories");
}
