import type { BaseResponse, MeRequest, MeResponse } from "@/utils/types";
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

export const joinMentorByCode = (code: string): Promise<BaseResponse<any>> => {
  return fetcherBase(`/v1/mentor/join`, {
    method: "POST",
    body: JSON.stringify({ code }),
  });
}
