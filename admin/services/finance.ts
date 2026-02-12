import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";

export interface AdminWithdrawal {
    id: string;
    tutor: {
        id: string;
        user_id: string;
        name: string;
        phone_number: string;
        email: string;
        status: string;
        created_at: string;
        updated_at: string;
    };
    amount: number | string;
    status: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    admin_note?: string;
    processed_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ListWithdrawalsParams {
    page?: number;
    pageSize?: number;
    status?: string;
}

export async function getAdminWithdrawals(params?: ListWithdrawalsParams): Promise<BaseResponse<AdminWithdrawal[]>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params?.status && params.status !== "all") query.append("status", params.status);

    return fetcherBase<AdminWithdrawal[]>(`/v1/admin/withdrawals?${query.toString()}`);
}

export async function approveWithdrawal(id: string): Promise<BaseResponse<string>> {
    return fetcherBase<string>(`/v1/admin/withdrawals/${id}/approve`, {
        method: "POST",
    });
}

export async function rejectWithdrawal(id: string, note: string): Promise<BaseResponse<string>> {
    return fetcherBase<string>(`/v1/admin/withdrawals/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ note }),
    });
}
