import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth-admin";
import { createModeSubcategory, getModeSubcategoryInfos } from "@/lib/categories-data";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const subcategories = await getModeSubcategoryInfos();
  return NextResponse.json(subcategories);
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  if (!name) {
    return NextResponse.json({ error: "Subcategory name is required." }, { status: 400 });
  }

  try {
    const result = await createModeSubcategory(name);
    revalidateTag("products", "max");
    return NextResponse.json(result, { status: result.created ? 201 : 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create subcategory.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
