import { fetcherBase } from "@/services/base";
import { NextResponse, type NextRequest } from "next/server";

async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const pathname = url.pathname.replace("/api", "");
  const searchParams = url.searchParams;

  try {
    const contentType = request.headers.get("content-type");
    let body: string | FormData | undefined;

    // Handle multipart form data (file uploads)
    if (contentType?.includes("multipart/form-data")) {
      body = await request.formData();
    } else if (request.body) {
      body = await request.text();
    }

    const res = await fetcherBase(`${pathname}?${searchParams.toString()}`, {
      body,
      method: request.method,
      next: { revalidate: 0 },
    });

    // Check if response is a Response object (binary data like PDF)
    if (res instanceof Response) {
      const responseContentType = res.headers.get("content-type");

      // If it's a binary file (PDF, images, etc.), return the response as-is
      if (
        responseContentType?.includes("application/pdf") ||
        responseContentType?.includes("application/octet-stream") ||
        responseContentType?.includes("image/")
      ) {
        const blob = await res.blob();

        return new NextResponse(blob, {
          status: res.status,
          headers: {
            "Content-Type": responseContentType,
            "Content-Disposition": res.headers.get("content-disposition") || "",
          },
        });
      }
    }

    return NextResponse.json(res);
  } catch (error) {
    return NextResponse.json(error, { status: 500 });
  }
}

export { proxy as DELETE, proxy as GET, proxy as POST, proxy as PUT };

