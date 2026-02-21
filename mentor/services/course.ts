import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";
import { CourseSaved, CourseDetailSaved, CourseCreateResponse, CoursePayload } from "@/utils/types/course";

export async function getMyCourses(page = 1, limit = 10): Promise<BaseResponse<CourseSaved[]>> {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    return fetcherBase<CourseSaved[]>(`/v1/tutors/courses?${query}`);
}

export async function getCourseSaved(id: string): Promise<BaseResponse<CourseDetailSaved>> {
    return fetcherBase<CourseDetailSaved>(`/v1/tutors/courses/${id}`);
}

export async function createCourse(data: CoursePayload): Promise<BaseResponse<CourseCreateResponse>> {
    return fetcherBase<CourseCreateResponse>("/v1/tutors/courses", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateCourse(id: string, data: CoursePayload): Promise<BaseResponse<CourseCreateResponse>> {
    return fetcherBase<CourseCreateResponse>(`/v1/tutors/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function submitCourse(id: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/tutors/courses/${id}/submit`, {
        method: "POST",
    });
}

export async function publishCourse(id: string, isPublished: boolean): Promise<BaseResponse<string>> {
    return fetcherBase<string>(`/v1/tutors/courses/${id}/publish`, {
        method: "PUT",
        body: JSON.stringify({ isPublished }),
    });
}

export async function deleteCourse(id: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/tutors/courses/${id}`, {
        method: "DELETE",
    });
}

export interface CourseCategory {
    id: string;
    name: string;
}

export async function getCourseCategories(q = ""): Promise<BaseResponse<CourseCategory[]>> {
    const query = new URLSearchParams({
        ...(q ? { q } : {}),
    });
    return fetcherBase<CourseCategory[]>(`/v1/course-categories?${query}`);
}
