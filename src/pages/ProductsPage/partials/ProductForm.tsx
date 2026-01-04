import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Image as ImageIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCategories } from "@/hooks/useCategories";
import { supabase } from "@/lib/supabase";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

// 1. Định nghĩa Schema Validation (Zod)
const productSchema = z.object({
  // Nhóm thông tin cơ bản
  vietnameseName: z.string().min(2, "Tên tiếng Việt phải có ít nhất 2 ký tự"),
  englishName: z.string().min(2, "Tên tiếng Anh phải có ít nhất 2 ký tự"),
  slug: z.string().min(1, "Slug không được để trống"), // Có thể auto-generate từ name

  // Nhóm phân loại
  category: z.string({ error: "Vui lòng chọn danh mục" }),

  // Nhóm giá cả & kho
  basePrice: z.coerce.number().min(0, "Giá gốc không được âm"),
  active: z.boolean().default(true),

  // Nhóm mô tả (Optional)
  vietnameseDescription: z.string().optional(),
  englishDescription: z.string().optional(),

  // Hình ảnh
  image: z.any().optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export default function ProductForm({
  existingProduct,
}: {
  existingProduct?: Partial<ProductFormValues> & { id: string };
}) {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  // State để hiển thị preview ảnh (Client side only)
  const [imagePreview, setImagePreview] = useState<string | null>(
    existingProduct?.image || null
  );
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(data: ProductFormValues) {
    setIsLoading(true);

    const selectedCategoryName =
      categories?.find((c) => c.id === data.category)?.slug || "fruit-tea";
    try {
      let imageUrl = existingProduct?.image || null; // Mặc định là null nếu không up ảnh

      // BƯỚC 1: XỬ LÝ UPLOAD ẢNH (Nếu người dùng có chọn ảnh)
      // data.image ở đây chính là File object lấy từ input type="file"
      if (data.image instanceof File) {
        const file = data.image;

        // Tạo tên file duy nhất để tránh bị trùng đè (dùng timestamp)
        // Ví dụ: 171548392-tra-sua-duong-den.png
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Upload lên Bucket 'products'
        const { error: uploadError } = await supabase.storage
          .from(`products/${selectedCategoryName}`) // Tên bucket bạn tạo ở Phần 1
          .upload(filePath, file);

        if (uploadError) {
          return toast.error("Upload product image failed", {
            description: uploadError.message,
          });
        }

        // Lấy đường dẫn public (để lưu vào DB)
        const { data: urlData } = supabase.storage
          .from(`products/${selectedCategoryName}`)
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
      }

      let productId = existingProduct?.id;

      // --- 2. XỬ LÝ BẢNG PRODUCTS (CHA) ---
      const productData = {
        base_price: data.basePrice,
        image_url: imageUrl,
        category_id: data.category,
        is_active: data.active,
        slug: data.slug,
      };

      if (existingProduct) {
        // UPDATE
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", productId);
        if (error) {
          return toast.error("Update product failed", {
            description: error.message,
          });
        }
      } else {
        // CREATE: Phải dùng .select().single() để lấy ID vừa tạo
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert(productData)
          .select()
          .single();
        if (error) {
          return toast.error("Create product failed", {
            description: error.message,
          });
        }
        productId = newProduct.id;
      }

      // --- 3. XỬ LÝ BẢNG PRODUCT_TRANSLATIONS (CON) ---
      // Chuẩn bị mảng translation
      const translationsData = [
        {
          product_id: productId,
          locale: "vi",
          name: data.vietnameseName,
          description: data.vietnameseDescription,
        },
        {
          product_id: productId,
          locale: "en",
          name: data.englishName,
          description: data.englishDescription,
        },
      ];

      // Dùng upsert: Tự động Insert nếu chưa có, Update nếu đã có (dựa vào constraint Bước 0)
      const { error: transError } = await supabase
        .from("product_translations")
        .upsert(translationsData, { onConflict: "product_id, locale" });

      if (transError) {
        return toast.error("Save product translations failed", {
          description: transError.message,
        });
      }

      toast.success("Save product successfully");
    } catch (e) {
      return toast.error("An error occured", {
        description: (e as Error).message,
      });
    } finally {
      setIsLoading(false);
    }
  }
  // 2. Khởi tạo Form
  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      vietnameseName: "",
      englishName: "",
      slug: "",
      vietnameseDescription: "",
      englishDescription: "",
      basePrice: 0,
      active: true,
      category: "",
      image: "",
    },
  });

  // Hàm giả lập xử lý upload ảnh để hiện preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      form.setValue("image", file);
    }
  };

  useEffect(() => {
    if (existingProduct) {
      // 1. Set giá trị cho các ô input text/number
      form.reset({
        vietnameseName: existingProduct.vietnameseName,
        englishName: existingProduct.englishName,
        slug: existingProduct.slug,
        basePrice: existingProduct.basePrice,
        active: existingProduct.active,
        category: existingProduct.category,
        vietnameseDescription: existingProduct.vietnameseDescription,
        englishDescription: existingProduct.englishDescription,
        // Vì input type="file" không nhận giá trị string URL
        image: undefined,
      });
    }
  }, [existingProduct, form]);

  return (
    <div className="min-h-screen">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-9 w-9 border-border bg-card hover:bg-accent text-muted-foreground"
                onClick={() => window.history.back()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold tracking-tight">
                {existingProduct ? "Update Product" : "Create Product"}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button disabled={isLoading} type="submit">
                {isLoading && <Spinner />}
                Save
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {/* Left Column - Picture */}
            <div className="space-y-8">
              {/* Product Images Card */}
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base font-semibold">
                    Product Image
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1">
                  {!imagePreview ? (
                    <div className="h-full flex-1 border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center space-y-4 transition-colors hover:bg-accent/5 relative">
                      {/* Hidden Input File */}
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                      />
                      <div className="p-3 border rounded-full">
                        <ImageIcon
                          size={24}
                          className="text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          Drop or click to upload an image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG or JPG (max 5MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex-1 flex relative rounded-lg overflow-hidden border border-border w-full aspect-video md:w-1/2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="object-cover w-full h-full"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={() => {
                          setImagePreview(null);
                          form.setValue("image", null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Left Column - Product Details & Images */}
            <div className="xl:col-span-2 space-y-8">
              {/* Product Details Card */}
              <Card className="border-border shadow-sm">
                <CardHeader className="flex justify-between">
                  <CardTitle className="text-base font-semibold">
                    Product Details
                  </CardTitle>
                  <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                      <FormItem className="flex gap-4">
                        <FormLabel>Active</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Field: Name */}
                    <FormField
                      control={form.control}
                      name="vietnameseName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vietnamese name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: Trà sữa Trân Châu Đường Đen"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="englishName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>English name</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Tea Latte" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ex: tra-sua-tran-chau-duong-den"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    {/* Field: Category */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          {!Array.isArray(categories) || categoriesLoading ? (
                            <Skeleton className="h-8 w-full" />
                          ) : (
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.isArray(categories) &&
                                  categories.map((category) => (
                                    <SelectItem
                                      key={category.id}
                                      value={category.id}
                                    >
                                      {category.name}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Field: Base Price */}
                    <FormField
                      control={form.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base price (VNĐ)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              value={(field.value as number | string) ?? ""}
                              onChange={(e) => {
                                const val =
                                  e.target.value === ""
                                    ? undefined
                                    : Number(e.target.value);
                                field.onChange(val);
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Field: Description */}
                    <FormField
                      control={form.control}
                      name="vietnameseDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Vietnamese description (Optional)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter Vietnamese description..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="englishDescription"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>English description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter English description..."
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
