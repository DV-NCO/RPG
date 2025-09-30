import InventorySystem from './Inventory';
import { ItemDefinition } from './Items';

export interface ShopItem {
  item: ItemDefinition;
  quantity: number;
}

export default class ShopSystem {
  constructor(private readonly inventory: InventorySystem) {}

  purchase(shopItem: ShopItem): boolean {
    const cost = shopItem.item.price;
    if (!this.inventory.spendCredits(cost)) {
      return false;
    }
    this.inventory.addItem(shopItem.item.id, shopItem.quantity);
    this.inventory.applyItemEffect(shopItem.item);
    return true;
  }
}
