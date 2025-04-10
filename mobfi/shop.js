// shop.js

// Define rarity multipliers for selling (Globally accessible)
const rarityMultipliers = {
    common: 1,
    uncommon: 10,
    rare: 20,
    epic: 50,
    legendary: 100,
    mythic: 500,
    god_tier: 1000
};

class Shop {
    constructor(name) { // Removed inventory parameter
        this.name = name;
        this.inventory = this.initializeInventory(); // Items the shop sells - initializes from global databases
    }

    // Initialize shop inventory dynamically from global databases
    initializeInventory() {
        let shopStock = {};
        const DEFAULT_ITEM_PRICE = 25; // Default price for items from items.js without a price

        // Define the specific items allowed in the shop
        const allowedItemIds = [
            'MED001',
            'MED002',
            'FOOD001',
            'FOOD002',
            'DRUG001',
            'DRUG002'
        ];

        // --- Add only allowed items from items.js (itemsDatabase) ---
        if (typeof itemsDatabase !== 'undefined') {
            allowedItemIds.forEach(id => {
                const item = itemsDatabase.get(id);
                if (item) {
                    shopStock[id] = {
                        ...item, // Spread the original item properties
                        price: item.price || DEFAULT_ITEM_PRICE, // Use defined price or default
                        quantity: Infinity // Shops have infinite stock
                    };
                    // console.log(`Added allowed item to shop: ${item.name} ($${shopStock[id].price})`);
                } else {
                    console.warn(`Item ID ${id} specified for shop but not found in itemsDatabase.`);
                }
            });
        } else {
            console.warn("itemsDatabase not found when initializing shop inventory.");
        }

        // --- Equipment items are no longer added automatically ---

        console.log(`Shop initialized with ${Object.keys(shopStock).length} unique items.`);
        return shopStock;
    }

    // Method to handle buying items from the shop
    buyItem(itemId, player) {
        const item = this.inventory[itemId];
        if (!item) {
            console.error("Item not found in shop inventory.");
            return { success: false, message: "Item not found in shop." };
        }

        const price = item.price || 100; // Use item's price or default equipment price

        if (player.money >= price) {
            player.money -= price;
            // Add item to player inventory - Pass only the item ID
            player.addItemToInventory(item.id); // Pass item.id, not the whole item object
            console.log(`${player.name} bought ${item.name} for $${price}.`);
            // Note: Shop quantity is infinite for these items, so no need to decrement.
             return { success: true, message: `Bought ${item.name} for $${price}.` };
        } else {
            console.log("Not enough money.");
             return { success: false, message: "Not enough money." };
        }
    }

