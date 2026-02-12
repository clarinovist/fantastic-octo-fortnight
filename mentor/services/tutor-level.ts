import { BaseResponse } from "@/utils/types";
import { TutorLevelInfo } from "@/utils/types/tutor-level";
import { fetcherBase } from "./base";

export async function getTutorLevel(): Promise<BaseResponse<TutorLevelInfo>> {
    return fetcherBase<TutorLevelInfo>("/v1/tutors/level");
}
