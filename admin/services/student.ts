"use server"

import type { BaseResponse, Student, StudentDetail } from "@/utils/types";
import { fetcherBase } from "./base";

type StudentsParams = {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  q?: string;
  sort?: string;
  sortDirection?: string;
}

export async function getStudents(params: StudentsParams): Promise<BaseResponse<Student[]>> {
  const qs = new URLSearchParams();
  if (params.page) qs.append('page', params.page.toString());
  if (params.pageSize) qs.append('pageSize', params.pageSize.toString());
  if (params.name) qs.append('name', params.name);
  if (params.email) qs.append('email', params.email);
  if (params.q) qs.append('q', params.q);
  qs.append('sort', params.sort || "created_at");
  qs.append('sortDirection', params.sortDirection || "DESC");
  return fetcherBase<Student[]>(`/v1/admin/students?${qs.toString()}`, {
    next: { tags: ['students'] },
  });
}

export async function getStudentById(id: string): Promise<BaseResponse<StudentDetail>> {
  return fetcherBase<StudentDetail>(`/v1/admin/students/${id}`, {
    next: { tags: ['student'] },
  });
}

type CreateStudentPayload = {
  dateOfBirth: string;
  email: string;
  gender: string;
  latitude: number;
  longitude: number;
  name: string;
  password?: string;
  phoneNumber: string;
  photoProfile: string;
  socialMediaLinks: Record<string, string>;
  premiumUntil?: string;
}

export async function createStudent(payload: CreateStudentPayload): Promise<BaseResponse<Student>> {
  return fetcherBase<Student>('/v1/admin/students', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type UpdateStudentPayload = {
  dateOfBirth?: string;
  email?: string;
  gender?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  password?: string;
  phoneNumber?: string;
  photoProfile?: string;
  socialMediaLinks?: Record<string, string>;
  premiumUntil?: string;
}

export async function updateStudent(id: string, payload: UpdateStudentPayload): Promise<BaseResponse<Student>> {
  return fetcherBase<Student>(`/v1/admin/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteStudents(ids: string[]): Promise<BaseResponse<null>> {
  return fetcherBase<null>(`/v1/admin/students`, {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export async function changeRoleStudent(id: string): Promise<BaseResponse<Student>> {
  return fetcherBase<Student>(`/v1/admin/students/${id}/change-role`, {
    method: "POST",
  })
}

export async function updateStudentReview(reviewId: string, review: string, rate: number, recommendByStudent: "yes" | "no" | null): Promise<BaseResponse<null>> {
  return fetcherBase<null>(`/v1/admin/student-reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify({ review, rate, recommendByStudent }),
  });
}

export async function deleteStudentReview(reviewId: string): Promise<BaseResponse<string>> {
  return fetcherBase<string>(`/v1/admin/student-reviews/${reviewId}`, {
    method: "DELETE",
  });
}
