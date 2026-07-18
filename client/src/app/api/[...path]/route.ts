import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    const pathString = path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    
    // Read the backend URL dynamically at runtime from environment variables
    const backendUrl = process.env.BACKEND_API_URL || "http://nuc-stats-server:8000";
    const targetUrl = `${backendUrl}/api/${pathString}${searchParams ? `?${searchParams}` : ""}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return new NextResponse(await response.text(), { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Failed to proxy request to backend", details: error.message },
      { status: 502 }
    );
  }
}
