import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";
import { Review, ReviewStats } from "@/utils/types/review";

export async function getTutorReviews(params?: { page?: number; limit?: number }): Promise<BaseResponse<Review[]>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.limit) query.append("limit", params.limit.toString());

    return fetcherBase<Review[]>(`/v1/tutors/reviews?${query.toString()}`);
}

export async function getTutorReviewStats(): Promise<BaseResponse<ReviewStats>> {
    return fetcherBase<ReviewStats>("/v1/tutors/reviews/stats");
}
