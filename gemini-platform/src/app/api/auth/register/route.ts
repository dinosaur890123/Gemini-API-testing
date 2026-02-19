
import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import bcrypt from "bcrypt";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

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

    return NextResponse.json({
      message: "User created successfully",
      user: { id: newUser.id, email: newUser.email, name: newUser.name }
    });

  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
