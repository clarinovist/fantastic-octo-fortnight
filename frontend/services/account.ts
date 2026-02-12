<<<<<<< HEAD
import type { BaseResponse, MeRequest, MeResponse, TutorDocumentResponse } from "@/utils/types";
=======
import type { BaseResponse, MeRequest, MeResponse } from "@/utils/types";
>>>>>>> 1a19ced (chore: update service folders from local)
import { fetcherBase } from "./base";

export const getMe = (): Promise<{ data: MeResponse }> => {
  return fetcherBase(`/v1/me`, {
    next: { tags: ["me"] },
  });
}
export const updateMe = (data: MeRequest): Promise<BaseResponse<MeResponse>> => {
  console.log("data service", data);
  return fetcherBase(`/v1/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export const updateMeLocation = (data: { latitude: number; longitude: number }): Promise<BaseResponse<MeResponse>> => {
  return fetcherBase(`/v1/profile/location`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
<<<<<<< HEAD
export const getTutorDocuments = (): Promise<{ data: TutorDocumentResponse[] }> => {
  return fetcherBase(`/v1/tutors/documents`, {
    next: { tags: ["tutor-documents"] },
  });
}
export const deleteTutorDocument = (id: string): Promise<{ data: string }> => {
  return fetcherBase(`/v1/tutors/documents/${id}`, {
    method: "DELETE",
  });
}
export const uploadTutorDocument = (payload: { document: string }): Promise<{ data: string }> => {
  return fetcherBase(`/v1/tutors/documents`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
export const publishCourse = (id: string): Promise<{ data: string }> => {
  return fetcherBase(`/v1/tutors/courses/${id}/publish`, {
    method: "POST",
  });
}
=======
>>>>>>> 1a19ced (chore: update service folders from local)
