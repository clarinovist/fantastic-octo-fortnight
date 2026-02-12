import type { BaseResponse, FileItem } from "@/utils/types";
import { fetcherBase } from "./base";

export const uploadFile = async (payload: FormData): Promise<BaseResponse<FileItem>> => {
  return fetcherBase("/v1/files/upload", {
    method: "POST",
    body: payload,
  });
}
