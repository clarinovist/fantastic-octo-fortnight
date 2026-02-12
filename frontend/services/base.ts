"use server"

import { TOKEN_KEY } from "@/utils/constants/cookies";
import type { BaseResponse } from "@/utils/types";
import { cookies } from "next/headers";

const baseApiUrl = process.env.NEXT_BASE_API_URL!;
const defaultInvalidateCache = 0; // seconds

export const fetcher = async <T>(input: RequestInfo, options?: RequestInit): Promise<T | Response> => {
  const cookiesStore = await cookies();

  const isFormData = options?.body instanceof FormData;
  const headers = isFormData
    ? {
      authorization: `Bearer ${cookiesStore.get(TOKEN_KEY)?.value || ""}`,
      ...options?.headers,
    }
    : {
      "Content-Type": "application/json",
      authorization: `Bearer ${cookiesStore.get(TOKEN_KEY)?.value || ""}`,
      ...options?.headers,
    };

  const res = await fetch(input, {
    ...options,
    headers,
    next: { revalidate: options?.method === "GET" ? defaultInvalidateCache : undefined },
  });

  if (!res.ok) {
    const resp = await res.json()
    throw resp;
  }

  // Check if response is binary (PDF, images, etc.)
  const contentType = res.headers.get("content-type");
  if (
    contentType?.includes("application/pdf") ||
    contentType?.includes("application/octet-stream") ||
    contentType?.includes("image/")
  ) {
    // Return the Response object directly for binary data
    return res as T;
  }

  return res.json();
};

export async function fetcherBase<T>(input: RequestInfo, options?: RequestInit): Promise<BaseResponse<T>> {
  const url = `${baseApiUrl}${input}`

  try {
    const response = await fetcher<any>(url, options);

    // If response is a Response object (binary data), return it directly
    if (response && 'blob' in response) {
      return response;
    }

    // If the API already returns BaseResponse format, use it directly
    if (response && typeof response === 'object' && 'success' in response) {
      return response as BaseResponse<T>;
    }

    // Otherwise, wrap the response in BaseResponse format
    return {
      data: response as T,
      statusCode: 200,
      success: true
    };
  } catch (error: any) {
    console.error(`Fetch error ${url}:`, JSON.stringify(error, null, 0));
    return {
      data: null as T,
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || 'An error occurred',
      ...(error.metadata ? { metadata: error.metadata } : {}),
      ...(error.error ? { error: error.error } : {}),
      ...(error.code ? { code: error.code } : {})
    };
  }
}
