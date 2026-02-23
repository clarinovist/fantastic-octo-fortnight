import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";
import { TutorDocument } from "@/utils/types/document";

export async function getTutorDocuments(): Promise<BaseResponse<TutorDocument[]>> {
    return fetcherBase<TutorDocument[]>("/v1/tutors/documents");
}

export async function uploadTutorDocument(formData: FormData): Promise<BaseResponse<TutorDocument>> {
    const fileUpload = await fetcherBase<{ url: string }>('/v1/files/upload', {
        method: 'POST',
        body: formData,
    });

    if (!fileUpload.success) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return fileUpload as any;
    }

    return fetcherBase<TutorDocument>('/v1/tutors/documents', {
        method: 'POST',
        body: JSON.stringify({
            document: fileUpload.data.url,
            name: formData.get("name")?.toString() || "",
            type: formData.get("type")?.toString() || "",
        }),
    });
}

export async function deleteTutorDocument(id: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/tutors/documents/${id}`, {
        method: "DELETE",
    });
}
