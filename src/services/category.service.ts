import { supabase } from "@/lib/supabase";

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  image_url: string;
}

export const getCategories = async (): Promise<CategoryItem[]> => {
  // 1. Gọi Supabase
  const { data, error } = await supabase
    .from("categories")
    .select(
      `
        *,
        category_translations (
            name
        )
        `
    )
    .eq("category_translations.locale", "vi")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  // 2. Transform Data: Biến dữ liệu thô từ DB thành format đẹp cho UI
  // Giả sử DB trả về: created_at (ISO string), price (number)
  return data.map((item) => {
    const translation = item.category_translations?.[0];
    return {
      ...item,
      name: translation?.name,
    };
  });
};
