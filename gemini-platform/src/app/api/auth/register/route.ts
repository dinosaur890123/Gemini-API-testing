
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";
import { addLog } from "@/lib/logger";

function getRequestIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || null;
  return req.headers.get("x-real-ip") || null;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    const ip = getRequestIp(req);
    const userAgent = req.headers.get("user-agent");
    const path = new URL(req.url).pathname;
    const method = req.method;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser && existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name",
      [email, hashedPassword, name || email.split("@")[0]]
    );

    const newUser = result?.rows[0];

    await addLog({
      event_type: "register",
      message: `New user registered: ${email}`,
      user_email: email,
      user_id: newUser?.id ?? null,
      ip,
      user_agent: userAgent,
      path,
      method,
    });

    return NextResponse.json({
      message: "User created successfully",
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });

  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
