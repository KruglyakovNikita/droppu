import apiService from ".";

export interface InventoryItem {
  id: number;
  user_id: number;
  inventory_item_id: number;
  quantity: number;
  inventory_item: {
    name: string;
    description: string;
    item_type: string;
    rarity: string;
    image_url: string;
    animation_url: string;
    id: number;
  }
}

export const getInventory = async () => {
  const response = await apiService.get<InventoryItem[]>("/api/v1/inventory/my");
  return response;
};

export const equipItem = async (itemId: number) => {
  const response = await apiService.post(`/api/v1/inventory/equip/${itemId}`, {});
  return response;
}; 