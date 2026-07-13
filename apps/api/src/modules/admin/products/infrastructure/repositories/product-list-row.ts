export interface ProductListRow {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  category_name: string;
  price: string;
  status: string;
  rating: number;
  review_count: number;
  created_at: Date;
  stock_total: number;
  main_image_url: string | null;
}
