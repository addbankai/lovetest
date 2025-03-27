/**
 * Inventory system for the Cyberpunk MMORPG game
 * Manages player's items, equipment, and inventory UI
 */

const Inventory = {
    items: [],
    
    saveData: function() {
        return {
            items: this.items,
            lastUpdated: new Date().toISOString()
        };
    },
    
    loadData: function(data) {
        if (data && Array.isArray(data.items)) {
            this.items = data.items;
        }
    },
    
    // Inventory slots
    slots: new Array(96).fill(null), // Initialize with 96 empty slots
    
    // Maximum inventory slots per tab
    slotsPerTab: 96, // Updated to match new 12x8 grid layout
    
    // Current active tab
    activeTab: 'all',
    
    // Current page for each tab
    currentPage: {},
    
    // Items per page
    itemsPerPage: 96, // Updated to match 12 columns × 8 rows grid
    
    // Inventory tabs configuration
    tabs: {
        'all': { name: 'All Items', filter: () => true },
        'weapon': { name: 'Weapons', filter: item => item && item.category === Items.CATEGORIES.WEAPON },
        'armor': { name: 'Armor', filter: item => item && (item.category === Items.CATEGORIES.ARMOR || item.category === Items.CATEGORIES.GLOVES || item.category === Items.CATEGORIES.BOOTS) },
        'accessory': { name: 'Accessories', filter: item => item && item.category === Items.CATEGORIES.ACCESSORY },
        'consumable': { name: 'Consumables', filter: item => item && item.category === Items.CATEGORIES.CONSUMABLE },
        'material': { name: 'Materials', filter: item => item && item.category === Items.CATEGORIES.MATERIAL }
    },
    
    // Character-specific equipment slots
    // Map of character ID to equipment object
    characterEquipment: {},
    
    // Default empty equipment template
    emptyEquipment: {
        rightHand: null,
        leftHand: null,
        armor: null,
        gloves: null,
        boots: null,
        accessory1: null,
        accessory2: null
    },
    
    // Equipment types
    EQUIPMENT_TYPES: {
        SWORD: 'sword',
        DAGGER: 'dagger',
        DUAL_DAGGER: 'dual_dagger',
        DUAL_BLADE: 'dual_blade',
        BOW: 'bow',
        CROSSBOW: 'crossbow',
        STAFF: 'staff',
        KATANA: 'katana',
        KNUCKLES: 'knuckles',
        SPEAR: 'spear',
        SCYTHE: 'scythe',
        WAND: 'wand',
        GRIMOIRE: 'grimoire',
        RIFLE: 'rifle',
        SHIELD: 'shield'
    },
    
    // Dual wielding weapons (these fill both hand slots)
    DUAL_WIELD_TYPES: ['dual_dagger', 'dual_blade', 'bow', 'crossbow', 'rifle', 'katana', 'knuckles'],
    
    /**
     * Initialize the inventory system
     * @param {Object} savedData - Saved inventory data (optional)
     */
    init: function() {
        // Try to load from local storage first
        const savedData = this.loadFromLocal();
        
        // Initialize empty inventory if no saved data
        const totalSlots = this.slotsPerTab * Object.keys(this.tabs).length;
        this.slots = savedData?.slots || new Array(totalSlots).fill(null);
        
        // Initialize current page for each tab
        Object.keys(this.tabs).forEach(tabId => {
            this.currentPage[tabId] = savedData?.currentPage?.[tabId] || 0;
        });
        
        // Initialize equipment from saved data or empty
        this.characterEquipment = savedData?.characterEquipment || {};
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Add save listener for equipment changes
        document.addEventListener('equipmentChanged', () => {
            this.saveToLocal();
        });
    },
    
    /**
     * Set up inventory UI event listeners
     */
    setupEventListeners: function() {
        // Inventory button
        const inventoryButton = document.getElementById('inventory-button');
        if (inventoryButton) {
            inventoryButton.addEventListener('click', () => {
                this.openInventory();
            });
        }
        
        // Close modal buttons
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal) {
                    Utils.hideModal(modal.id);
                }
            });
        });
        
        // Tab switching
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('inventory-tab')) {
                const tabId = e.target.dataset.tab;
                if (tabId && this.tabs[tabId]) {
                    this.switchTab(tabId);
                }
            }
        });
        
        // Pagination buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-prev')) {
                this.prevPage();
            } else if (e.target.classList.contains('page-next')) {
                this.nextPage();
            }
        });
    },
    
    /**
     * Get equipment for a character, creating it if it doesn't exist
     * @param {string} characterId - Character ID
     * @returns {Object} Character equipment
     */
    getCharacterEquipment: function(characterId) {
        if (!this.characterEquipment[characterId]) {
            // Clone the empty equipment template
            this.characterEquipment[characterId] = JSON.parse(JSON.stringify(this.emptyEquipment));
        }
        return this.characterEquipment[characterId];
    },
    
    /**
     * Save inventory to local storage
     */
    saveToLocal: function() {
        const saveData = {
            slots: this.slots,
            currentPage: this.currentPage,
            characterEquipment: this.characterEquipment,  // Make sure we save character equipment
            lastSaved: new Date().toISOString()
        };
        localStorage.setItem('inventoryData', JSON.stringify(saveData));
        
        // Dispatch event so authentication system can save to database
        const event = new CustomEvent('inventoryChanged', {
            detail: { 
                slots: this.slots, 
                characterEquipment: this.characterEquipment 
            }
        });
        document.dispatchEvent(event);
    },

    /**
     * Load inventory from local storage
     */
    loadFromLocal: function() {
        const data = localStorage.getItem('inventoryData');
        return data ? JSON.parse(data) : null;
    },

    /**
     * Load inventory from data object
     * @param {Object} data - Saved inventory data
     */
    loadFromData: function(data) {
        // Load inventory slots
        if (data.slots) {
            const totalSlots = this.slotsPerTab * Object.keys(this.tabs).length;
            for (let i = 0; i < Math.min(data.slots.length, totalSlots); i++) {
                if (data.slots[i]) {
                    const item = Items.getItem(data.slots[i].id);
                    if (item) {
                        this.slots[i] = Object.assign({}, item, {
                            quantity: data.slots[i].quantity || 1,
                            instanceId: data.slots[i].instanceId || Utils.generateId()
                        });
                    }
                }
            }
        }
        
        // Load character equipment
        if (data.characterEquipment) {
            for (const characterId in data.characterEquipment) {
                this.characterEquipment[characterId] = {};
                const equipData = data.characterEquipment[characterId];
                
                for (const slot in this.emptyEquipment) {
                    if (equipData[slot]) {
                        const item = Items.getItem(equipData[slot].id);
                        if (item) {
                            this.characterEquipment[characterId][slot] = Object.assign({}, item, {
                                instanceId: equipData[slot].instanceId || Utils.generateId()
                            });
                        } else {
                            this.characterEquipment[characterId][slot] = null;
                        }
                    } else {
                        this.characterEquipment[characterId][slot] = null;
                    }
                }
            }
        }
        
        // For backwards compatibility with old save format
        if (data.equipment) {
            // Get the first active character (or create a default ID if none)
            const activeCharacter = Game.getActiveCharacter();
            const characterId = activeCharacter ? activeCharacter.id : 'default';
            
            // Initialize equipment for this character
            this.characterEquipment[characterId] = {};
            
            // Copy old equipment format to the first character's equipment
            for (const slot in this.emptyEquipment) {
                if (data.equipment[slot]) {
                    const item = Items.getItem(data.equipment[slot].id);
                    if (item) {
                        this.characterEquipment[characterId][slot] = Object.assign({}, item, {
                            instanceId: data.equipment[slot].instanceId || Utils.generateId()
                        });
                    } else {
                        this.characterEquipment[characterId][slot] = null;
                    }
                } else {
                    this.characterEquipment[characterId][slot] = null;
                }
            }
        }
    },
    
    /**
     * Update character equipment modal
     * @param {Object} character - Character data
     */
    updateCharacterEquipmentModal: function(character) {
        // Store the character ID for equipment selection
        CharacterSystem.currentEquipmentCharacterId = character.id;
        
        const portrait = document.getElementById("equipment-character-portrait");
        if (portrait) {
            portrait.style.backgroundImage = `url(${character.idleSprite})`;
        }
        
        const name = document.getElementById("equipment-character-name");
        if (name) {
            name.textContent = character.name;
        }
        
        const level = document.getElementById("equipment-character-level");
        if (level) {
            level.textContent = `Level ${character.level}`;
        }
        
        const statsContainer = document.getElementById("equipment-character-stats");
        if (statsContainer) {
            statsContainer.innerHTML = "";
            
            // Add main stats
            const mainStats = ["HP", "SP", "Damage", "Defense"];
            const statValues = [
                `${character.stats.currentHp}/${character.stats.maxHp}`,
                `${character.stats.currentSp}/${character.stats.maxSp}`,
                character.stats.damage,
                character.stats.defense
            ];
            
            mainStats.forEach((stat, index) => {
                const statElement = document.createElement("div");
                statElement.className = "character-stat";
                statElement.innerHTML = `<span class="stat-name">${stat}:</span> <span class="stat-value">${statValues[index]}</span>`;
                statsContainer.appendChild(statElement);
            });
            // Add additional detailed stats for character info
            const additionalStats = [
                { name: "Attack Speed", value: character.stats.attackSpeed },
                { name: "Magic Damage", value: character.stats.magicDamage },
                { name: "Range Damage", value: character.stats.rangeDamage },
                { name: "Hit", value: character.stats.hit },
                { name: "Evasion", value: character.stats.evasion },
                { name: "Critical", value: character.stats.critical },
                { name: "Magic Defense", value: character.stats.magicDefense }
            ];
            additionalStats.forEach(statObj => {
                const statElement = document.createElement("div");
                statElement.className = "character-stat";
                statElement.innerHTML = `<span class="stat-name">${statObj.name}:</span> <span class="stat-value">${statObj.value}</span>`;
                statsContainer.appendChild(statElement);
            });
        }
        
        const equipment = this.getCharacterEquipment(character.id);
        for (const slotName in equipment) {
            let slotElement = document.getElementById(`slot-${slotName}`);
            if (slotElement) {
                slotElement.innerHTML = "";
                slotElement.classList.remove("dual-wield-ref");
                const newSlot = slotElement.cloneNode(false);
                slotElement.parentNode.replaceChild(newSlot, slotElement);
                slotElement = newSlot;
                
                const item = equipment[slotName];
                if (item && !item.isDualWieldRef) {
                    let imgSrc = item.icon;
                    if (!imgSrc || imgSrc.includes("undefined")) {
                        imgSrc = Items.createPlaceholderImage(item.id);
                    }
                    const img = document.createElement("img");
                    img.src = imgSrc;
                    img.alt = item.name;
                    img.style.maxWidth = "64px";
                    img.style.maxHeight = "64px";
                    img.style.objectFit = "contain";
                    slotElement.appendChild(img);
                    
                    // Add unequip button
                    const unequipButton = document.createElement("button");
                    unequipButton.className = "unequip-button";
                    unequipButton.textContent = "Unequip";
                    unequipButton.style.position = "absolute";
                    unequipButton.style.bottom = "2px";
                    unequipButton.style.left = "50%";
                    unequipButton.style.transform = "translateX(-50%)";
                    unequipButton.style.fontSize = "10px";
                    unequipButton.style.padding = "2px 5px";
                    unequipButton.style.background = "rgba(255, 0, 0, 0.7)";
                    unequipButton.style.color = "white";
                    unequipButton.style.border = "none";
                    unequipButton.style.borderRadius = "3px";
                    unequipButton.style.cursor = "pointer";
                    unequipButton.style.display = "none"; // Hidden by default
                    
                    // Show unequip button on hover
                    slotElement.addEventListener("mouseenter", (e) => {
                        this.showItemTooltip(item, e.target);
                        unequipButton.style.display = "block";
                    });
                    
                    slotElement.addEventListener("mouseleave", () => {
                        this.hideItemTooltip();
                        unequipButton.style.display = "none";
                    });
                    
                    // Unequip functionality
                    unequipButton.addEventListener("click", (e) => {
                        e.stopPropagation();
                        this.unequipItem(slotName, character.id);
                        CharacterSystem.updateCharacterEquipmentModal(character);
                    });
                    
                    slotElement.style.position = "relative";
                    slotElement.appendChild(unequipButton);
                } else if (item && item.isDualWieldRef) {
                    slotElement.classList.add("dual-wield-ref");
                    const label = document.createElement("div");
                    label.className = "dual-wield-label";
                    label.textContent = "(Dual Wield)";
                    slotElement.appendChild(label);
                }
            }
        }
    },
    
    /**
     * Remove an item from the inventory
     * @param {number} slotIndex - Slot index
     * @param {number} quantity - Quantity to remove
     * @returns {boolean} True if item was removed successfully
     */
    removeItem: function(slotIndex, quantity = 1) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.error(`Invalid slot index: ${slotIndex}`);
            return false;
        }
        
        const slot = this.slots[slotIndex];
        if (!slot) {
            console.error(`Slot is empty: ${slotIndex}`);
            return false;
        }
        
        if (slot.quantity <= quantity) {
            // Remove entire stack
            this.slots[slotIndex] = null;
        } else {
            // Remove partial stack
            slot.quantity -= quantity;
        }
        
            this.updateInventoryUI();
            this.saveToLocal();
        return true;
    },
    
    /**
     * Use an item from the inventory
     * @param {number} slotIndex - Slot index
     * @returns {boolean} True if item was used successfully
     */
    useItem: function(slotIndex) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.error(`Invalid slot index: ${slotIndex}`);
            return false;
        }
        
        const slot = this.slots[slotIndex];
        if (!slot) {
            console.error(`Slot is empty: ${slotIndex}`);
            return false;
        }
        
        // Check if item is usable
        if (!Items.isUsable(slot)) {
            console.error(`Item is not usable: ${slot.id}`);
            return false;
        }
        
        // Get the active character
        const activeCharacter = Game.getActiveCharacter();
        if (!activeCharacter) {
            console.error('No active character');
            return false;
        }
        
        // Use the item
        const used = Items.useItem(slot, activeCharacter);
        if (used) {
            // Remove one from the stack
            this.removeItem(slotIndex, 1);
            return true;
        }
        
        return false;
    },
    
    /**
     * Equip an item
     * @param {number} slotIndex - Inventory slot index
     * @param {string} characterId - (Optional) Character ID to equip item to, defaults to active character
     * @returns {boolean} True if item was equipped successfully
     */
    equipItem: function(slotIndex, characterId = null) {
        if (slotIndex < 0 || slotIndex >= this.slots.length) {
            console.error(`Invalid slot index: ${slotIndex}`);
            return false;
        }
        
        const item = this.slots[slotIndex];
        if (!item) {
            console.error(`Slot is empty: ${slotIndex}`);
            return false;
        }
        
        // Check if item is equippable
        if (!Items.isEquippable(item)) {
            console.error(`Item is not equippable: ${item.id}`);
            return false;
        }
        
        // If no character ID was provided, use the active character
        if (!characterId) {
            const activeCharacter = Game.getActiveCharacter();
            if (!activeCharacter) {
                console.error('No active character to equip item to');
                return false;
            }
            characterId = activeCharacter.id;
        }
        
        // Get character's equipment
        const equipment = this.getCharacterEquipment(characterId);
        
        // Determine equipment slot based on category and equipment type
        let primarySlot = '';
        let secondarySlot = null;
        
        switch (item.category) {
            case Items.CATEGORIES.WEAPON:
                // Check if it's a dual-wield weapon
                if (item.equipmentType && this.DUAL_WIELD_TYPES.includes(item.equipmentType)) {
                    primarySlot = 'rightHand';
                    secondarySlot = 'leftHand';
                } else {
                    primarySlot = 'rightHand';
                }
                break;
                
                
            case Items.CATEGORIES.ARMOR:
                switch (item.equipmentType) {
                    case 'gloves':
                        primarySlot = 'gloves';
                        break;
                    case 'boots':
                        primarySlot = 'boots';
                        break;
                    case 'shield':
                        primarySlot = 'leftHand';
                        break;
                    default:
                        primarySlot = 'armor';
                        break;
                }
                break;
                
            case Items.CATEGORIES.GLOVES:
                // Direct handling for gloves category
                primarySlot = 'gloves';
                break;
                
            case Items.CATEGORIES.BOOTS:
                // Direct handling for boots category
                primarySlot = 'boots';
                break;
                
            case Items.CATEGORIES.ACCESSORY:
                // Find first empty accessory slot
                if (!equipment.accessory1) {
                    primarySlot = 'accessory1';
                } else if (!equipment.accessory2) {
                    primarySlot = 'accessory2';
                } else {
                    // Both accessory slots are full, replace the first one
                    primarySlot = 'accessory1';
                }
                break;
                
            default:
                console.error(`Unknown equipment category: ${item.category}`);
                return false;
        }
        
        // Special case: If right hand has a dual-wield weapon, unequip both hands first
        if (equipment.rightHand && 
            equipment.rightHand.equipmentType && 
            this.DUAL_WIELD_TYPES.includes(equipment.rightHand.equipmentType)) {
            
            const unequippedRight = this.unequipItem('rightHand', characterId);
            if (!unequippedRight) {
                console.error(`Failed to unequip dual-wield weapon from right hand`);
                return false;
            }
            
            // Left hand should already be empty since it's a dual-wield weapon
        } 
        // Special case: If equipping a dual-wield weapon, make sure left hand is empty
        else if (secondarySlot === 'leftHand') {
            if (equipment.leftHand) {
                const unequippedLeft = this.unequipItem('leftHand', characterId);
                if (!unequippedLeft) {
                    console.error(`Failed to unequip item from left hand`);
                    return false;
                }
            }
        }
        // Special case: If left hand has a shield and equipping to right hand, unequip left hand first
        else if (primarySlot === 'rightHand' && equipment.leftHand && equipment.leftHand.equipmentType === 'shield') {
            const unequippedLeft = this.unequipItem('leftHand', characterId);
            if (!unequippedLeft) {
                console.error(`Failed to unequip shield from left hand`);
                return false;
            }
        }
        
        // Unequip current item in the primary slot if any
        if (equipment[primarySlot]) {
            const unequipped = this.unequipItem(primarySlot, characterId);
            if (!unequipped) {
                console.error(`Failed to unequip item from slot: ${primarySlot}`);
                return false;
            }
        }
        
        // Move item from inventory to equipment
        equipment[primarySlot] = item;
        this.slots[slotIndex] = null;
        
        // If it's a dual-wield weapon, mark the secondary slot as used
        if (secondarySlot === 'leftHand') {
            equipment[secondarySlot] = { 
                isDualWieldRef: true,
                refersTo: primarySlot
            };
        }
        
        // Update UI
        this.updateInventoryUI();
        this.saveToLocal();
        this.updateEquipmentUI(characterId);
        
        // Get character and update their stats
        const character = CharacterSystem.getCharacterById(characterId);
        if (character) {
            // Recalculate all stats including equipment
            CharacterSystem.calculateDerivedStats(character);
            // Update character sprite
            CharacterSystem.updateCharacterSpriteBasedOnEquipment(character);
            // Update UI if available
            if (window.UIManager) {
                UIManager.updateCharacterStats(character);
            }
        }
        
        // Dispatch equipment changed event
        document.dispatchEvent(new CustomEvent('equipmentChanged', {
            detail: {
                characterId: characterId,
                slot: primarySlot,
                item: item
            }
        }));
        
        return true;
    },
    
    /**
     * Unequip an item
     * @param {string} equipSlot - Equipment slot ('rightHand', 'leftHand', 'armor', 'gloves', 'boots', 'accessory1', 'accessory2')
     * @param {string} characterId - (Optional) Character ID to unequip item from, defaults to active character
     * @returns {boolean} True if item was unequipped successfully
     */
    unequipItem: function(equipSlot, characterId = null) {
        // If no character ID was provided, use the active character
        if (!characterId) {
            const activeCharacter = Game.getActiveCharacter();
            if (!activeCharacter) {
                console.error('No active character to unequip item from');
                return false;
            }
            characterId = activeCharacter.id;
        }
        
        // Get character's equipment
        const equipment = this.getCharacterEquipment(characterId);
        
        if (!equipment[equipSlot]) {
            console.error(`No item equipped in slot: ${equipSlot}`);
            return false;
        }
        
        // Check if this is a reference to a dual-wield weapon
        if (equipment[equipSlot].isDualWieldRef) {
            // Just clear the reference, the actual item is in the referenced slot
            equipment[equipSlot] = null;
            return true;
        }
        
        // Check if this is a dual-wield weapon
        const item = equipment[equipSlot];
        const isDualWield = equipSlot === 'rightHand' && 
                          item.equipmentType && 
                          this.DUAL_WIELD_TYPES.includes(item.equipmentType);
        
        // Find empty inventory slot
        const emptySlotIndex = this.slots.findIndex(slot => slot === null);
        if (emptySlotIndex === -1) {
            console.error('Inventory is full, cannot unequip');
            return false;
        }
        
        // Move item from equipment to inventory
        this.slots[emptySlotIndex] = equipment[equipSlot];
        equipment[equipSlot] = null;
        
        // If dual-wield weapon, also clear the left hand slot
        if (isDualWield && equipment.leftHand && equipment.leftHand.isDualWieldRef) {
            equipment.leftHand = null;
        }
        
        // Update UI
        this.updateInventoryUI();
        this.saveToLocal();
        this.updateEquipmentUI(characterId);
        
        // Get character and update their stats
        const character = CharacterSystem.getCharacterById(characterId);
        if (character) {
            // Recalculate all stats including equipment
            CharacterSystem.calculateDerivedStats(character);
            // Update character sprite
            CharacterSystem.updateCharacterSpriteBasedOnEquipment(character);
            // Update UI if available
            if (window.UIManager) {
                UIManager.updateCharacterStats(character);
            }
        }
        
        // Dispatch equipment changed event
        document.dispatchEvent(new CustomEvent('equipmentChanged', {
            detail: {
                characterId: characterId,
                slot: equipSlot,
                item: null
            }
        }));
        
        return true;
    },
    
    /**
     * Move an item from one inventory slot to another
     * @param {number} fromIndex - Source slot index
     * @param {number} toIndex - Destination slot index
     * @returns {boolean} True if item was moved successfully
     */
    moveItem: function(fromIndex, toIndex) {
        if (fromIndex < 0 || fromIndex >= this.slots.length || 
            toIndex < 0 || toIndex >= this.slots.length) {
            console.error(`Invalid slot indices: ${fromIndex} -> ${toIndex}`);
            return false;
        }
        
        if (fromIndex === toIndex) {
            return true; // No need to move
        }
        
        const fromItem = this.slots[fromIndex];
        if (!fromItem) {
            console.error(`Source slot is empty: ${fromIndex}`);
            return false;
        }
        
        const toItem = this.slots[toIndex];
        
        // If destination is empty, simple move
        if (!toItem) {
            this.slots[toIndex] = fromItem;
            this.slots[fromIndex] = null;
        this.updateInventoryUI();
        this.saveToLocal();
            return true;
        }
        
        // If both items are the same and stackable, try to stack
        if (fromItem.id === toItem.id && fromItem.stackable && toItem.stackable) {
            const spaceInStack = toItem.maxStack - toItem.quantity;
            if (spaceInStack > 0) {
                const amountToMove = Math.min(fromItem.quantity, spaceInStack);
                toItem.quantity += amountToMove;
                fromItem.quantity -= amountToMove;
                
                // If source stack is empty, remove it
                if (fromItem.quantity <= 0) {
                    this.slots[fromIndex] = null;
                }
                
                this.updateInventoryUI();
                return true;
            }
        }
        
        // Otherwise, swap the items
        this.slots[toIndex] = fromItem;
        this.slots[fromIndex] = toItem;
        this.updateInventoryUI();
        this.saveToLocal(); // Save after moving items
        return true;
    },
    
    /**
     * Switch to a different inventory tab
     * @param {string} tabId - Tab ID to switch to
     */
    switchTab: function(tabId) {
        if (this.tabs[tabId]) {
            this.activeTab = tabId;
            this.updateInventoryUI();
            
            // Update tab UI
            const tabButtons = document.querySelectorAll('.inventory-tab');
            tabButtons.forEach(button => {
                if (button.dataset.tab === tabId) {
                    button.classList.add('active');
                } else {
                    button.classList.remove('active');
                }
            });
        }
    },
    
    /**
     * Add an item to the inventory
     * @param {string} itemId - Item ID
     * @param {number} quantity - Quantity to add
     * @returns {boolean} True if item was added successfully
     */
    addItem: function(itemId, quantity = 1) {
        console.log('Adding item to inventory:', itemId, quantity);
        
        const item = Items.getItem(itemId);
        if (!item) {
            console.error(`Item not found: ${itemId}`);
            return false;
        }
        
        // Find empty slot or existing stack
        let emptySlot = -1;
        for (let i = 0; i < this.slots.length; i++) {
            const slot = this.slots[i];
            
            // If slot has same item and is stackable
            if (slot && slot.id === itemId && item.stackable) {
                slot.quantity = (slot.quantity || 1) + quantity;
            this.updateInventoryUI();
            this.saveToLocal();
            
            // Remove this event dispatch since we don't want to count crafting as collection
            // document.dispatchEvent(new CustomEvent('itemCollected', {
            //     detail: {
            //         itemId: itemId,
            //         quantity: quantity
            //     }
            // }));
            
            return true;
            }
            
            // Remember first empty slot
            if (emptySlot === -1 && !slot) {
                emptySlot = i;
            }
        }
        
        // If we found an empty slot, add item there
        if (emptySlot !== -1) {
            this.slots[emptySlot] = {
                id: itemId,
                quantity: quantity,
                ...item
            };
            this.updateInventoryUI();
            this.saveToLocal();
            
            // Remove this event dispatch since we don't want to count crafting as collection
            // document.dispatchEvent(new CustomEvent('itemCollected', {
            //     detail: {
            //         itemId: itemId,
            //         quantity: quantity
            //     }
            // }));
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Update the inventory UI
     */
    updateInventoryUI: function() {
        const inventoryModal = document.getElementById('inventory-modal');
        if (!inventoryModal) return;
        
        // Get or create the tabs container
        let tabsContainer = inventoryModal.querySelector('.inventory-tabs');
        if (!tabsContainer) {
            tabsContainer = document.createElement('div');
            tabsContainer.className = 'inventory-tabs';
            inventoryModal.insertBefore(tabsContainer, inventoryModal.firstChild);
        }
        
        // Style tabs container
        tabsContainer.style.display = 'flex';
        tabsContainer.style.justifyContent = 'center';
        tabsContainer.style.gap = '5px';
        tabsContainer.style.marginBottom = '15px';
        tabsContainer.style.padding = '5px 0';
        tabsContainer.style.borderBottom = '1px solid #444';
        
        // Clear and recreate tabs
        tabsContainer.innerHTML = '';
        Object.entries(this.tabs).forEach(([tabId, tabData]) => {
            const tabElement = document.createElement('div');
            tabElement.className = 'inventory-tab';
            tabElement.dataset.tab = tabId;
            tabElement.textContent = tabData.name;
            
            // Style tab
            tabElement.style.padding = '5px 10px';
            tabElement.style.border = '1px solid #555';
            tabElement.style.borderRadius = '4px';
            tabElement.style.cursor = 'pointer';
            tabElement.style.backgroundColor = '#333';
            tabElement.style.color = '#ccc';
            
            if (tabId === this.activeTab) {
                tabElement.classList.add('active');
                tabElement.style.backgroundColor = '#007bff';
                tabElement.style.color = 'white';
                tabElement.style.fontWeight = 'bold';
            }
            
            // Hover effect
            tabElement.addEventListener('mouseenter', () => {
                if (tabId !== this.activeTab) {
                    tabElement.style.backgroundColor = '#444';
                }
            });
            
            tabElement.addEventListener('mouseleave', () => {
                if (tabId !== this.activeTab) {
                    tabElement.style.backgroundColor = '#333';
                }
            });
            
            tabsContainer.appendChild(tabElement);
        });
        
        // Get or create inventory grid container
        const inventoryGrid = document.getElementById('inventory-grid');
        if (!inventoryGrid) return;
        
        // Apply grid layout styles - completely remove any spacing and center align
        inventoryGrid.style.display = 'grid';
        inventoryGrid.style.gridTemplateColumns = 'repeat(12, 60px)'; // 12 columns
        inventoryGrid.style.gridTemplateRows = 'repeat(8, 60px)'; // 8 rows
        inventoryGrid.style.gap = '0'; // No gap between slots
        inventoryGrid.style.padding = '0'; // No padding
        inventoryGrid.style.margin = '0 auto'; // Center horizontally
        inventoryGrid.style.width = '720px'; // Exact width for 12 columns of 60px
        inventoryGrid.style.height = '480px'; // Exact height for 8 rows of 60px
        inventoryGrid.style.borderCollapse = 'collapse'; // Collapse borders
        inventoryGrid.style.justifyContent = 'center'; // Center grid items horizontally
        inventoryGrid.style.alignItems = 'center'; // Center grid items vertically
        
        // Clear existing slots
        inventoryGrid.innerHTML = '';
        
        // Get items for the current tab and page
        const filteredItems = this.getFilteredItems();
        const currentPage = this.currentPage[this.activeTab] || 0;
        const startIndex = currentPage * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageItems = filteredItems.slice(startIndex, endIndex);
        
        // Create slots for the current page (96 slots: 12 columns x 8 rows)
        for (let i = 0; i < this.itemsPerPage; i++) {
            const slotElement = document.createElement('div');
            slotElement.className = 'inventory-slot';
            
            // Apply compact slot styling - removed border radius and reduced border
            slotElement.style.width = '60px';
            slotElement.style.height = '60px';
            slotElement.style.border = '0.5px solid #444';
            slotElement.style.backgroundColor = '#222';
            slotElement.style.borderRadius = '0'; // Removed rounded corners
            slotElement.style.display = 'flex';
            slotElement.style.justifyContent = 'center';
            slotElement.style.alignItems = 'center';
            slotElement.style.position = 'relative';
            slotElement.style.margin = '0'; // Ensure no margin
            slotElement.style.padding = '0'; // Ensure no padding
            
            const pageItem = pageItems[i];
            if (pageItem && pageItem.item) {
                const slot = pageItem.item;
                const slotIndex = pageItem.index;
                
                slotElement.dataset.index = slotIndex;
                
                try {
                    // Item in slot
                    let imgSrc = '';
                    
                    // If icon exists, use it, otherwise create placeholder
                    if (slot.icon && !slot.icon.includes('undefined')) {
                        imgSrc = slot.icon;
                    } else {
                        imgSrc = Items.createPlaceholderImage(slot.id);
                    }
                    
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.alt = slot.name || 'Item';
                    img.style.maxWidth = '90%';
                    img.style.maxHeight = '90%';
                    img.style.objectFit = 'contain';
                    img.style.margin = 'auto';
                    slotElement.appendChild(img);
                    
                    // Add quantity for stackable items
                    if (slot.stackable && slot.quantity > 1) {
                        const quantityElement = document.createElement('div');
                        quantityElement.className = 'item-count';
                        quantityElement.textContent = slot.quantity;
                        slotElement.appendChild(quantityElement);
                    }
                } catch (error) {
                    console.error('Error rendering inventory item:', error);
                    // Create fallback display for corrupt items
                    const fallbackText = document.createElement('div');
                    fallbackText.textContent = '?';
                    fallbackText.style.fontSize = '24px';
                    fallbackText.style.color = '#f00';
                    slotElement.appendChild(fallbackText);
                }
                
                // Add tooltip
                slotElement.addEventListener('mouseenter', (e) => {
                    this.showItemTooltip(slot, e.target);
                });
                
                slotElement.addEventListener('mouseleave', () => {
                    this.hideItemTooltip();
                });
                
                // Add click handler
                slotElement.addEventListener('click', () => {
                    this.handleSlotClick(slotIndex);
                });
            }
            
            inventoryGrid.appendChild(slotElement);
        }
        
        // Get or create pagination container
        let paginationContainer = inventoryModal.querySelector('.inventory-pagination');
        if (!paginationContainer) {
            paginationContainer = document.createElement('div');
            paginationContainer.className = 'inventory-pagination';
            inventoryModal.appendChild(paginationContainer);
        }
        
        // Style pagination container
        paginationContainer.style.display = 'flex';
        paginationContainer.style.justifyContent = 'center';
        paginationContainer.style.alignItems = 'center';
        paginationContainer.style.gap = '15px';
        paginationContainer.style.marginTop = '15px';
        paginationContainer.style.padding = '10px 0';
        paginationContainer.style.borderTop = '1px solid #444';
        
        // Update pagination
        paginationContainer.innerHTML = '';
        
        // Get total pages
        const totalPages = this.getTotalPages();
        
        // Previous page button
        const prevButton = document.createElement('button');
        prevButton.className = 'page-prev';
        prevButton.textContent = '← Previous';
        prevButton.disabled = currentPage === 0;
        
        // Style previous button
        prevButton.style.padding = '5px 10px';
        prevButton.style.backgroundColor = currentPage === 0 ? '#333' : '#007bff';
        prevButton.style.color = currentPage === 0 ? '#777' : 'white';
        prevButton.style.border = '1px solid #555';
        prevButton.style.borderRadius = '4px';
        prevButton.style.cursor = currentPage === 0 ? 'default' : 'pointer';
        prevButton.style.opacity = currentPage === 0 ? '0.5' : '1';
        
        paginationContainer.appendChild(prevButton);
        
        // Page indicator
        const pageIndicator = document.createElement('div');
        pageIndicator.className = 'page-indicator';
        pageIndicator.textContent = `Page ${currentPage + 1} of ${totalPages}`;
        pageIndicator.style.fontWeight = 'bold';
        paginationContainer.appendChild(pageIndicator);
        
        // Next page button
        const nextButton = document.createElement('button');
        nextButton.className = 'page-next';
        nextButton.textContent = 'Next →';
        nextButton.disabled = currentPage >= totalPages - 1;
        
        // Style next button
        nextButton.style.padding = '5px 10px';
        nextButton.style.backgroundColor = currentPage >= totalPages - 1 ? '#333' : '#007bff';
        nextButton.style.color = currentPage >= totalPages - 1 ? '#777' : 'white';
        nextButton.style.border = '1px solid #555';
        nextButton.style.borderRadius = '4px';
        nextButton.style.cursor = currentPage >= totalPages - 1 ? 'default' : 'pointer';
        nextButton.style.opacity = currentPage >= totalPages - 1 ? '0.5' : '1';
        
        paginationContainer.appendChild(nextButton);
    },
    
    /**
     * Update the equipment UI for a character
     * @param {string} characterId - (Optional) Character ID, defaults to active character
     */
    updateEquipmentUI: function(characterId = null) {
        // If no character ID was provided, use the active character
        if (!characterId) {
            const activeCharacter = Game.getActiveCharacter();
            if (!activeCharacter) {
                // No active character, nothing to update
                return;
            }
            characterId = activeCharacter.id;
        }
        
        // Get the character object
        const character = CharacterSystem.getCharacterById(characterId);
        if (!character) return;
        
        // Update character portrait
        const portrait = document.getElementById('character-portrait');
        if (portrait) {
            portrait.style.backgroundImage = `url(${character.idleSprite})`;
        }
        
        // Update character stats based on equipment
        Game.updateCharacterStats();
    },
    
    /**
     * Show item tooltip
     * @param {Object} item - Item data
     * @param {HTMLElement} element - Element to attach tooltip to
     */
    showItemTooltip: function(item, element) {
        try {
            // Safety check
            if (!item) {
                console.error("Attempted to show tooltip for null/undefined item");
                return;
            }
            
            // Remove any existing tooltip
            this.hideItemTooltip();
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'item-tooltip';
            tooltip.id = 'item-tooltip';
            
            // Add rarity class for styling
            if (item.rarity) {
                // Handle both string and object rarity formats
                let rarityName = 'common';
                if (typeof item.rarity === 'string') {
                    rarityName = item.rarity.toLowerCase();
                } else if (item.rarity.name) {
                    rarityName = item.rarity.name.toLowerCase();
                }
                tooltip.classList.add(rarityName);
            }
            
            // Item name with rarity color
            const nameElement = document.createElement('h4');
            nameElement.textContent = item.name || 'Unknown Item';
            tooltip.appendChild(nameElement);
            
            // Item image
            let imgSrc = item.icon;
            if (!imgSrc || imgSrc.includes("undefined")) {
                imgSrc = Items.createPlaceholderImage ? Items.createPlaceholderImage(item.id) : '';
            }
            const imgElement = document.createElement('img');
            imgElement.src = imgSrc;
            imgElement.alt = item.name;
            imgElement.className = 'item-tooltip-image';
            tooltip.appendChild(imgElement);
            
            // Item type/category
            const typeElement = document.createElement('div');
            typeElement.className = 'item-type';
            // Determine item type
            let itemType = item.category;
            if (item.equipmentType) {
                // Format the equipment type (e.g., "LIGHT_ARMOR" -> "Light Armor")
                const formattedType = item.equipmentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                itemType = `${formattedType} (${itemType})`;
            }
            typeElement.textContent = itemType;
            tooltip.appendChild(typeElement);
            
            // Required level if applicable
            if (item.level) {
                const levelElement = document.createElement('div');
                levelElement.className = 'item-level';
                levelElement.textContent = `Required Level: ${item.level}`;
                tooltip.appendChild(levelElement);
            }
            
            // Item description
            const descElement = document.createElement('p');
            descElement.textContent = item.description || 'No description available';
            tooltip.appendChild(descElement);
            
            // Item stats
            if (item.stats && Object.keys(item.stats).length > 0) {
                const statsElement = document.createElement('div');
                statsElement.className = 'item-stats';
                
                for (const [stat, value] of Object.entries(item.stats)) {
                    const statElement = document.createElement('div');
                    
                    // Format stat name (e.g., "attackSpeed" -> "Attack Speed")
                    const formattedStat = stat.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    
                    // Determine if stat is positive (buff) or negative (debuff)
                    let valueStr = value.toString();
                    let statClass = '';
                    
                    if (typeof value === 'number') {
                        if (value > 0) {
                            valueStr = '+' + valueStr;
                            statClass = 'stat-buff';
                        } else if (value < 0) {
                            statClass = 'stat-debuff';
                        }
                    }
                    
                    // Create stat name span
                    const statNameSpan = document.createElement('span');
                    statNameSpan.textContent = formattedStat;
                    statElement.appendChild(statNameSpan);
                    
                    // Create stat value span
                    const statValueSpan = document.createElement('span');
                    statValueSpan.textContent = valueStr;
                    if (statClass) {
                        statValueSpan.className = statClass;
                    }
                    statElement.appendChild(statValueSpan);
                    
                    statsElement.appendChild(statElement);
                }
                
                tooltip.appendChild(statsElement);
            }
            
            // Item effects
            if (item.effects && item.effects.length > 0) {
                const effectsElement = document.createElement('div');
                effectsElement.className = 'item-effects';
                
                for (const effect of item.effects) {
                    const effectElement = document.createElement('div');
                    effectElement.textContent = effect;
                    effectsElement.appendChild(effectElement);
                }
                
                tooltip.appendChild(effectsElement);
            }
            
            // Position tooltip
            const rect = element.getBoundingClientRect();
            
            // Position tooltip to the right of the element by default
            let leftPosition = rect.right + 10;
            let topPosition = rect.top;
            
            // Check if the tooltip would go off the right edge of the screen
            const tooltipWidth = 300; // Approximate width based on CSS
            if (leftPosition + tooltipWidth > window.innerWidth) {
                // If it would go off the right edge, position to the left of the element instead
                leftPosition = Math.max(10, rect.left - tooltipWidth - 10);
            }
            
            // Check if the tooltip would go off the bottom of the screen
            const tooltipHeight = 250; // Approximate height
            if (topPosition + tooltipHeight > window.innerHeight) {
                // Adjust to make it fit within the viewport
                topPosition = Math.max(10, window.innerHeight - tooltipHeight - 10);
            }
            
            tooltip.style.left = `${leftPosition}px`;
            tooltip.style.top = `${topPosition}px`;
            
            // Add to document
            document.body.appendChild(tooltip);
            
        } catch (error) {
            console.error("Error showing item tooltip:", error);
            return; // Exit if there's an error
        }
    },
    
    /**
     * Hide item tooltip
     */
    hideItemTooltip: function() {
        const tooltip = document.getElementById('item-tooltip');
        if (tooltip) {
            tooltip.remove();
        }
    },
    
    /**
     * Handle inventory slot click
     * @param {number} index - Slot index
     */
    handleSlotClick: function(index) {
        const slot = this.slots[index];
        if (!slot) return;

        // Prevent any action for material or quest items
        if (slot.category === Items.CATEGORIES.MATERIAL || slot.category === Items.CATEGORIES.QUEST) {
            console.log(`Clicked on a non-interactive item: ${slot.name} (${slot.category})`);
            return; // Do nothing for these item types
        }
        
        // Show context menu with options
        const options = [];
        
        if (Items.isEquippable(slot)) {
            options.push({
                text: 'Equip',
                action: () => this.equipItem(index)
            });
        }
        
        if (Items.isUsable(slot)) {
            options.push({
                text: 'Use',
                action: () => this.useItem(index)
            });
        }
        
        options.push({
            text: 'Drop',
            action: () => this.removeItem(index)
        });
        
        // For simplicity, just execute the first action
        // In a real game, you'd show a context menu
        if (options.length > 0) {
            options[0].action();
        }
    },
    
    /**
     * Get all equipped items for a character
     * @param {string} characterId - (Optional) Character ID, defaults to active character
     * @returns {Array} Array of equipped items
     */
    getEquippedItems: function(characterId = null) {
        // If no character ID was provided, use the active character
        if (!characterId) {
            const activeCharacter = Game.getActiveCharacter();
            if (!activeCharacter) {
                return [];
            }
            characterId = activeCharacter.id;
        }
        
        // Get character's equipment
        const equipment = this.getCharacterEquipment(characterId);
        
        // Return non-null items that aren't dual wield references
        return Object.values(equipment).filter(item => item !== null && !item.isDualWieldRef);
    },
    
    /**
     * Calculate total stats from equipped items for a character
     * @param {string} characterId - (Optional) Character ID, defaults to active character
     * @returns {Object} Combined stats from all equipped items
     */
    getEquipmentStats: function(characterId = null) {
        const stats = {};
        
        try {
            // Check if Game system is available for getting active character
            if (characterId === null && (typeof Game === 'undefined' || !Game.getActiveCharacter)) {
                console.error("Game system not available and no characterId provided");
                return stats;
            }
            
            // Try to get equipped items for the character
            const equippedItems = this.getEquippedItems(characterId);
            
            if (!equippedItems || !Array.isArray(equippedItems)) {
                console.warn("No equipped items found or invalid items array");
                return stats;
            }
            
            // Combine stats from all equipped items
            equippedItems.forEach(item => {
                if (item && item.stats) {
                    for (const [stat, value] of Object.entries(item.stats)) {
                        if (stats[stat]) {
                            stats[stat] += value;
                        } else {
                            stats[stat] = value;
                        }
                    }
                }
            });
        } catch (error) {
            console.error("Error calculating equipment stats:", error);
            // Return empty stats object on error
        }
        
        return stats;
    },
    
    /**
     * Get available equipment items for a specific slot
     * @param {string} slotName - Equipment slot name ('rightHand', 'leftHand', 'armor', 'gloves', 'boots', 'accessory1', 'accessory2')
     * @param {string} characterId - Character ID to check equipment compatibility for
     * @returns {Array} Array of items from inventory that can be equipped in the slot
     */
    getAvailableEquipmentForSlot: function(slotName, characterId) {
        const availableItems = [];
        
        // Filter inventory for equippable items that match the slot requirements
        for (let i = 0; i < this.slots.length; i++) {
            const item = this.slots[i];
            if (!item || !Items.isEquippable(item)) continue;
            
            let isCompatible = false;
            
            switch (slotName) {
                case 'rightHand':
                    // Weapons go in right hand
                    isCompatible = item.category === Items.CATEGORIES.WEAPON;
                    break;
                    
                case 'leftHand':
                    // Shields or possibly off-hand weapons go in left hand
                    isCompatible = (item.category === Items.CATEGORIES.ARMOR && 
                                   item.equipmentType === 'shield');
                    // Could add support for off-hand weapons here if game design allows it
                    break;
                    
                case 'armor':
                    // Armor items (excluding gloves, boots, and shields)
                    isCompatible = (item.category === Items.CATEGORIES.ARMOR && 
                                   item.equipmentType !== 'gloves' && 
                                   item.equipmentType !== 'boots' &&
                                   item.equipmentType !== 'shield');
                    break;
                    
                case 'gloves':
                    // Only gloves - check both ARMOR category with gloves equipmentType and GLOVES category
                    isCompatible = (item.category === Items.CATEGORIES.ARMOR && item.equipmentType === 'gloves') || 
                                   (item.category === Items.CATEGORIES.GLOVES);
                    break;
                    
                case 'boots':
                    // Only boots - check both ARMOR category with boots equipmentType and BOOTS category
                    isCompatible = (item.category === Items.CATEGORIES.ARMOR && item.equipmentType === 'boots') || 
                                   (item.category === Items.CATEGORIES.BOOTS);
                    break;
                    
                case 'accessory1':
                case 'accessory2':
                    // Accessories (rings, amulets, etc.)
                    isCompatible = item.category === Items.CATEGORIES.ACCESSORY;
                    break;
            }
            
            if (isCompatible) {
                availableItems.push({
                    index: i,  // Store the inventory index for equipping later
                    ...item    // Include all item properties
                });
            }
        }
        
        return availableItems;
    },
    
    /**
     * Open the inventory modal
     */
    openInventory: function() {
        // Hide any open tooltips first
        this.hideItemTooltip();
        
        // Create inventory modal if it doesn't exist
        let inventoryModal = document.getElementById('inventory-modal');
        if (!inventoryModal) {
            inventoryModal = document.createElement('div');
            inventoryModal.id = 'inventory-modal';
            inventoryModal.className = 'modal';
            
            // Create modal content with cyberpunk styling
            inventoryModal.innerHTML = `
                <div class="modal-content" style="background: linear-gradient(to bottom, #1a1a2e, #0d0d1a); border: 2px solid #00f7ff;">
                    <div class="modal-header" style="background: linear-gradient(to right, #00111a, #002233); border-bottom: 2px solid #00f7ff;">
                        <h2 style="color: #00f7ff; text-shadow: 0 0 5px rgba(0, 247, 255, 0.5);">INVENTORY</h2>
                        <span class="close-modal" style="color: #00f7ff; font-size: 24px;">&times;</span>
                    </div>
                    <div class="modal-body" style="padding: 20px; max-height: 70vh; overflow-y: auto;">
                        <div id="inventory-grid"></div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(inventoryModal);
            
            // Set up event listener for close button
            const closeButton = inventoryModal.querySelector('.close-modal');
            if (closeButton) {
                closeButton.addEventListener('click', () => {
                    this.hideItemTooltip(); // Hide tooltips when closing
                    Utils.hideModal('inventory-modal');
                });
            }
            
            // Add escape key handler
            const escHandler = (e) => {
                if (e.key === 'Escape') {
                    this.hideItemTooltip();
                    Utils.hideModal('inventory-modal');
                }
            };
            
            // Only add the handler once and store it for cleanup
            inventoryModal.escapeHandler = escHandler;
            document.addEventListener('keydown', escHandler);
        }
        
        // Show the modal
        Utils.showModal('inventory-modal');
        
        // Update the inventory UI
        this.updateInventoryUI();
    },
    
    /**
     * Get filtered items based on the active tab
     * @returns {Array} Array of filtered items with their original indices
     */
    getFilteredItems: function() {
        const tabFilter = this.tabs[this.activeTab].filter;
        const filteredItems = [];
        
        for (let i = 0; i < this.slots.length; i++) {
            const item = this.slots[i];
            if (item && tabFilter(item)) {
                filteredItems.push({
                    item: item,
                    index: i
                });
            }
        }
        
        return filteredItems;
    },
    
    /**
     * Get total number of pages for the current tab
     * @returns {number} Total pages
     */
    getTotalPages: function() {
        const filteredItems = this.getFilteredItems();
        return Math.max(1, Math.ceil(filteredItems.length / this.itemsPerPage));
    },
    
    /**
     * Go to the previous page
     */
    prevPage: function() {
        if (this.currentPage[this.activeTab] > 0) {
            this.currentPage[this.activeTab]--;
            this.updateInventoryUI();
        }
    },
    
    /**
     * Go to the next page
     */
    nextPage: function() {
        const totalPages = this.getTotalPages();
        if (this.currentPage[this.activeTab] < totalPages - 1) {
            this.currentPage[this.activeTab]++;
            this.updateInventoryUI();
        }
    },
    
    setCharacterEquipment: function(characterId, slot, item) {
        if (!this.characterEquipment[characterId]) {
            this.characterEquipment[characterId] = {};
        }
        
        this.characterEquipment[characterId][slot] = item;
        
        // Save immediately when equipment changes
        this.saveToLocal();
        
        // Dispatch equipment changed event
        const event = new CustomEvent('equipmentChanged', {
            detail: {
                characterId: characterId,
                slot: slot,
                item: item
            }
        });
        document.dispatchEvent(event);
        
        // Update UI if needed
        if (typeof this.updateEquipmentUI === 'function') {
            this.updateEquipmentUI(characterId);
        }
    }
};
