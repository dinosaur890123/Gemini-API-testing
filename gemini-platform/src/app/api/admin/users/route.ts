
import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(req: Request) {
  // Authentication handled by middleware (checks admin_session cookie)
  
  try {
    // Fetch users with count of their chats
    const result = await query(`
      SELECT 
        u.id, 
        u.email, 
        u.name, 
        u.created_at,
        COUNT(c.id) as chat_count
      FROM users u
      LEFT JOIN chats c ON u.id = c.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT 100
    `);

    return NextResponse.json(result?.rows || []);
  } catch (error) {
    console.error("Admin Users Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    await query("DELETE FROM users WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Delete User Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
