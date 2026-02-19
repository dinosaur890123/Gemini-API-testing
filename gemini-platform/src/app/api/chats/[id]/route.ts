
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { query } from "@/lib/db";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const result = await query(
      "SELECT * FROM chats WHERE id = $1 AND user_id = $2",
      [params.id, (session.user as any).id]
    );

    if (!result?.rows.length) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { messages, title } = await req.json();
    
    // Build update query dynamically if needed, but for now simple
    const result = await query(
      "UPDATE chats SET messages = $1, title = COALESCE($2, title), updated_at = NOW() WHERE id = $3 AND user_id = $4 RETURNING *",
      [JSON.stringify(messages), title, params.id, (session.user as any).id]
    );

    if (!result?.rows.length) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await query("DELETE FROM chats WHERE id = $1 AND user_id = $2", [params.id, (session.user as any).id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
