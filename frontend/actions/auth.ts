"use server"

import { authGoogle, forgotPassword, login, resetPassword, signUp, verifyEmail } from "@/services/auth"
import { ID_TOKEN, TOKEN_KEY } from "@/utils/constants/cookies"
import type { BaseResponse, GoogleAuthResponse, LoginResponse, RegisterResponse } from "@/utils/types"
import { cookies } from "next/headers"

export async function signUpAction(data: FormData): Promise<BaseResponse<RegisterResponse>> {
  const email = data.get("email") as string
  const name = data.get("name") as string
  const phoneNumber = data.get("phoneNumber") as string
  const password = data.get("password") as string
  const roleName = data.get("roleName") as "student" | "tutor"

  return signUp({ email, name, phoneNumber, password, roleName })
}

export async function loginAction(data: FormData): Promise<BaseResponse<LoginResponse>> {
  const email = data.get("email") as string
  const password = data.get("password") as string
  const cookiesStore = await cookies()
  const response = await login({ email, password })
  if (response.data?.accessToken) {
    cookiesStore.set(TOKEN_KEY, response.data.accessToken, {
      // Set cookie to expire in 20 hours
      expires: new Date(Date.now() + 20 * 60 * 60 * 1000)
    })
  }

  return response
}

export async function roleNameAction(data: FormData): Promise<BaseResponse<GoogleAuthResponse>> {
  try {
    const roleName = data.get("roleName") as "student" | "tutor"
    const cookiesStore = await cookies()
    const token = cookiesStore.get(ID_TOKEN)?.value
    const resp = await authGoogle({ idToken: token!, roleName })
    if (resp.data?.accessToken) {
      cookiesStore.set(TOKEN_KEY, resp.data.accessToken, {
        expires: new Date(Date.now() + 20 * 60 * 60 * 1000)
      })
    }
    return resp
  } catch (error) {
    console.error("Role Name Action Error: ", error)
    return {
      data: null as any,
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
    }
  }
}
export async function logoutAction() {
  const cookiesStore = await cookies()
  cookiesStore.delete(TOKEN_KEY)
  cookiesStore.delete(ID_TOKEN)
}
export async function verifyEmailAction(token: string) {
  const cookiesStore = await cookies()
  const resp = await verifyEmail(token)
  if (resp.data?.accessToken) {
    cookiesStore.set(TOKEN_KEY, resp.data.accessToken, {
      expires: new Date(Date.now() + 20 * 60 * 60 * 1000)
    })
  }
  return resp
}
export async function forgotPasswordAction(email: string) {
  return forgotPassword(email)
}
export async function resetPasswordAction(data: FormData) {
  const token = data.get("token") as string
  const newPassword = data.get("newPassword") as string
  return resetPassword(token, newPassword)
}
