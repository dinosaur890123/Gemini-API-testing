
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await query(
      "SELECT id, title, created_at, updated_at FROM chats WHERE user_id = $1 ORDER BY updated_at DESC",
      [(session.user as any).id]
    );
    return NextResponse.json(result?.rows || []);
  } catch (error) {
    console.error("Error fetching chats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, messages } = await req.json();

    const result = await query(
      "INSERT INTO chats (user_id, title, messages) VALUES ($1, $2, $3) RETURNING id, title, created_at",
      [(session.user as any).id, title || "New Chat", JSON.stringify(messages || [])]
    );

    return NextResponse.json(result?.rows[0]);
  } catch (error) {
    console.error("Error creating chat:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
