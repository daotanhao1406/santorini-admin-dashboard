import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import ProductForm, { type ProductFormValues } from "./partials/ProductForm";
import type { IProduct, IProductTranslation } from "@/types/product.type";

const mapSupabaseDataToFormValues: (
  data: Partial<IProduct> & { product_translations: IProductTranslation[] }
) => Partial<ProductFormValues> & { id: string | undefined } = (
  data: Partial<IProduct> & { product_translations: IProductTranslation[] }
) => {
  // 1. Tách thông tin translation
  const viData = data.product_translations?.find((t) => t.locale === "vi");
  const enData = data.product_translations?.find((t) => t.locale === "en");

  // 2. Map sang cấu trúc Zod Schema
  return {
    id: data.id, // Giữ lại ID để dùng khi update
    vietnameseName: viData?.name || "",
    englishName: enData?.name || "",
    slug: data.slug || "",
    category: data.category_id || "", // Map snake_case -> camelCase
    basePrice: data.base_price || 0,
    active: data.is_active, // Map is_active -> active
    vietnameseDescription: viData?.description || "",
    englishDescription: enData?.description || "",
    // Lưu ý: image trong schema là File (để upload), còn data.image_url là string
    // Ta cứ trả về image_url để hiển thị preview, nhưng không gán vào field "image" của form
    image: data.image_url,
  };
};

export default function UpdateProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State quản lý dữ liệu và trạng thái loading
  const [productData, setProductData] = useState<
    (Partial<ProductFormValues> & { id: string }) | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;

      try {
        setIsLoading(true);
        // Gọi Supabase với query JOIN bảng translations
        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            product_translations (
              locale,
              name,
              description
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          throw new Error("Không tìm thấy sản phẩm");
        }
        const cleanData = mapSupabaseDataToFormValues(
          data
        ) as Partial<ProductFormValues> & { id: string };
        setProductData(cleanData);
      } catch (err) {
        console.error("Lỗi lấy dữ liệu:", err);
        setError((err as Error).message || "Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  // 1. Màn hình Loading
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center space-x-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Đang tải dữ liệu sản phẩm...</p>
      </div>
    );
  }

  // 2. Màn hình Lỗi (Ví dụ sai ID hoặc mất mạng)
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-xl font-semibold text-destructive">Lỗi: {error}</h2>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
        </Button>
      </div>
    );
  }

  // 3. Màn hình Form (Khi đã có dữ liệu)
  return (
    <div className="container mx-auto">
      {/* Truyền dữ liệu vừa fetch được vào prop existingProduct */}
      <ProductForm existingProduct={productData} />
    </div>
  );
}
