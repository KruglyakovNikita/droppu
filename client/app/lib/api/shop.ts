import apiService from ".";

export interface ShopItem {
  name: string;
  description: string;
  coin_price: number;
  star_price: number;
  inventory_item_id: number;
  is_available: boolean;
  inventory_item: {
    name: string;
    description: string;
    item_type: string;
    rarity: string;
    image_url: string;
    animation_url: string;
    id: number;
  };
  id: number;
}

interface PurchaseRequest {
  item_id: number;
  quantity: number;
  currency: string;
}

export const getShopItems = async () => {
  const response = await apiService.get<ShopItem[]>("/api/v1/shop/items");
  return response;
};

export const purchaseItem = async (data: PurchaseRequest) => {
  const response = await apiService.post("/api/v1/shop/purchase", data);
  return response;
}; 