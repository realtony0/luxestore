import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdmin } from "@/lib/auth-admin";
import { getProducts, addProduct } from "@/lib/products-data";
import { normalizeProductImages, type Product } from "@/lib/products";
import { normalizeColorImagesMap } from "@/lib/product-options";

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
  const normalizedColorImages = normalizeColorImagesMap(colorImages);
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
