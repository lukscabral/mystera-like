export default class InventorySystem {

    constructor(owner, size = 20) {
        this.owner = owner;
        this.size = size;
        this.items = [];
    }

    addItem(item) {

        //se estackavel tenta somar
        if (item.stackable) {

            let existing = this.items.find(
                i => i.id === item.id && i.quantity < i.maxStack
            );

            if (existing) {

                const space = existing.maxStack - existing.quantity;

                const amountToAdd = Math.min(space, item.quantity);

                existing.quantity += amountToAdd;
                item.quantity -= amountToAdd;

                if (item.quantity <= 0) {
                    return true;
                }               
            }
        }

        //verificar espaço
        if (this.items.lenght >= this.size) {
            console.log("Inventario cheio");
            return false;
        }

        this.items.push({ ...item });
        return true;
    }

    removeItem(itemId, quantity = 1) {

        const index = this.items.findIndex(
            i => i.id === itemId
        );

        if (index === -1) return false;

        const item = this.items[index];

        if (item.stackable) {
            item.quantity -= quantity;

            if (item.quantity <= 0) {
                this.items.splice(index, 1);
            }
        } else {
            this.items.splice(index, 1);
        }

        return true;
    }

    getItem(itemId) {
        return this.items.find(i => i.id === itemId);
    }

    useItem(itemId) {

        const item = this.getItem(itemId);
        if (!item) return false;

        if (item.type === "consumable") {

            if (item.is === "small_potion") {
                this.owner.heal(20);
            }

            this.removeItem(itemId, 1);
            return true;
        }

        return false;
    }

}