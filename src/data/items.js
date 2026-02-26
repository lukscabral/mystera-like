export const ITEM_DATABASE = {

    small_potion: {
        id: "small_potion",
        name: "Small Potion",
        type: "consumable",
        stackable: true,
        maxStack: 10,
        sprite: "small_potion",
        effects: {
            heal: 20
        }
    },

    sword_iron: {
        id: "sword_iron",
        name: "Iron Sword",
        type: "weapon",
        stackable: false,
        sprite: "sword_iron",

        stats: {
            attack: 5
        },

        durability: {
            max: 40
        }
    },

    helmet_leather: {
        id: "helmet_leather",
        name: "Leather Helmet",
        type: "armor",
        stackable: false,
        sprite: "helmet_leather",

        stats: {
            defense: 3
        },

        durability: {
            max: 30
        }
    }
}