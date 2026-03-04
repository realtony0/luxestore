import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { isAdmin } from "@/lib/auth-admin";
import { ensureTable, getDb } from "@/lib/db";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_IMAGE_SIDE = 1800;
const WEBP_QUALITY = 82;

export const runtime = "nodejs";

async function optimizeImage(file: File): Promise<Buffer> {
  const input = Buffer.from(await file.arrayBuffer());

  return sharp(input, {
    failOn: "none",
    limitInputPixels: 40_000_000,
  })
    .rotate()
    .resize(MAX_IMAGE_SIDE, MAX_IMAGE_SIDE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toBuffer();
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data." },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "File must be an image." }, { status: 400 });
  }

  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: "Invalid image. Max size: 8MB." },
      { status: 400 }
    );
  }

  const sql = getDb();
  if (!sql) {
    return NextResponse.json(
      { error: "Database is required for uploads. Set DATABASE_URL." },
      { status: 500 }
    );
  }

  try {
    await ensureTable();
    const optimized = await optimizeImage(file);
    const id = crypto.randomUUID();
    const dataBase64 = optimized.toString("base64");
    const mimeType = "image/webp";
    await sql`
      INSERT INTO media_assets (id, mime_type, data_base64)
      VALUES (${id}, ${mimeType}, ${dataBase64})
    `;

    return NextResponse.json({ url: `/api/media/${id}` }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Image upload failed." }, { status: 500 });
  }
}
