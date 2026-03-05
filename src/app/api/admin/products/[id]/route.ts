import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth-admin";
import { deleteProduct, getProductById, updateProduct } from "@/lib/products-data";
import { normalizeProductImages, type Product } from "@/lib/products";
import { normalizeColorImagesMap } from "@/lib/product-options";
import { collectProductBlobImageUrls, deleteBlobUrls, getRemovedBlobImageUrls } from "@/lib/blob-storage";
import { ADMIN_LIMITS, imagesPerColorLimitMessage, imagesPerProductLimitMessage } from "@/lib/admin-limits";

type Params = { params: Promise<{ id: string }> };

export async function DELETE(_request: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getProductById(id);
  const ok = await deleteProduct(id);
  if (!ok) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  await deleteBlobUrls(collectProductBlobImageUrls(existing));
  revalidateTag("products", "max");
  return NextResponse.json({ ok: true });
}

export async function PUT(request: NextRequest, { params }: Params) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const { id } = await params;
  const existing = await getProductById(id);
  if (!existing) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const input: Partial<Product> = {};

  if (body.name != null) input.name = String(body.name).trim();
  if (typeof body.price === "number") input.price = body.price;
  if (body.category != null) input.category = String(body.category).trim();
  if (body.universe === "mode") input.universe = "mode";

  if (body.image != null || body.images != null) {
    const normalizedImages = normalizeProductImages(body.images, body.image);
    if (normalizedImages.length === 0) {
      return NextResponse.json({ error: "At least one product image is required." }, { status: 400 });
    }
    if (normalizedImages.length > ADMIN_LIMITS.maxImagesPerProduct) {
      return NextResponse.json(
        { error: imagesPerProductLimitMessage(ADMIN_LIMITS.maxImagesPerProduct) },
        { status: 400 }
      );
    }
    input.image = normalizedImages[0];
    input.images = normalizedImages;
  }

  if (body.description != null) input.description = String(body.description).trim();
  if (body.color != null) input.color = String(body.color).trim() || undefined;
  if (body.colorImages != null) {
    const normalizedColorImages = normalizeColorImagesMap(body.colorImages);
    for (const [color, list] of Object.entries(normalizedColorImages)) {
      if (list.length > ADMIN_LIMITS.maxImagesPerColor) {
        return NextResponse.json(
          { error: imagesPerColorLimitMessage(ADMIN_LIMITS.maxImagesPerColor, color) },
          { status: 400 }
        );
      }
    }
    input.colorImages = normalizedColorImages;
  }
  if (Array.isArray(body.sizes)) input.sizes = body.sizes.map((s: unknown) => String(s));

  const product = await updateProduct(id, input);
  if (!product) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  await deleteBlobUrls(getRemovedBlobImageUrls(existing, product));
  revalidateTag("products", "max");
  return NextResponse.json(product);
}
