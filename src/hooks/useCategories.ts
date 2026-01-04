import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/category.service";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"], // Key định danh cache
    queryFn: getCategories, // Hàm fetch data
    staleTime: 1000 * 60, // Data cũ sau 1 phút (tùy chỉnh)
  });
};
