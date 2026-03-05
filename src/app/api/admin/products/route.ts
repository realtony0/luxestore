import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth-admin";
import { getProducts, addProduct } from "@/lib/products-data";
import { normalizeProductImages, type Product } from "@/lib/products";
import { normalizeColorImagesMap } from "@/lib/product-options";
import {
  ADMIN_LIMITS,
  imagesPerColorLimitMessage,
  imagesPerProductLimitMessage,
  productLimitReachedMessage,
} from "@/lib/admin-limits";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const products = await getProducts();
  return NextResponse.json(products.filter((product) => product.universe === "mode"));
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  const existingProducts = await getProducts();
  const modeCount = existingProducts.filter((product) => product.universe === "mode").length;
  if (modeCount >= ADMIN_LIMITS.maxProducts) {
    return NextResponse.json(
      { error: productLimitReachedMessage(modeCount, ADMIN_LIMITS.maxProducts) },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const {
    name,
    price,
    category,
    image,
    images,
    description,
    color,
    colorImages,
    sizes,
  } = body;

  const normalizedImages = normalizeProductImages(images, image);
  if (normalizedImages.length > ADMIN_LIMITS.maxImagesPerProduct) {
    return NextResponse.json(
      { error: imagesPerProductLimitMessage(ADMIN_LIMITS.maxImagesPerProduct) },
      { status: 400 }
    );
  }

  const normalizedColorImages = normalizeColorImagesMap(colorImages);
  for (const [color, list] of Object.entries(normalizedColorImages)) {
    if (list.length > ADMIN_LIMITS.maxImagesPerColor) {
      return NextResponse.json(
        { error: imagesPerColorLimitMessage(ADMIN_LIMITS.maxImagesPerColor, color) },
        { status: 400 }
      );
    }
  }

  if (!name || typeof price !== "number" || !category || normalizedImages.length === 0 || !description) {
    return NextResponse.json(
      { error: "Required fields: name, price, category, images/image, description." },
      { status: 400 }
    );
  }

  const input: Omit<Product, "id" | "slug"> = {
    name: String(name).trim(),
    price: Number(price),
    category: String(category).trim(),
    universe: "mode",
    image: normalizedImages[0],
    images: normalizedImages,
    description: String(description).trim(),
  };
  if (color != null) input.color = String(color).trim() || undefined;
  if (Object.keys(normalizedColorImages).length > 0) {
    input.colorImages = normalizedColorImages;
  }
  if (Array.isArray(sizes)) input.sizes = sizes.map((s: unknown) => String(s));

  try {
    const product = await addProduct(input);
    revalidateTag("products", "max");
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Failed to create product." }, { status: 500 });
  }
}
