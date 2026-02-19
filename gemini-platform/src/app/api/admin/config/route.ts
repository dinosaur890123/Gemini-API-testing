// src/app/api/admin/config/route.ts
import { NextResponse } from "next/server";
import { getConfig, updateConfig } from "@/lib/config";

// Force dynamic to prevent caching issues
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getConfig());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Validate updates
    if (typeof body.rateLimit === 'number' && body.rateLimit < 0) {
      return NextResponse.json({ error: "Invalid rate limit" }, { status: 400 });
    }

    updateConfig(body);
    return NextResponse.json({ message: "Configuration updated successfully", config: getConfig() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update configuration" }, { status: 500 });
  }
}
