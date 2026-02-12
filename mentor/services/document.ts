import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";
import { TutorDocument, UploadDocumentRequest } from "@/utils/types/document";

export async function getTutorDocuments(): Promise<BaseResponse<TutorDocument[]>> {
    return fetcherBase<TutorDocument[]>("/v1/tutors/documents");
}

export async function uploadTutorDocument(data: UploadDocumentRequest): Promise<BaseResponse<TutorDocument>> {
    return fetcherBase<TutorDocument>("/v1/tutors/documents", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteTutorDocument(id: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/tutors/documents/${id}`, {
        method: "DELETE",
    });
}