    // Method to handle selling items to the shop
    sellItem(itemId, player) {
        // Find the item in the player's inventory. Need to know the structure.
        // Let's assume player.inventory is an object where keys are item IDs and values have quantity.
        // Or maybe it's an array of item objects. Assuming array for now.
        const itemIndex = player.inventory.findIndex(invItem => invItem.id === itemId);
        if (itemIndex === -1) {
             console.error("Item not found in player inventory.");
             return { success: false, message: "Item not found in your inventory." };
        }

        // --- FIX: Get item definition to retrieve the name ---
        const itemDefinition = itemsDatabase.get(itemId) || equipmentDatabase.get(itemId);
        if (!itemDefinition) {
            console.error(`Cannot sell item: Definition not found for ID ${itemId}`);
            return { success: false, message: `Cannot find details for item ${itemId}.` };
        }
        const itemName = itemDefinition.name; // Get name from definition
        // --- END FIX ---

        const shopItem = this.inventory[itemId]; // Get the item details from the shop's inventory for price check

        if (!shopItem) {
            // This check might be redundant now if itemDefinition was found, but keep as safety
            console.error(`Item ID ${itemId} found in player inventory but definition missing in shop inventory for price check.`);
            return { success: false, message: "Cannot determine sell price for this item." };
        }

        // Calculate sell price based on item definition's rarity and global multiplier
        const rarityName = itemDefinition.rarity ? itemDefinition.rarity.name : 'Common'; // Get name string or default
        const rarityKey = rarityName.toLowerCase().replace('-', '_'); // Convert name string to key
        const multiplier = rarityMultipliers[rarityKey] || 1;
        // const sellPrice = 1 * multiplier; // OLD CALCULATION - Incorrect base price

        // Calculate sell price based on the SHOP'S buy price, applying a sell penalty (e.g., 50%)
        const buyPrice = shopItem.price; // Get the price the shop sells it for
        const sellPenalty = 0.5; // Sell for 50% of buy price (adjust as needed)
        const calculatedSellPrice = Math.floor(buyPrice * sellPenalty); // Calculate sell price, ensuring integer

        // Ensure sell price is at least 1
        const finalSellPrice = Math.max(1, calculatedSellPrice);


        // Add money BEFORE removing the item
        player.money += finalSellPrice; // Use the calculated finalSellPrice

        // Remove item from player inventory using the index found earlier
        player.removeItemFromInventory(itemIndex); // Pass the correct index

        console.log(`${player.name} sold ${itemName} for $${finalSellPrice}.`); // Log using stored name and final price
         return { success: true, message: `Sold ${itemName} for $${finalSellPrice}.` }; // Use stored name and final price
    }

     // Get items available for purchase
    getBuyableItems() {
        // Return a deep copy to prevent direct modification of shop inventory
        return JSON.parse(JSON.stringify(Object.values(this.inventory)));
    }
}

// Example Usage (requires player object and baseItems definition)
/*
const player = {
    name: "Trainer",
    money: 500,
    inventory: [], // Example: [{ id: 'pistol_common', name: 'Pistol', type: 'weapon', rarity: 'common', ... }]
    addItemToInventory: function(item) {
        const existingItem = this.inventory.find(i => i.id === item.id);
        if (existingItem && item.stackable) { // Assuming stackable property
             existingItem.quantity = (existingItem.quantity || 1) + 1;
        } else {
            this.inventory.push({...item, quantity: 1}); // Add as new item with quantity 1
        }
     },
    removeItemFromInventory: function(index) {
        const item = this.inventory[index];
         if (item.quantity > 1) {
            item.quantity -= 1;
         } else {
            this.inventory.splice(index, 1);
         }
    }
};

// Assume baseItems is loaded from items.js/equipment.js
const baseItems = {
    consumables: {
        'potion': { id: 'potion', name: 'Potion', type: 'consumable', effect: { heal: 20 }, price: 50, rarity: 'common', stackable: true }
    },
    equipment: {
        'weapon': [
            { id: 'pistol_common', name: 'Pistol', type: 'weapon', damage: 5, rarity: 'common', stackable: false },
            { id: 'rifle_uncommon', name: 'Rifle', type: 'weapon', damage: 10, rarity: 'uncommon', stackable: false }
        ],
        'armor': [
             { id: 'vest_common', name: 'Vest', type: 'armor', defense: 3, rarity: 'common', stackable: false }
        ]
    }
};

const townShop = new Shop("General Store", baseItems);

console.log("Shop Inventory:", townShop.getBuyableItems());
console.log("Player Inventory Before:", player.inventory);
console.log("Player Money Before:", player.money);

// Buy an item
townShop.buyItem('potion', player);
townShop.buyItem('vest_common', player);
townShop.buyItem('potion', player); // Buy another potion

// Sell an item (assuming player found one)
// player.addItemToInventory({ id: 'junk_rare', name: 'Shiny Rock', type: 'junk', rarity: 'rare', stackable: false });
// townShop.sellItem('junk_rare', player);


console.log("Player Inventory After:", player.inventory);
console.log("Player Money After:", player.money);
*/

// Export the class if using modules
// export { Shop, rarityMultipliers }; // Uncomment if using ES Modules
