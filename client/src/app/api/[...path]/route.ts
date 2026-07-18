import { NextRequest, NextResponse } from "next/server";

async function handleProxy(
  request: NextRequest,
  method: string,
  pathPromise: Promise<{ path: string[] }>
) {
  try {
    const { path } = await pathPromise;
    const pathString = path.join("/");
    const searchParams = request.nextUrl.searchParams.toString();
    
    // Read the backend URL dynamically at runtime from environment variables
    const backendUrl = process.env.BACKEND_API_URL || "http://nuc-stats-server:8000";
    const targetUrl = `${backendUrl}/api/${pathString}${searchParams ? `?${searchParams}` : ""}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Forward the API key if present in the incoming headers
    const apiKey = request.headers.get("x-api-key");
    if (apiKey) {
      headers["x-api-key"] = apiKey;
    }

    const fetchOptions: RequestInit = {
      method: method,
      headers: headers,
    };

    // Forward the request body for POST requests
    if (method === "POST") {
      const bodyText = await request.text();
      if (bodyText) {
        fetchOptions.body = bodyText;
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, "GET", params);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleProxy(request, "POST", params);
}
