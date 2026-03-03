import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth-admin";
import { createCategory, getCategoryInfos } from "@/lib/categories-data";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const categories = await getCategoryInfos();
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Category name is required." }, { status: 400 });
  }

  try {
    const result = await createCategory(name);
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create category.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
