"use server"

import { revalidateTag } from "next/cache";
import { updateProfile, uploadFile } from "@/services/auth";
import { updateLocation } from "@/services/account";

export async function updateProfileAction(data: { name?: string; phoneNumber?: string; address?: string; bio?: string; gender?: string; dateOfBirth?: string; }) {
    try {
        const res = await updateProfile(data);
        revalidateTag("profile", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}

export async function updateLocationAction(latitude: number, longitude: number, address: string) {
    try {
        const res = await updateLocation({ latitude, longitude, address });
        revalidateTag("profile", "default");
        return res;
    } catch (error) {
        return { success: false, error };
    }
}

export async function uploadPhotoAction(formData: FormData) {
    try {
        const file = formData.get("file") as File;
        if (!file) {
            return { success: false, error: "No file provided" };
        }

        // Step 1: Upload the file to get URL
        const uploadRes = await uploadFile(file);
        if (!uploadRes.success || !uploadRes.data?.url) {
            return { success: false, error: "Failed to upload file" };
        }

        // Step 2: Update profile with the new photo URL
        const profileRes = await updateProfile({ photoProfile: uploadRes.data.url });
        revalidateTag("profile", "default");
        return profileRes;
    } catch (error) {
        return { success: false, error };
    }
}
