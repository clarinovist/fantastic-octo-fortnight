"use server"

import {
  deleteTutorDocument,
  updateMe,
  updateMeLocation,
  uploadTutorDocument,
} from "@/services/account"
import type { BaseResponse, MeResponse } from "@/utils/types"
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
export async function deleteTutorDocumentAction(id: string): Promise<{ data: string }> {
  const resp = await deleteTutorDocument(id)
  updateTag("tutor-documents")
  return resp
}
export async function uploadTutorDocumentAction(data: FormData): Promise<{ data: string }> {
  const document = data.get("document") as string
  const resp = await uploadTutorDocument({ document })
  updateTag("tutor-documents")
  return resp
}
