"use server"

<<<<<<< HEAD
import { login } from "@/services/auth"
=======
import { forgotPassword, login, resetPassword } from "@/services/auth"
>>>>>>> 1a19ced (chore: update service folders from local)
import { ID_TOKEN, TOKEN_KEY } from "@/utils/constants/cookies"
import type { BaseResponse, LoginResponse } from "@/utils/types"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function loginAction(
  prevState: BaseResponse<LoginResponse> | null,
  formData: FormData
): Promise<BaseResponse<LoginResponse>> {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return {
        data: null as unknown as LoginResponse,
        statusCode: 400,
        success: false,
        message: "Email and password are required"
      }
    }

    const cookiesStore = await cookies()
    const response = await login({ email, password })

    if (response.success && response.data?.accessToken) {
      cookiesStore.set(TOKEN_KEY, response.data.accessToken, {
        // Set cookie to expire in 20 hours
        expires: new Date(Date.now() + 20 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      })

      redirect("/dashboard")
    }

    return response
  } catch (error) {
    // Handle redirect errors (redirect throws an error internally)
    const err = error as unknown as { message?: string; statusCode?: number }
    if (err?.message?.includes("NEXT_REDIRECT")) {
      throw error
    }

    return {
      data: null as unknown as LoginResponse,
      statusCode: err.statusCode || 500,
      success: false,
      message: err.message || "An error occurred during login. Please try again."
    }
  }
}

export async function logoutAction() {
  const cookiesStore = await cookies()
  cookiesStore.delete(TOKEN_KEY)
  cookiesStore.delete(ID_TOKEN)
<<<<<<< HEAD
}
=======
  redirect("/login")
}

export async function forgotPasswordAction(email: string) {
  try {
    const res = await forgotPassword(email);
    return res;
  } catch (error) {
    const err = error as { message?: string };
    return { success: false, message: err.message || "Gagal mengirim email reset password." };
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    const res = await resetPassword(token, newPassword);
    return res;
  } catch (error) {
    const err = error as { message?: string };
    return { success: false, message: err.message || "Gagal mengatur ulang password." };
  }
}

>>>>>>> 1a19ced (chore: update service folders from local)
