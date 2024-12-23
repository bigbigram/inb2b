export interface Category {
  id: number;
  cate_name: string;
  cate_image: string;
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: Category[];
}
