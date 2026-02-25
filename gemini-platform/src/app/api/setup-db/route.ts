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
        message TEXT NOT NULL,
        event_type TEXT,
        user_id TEXT,
        user_email TEXT,
        ip TEXT,
        user_agent TEXT,
        path TEXT,
        method TEXT,
        chat_id TEXT,
        metadata JSONB
      );
    `);

    // Upgrade existing logs table (safe no-ops if already present)
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS event_type TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS user_id TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS user_email TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS ip TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS user_agent TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS path TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS method TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS chat_id TEXT;`);
    await query(`ALTER TABLE logs ADD COLUMN IF NOT EXISTS metadata JSONB;`);

    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Create chats table
    await query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT,
        messages JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    return NextResponse.json({ status: "success", message: "Database tables created successfully." });
  } catch (error: unknown) {
    return NextResponse.json(
      { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
