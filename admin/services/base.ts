"use server"

import { TOKEN_KEY } from "@/utils/constants/cookies";
<<<<<<< HEAD
import type { BaseResponse } from "@/utils/types";
import { cookies } from "next/headers";

=======
import type { BaseResponse, Metadata } from "@/utils/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
>>>>>>> 1a19ced (chore: update service folders from local)
const baseApiUrl = process.env.NEXT_BASE_API_URL!;
const defaultInvalidateCache = 0; // seconds

export const fetcher = async <T>(input: RequestInfo, options?: RequestInit): Promise<T> => {
  const cookiesStore = await cookies();

  const isFormData = options?.body instanceof FormData;
  const headers = isFormData
    ? {
      authorization: `Bearer ${cookiesStore.get(TOKEN_KEY)?.value || ""}`,
      ...options?.headers,
    }
    : {
      "Content-Type": "application/json",
<<<<<<< HEAD
      authorization: `Bearer ${cookiesStore.get(TOKEN_KEY)?.value || ""}`,
=======
      ...(cookiesStore.get(TOKEN_KEY)?.value
        ? { authorization: `Bearer ${cookiesStore.get(TOKEN_KEY)?.value}` }
        : {}),
>>>>>>> 1a19ced (chore: update service folders from local)
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
    const response = await fetcher<unknown>(url, options);

    // If response is a Response object (binary data), return it wrapped
    if (response instanceof Response) {
      return {
        data: response as T,
        statusCode: 200,
        success: true
      };
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
<<<<<<< HEAD
  } catch (error: any) {
    console.error(`Fetch error ${url}:`, JSON.stringify(error, null, 0));
    return {
      data: null as unknown as T,
      statusCode: error.statusCode || 500,
      success: false,
      message: error.message || 'An error occurred',
      ...(error.metadata ? { metadata: error.metadata } : {}),
      ...(error.error ? { error: error.error } : {}),
      ...(error.code ? { code: error.code } : {})
=======
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string; metadata?: unknown; error?: unknown; code?: number };
    console.error(`Fetch error ${url}:`, JSON.stringify(err, null, 0));
    // Check for 401 Unauthorized
    if (err.statusCode === 401) {
      const cookiesStore = await cookies();
      cookiesStore.delete(TOKEN_KEY);
      // We can't use redirect() here because it throws an error that might be caught by the caller.
      // Instead, we can return a specific response or let the caller handle it.
      // However, for a server action/component, we usually want to redirect.
      // Let's rely on middleware for initial protection, but if an API call fails with 401
      // (e.g. token expired mid-session), we should probably redirect.

      // Since this is a utility function used in server components/actions, 
      // utilizing `redirect` from `next/navigation` is valid but throws NEXT_REDIRECT.
      redirect("/login");
    }

    return {
      data: null as unknown as T,
      statusCode: err.statusCode || 500,
      success: false,
      message: err.message || 'An error occurred',
      ...(err.metadata ? { metadata: err.metadata as Metadata } : {}),
      ...(err.error ? { error: String(err.error) } : {}),
      ...(err.code ? { code: err.code } : {})
>>>>>>> 1a19ced (chore: update service folders from local)
    };
  }
}
