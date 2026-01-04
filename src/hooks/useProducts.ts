// src/hooks/use-products.ts
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/product.service";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"], // Key định danh cache
    queryFn: getProducts, // Hàm fetch data
    staleTime: 1000 * 60, // Data cũ sau 1 phút (tùy chỉnh)
  });
};
