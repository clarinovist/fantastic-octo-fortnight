export function clientFetch<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const contentTypeParams: Record<string, string> =
    init?.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" };

  return fetch(input, {
    ...init,
    headers: {
      "X-Api-Proxy": "true",
      ...contentTypeParams,
      ...init?.headers,
    },
    next: { revalidate: 0 },
  })
    .then((res) => {
      if (!res.ok) {
        throw res;
      }
      return res.json();
    })
    .then((data) => {
      return data.data as T;
    })
    .catch(async (err) => {
      console.error("Error Fetching Data:", err);
      // JSON is not available in the error object, for example when the request is aborted
      if ("json" in err) {
        const errorData = await err.json();
        throw {
          ...errorData,
          status: err?.status,
        };
      }

      throw err;
    });
}
export function clientFetchRaw<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  const contentTypeParams: Record<string, string> =
    init?.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" };

  return fetch(input, {
    ...init,
    headers: {
      "X-Api-Proxy": "true",
      ...contentTypeParams,
      ...init?.headers,
    },
    next: { revalidate: 0 },
  })
    .then((res) => {
      if (!res.ok) {
        throw res;
      }
      return res.json();
    })
    .then((data) => {
      console.log("Raw Data:", data);
      return data as T;
    })
    .catch(async (err) => {
      console.error("Error Fetching Data:", err);
      // JSON is not available in the error object, for example when the request is aborted
      if ("json" in err) {
        const errorData = await err.json();
        throw {
          ...errorData,
          status: err?.status,
        };
      }

      throw err;
    });
}
