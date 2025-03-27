/**
 * Market System for LovelaceVerse
 * Handles Junk Market, Recycle Shop, and Blackmarket interactions.
 */

const MarketSystem = {
    selectedJunkItems: new Map(), // Map<itemIndex, { item: itemData, quantity: number }>
    selectedRecycleItems: new Map(), // Map<itemIndex, itemData>

    // Rarity to currency value mapping for Junk Market
    junkValueMap: {
        'Legendary': { amount: 10, currency: 'gold' },
        'Epic': { amount: 1, currency: 'gold' },
        'Rare': { amount: 50, currency: 'silver' },
        'Uncommon': { amount: 1, currency: 'silver' },
        'Common': { amount: 50, currency: 'copper' }
    },

    init: function() {
        console.log("Initializing Market System...");
        this.setupEventListeners();

        // Add listener to update market grids when the modal is opened
        const marketModal = document.getElementById('market-modal');
        if (marketModal) {
            // Using MutationObserver to detect when the modal becomes visible
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        if (marketModal.style.display === 'block') {
                            this.populateJunkGrid();
                            this.populateRecycleGrid();
                            this.clearSelections(); // Clear selections when modal opens
                            this.updateMarketCurrencyDisplay(); // Update currency when modal opens
                        }
                    }
                }
            });
            observer.observe(marketModal, { attributes: true });
        }
    },

    setupEventListeners: function() {
        const sellButton = document.getElementById('sell-junk-button');
        if (sellButton) {
            sellButton.addEventListener('click', () => this.sellSelectedJunk());
        }

        const recycleButton = document.getElementById('recycle-items-button');
        if (recycleButton) {
            recycleButton.addEventListener('click', () => this.recycleSelectedItems());
        }

        // Event delegation for item clicks within the grids
        const junkGrid = document.getElementById('junk-inventory-grid');
        if (junkGrid) {
            junkGrid.addEventListener('click', (e) => {
                const slot = e.target.closest('.inventory-slot');
                if (slot) {
                    const index = parseInt(slot.dataset.index, 10);
                    this.toggleJunkSelection(index, slot);
                }
            });
        }

        const recycleGrid = document.getElementById('recycle-inventory-grid');
        if (recycleGrid) {
            recycleGrid.addEventListener('click', (e) => {
                const slot = e.target.closest('.inventory-slot');
                if (slot) {
                    const index = parseInt(slot.dataset.index, 10);
                     this.toggleRecycleSelection(index, slot);
                }
            });
        }
    },

    clearSelections: function() {
        this.selectedJunkItems.clear();
        this.selectedRecycleItems.clear();
        this.updateJunkSellTotal();
        // Clear visual selection highlights
        document.querySelectorAll('#junk-inventory-grid .inventory-slot.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('#recycle-inventory-grid .inventory-slot.selected').forEach(el => el.classList.remove('selected'));
    },

    populateJunkGrid: function() {
        const grid = document.getElementById('junk-inventory-grid');
        if (!grid) {
             console.error("[MarketSystem] Junk grid not found!");
             return;
        }
        grid.innerHTML = ''; // Clear previous items

        let itemsAdded = 0;
        Inventory.slots.forEach((item, index) => {
            if (item) {
                // Exclude equipped items if necessary
                // if (item.equipped) return;

                const slotElement = this.createMarketItemElement(item, index);
                if (slotElement) {
                    grid.appendChild(slotElement);
                    itemsAdded++;
                }
            }
        });

         if (itemsAdded === 0) {
             grid.innerHTML = '<p class="empty-grid-message">No items available to sell.</p>';
         }
    },

    populateRecycleGrid: function() {
        const grid = document.getElementById('recycle-inventory-grid');
        if (!grid) {
            console.error("[MarketSystem] Recycle grid not found!");
             return;
        }
        grid.innerHTML = ''; // Clear previous items

        const equipmentCategories = [
            Items.CATEGORIES.WEAPON,
            Items.CATEGORIES.ARMOR,
            Items.CATEGORIES.GLOVES,
            Items.CATEGORIES.BOOTS,
            Items.CATEGORIES.ACCESSORY
        ];

        let itemsAdded = 0;
        Inventory.slots.forEach((item, index) => {
            if (item && equipmentCategories.includes(item.category)) {
                 // Exclude equipped items if necessary
                 // if (item.equipped) return;

                const slotElement = this.createMarketItemElement(item, index);
                 if (slotElement) {
                    grid.appendChild(slotElement);
                    itemsAdded++;
                }
            }
        });

         if (itemsAdded === 0) {
             grid.innerHTML = '<p class="empty-grid-message">No equipment available to recycle.</p>';
         }
    },

    createMarketItemElement: function(item, index) {
        const slotElement = document.createElement('div');
        slotElement.className = 'inventory-slot';
        slotElement.dataset.index = index;

        if (!item) {
             console.error(`[MarketSystem] createMarketItemElement called with null item at index ${index}`);
             return null;
        }
        // console.log(`[MarketSystem] Creating element for item at index ${index}:`, JSON.stringify(item)); // Reduced logging

        slotElement.dataset.itemId = item.id || `unknown-${index}`;

        // Add rarity class for slot background/border
        let slotRarityClass = 'rarity-unknown'; // Default fallback class
        if (item.rarity && typeof item.rarity === 'object' && item.rarity.name) { // Check for object format first
            slotRarityClass = `rarity-${item.rarity.name.toLowerCase()}`;
        } else if (item.rarity && typeof item.rarity === 'string') { // Fallback to string format
             slotRarityClass = `rarity-${item.rarity.toLowerCase()}`;
        } else {
             console.warn(`[MarketSystem] Item at index ${index} (ID: ${item.id || 'N/A'}) has missing or invalid rarity:`, item.rarity);
        }
        slotElement.classList.add(slotRarityClass); // Add class to the main slot div

        let imgSrc = item.icon;
        if (!imgSrc || imgSrc.includes('undefined')) {
            imgSrc = Items.createPlaceholderImage ? Items.createPlaceholderImage(item.id) : '';
        }

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = item.name || 'Unknown Item';
        slotElement.appendChild(img);

        if (item.stackable && item.quantity > 1) {
            const quantityElement = document.createElement('div');
            quantityElement.className = 'item-count';
            quantityElement.textContent = item.quantity;
            slotElement.appendChild(quantityElement);
        }

        // --- Add Rarity Indicator Text ---
        const rarityElement = document.createElement('div');
        rarityElement.className = 'item-slot-rarity'; // Assign class for styling
        let rarityName = 'Unknown';
        // Determine rarity name for display (using the same logic as for slotRarityClass)
        if (item.rarity && typeof item.rarity === 'object' && item.rarity.name) {
            rarityName = item.rarity.name;
        } else if (item.rarity && typeof item.rarity === 'string') {
            rarityName = item.rarity;
        }
        rarityElement.textContent = rarityName;
        // Add the determined rarity class (e.g., 'rarity-common') to the text element for color styling
        rarityElement.classList.add(slotRarityClass);
        slotElement.appendChild(rarityElement);
        // --- End Rarity Indicator ---

        // Add tooltip
        slotElement.addEventListener('mouseenter', (e) => Inventory.showItemTooltip(item, e.target));
        slotElement.addEventListener('mouseleave', () => Inventory.hideItemTooltip());

        return slotElement;
    },


    toggleJunkSelection: function(index, slotElement) {
        const item = Inventory.slots[index];
        if (!item) return;

        if (this.selectedJunkItems.has(index)) {
            this.selectedJunkItems.delete(index);
            slotElement.classList.remove('selected');
            // Remove quantity indicator if needed
            // delete slotElement.dataset.sellQuantity;
        } else {
            if (item.stackable && item.quantity > 1) {
                this.showQuantityModal(item, index, slotElement);
            } else {
                this.selectedJunkItems.set(index, { item: item, quantity: 1 });
                slotElement.classList.add('selected');
            }
        }
        this.updateJunkSellTotal();
    },

    showQuantityModal: function(item, index, slotElement) {
        const modal = document.getElementById('quantity-modal');
        const title = document.getElementById('quantity-modal-title');
        const icon = document.getElementById('quantity-item-icon');
        const name = document.getElementById('quantity-item-name');
        const input = document.getElementById('quantity-input');
        const maxDisplay = document.getElementById('quantity-max').querySelector('span');
        const errorMsg = document.getElementById('quantity-error');
        const confirmBtn = document.getElementById('quantity-confirm-button');
        const cancelBtn = document.getElementById('quantity-cancel-button');

        if (!modal || !input || !confirmBtn || !cancelBtn || !icon || !name || !maxDisplay || !errorMsg) {
            console.error("[MarketSystem] Quantity modal elements not found! Falling back to prompt.");
            const maxQuantity = item.quantity;
            const sellQuantityStr = prompt(`Fallback: How many ${item.name} to sell? (Max: ${maxQuantity})`, maxQuantity);
            const sellQuantity = parseInt(sellQuantityStr, 10);
             if (!isNaN(sellQuantity) && sellQuantity > 0 && sellQuantity <= maxQuantity) {
                 this.selectedJunkItems.set(index, { item: item, quantity: sellQuantity });
                 slotElement.classList.add('selected');
                 this.updateJunkSellTotal();
             } else if (sellQuantityStr !== null) {
                 alert(`Invalid quantity.`);
             }
            return;
        }

        title.textContent = `Sell ${item.name}`;
        icon.src = item.icon || (Items.createPlaceholderImage ? Items.createPlaceholderImage(item.id) : '');
        name.textContent = item.name;
        input.max = item.quantity;
        input.value = item.quantity;
        maxDisplay.textContent = item.quantity;
        errorMsg.style.display = 'none';

        const context = {
            item: item,
            index: index,
            slotElement: slotElement,
            confirmListener: null,
            cancelListener: null,
            modal: modal
        };

        context.confirmListener = () => {
            const sellQuantity = parseInt(input.value, 10);
            const maxQuantity = parseInt(input.max, 10);

            if (!isNaN(sellQuantity) && sellQuantity > 0 && sellQuantity <= maxQuantity) {
                this.selectedJunkItems.set(context.index, { item: context.item, quantity: sellQuantity });
                context.slotElement.classList.add('selected');
                this.updateJunkSellTotal();
                this.closeQuantityModal(context);
            } else {
                errorMsg.style.display = 'block';
            }
        };

        context.cancelListener = () => {
            // If cancelled, ensure item is deselected if it wasn't already confirmed
            if (!this.selectedJunkItems.has(context.index)) {
                 context.slotElement.classList.remove('selected');
            }
            this.closeQuantityModal(context);
        };

        confirmBtn.replaceWith(confirmBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
        document.getElementById('quantity-confirm-button').addEventListener('click', context.confirmListener);
        document.getElementById('quantity-cancel-button').addEventListener('click', context.cancelListener);

        modal.style.display = 'block';
        input.focus(); // Focus the input field
        input.select(); // Select the default value
    },

    closeQuantityModal: function(context) {
        if (context && context.modal) {
             const currentConfirmBtn = document.getElementById('quantity-confirm-button');
             const currentCancelBtn = document.getElementById('quantity-cancel-button');
             if(currentConfirmBtn && context.confirmListener) currentConfirmBtn.removeEventListener('click', context.confirmListener);
             if(currentCancelBtn && context.cancelListener) currentCancelBtn.removeEventListener('click', context.cancelListener);
            context.modal.style.display = 'none';
        }
    },

     toggleRecycleSelection: function(index, slotElement) {
        const item = Inventory.slots[index];
        if (!item) return;

        if (this.selectedRecycleItems.has(index)) {
            this.selectedRecycleItems.delete(index);
            slotElement.classList.remove('selected');
        } else {
            // For recycling, we still process the whole stack
            this.selectedRecycleItems.set(index, item);
            slotElement.classList.add('selected');
        }
    },

    updateJunkSellTotal: function() {
        const totalElement = document.getElementById('junk-sell-total');
        if (!totalElement) return;

        let totalValue = { copper: 0, silver: 0, gold: 0 };

        this.selectedJunkItems.forEach(selection => {
            const itemData = selection.item;
            const sellQuantity = selection.quantity;
            let itemRarityName = null;

            if (itemData.rarity && typeof itemData.rarity === 'object' && itemData.rarity.name) {
                itemRarityName = itemData.rarity.name;
            } else if (itemData.rarity && typeof itemData.rarity === 'string') {
                itemRarityName = itemData.rarity;
            }

            if (!itemRarityName) return;

            const valueInfo = this.junkValueMap[itemRarityName];
            if (valueInfo) {
                totalValue[valueInfo.currency] += valueInfo.amount * sellQuantity;
            }
        });

        totalValue.silver += Math.floor(totalValue.copper / 100);
        totalValue.copper %= 100;
        totalValue.gold += Math.floor(totalValue.silver / 100);
        totalValue.silver %= 100;

        let totalString = "Total Value: ";
        let parts = [];
        if (totalValue.gold > 0) parts.push(`${totalValue.gold} GOLD`);
        if (totalValue.silver > 0) parts.push(`${totalValue.silver} Silver`);
        if (totalValue.copper > 0) parts.push(`${totalValue.copper} Copper`);

        totalElement.textContent = parts.length > 0 ? totalString + parts.join(', ') : totalString + "0";
    },

    sellSelectedJunk: function() {
        if (this.selectedJunkItems.size === 0) {
            Utils.showNotification("No items selected", "Select items from your inventory to sell.", 3000);
            return;
        }

        console.log("Attempting to sell selected junk items:", this.selectedJunkItems);

        let totalGained = { copper: 0, silver: 0, gold: 0 };
        const itemsToRemove = [];

        this.selectedJunkItems.forEach((selection, index) => {
            const itemData = selection.item;
            const sellQuantity = selection.quantity;
            let itemRarityName = null;

            if (itemData.rarity && typeof itemData.rarity === 'object' && itemData.rarity.name) {
                itemRarityName = itemData.rarity.name;
            } else if (itemData.rarity && typeof itemData.rarity === 'string') {
                itemRarityName = itemData.rarity;
            }

            if (!itemRarityName) {
                console.warn(`[MarketSystem] Skipping item ${itemData.name} at index ${index} due to invalid rarity for selling.`);
                return;
            }

            const valueInfo = this.junkValueMap[itemRarityName];
            if (valueInfo) {
                console.log(`[MarketSystem] Selling ${sellQuantity}x ${itemData.name} (${itemRarityName}) for ${valueInfo.amount * sellQuantity} ${valueInfo.currency}`);
                totalGained[valueInfo.currency] += valueInfo.amount * sellQuantity;
                itemsToRemove.push({ index: index, quantity: sellQuantity });
            } else {
                 console.warn(`[MarketSystem] No junk value defined for rarity: ${itemRarityName}`);
            }
        });

        console.log("[MarketSystem] Total currency to gain:", totalGained);
        if (totalGained.copper > 0) Currency.addCopper(totalGained.copper);
        if (totalGained.silver > 0) Currency.addSilver(totalGained.silver);
        if (totalGained.gold > 0) Currency.addGold(totalGained.gold);
        console.log("[MarketSystem] Currency after adding:", { copper: Currency.copper, silver: Currency.silver, gold: Currency.gold });

        console.log("[MarketSystem] Removing sold items:", itemsToRemove);
        let removalSuccess = true;
        itemsToRemove.sort((a, b) => b.index - a.index).forEach(removalInfo => {
            const { index, quantity } = removalInfo;
            console.log(`[MarketSystem] Attempting to remove item at index ${index} (Quantity: ${quantity})`);
            const removed = Inventory.removeItem(index, quantity);
             console.log(`[MarketSystem] Result of removeItem(${index}, ${quantity}):`, removed);
             if (!removed) {
                 console.error(`[MarketSystem] Failed to remove item at index ${index} (Quantity: ${quantity})!`);
                 removalSuccess = false;
             }
        });
         console.log("[MarketSystem] Inventory after sell removal:", JSON.stringify(Inventory.slots));

        if (removalSuccess) {
            let gainedString = "Sold items for: ";
            let parts = [];
            if (totalGained.gold > 0) parts.push(`${totalGained.gold} GOLD`);
            if (totalGained.silver > 0) parts.push(`${totalGained.silver} Silver`);
            if (totalGained.copper > 0) parts.push(`${totalGained.copper} Copper`);
            Utils.showNotification("Items Sold", parts.length > 0 ? gainedString + parts.join(', ') : "Sold items.", 3000, 'success');
        } else {
             Utils.showNotification("Sell Error", "Failed to remove some items from inventory. Check console.", 5000, 'error');
        }

        this.clearSelections();
        this.populateJunkGrid();
        Inventory.updateInventoryUI();
        this.updateMarketCurrencyDisplay();
    },

    recycleSelectedItems: function() {
        if (this.selectedRecycleItems.size === 0) {
            Utils.showNotification("No items selected", "Select equipment from your inventory to recycle.", 3000);
            return;
        }

        console.log("Attempting to recycle selected items:", this.selectedRecycleItems);
        const resultDisplay = document.getElementById('recycle-result-display');
        if(resultDisplay) resultDisplay.innerHTML = 'Recycling...';

        const itemsToRemoveIndices = []; // Store only indices for removal
        const materialsGained = {};

        this.selectedRecycleItems.forEach((item, index) => {
            itemsToRemoveIndices.push(index); // Store index to remove later
            const numMaterials = Utils.randomInt(1, 3);
            let materialId = 'common_material';
            let itemRarityName = 'Common';

            if (item.rarity && typeof item.rarity === 'object' && item.rarity.name) {
                itemRarityName = item.rarity.name;
                 switch (itemRarityName) {
                    case 'Legendary': materialId = 'legendary_material'; break;
                    case 'Epic':      materialId = 'epic_material'; break;
                    case 'Rare':      materialId = 'rare_material'; break;
                    case 'Uncommon':  materialId = 'uncommon_material'; break;
                    // Common case handled by default
                 }
            } else if (item.rarity && typeof item.rarity === 'string') {
                 itemRarityName = item.rarity;
                 switch (itemRarityName) {
                    case 'Legendary': materialId = 'legendary_material'; break;
                    case 'Epic':      materialId = 'epic_material'; break;
                    case 'Rare':      materialId = 'rare_material'; break;
                    case 'Uncommon':  materialId = 'uncommon_material'; break;
                     // Common case handled by default
                 }
            } else {
                 console.warn(`[MarketSystem] Invalid rarity found for item ${item.name} at index ${index}, defaulting to common material.`);
            }

            if (typeof Inventory !== 'undefined' && typeof Inventory.addItem === 'function') {
                 console.log(`[MarketSystem] Attempting to add ${numMaterials}x ${materialId} from recycling ${item.name} (${itemRarityName})`);
                 try {
                    const added = Inventory.addItem(materialId, numMaterials);
                    console.log(`[MarketSystem] Inventory.addItem result for ${materialId}:`, added);
                    if(added) {
                        materialsGained[materialId] = (materialsGained[materialId] || 0) + numMaterials;
                    } else {
                         console.error(`[MarketSystem] Inventory.addItem returned false/null for ${materialId}.`);
                    }
                 } catch (addError) {
                     console.error(`[MarketSystem] Error calling Inventory.addItem for ${materialId}:`, addError);
                }
            } else {
                 console.error("[MarketSystem] Inventory.addItem function not found!");
            }
        });

         console.log("[MarketSystem] Removing recycled items at indices:", itemsToRemoveIndices);
         let recycleRemovalSuccess = true;
        itemsToRemoveIndices.sort((a, b) => b - a).forEach(index => {
             // Since we recycle the whole stack, quantity is implicitly the full stack quantity
             const itemToRemove = Inventory.slots[index]; // Get item to check stackable status
             const quantityToRemove = itemToRemove?.stackable ? itemToRemove.quantity : 1;
             console.log(`[MarketSystem] Attempting to remove recycled item at index ${index} (Full Stack Qty: ${quantityToRemove})`);
            const removed = Inventory.removeItem(index, quantityToRemove); // Remove full stack
             console.log(`[MarketSystem] Result of removeItem(${index}, ${quantityToRemove}) for recycling:`, removed);
             if (!removed) {
                 console.error(`[MarketSystem] Failed to remove recycled item at index ${index}!`);
                 recycleRemovalSuccess = false;
             }
        });
         console.log("[MarketSystem] Inventory after recycling removal:", JSON.stringify(Inventory.slots));

        let resultText = "Recycling Complete! Gained: <br>";
        let gainedAny = false;
        for (const materialId in materialsGained) {
             const materialItem = Items.getItem(materialId);
             const materialName = materialItem ? materialItem.name : materialId;
            resultText += `- ${materialsGained[materialId]} x ${materialName}<br>`;
            gainedAny = true;
        }
         if (!gainedAny) {
             resultText = "Recycling process complete, but no materials were obtained this time.";
         }

        if(resultDisplay) resultDisplay.innerHTML = resultText;
        Utils.showNotification("Recycling Complete", "Check the results panel.", 3000, 'success');

        this.clearSelections();
        this.populateRecycleGrid();
        Inventory.updateInventoryUI();

        setTimeout(() => {
            if(resultDisplay) resultDisplay.innerHTML = '';
        }, 5000);
    },

    updateMarketCurrencyDisplay: function() {
        const copperEl = document.getElementById('market-copper-amount');
        const silverEl = document.getElementById('market-silver-amount');
        const goldEl = document.getElementById('market-gold-amount');

        if (copperEl && silverEl && goldEl && typeof Currency !== 'undefined') {
            copperEl.textContent = Currency.copper;
            silverEl.textContent = Currency.silver;
            goldEl.textContent = Currency.gold;
        } else {
            console.warn("[MarketSystem] Could not update market currency display elements or Currency object not found.");
        }
    }
};

// Add basic CSS for selected items and empty grid message
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .inventory-slot.selected {
            outline: 2px solid var(--accent-cyan, #00f7ff);
            box-shadow: 0 0 10px var(--accent-cyan, #00f7ff);
            background: rgba(0, 247, 255, 0.1);
        }
        .empty-grid-message {
            color: var(--text-secondary, #aaa);
            text-align: center;
            padding: 20px;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
})();


// Initialization is now handled by Game.initSystems in main.js
