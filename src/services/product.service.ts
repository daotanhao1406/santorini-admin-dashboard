import { supabase } from "@/lib/supabase";
import type { IProduct } from "@/types/product.type";

export const getProducts = async (): Promise<IProduct[]> => {
  // 1. Gọi Supabase
  const { data, error } = await supabase
    .from("products") // Giả sử tên bảng trong DB là 'products'
    .select(
      `
      *,
      product_translations (
        id,
        name,
        description
      ),
      categories (
        id,
        category_translations (
          name
        )
      )
      `
    )
    .eq("product_translations.locale", "vi")
    .eq("categories.category_translations.locale", "vi")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // 2. Transform Data: Biến dữ liệu thô từ DB thành format đẹp cho UI
  // Giả sử DB trả về: created_at (ISO string), price (number)
  return data.map((item) => {
    const translation = item.product_translations?.[0];
    let categoryName = "Chưa phân loại";
    if (Array.isArray(item?.categories?.category_translations)) {
      categoryName = item?.categories?.category_translations[0]?.name;
    }
    return {
      ...item,
      name: translation?.name,
      description: translation?.description,
      category: categoryName,
    };
  });
};
