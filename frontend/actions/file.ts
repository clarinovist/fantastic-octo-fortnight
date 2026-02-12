"use server"

import { uploadFile } from "@/services/file"
import type { BaseResponse, FileItem } from "@/utils/types"

export async function fileUploadAction(formData: FormData): Promise<BaseResponse<FileItem>> {
  try {
    const response = await uploadFile(formData)
    console.log(response)
    return response
  } catch (error) {
    console.log(error)
    throw error
  }
}
