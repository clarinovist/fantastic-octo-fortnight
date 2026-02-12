import { fetcherBase } from "./base";
import { BaseResponse, TutorDocumentResponse } from "@/utils/types";

export async function uploadTutorDocument(data: { document: string }): Promise<BaseResponse<TutorDocumentResponse>> {
    return fetcherBase<TutorDocumentResponse>("/v1/tutors/documents", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteTutorDocument(id: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/tutors/documents/${id}`, {
        method: "DELETE",
    });
}
