import { fetcherBase } from "./base";
import { BaseResponse } from "@/utils/types";

export interface MentorStudent {
    id: string;
    student_id: string;
    name: string;
    email: string;
    joined_at: string;
    status: string;
    total_sessions: number;
}

export interface InviteCodeResponse {
    code: string;
}

export interface BalanceResponse {
    balance: string;
}

export interface Transaction {
    id: string;
    type: string;
    amount: string;
    description: string;
    reference_type: string;
    created_at: string;
}

export interface FinanceStats {
    total_balance: string;
    balance_change_pct: number;
    total_income_30d: string;
    income_change_pct: number;
    total_commission_30d: string;
    commission_target: string;
    chart_data: {
        month: string;
        amount: number;
    }[];
}
export interface Withdrawal {
    id: string;
    amount: string;
    status: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    created_at: string;
}

export interface WithdrawalRequest {
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
}

export async function getMentorStudents(): Promise<BaseResponse<MentorStudent[]>> {
    return fetcherBase<MentorStudent[]>("/v1/mentor/students");
}

export async function getInviteCode(): Promise<BaseResponse<InviteCodeResponse>> {
    return fetcherBase<InviteCodeResponse>("/v1/mentor/invite-code");
}

export async function getMentorBalance(): Promise<BaseResponse<BalanceResponse>> {
    return fetcherBase<BalanceResponse>("/v1/mentor/balance");
}

export async function getMentorTransactions(page = 1, limit = 10, type = ""): Promise<BaseResponse<Transaction[]>> {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(type ? { type } : {})
    });
    return fetcherBase<Transaction[]>(`/v1/mentor/transactions?${query}`);
}

export async function getMentorWithdrawals(page = 1, limit = 10, status = ""): Promise<BaseResponse<Withdrawal[]>> {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status ? { status } : {})
    });
    return fetcherBase<Withdrawal[]>(`/v1/mentor/withdrawals?${query}`);
}

export async function requestWithdrawal(body: WithdrawalRequest): Promise<BaseResponse<null>> {
    return fetcherBase<null>("/v1/mentor/withdrawals", {
        method: "POST",
        body: JSON.stringify(body),
    });
}
// Sessions
export interface Session {
    id: string;
    student_id: string;
    student_name: string;
    course_name: string;
    booking_date: string; // YYYY-MM-DD
    booking_time: string; // HH:MM
    status: string;
    class_type: string;
    code: string;
    notes?: string;
    latitude?: number;
    longitude?: number;
}

export interface CreateSessionRequest {
    student_id: string;
    class_type: string;
    course_id: string;
    booking_date: string;
    booking_time: string;
    duration_minutes: number;
    latitude?: number;
    longitude?: number;
    notes?: string;
}

export async function getMentorSessions(page = 1, limit = 10): Promise<BaseResponse<Session[]>> {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    return fetcherBase<Session[]>(`/v1/mentor/bookings?${query}`);
}

export async function createSession(data: CreateSessionRequest): Promise<BaseResponse<Session>> {
    return fetcherBase<Session>("/v1/mentor/bookings", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export interface MentorCourse {
    id: string;
    title: string;
    description: string;
    is_published: boolean;
    status: string;
}

export async function getMentorCourses(page = 1, limit = 100): Promise<BaseResponse<MentorCourse[]>> {
    const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
    });
    return fetcherBase<MentorCourse[]>(`/v1/tutors/courses?${query}`);
}

// Student Detail
export interface StudentDetail {
    id: string;
    student_id: string;
    name: string;
    email: string;
    status: string;
    joined_at: string;
    total_sessions: number;
    completed_sessions: number;
    upcoming_sessions: number;
    sessions: Session[];
}

export async function getStudentDetail(studentId: string): Promise<BaseResponse<StudentDetail>> {
    return fetcherBase<StudentDetail>(`/v1/mentor/students/${studentId}`);
}

// Session Detail & Status
export async function getSessionDetail(sessionId: string): Promise<BaseResponse<Session>> {
    return fetcherBase<Session>(`/v1/mentor/bookings/${sessionId}`);
}

export async function updateSessionStatus(sessionId: string, status: string): Promise<BaseResponse<null>> {
    return fetcherBase<null>(`/v1/mentor/bookings/${sessionId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
    });
}

export async function getFinanceStats(): Promise<BaseResponse<FinanceStats>> {
    return fetcherBase<FinanceStats>("/v1/mentor/finance/stats");
}
