
import { NextRequest, NextResponse } from "next/server";
import { getLogs } from "@/lib/logger";

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const logs = await getLogs();
  return NextResponse.json(logs);
}

