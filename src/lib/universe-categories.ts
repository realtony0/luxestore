export const MODE_CATEGORIES = [
  "Clothes",
  "Shoes",
  "Wigs",
  "Sunglasses",
  "Bags & more",
] as const;

export const MODE_CLOTHING_SUBCATEGORIES = [
  "Tshirts",
  "Pants",
  "Shirts",
  "Polos",
  "Sets",
  "Hoodies",
] as const;

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim();
}

type ModeClothingSubcategory = (typeof MODE_CLOTHING_SUBCATEGORIES)[number];

function detectModeClothingSubcategory(rawCategory: string): ModeClothingSubcategory | null {
  const category = normalize(rawCategory);

  if (
    category.includes("tshirt") ||
    category.includes("t-shirt") ||
    category.includes("t shirt") ||
    category.includes("tee shirt") ||
    category.includes("tee-shirt") ||
    category.includes("tee")
  ) {
    return "Tshirts";
  }

  if (
    category.includes("pantalon") ||
    category.includes("jean") ||
    category.includes("pant") ||
    category.includes("trouser")
  ) {
    return "Pants";
  }

  if (category.includes("chemise") || category.includes("shirt")) {
    return "Shirts";
  }

  if (category.includes("lacoste") || category.includes("polo")) {
    return "Polos";
  }

  if (category.includes("set") || category.includes("ensemble")) {
    return "Sets";
  }

  if (
    category.includes("pull") ||
    category.includes("sweat") ||
    category.includes("hoodie") ||
    category.includes("sweatshirt")
  ) {
    return "Hoodies";
  }

  return null;
}

export function mapModeCategory(rawCategory: string): (typeof MODE_CATEGORIES)[number] {
  const category = normalize(rawCategory);
  const clothingSubcategory = detectModeClothingSubcategory(rawCategory);

  if (clothingSubcategory) return "Clothes";
  if (category.includes("cloth") || category.includes("wear") || category.includes("vetement")) {
    return "Clothes";
  }
  if (category.includes("shoe") || category.includes("sneaker") || category.includes("chaussure")) {
    return "Shoes";
  }
  if (category.includes("wig") || category.includes("perruque")) {
    return "Wigs";
  }
  if (category.includes("sunglass") || category.includes("lunette")) {
    return "Sunglasses";
  }
  if (
    category.includes("bag") ||
    category.includes("sac") ||
    category.includes("accessoire") ||
    category.includes("maroquinerie")
  ) {
    return "Bags & more";
  }

  return "Bags & more";
}

export function mapModeSubcategory(rawCategory: string): ModeClothingSubcategory | null {
  return detectModeClothingSubcategory(rawCategory);
}

export function matchModeSubcategory(
  rawCategory: string,
  subcategories: readonly string[] = []
): string | null {
  const category = normalize(rawCategory);
  const directMatch = subcategories.find((subcategory) => normalize(subcategory) === category);
  if (directMatch) return directMatch;
  return detectModeClothingSubcategory(rawCategory);
}

export function resolveModeDisplayCategory(
  rawCategory: string,
  subcategories: readonly string[] = []
): { category: (typeof MODE_CATEGORIES)[number]; subCategory: string | null } {
  const subCategory = matchModeSubcategory(rawCategory, subcategories);
  if (subCategory) {
    return { category: "Clothes", subCategory };
  }
  return { category: mapModeCategory(rawCategory), subCategory: null };
}

export function normalizeModeCategoryInput(rawCategory: string): string {
  const category = normalize(rawCategory);
  const clothingSubcategory = detectModeClothingSubcategory(rawCategory);
  if (clothingSubcategory) return clothingSubcategory;

  if (category.includes("cloth") || category.includes("wear") || category.includes("vetement")) return "Clothes";
  if (category.includes("shoe") || category.includes("sneaker") || category.includes("chaussure")) return "Shoes";
  if (category.includes("wig") || category.includes("perruque")) return "Wigs";
  if (category.includes("sunglass") || category.includes("lunette")) return "Sunglasses";
  if (
    category.includes("bag") ||
    category.includes("sac") ||
    category.includes("accessoire") ||
    category.includes("maroquinerie")
  ) {
    return "Bags & more";
  }

  return rawCategory.trim();
}
