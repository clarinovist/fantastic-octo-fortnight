import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";

export interface UpdateLocationPayload {
    latitude: number;
    longitude: number;
    address?: string;
}

export async function updateLocation(body: UpdateLocationPayload): Promise<BaseResponse<null>> {
    return fetcherBase<null>('/v1/profile/location', {
        method: 'PUT',
        body: JSON.stringify(body),
    });
}

// Re-export or add other account related methods here as needed
