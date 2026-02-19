// src/app/api/setup-db/route.ts
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    // Check if connected
    const test = await query("SELECT NOW()");
    if (!test) {
      return NextResponse.json({ 
        status: "error", 
        message: "Database not connected. Please add POSTGRES_URL to your environment variables." 
      }, { status: 500 });
    }

    // Create logs table if not exists
    await query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        message TEXT NOT NULL
      );
    `);

    return NextResponse.json({ status: "success", message: "Database table 'logs' created successfully." });
  } catch (error: any) {
    return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
  }
}
