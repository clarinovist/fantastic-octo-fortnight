import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get("url")

  if (!url) {
    return NextResponse.json({ success: false, error: "No URL provided" }, { status: 400 })
  }

  try {
    // Fetch the URL without following redirects first to get headers
    const response = await fetch(url, {
      redirect: "manual",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MapResolver/1.0)",
      },
    })

    // Get the Location header that contains the redirect URL
    const location = response.headers.get("location")
<<<<<<< HEAD
    console.log("Location header:", location)

=======
>>>>>>> 1a19ced (chore: update service folders from local)
    if (location) {
      return NextResponse.json({ success: true, resolvedUrl: location })
    }

    return NextResponse.json({ success: false, error: "No redirect found" })
  } catch (error) {
    console.error("Error resolving URL:", error)
    return NextResponse.json({ success: false, error: "Failed to resolve URL" }, { status: 500 })
  }
}
