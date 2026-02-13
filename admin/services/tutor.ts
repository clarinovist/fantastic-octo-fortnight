"use server"

import type { BaseResponse, Tutor, TutorCourse, TutorDetail, TutorDocument } from "@/utils/types";
import { fetcherBase } from "./base";

type TutorsParams = {
  page?: number;
  pageSize?: number;
  name?: string;
  email?: string;
  q?: string;
  sort?: string;
  sortDirection?: string;
}

export async function getTutors(params: TutorsParams): Promise<BaseResponse<Tutor[]>> {
  const qs = new URLSearchParams();
  if (params.page) qs.append('page', params.page.toString());
  if (params.pageSize) qs.append('pageSize', params.pageSize.toString());
  if (params.name) qs.append('name', params.name);
  if (params.email) qs.append('email', params.email);
  if (params.q) qs.append('q', params.q);
  qs.append('sort', params.sort || "created_at");
  qs.append('sortDirection', params.sortDirection || "DESC");
  return fetcherBase<Tutor[]>(`/v1/admin/tutors?${qs.toString()}`, {
    next: { tags: ['tutors'] },
  });
}

export async function getTutorById(id: string): Promise<BaseResponse<TutorDetail>> {
  return fetcherBase<TutorDetail>(`/v1/admin/tutors/${id}`, {
    next: { tags: ['tutor'] },
  });
}

type CreateTutorPayload = {
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
}

export async function createTutor(payload: CreateTutorPayload): Promise<BaseResponse<Tutor>> {
  return fetcherBase<Tutor>('/v1/admin/tutors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export type UpdateTutorPayload = {
  dateOfBirth?: string;
  email?: string;
  gender?: string;
  latitude?: number;
  longitude?: number;
  name?: string;
  password?: string;
  phoneNumber?: string;
  photoProfile?: string;
  levelPoint?: number;
  socialMediaLinks?: Record<string, string>;
}

export async function updateTutor(id: string, payload: UpdateTutorPayload): Promise<BaseResponse<Tutor>> {
  return fetcherBase<Tutor>(`/v1/admin/tutors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function deleteTutors(ids: string[]): Promise<BaseResponse<null>> {
  return fetcherBase<null>(`/v1/admin/tutors`, {
    method: 'DELETE',
    body: JSON.stringify({ ids }),
  });
}

export async function changeRoleTutor(id: string): Promise<BaseResponse<Tutor>> {
  return fetcherBase<Tutor>(`/v1/admin/tutors/${id}/change-role`, {
    method: "POST",
  })
}

export async function changeTutorStatus(id: string, status: 'active' | 'inactive'): Promise<BaseResponse<Tutor>> {
  return fetcherBase<Tutor>(`/v1/admin/tutors/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  })
}

export async function getTutotrDocuments(tutorId: string): Promise<BaseResponse<TutorDocument[]>> {
  return fetcherBase<TutorDocument[]>(`/v1/admin/tutors/${tutorId}/documents`, {
    next: { tags: ['tutor-documents'] },
  });
}

export async function changeDocumentStatus(tutorId: string, documentId: string, status: 'active' | 'inactive'): Promise<BaseResponse<TutorDocument>> {
  return fetcherBase<TutorDocument>(`/v1/admin/tutors/${tutorId}/documents/${documentId}/${status}`, {
    method: "PUT",
  });
}

export async function uploadTutorDocument(url: string, tutorId: string): Promise<BaseResponse<string>> {
  return fetcherBase(`/v1/admin/tutors/${tutorId}/documents`, {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export async function getCoursesByTutor(tutorId: string): Promise<BaseResponse<TutorCourse[]>> {
  return fetcherBase<TutorCourse[]>(`/v1/admin/tutors/${tutorId}/courses`, {
    next: { tags: ['tutor-courses'] },
  });
}

export async function updateTutorReview(reviewId: string, review: string, rate: number, recommendByStudent: "yes" | "no" | null): Promise<BaseResponse<null>> {
  return fetcherBase<null>(`/v1/admin/tutor-reviews/${reviewId}`, {
    method: "PUT",
    body: JSON.stringify({ review, rate, recommendByStudent }),
  });
}

export async function deleteTutorReview(reviewId: string): Promise<BaseResponse<string>> {
  return fetcherBase<string>(`/v1/admin/tutor-reviews/${reviewId}`, {
    method: "DELETE",
  });
}
