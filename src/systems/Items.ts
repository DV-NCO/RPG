export interface ItemDefinition {
  id: string;
  name: string;
  description: string;
  type: 'equipment' | 'consumable' | 'charm' | 'key';
  price: number;
}

export function loadItemDefinitions(data: Record<string, { name: string; description: string; type: string; price: number }>): ItemDefinition[] {
  return Object.entries(data).map(([id, value]) => ({
    id,
    name: value.name,
    description: value.description,
    type: value.type as ItemDefinition['type'],
    price: value.price,
  }));
}
