"use server"

import { revalidateTag } from "next/cache";
import { uploadTutorDocument, deleteTutorDocument } from "@/services/document";
import { UploadDocumentRequest } from "@/utils/types/document";

export async function uploadDocumentAction(data: UploadDocumentRequest) {
    try {
        const res = await uploadTutorDocument(data);
        revalidateTag("documents", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}

export async function deleteDocumentAction(id: string) {
    try {
        const res = await deleteTutorDocument(id);
        revalidateTag("documents", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}
