"use server";

import { requestWithdrawal } from "@/services/mentor";
import { mutate } from "swr";

export async function submitWithdrawalAction(formData: FormData) {
    const amount = parseFloat(formData.get("amount") as string);
    const bank_name = formData.get("bank_name") as string;
    const account_number = formData.get("account_number") as string;
    const account_name = formData.get("account_name") as string;

    if (!amount || amount <= 0) {
        return { success: false, error: "Jumlah penarikan harus lebih dari 0" };
    }

    try {
        const res = await requestWithdrawal({
            amount,
            bank_name,
            account_number,
            account_name,
        });

        if (res.success) {
            // Revalidate relevant SWR keys
            mutate("/v1/mentor/balance");
            mutate("/v1/mentor/withdrawals");
            mutate("/v1/mentor/transactions");
            return { success: true };
        } else {
            return { success: false, error: res.message || "Gagal mengajukan penarikan" };
        }
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Terjadi kesalahan sistem";
        return { success: false, error: message };
    }
}
