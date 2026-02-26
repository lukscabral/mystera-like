import { ITEM_DATABASE } from "../data/items.js";

export default class ItemFactory {

    static create(itemId, quantity = 1) {
        const template = ITEM_DATABASE[itemId];

        if (!template) {
            console.warn("Item não existe: ",itemId);
            return null;
        }

        const itemInstance = 
        {
            id: template.id,
            name: template.name,
            type: template.type,
            sprite: template.sprite,
            stackable: template.stackable,
            maxStack: template.maxStack || 1,
            quantity: template.stackable ? quantity : 1
        };

        if (template.stats) {
            itemInstance.stats = { ...template.stats };
        }

        if (template.effects) {
            itemInstance.effects = { ...template.effects };
        }

        if (template.durability) {
            itemInstance.durability = {
                current: template.durability.max,
                max: template.durability.max
            };
        }

        return itemInstance;
    }
}