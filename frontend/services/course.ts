import { Course, CourseBookedDate, CourseCategory, CourseDetail, CourseDetailSaved } from "@/utils/types";
import qs from "qs";
import { fetcherBase } from "./base";

type GetCoursesParams = {
  page?: number;
  pageSize?: number;
}

export const getCourses = (params?: GetCoursesParams) => {
  const query = qs.stringify(params);
  return fetcherBase(`/v1/courses?${query}`);
}

type GetCourseCategoriesParams = {
  page?: number;
  pageSize?: number;
  q?: string
}

export const getCourseCategories = (params?: GetCourseCategoriesParams) => {
  const query = qs.stringify(params);
  return fetcherBase(`/v1/course-categories?${query}`);
}

export const getCoursesCategoriesTrending = (): Promise<{ data: CourseCategory[] }> => {
  return fetcherBase(`/v1/course-categories/trending`);
}

export const getCourseById = (id: string): Promise<{ data: CourseDetail }> => {
  return fetcherBase(`/v1/courses/${id}`);
}

export const getCourseRecommendations = (id: string): Promise<{ data: Course[] }> => {
  return fetcherBase(`/v1/courses/${id}/related`);
}
export const getCourseSavedById = (id: string): Promise<{ data: CourseDetailSaved }> => {
  return fetcherBase(`/v1/tutors/courses/${id}`);
}
export const getBookedDate = ({ id, startDate, endDate }: { id: string, startDate: string, endDate: string }): Promise<{ data: CourseBookedDate }> => {
  const query = qs.stringify({ startDate, endDate });
  console.log('Fetching booked dates with query:', query);
  return fetcherBase(`/v1/courses/${id}/booking?${query}`);
}