"use server"

import {
  updateMe,
  updateMeLocation,
} from "@/services/account"
import {
  deleteTutorDocument,
  uploadTutorDocument,
} from "@/services/document"
import type { BaseResponse, MeResponse, TutorDocumentResponse } from "@/utils/types"
import { updateTag } from "next/cache"

export async function updateAccountAction(data: FormData): Promise<BaseResponse<MeResponse>> {
  const name = data.get("name") as string
  const phoneNumber = data.get("phoneNumber") as string
  const dateOfBirth = data.get("dateOfBirth") as string
  const gender = data.get("gender") as string
  const photoProfile = data.get("photoProfile") as string
  const socialMediaLink = JSON.parse(data.get("socialMediaLink") as string)

  const response = await updateMe({
    name,
    phoneNumber,
    dateOfBirth,
    gender,
    photoProfile,
    socialMediaLink,
  })

  updateTag("me")

  return response
}
export async function updateAccountLocationAction(
  data: FormData
): Promise<BaseResponse<MeResponse>> {
  const latitude = parseFloat(data.get("latitude") as string)
  const longitude = parseFloat(data.get("longitude") as string)
  const response = await updateMeLocation({ latitude, longitude })

  updateTag("me")

  return response
}
export async function uploadTutorDocumentAction(
  data: FormData
): Promise<BaseResponse<TutorDocumentResponse>> {
  const document = data.get("document") as string
  const response = await uploadTutorDocument({ document })

  return response
}

export async function deleteTutorDocumentAction(id: string): Promise<BaseResponse<null>> {
  const response = await deleteTutorDocument(id)

  return response
}

export async function submitInviteCodeAction(code: string) {
  try {
    const { joinMentorByCode } = await import("@/services/account");
    const res = await joinMentorByCode(code);
    updateTag("me");
    return res;
  } catch (error: any) {
    return { success: false, message: error?.message || "Terjadi kesalahan" };
  }
}

