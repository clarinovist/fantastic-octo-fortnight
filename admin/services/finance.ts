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

export interface AdminTransaction {
    id: string;
    tutor_id: string;
    tutor_name: string;
    tutor_email: string;
    type: string;
    amount: number | string;
    commission: number | string;
    reference_type: string;
    reference_id: string;
    description: string;
    created_at: string;
}

export interface AdminTransactionStats {
    total_credit: number | string;
    total_debit: number | string;
    total_commission: number | string;
    total_count: number;
}

export interface ListTransactionsParams {
    page?: number;
    pageSize?: number;
    tutorName?: string;
    type?: string;
}

export async function getAdminTransactions(params?: ListTransactionsParams): Promise<BaseResponse<AdminTransaction[]>> {
    const query = new URLSearchParams();
    if (params?.page) query.append("page", params.page.toString());
    if (params?.pageSize) query.append("pageSize", params.pageSize.toString());
    if (params?.tutorName) query.append("tutorName", params.tutorName);
    if (params?.type && params.type !== "all") query.append("type", params.type);

    return fetcherBase<AdminTransaction[]>(`/v1/admin/transactions?${query.toString()}`);
}

export async function getAdminTransactionStats(): Promise<BaseResponse<AdminTransactionStats>> {
    return fetcherBase<AdminTransactionStats>("/v1/admin/transactions/stats");
}
