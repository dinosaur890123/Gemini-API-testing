
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  // Authentication handled by middleware (checks admin_session cookie)
  
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  try {
    if (id) {
       // Fetch specific chat details including messages
       const result = await query(`
        SELECT 
          c.id, 
          c.title, 
          c.messages,
          c.created_at, 
          c.updated_at,
          u.email as user_email,
          u.name as user_name
        FROM chats c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = $1
      `, [id]);
      
      if (result?.rows.length === 0) {
        return NextResponse.json({ error: "Chat not found" }, { status: 404 });
      }

      return NextResponse.json(result?.rows[0]);
    }

    // Fetch recent chats with user info
    const result = await query(`
      SELECT 
        c.id, 
        c.title, 
        c.created_at, 
        c.updated_at,
        u.email as user_email,
        u.name as user_name
      FROM chats c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.updated_at DESC
      LIMIT 100
    `);

    return NextResponse.json(result?.rows || []);
  } catch (error) {
    console.error("Admin Chats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await query("DELETE FROM chats WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Delete Chat Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
