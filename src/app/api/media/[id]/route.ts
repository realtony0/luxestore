import { NextRequest, NextResponse } from "next/server";
import { ensureTable, getDb } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: Params) {
  const sql = getDb();
  if (!sql) {
    return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing image id." }, { status: 400 });
  }

  try {
    await ensureTable();

    const rows = await sql`
      SELECT mime_type, data_base64
      FROM media_assets
      WHERE id = ${id}
      LIMIT 1
    `;

    const row = (rows as Array<{ mime_type: string; data_base64: string }>)[0];
    if (!row || typeof row.data_base64 !== "string" || !row.data_base64) {
      return new NextResponse("Not found", { status: 404 });
    }

    const body = Buffer.from(row.data_base64, "base64");
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": row.mime_type || "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to load image." }, { status: 500 });
  }
}
