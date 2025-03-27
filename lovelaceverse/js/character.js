/**
 * Character system for the Cyberpunk MMORPG game
 * Defines character classes, stats, and abilities
 */
const CharacterSystem = {
    // All unlocked characters
    characters: [],
    
    // Currently active characters (max 6)
    activeCharacters: [],
    
    // Maximum number of active characters
    maxActiveCharacters: 6,
    
    /**
     * Initialize the character system
     * @param {Object} savedData - Saved character data (optional)
     */
    init: function(savedData = null) {
        this.characters = [];
        this.activeCharacters = [];
        
        // Load saved data if available - check directly passed data first
        if (savedData) {
            this.loadFromData(savedData);
        } 
        // If no direct data was passed, check localStorage
        else {
            const localData = Utils.loadFromStorage('characters');
            if (localData) {
                console.log('Loading character data from localStorage');
                this.loadFromData(localData);
            }
        }
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    /**
     * Set up character UI event listeners
     */
    setupEventListeners: function() {
        // Character list button
        const characterListButton = document.getElementById('character-list-button');
        if (characterListButton) {
            characterListButton.addEventListener('click', () => {
                this.openCharacterList();
            });
        }
    },
    
    /**
     * Load character data from saved data
     * @param {Object} data - Saved character data
     */
    loadFromData: function(data) {
        // Load unlocked characters
        if (data.characters) {
            this.characters = data.characters.map(charData => {
                const character = this.createCharacterFromData(charData);
                // Add reset stats method to character
                this.addResetStatsMethod(character);
                return character;
            });
        }
        
        // Load active characters but don't activate them on refresh/login
        // We'll keep this code commented out to remember the original functionality
        // if (data.activeCharacters) {
        //     this.activeCharacters = data.activeCharacters.map(id => {
        //         return this.getCharacterById(id);
        //     }).filter(char => char !== null);
        // }
        
        // Ensure characters start in inactive mode on page refresh/login
        this.activeCharacters = [];
    },
    
    /**
     * Create a character from saved data
     * @param {Object} data - Character data
     * @returns {Object} Character object
     */
    createCharacterFromData: function(data) {
        return {
            id: data.id,
            name: data.name,
            level: data.level || 1,
            experience: data.experience || 0,
            stats: data.stats || this.getDefaultStats(),
            baseStats: data.baseStats || this.getDefaultStats(),
            abilities: data.abilities || [],
            cooldowns: {},
            buffs: [],
            sitSprite: data.sitSprite,
            idleSprite: data.idleSprite,
            runningSprite: data.runningSprite,
            attackSprite: data.attackSprite,
            rangedSprite: data.rangedSprite,
            magicSprite: data.magicSprite,
            specialAbility: data.specialAbility,
            thumbnail: data.thumbnail || null, // Custom thumbnail image
            rarity: data.rarity || "common",
            element: null, // Legacy DOM element (to be removed)
            mapElement: null, // Map sprite element
            thumbnailElement: null, // Character panel thumbnail element
            currentAnimation: "idle",
            currentFrame: 0,
            lastFrameTime: Date.now(),
            x: 0,
            y: 0,
            baseY: 0,
            verticalOffset: 0,
            verticalDirection: Math.random() < 0.5 ? 1 : -1,
            width: 64,
            height: 64,
            attackWidth: 128, // Larger width for attack animations
            isAttacking: false,
            attackTarget: null,
            // Combat movement tracking
            chaseStartTime: 0,
            chaseDuration: 0,
            chaseTargetId: null,
            attackRange: 50, // Distance at which character can attack without perfect overlap
            // Stun properties
            isHit: false,
            hitTime: 0,
            stunDuration: 500 // 0.5 seconds stun duration
        };
    },
    
    /**
     * Get default character stats
     * @returns {Object} Default stats
     */
    getDefaultStats: function() {
        return {
            strength: 1,
            agility: 1,
            vitality: 1,
            dexterity: 1,
            intelligence: 1,
            luck: 1,
            maxHp: 150,
            currentHp: 150,
            maxSp: 50,
            currentSp: 50,
            damage: 50,
            magicDamage: 50,
            rangeDamage: 50,
            attackSpeed: 1.0,
            defense: 50,
            magicDefense: 50,
            hit: 5,
            evasion: 5,
            critical: 5,
            attackRange: 100, // Default base range, will be adjusted by weapon type
            fireResistance: 5,
            waterResistance: 5,
            windResistance: 5,
            earthResistance: 5,
            lightningResistance: 5
        };
    },
    
    /**
     * Create a new character
     * @param {Object} data - Character data
     * @returns {Object} Created character
     */
    createCharacter: function(data) {
        if (!data.id) {
            data.id = Utils.generateId();
        }
        
        const existingChar = this.getCharacterById(data.id);
        if (existingChar) {
            console.log(`Character with ID ${data.id} already exists, returning existing character`);
            return existingChar;
        }
        
        const character = this.createCharacterFromData(data);
        this.addResetStatsMethod(character);
        this.calculateDerivedStats(character);
        this.characters.push(character);
        this.saveData();
        return character;
    },
    
    /**
     * Calculate derived stats based on base stats
     * @param {Object} character - Character to update
     */
    calculateDerivedStats: function(character) {
        const stats = character.stats;
        const baseStats = character.baseStats;
        
        // Reset stats to base values
        for (const key in baseStats) {
            stats[key] = baseStats[key];
        }
        
        // Apply level bonuses
        const levelBonus = character.level - 1;
        stats.strength += Math.floor(levelBonus * 0.5);
        stats.agility += Math.floor(levelBonus * 0.5);
        stats.vitality += Math.floor(levelBonus * 0.5);
        stats.dexterity += Math.floor(levelBonus * 0.5);
        stats.intelligence += Math.floor(levelBonus * 0.5);
        stats.luck += Math.floor(levelBonus * 0.5);
        
        // Calculate derived stats from base attributes
        stats.maxHp = 150 + (stats.vitality * 10);
        stats.maxSp = 50 + (stats.intelligence * 5);
        stats.damage = 50 + (stats.strength * 5);
        stats.magicDamage = 50 + (stats.intelligence * 5);
        stats.rangeDamage = 50 + (stats.dexterity * 5);
        stats.attackSpeed = 1.0 + (stats.agility * 0.02);
        stats.defense = 50 + (stats.vitality * 3);
        stats.magicDefense = 50 + (stats.intelligence * 3);
        stats.hit = 5 + (stats.dexterity * 0.5);
        stats.evasion = 5 + (stats.agility * 0.5) + (stats.luck * 0.2);
        stats.critical = 5 + (stats.luck * 0.5);
        
        // Apply equipment stats
        const equipmentStats = Inventory.getEquipmentStats(character.id); // Assume this returns an object like { attackRange: 50, ... }
        for (const [stat, value] of Object.entries(equipmentStats)) {
            // Exclude attackRange here, handle it separately below
            if (stats[stat] !== undefined && stat !== 'attackRange') {
                if (stat === 'attackSpeed') {
                    // Attack speed from gear might be a percentage increase or flat, adjust as needed
                    // Example: stats[stat] *= (1 + value / 100); // If value is percentage
                    stats[stat] += value; // Assuming flat bonus for now
                } else {
                    // For other flat stats, add
                    stats[stat] += value;
                }
            }
        }

        // --- Calculate Effective Attack Range ---
        const BASE_MELEE_RANGE = 100;
        const BASE_RANGED_RANGE = 400; // Increased base range for ranged
        const BASE_MAGIC_RANGE = 350;  // Increased base range for magic

        let effectiveBaseRange = BASE_MELEE_RANGE; // Default to melee
        // Check weapon type to set the correct base range
        if (typeof Inventory !== 'undefined') {
            const equipment = Inventory.getCharacterEquipment(character.id);
            const weapon = equipment?.rightHand; // Check right hand weapon
            if (weapon && weapon.equipmentType) {
                if (["bow", "crossbow", "rifle"].includes(weapon.equipmentType)) {
                    effectiveBaseRange = BASE_RANGED_RANGE;
                } else if (["staff", "wand", "grimoire"].includes(weapon.equipmentType)) {
                    effectiveBaseRange = BASE_MAGIC_RANGE;
                }
                // Otherwise, it stays BASE_MELEE_RANGE
            }
        }

        // Add flat range bonus from equipment to the determined base range
        const rangeBonus = equipmentStats.attackRange || 0; // Get range bonus from equipment stats
        stats.attackRange = effectiveBaseRange + rangeBonus;
        // --- End Attack Range Calculation ---

        // Ensure HP/SP don't exceed maximum
        stats.currentHp = Math.min(stats.currentHp || stats.maxHp, stats.maxHp);
        stats.currentSp = Math.min(stats.currentSp || stats.maxSp, stats.maxSp);

        console.log(`Calculated stats for ${character.name}: Critical = ${stats.critical}`); // <-- Log final critical stat
    },
    
    /**
     * Activate a character (add to active characters)
     * @param {string} characterId - Character ID
     * @returns {boolean} True if character was activated
     */
    activateCharacter: function(characterId) {
        if (this.activeCharacters.length >= this.maxActiveCharacters) {
            console.warn("Maximum number of active characters reached");
            return false;
        }
        
        // Silently return true if character is already active
        if (this.isCharacterActive(characterId)) {
            // Change from console.log to console.debug to avoid console spam
            console.debug("Character is already active");
            return true;
        }
        
        const character = this.getCharacterById(characterId);
        if (!character) {
            console.error(`Character not found: ${characterId}`);
            return false;
        }
        
        this.activeCharacters.push(character);
        const elements = this.createCharacterElements(character);
        character.mapElement = elements.mapElement;
        character.thumbnailElement = elements.thumbnailElement;
        this.positionCharacter(character);
        this.saveData();
        return true;
    },
    
    /**
     * Deactivate a character (remove from active characters)
     * @param {string} characterId - Character ID
     * @returns {boolean} True if character was deactivated
     */
    deactivateCharacter: function(characterId) {
        if (!this.isCharacterActive(characterId)) {
            console.error("Character is not active");
            return false;
        }
        
        const character = this.getCharacterById(characterId);
        if (!character) {
            console.error(`Character not found: ${characterId}`);
            return false;
        }
        
        this.activeCharacters = this.activeCharacters.filter(c => c.id !== characterId);
        
        if (character.mapElement) {
            const wrapper = document.getElementById(`character-wrapper-${characterId}`);
            if (wrapper) wrapper.remove();
            character.mapElement = null;
        }
        
        if (character.thumbnailElement) {
            character.thumbnailElement.remove();
            character.thumbnailElement = null;
        }
        
        this.saveData();
        return true;
    },
    
    /**
     * Create a DOM element for a character
     * @param {Object} character - Character data
     * @returns {Object} Character elements: {mapElement, thumbnailElement}
     */
    createCharacterElements: function(character) {
        const elements = {
            mapElement: this.createBattleElement(character),
            thumbnailElement: this.createThumbnailElement(character)
        };
        return elements;
    },
    
    /**
     * Create battle element for character (for map display)
     * @param {Object} character - Character data
     * @returns {HTMLElement} Map element
     */
    createBattleElement: function(character) {
        const charactersContainer = document.getElementById("characters-container");
        if (!charactersContainer) return null;
        
        const wrapper = document.createElement("div");
        wrapper.className = "character-wrapper";
        wrapper.id = `character-wrapper-${character.id}`;
        
        const element = document.createElement("div");
        element.className = "character-sprite";
        element.id = `character-${character.id}`;
        element.style.width = `${character.width}px`;
        element.style.height = `${character.height}px`;

        // // Add Name Plate for Character - REMOVED as requested
        // const namePlate = document.createElement('div');
        // namePlate.className = 'character-name-plate';
        // namePlate.textContent = character.name;
        // wrapper.appendChild(namePlate); // Append nameplate to the wrapper

        wrapper.appendChild(element); // Append character sprite after nameplate
        charactersContainer.appendChild(wrapper);
        return element;
    },
    
    /**
     * Create thumbnail element for character panel
     * @param {Object} character - Character data
     * @returns {HTMLElement} Thumbnail element
     */
    createThumbnailElement: function(character) {
        const characterPanel = document.getElementById("character-panel");
        if (!characterPanel) return null;
        
        const thumbnail = document.createElement("div");
        thumbnail.className = "character-thumbnail";
        thumbnail.id = `character-thumbnail-${character.id}`;
        thumbnail.dataset.id = character.id;
        
        const thumbImg = document.createElement("img");
        thumbImg.src = character.thumbnail || character.idleSprite;
        thumbImg.alt = character.name;
        
        // Create HP bar container
        const hpBarContainer = document.createElement("div");
        hpBarContainer.className = "character-hp-bar-container";
        
        // Create HP bar fill
        const hpBarFill = document.createElement("div");
        hpBarFill.className = "character-hp-bar";
        const hpPercentage = (character.stats.currentHp / character.stats.maxHp) * 100;
        hpBarFill.style.width = `${hpPercentage}%`;
        
        // Add gradient color based on HP percentage
        if (hpPercentage < 25) {
            hpBarFill.style.background = 'linear-gradient(to right, #ff0000, #ff3333)';
        } else if (hpPercentage < 50) {
            hpBarFill.style.background = 'linear-gradient(to right, #ff3333, #ff6633)';
        } else {
            hpBarFill.style.background = 'linear-gradient(to right, #ff3366, #ff6633)';
        }
        
        hpBarContainer.appendChild(hpBarFill);

        // Create XP bar container
        const xpBarContainer = document.createElement("div");
        xpBarContainer.className = "character-xp-bar-container";
        
        // Create XP bar fill
        const xpBarFill = document.createElement("div");
        xpBarFill.className = "character-xp-bar";
        
        // Calculate XP percentage for current level
        const currentLevel = character.level;
        const xpForCurrentLevel = currentLevel * 1000;
        const currentLevelXp = character.experience % xpForCurrentLevel;
        const xpPercentage = (currentLevelXp / xpForCurrentLevel) * 100;
        
        xpBarFill.style.width = `${xpPercentage}%`;
        xpBarContainer.appendChild(xpBarFill);
        
        // Add level indicator
        const levelIndicator = document.createElement("div");
        levelIndicator.className = "character-level-indicator";
        levelIndicator.textContent = `Lv.${character.level}`;
        
        thumbnail.appendChild(thumbImg);
        thumbnail.appendChild(levelIndicator);
        thumbnail.appendChild(hpBarContainer);
        thumbnail.appendChild(xpBarContainer);
        
        thumbnail.addEventListener("click", () => {
            this.openCharacterEquipmentModal(character.id);
        });
        
        characterPanel.appendChild(thumbnail);
        return thumbnail;
    },
    
    /**
     * Open character equipment modal
     * @param {string} characterId - Character ID
     */
    openCharacterEquipmentModal: function(characterId) {
        console.log(`Opening equipment modal for character: ${characterId}`);
        const character = this.getCharacterById(characterId);
        if (!character) {
            console.error(`Character not found with ID: ${characterId}`);
            return;
        }
        
        let modal = document.getElementById("character-equipment-modal");
        if (!modal) {
            console.log("Creating new equipment modal");
            modal = this.createCharacterEquipmentModal();
        }
        this.updateCharacterEquipmentModal(character);
        console.log("Showing equipment modal");
        Utils.showModal("character-equipment-modal");
    },
    
    /**
     * Create character equipment modal
     * @returns {HTMLElement} Character equipment modal
     */
    createCharacterEquipmentModal: function() {
        const modal = document.createElement("div");
        modal.id = "character-equipment-modal";
        modal.className = "modal";
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Character Equipment</h2>
                    <span class="close-modal" onclick="Utils.hideModal('character-equipment-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="character-equipment-layout">
                        <div class="character-portrait-section">
                            <div id="equipment-character-portrait"></div>
                            <div id="equipment-character-info">
                                <div id="equipment-character-name"></div>
                                <div id="equipment-character-level"></div>
                                <div id="equipment-character-stats"></div>
                            </div>
                        </div>
                        <div class="equipment-slots-section">
                            <div class="equipment-slot" data-slot="rightHand">
                                <div class="slot-label">Right Hand</div>
                                <div class="slot-item" id="slot-rightHand"></div>
                            </div>
                            <div class="equipment-slot" data-slot="leftHand">
                                <div class="slot-label">Left Hand</div>
                                <div class="slot-item" id="slot-leftHand"></div>
                            </div>
                            <div class="equipment-slot" data-slot="armor">
                                <div class="slot-label">Armor</div>
                                <div class="slot-item" id="slot-armor"></div>
                            </div>
                            <div class="equipment-slot" data-slot="gloves">
                                <div class="slot-label">Gloves</div>
                                <div class="slot-item" id="slot-gloves"></div>
                            </div>
                            <div class="equipment-slot" data-slot="boots">
                                <div class="slot-label">Boots</div>
                                <div class="slot-item" id="slot-boots"></div>
                            </div>
                            <div class="equipment-slot" data-slot="accessory1">
                                <div class="slot-label">Accessory 1</div>
                                <div class="slot-item" id="slot-accessory1"></div>
                            </div>
                            <div class="equipment-slot" data-slot="accessory2">
                                <div class="slot-label">Accessory 2</div>
                                <div class="slot-item" id="slot-accessory2"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        setTimeout(() => {
            const slots = modal.querySelectorAll(".equipment-slot");
            slots.forEach(slot => {
                slot.addEventListener("click", () => {
                    const slotName = slot.getAttribute("data-slot");
                    this.handleEquipmentSlotClick(slotName);
                });
            });
        }, 0);
        
        document.body.appendChild(modal);
        return modal;
    },
    
    /**
     * Update character sprite based on equipped weapon type
     * @param {Object} character - Character to update
     */
    updateCharacterSpriteBasedOnEquipment: function(character) {
        // Guard against invalid character objects
        if (!character) {
            console.error("Cannot update sprite for undefined character");
            return;
        }
        
        // Store original attack sprite if not already saved
        if (!character.originalAttackSprite) {
            character.originalAttackSprite = character.attackSprite;
        }
        
        // Check if Inventory system is available
        if (typeof Inventory === 'undefined') {
            console.error("Inventory system not available");
            character.attackSprite = character.originalAttackSprite;
            return;
        }
        
        try {
            // Get character's equipped weapon
            const equipment = Inventory.getCharacterEquipment(character.id);
            if (!equipment || !equipment.rightHand) {
                // No weapon equipped, always use default attack sprite
                character.attackSprite = character.originalAttackSprite;
                return;
            }
            
            const weapon = equipment.rightHand;
            
            // Choose animation based on weapon type
            if (weapon.equipmentType) {
                // Ranged weapons (bows, crossbows)
                if (["bow", "crossbow", "rifle"].includes(weapon.equipmentType)) {
                    // Make sure rangedSprite exists
                    if (character.rangedSprite) {
                        character.attackSprite = character.rangedSprite;
                    } else {
                        console.warn("Character has no ranged sprite, using default attack sprite");
                        character.attackSprite = character.originalAttackSprite;
                    }
                } 
                // Magic weapons (staffs, wands, grimoires)
                else if (["staff", "wand", "grimoire"].includes(weapon.equipmentType)) {
                    // Make sure magicSprite exists
                    if (character.magicSprite) {
                        character.attackSprite = character.magicSprite;
                    } else {
                        console.warn("Character has no magic sprite, using default attack sprite");
                        character.attackSprite = character.originalAttackSprite;
                    }
                }
                // All other weapons use the default attack sprite
                else {
                    character.attackSprite = character.originalAttackSprite;
                }
            } else {
                // No equipment type specified, use default
                character.attackSprite = character.originalAttackSprite;
            }
        } catch (error) {
            console.error("Error updating character sprite based on equipment:", error);
            // Fallback to original sprite in case of errors
            character.attackSprite = character.originalAttackSprite;
        }
    },
    
    /**
     * Update character equipment modal
     * @param {Object} character - Character data
     */
    updateCharacterEquipmentModal: function(character) {
        // Store the current character ID for equipment interactions
        this.currentEquipmentCharacterId = character.id;
        
        // Update character sprite based on equipped weapon
        this.updateCharacterSpriteBasedOnEquipment(character);
        
        const portrait = document.getElementById("equipment-character-portrait");
        if (portrait) {
            // Use thumbnail instead of full sprite for equipment modal
            portrait.style.backgroundImage = `url(${character.thumbnail || character.idleSprite})`;
            portrait.style.backgroundSize = "64px 64px"; // Make it a small thumbnail
            portrait.style.backgroundPosition = "center";
            portrait.style.backgroundRepeat = "no-repeat";
            portrait.style.width = "64px";
            portrait.style.height = "64px";
            portrait.style.margin = "0 auto";
            portrait.style.border = "2px solid var(--accent-cyan)";
            portrait.style.borderRadius = "5px";
            portrait.style.boxShadow = "0 0 10px rgba(0, 247, 255, 0.5)";
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
        
        const equipment = Inventory.getCharacterEquipment(character.id);
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
                    slotElement.appendChild(img);
                    
                    slotElement.addEventListener("mouseenter", (e) => {
                        Inventory.showItemTooltip(item, e.target);
                    });
                    
                    slotElement.addEventListener("mouseleave", () => {
                        Inventory.hideItemTooltip();
                    });
                    
                    slotElement.addEventListener("click", (e) => {
                        e.stopPropagation();
                        Inventory.unequipItem(slotName, character.id);
                        this.updateCharacterEquipmentModal(character);
                    });
                } else if (item && item.isDualWieldRef) {
                    slotElement.classList.add("dual-wield-ref");
                    const label = document.createElement("div");
                    label.className = "dual-wield-label";
                    label.textContent = "(Dual Wield)";
                    slotElement.appendChild(label);
                }
            }
        }

        // Ensure stats are recalculated after potential equipment changes reflected in the modal
        this.calculateDerivedStats(character);
        // Refresh the stats display in the modal after recalculating
        const refreshedStatsContainer = document.getElementById("equipment-character-stats"); // Renamed variable
         if (refreshedStatsContainer) {
             refreshedStatsContainer.innerHTML = ""; // Clear previous stats
             // Re-populate stats (copied logic from above for brevity)
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
                 refreshedStatsContainer.appendChild(statElement); // Use renamed variable
             });
             const additionalStats = [
                 { name: "Attack Speed", value: character.stats.attackSpeed.toFixed(2) }, // Format attack speed
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
                 refreshedStatsContainer.appendChild(statElement); // Use renamed variable
             });
         }
    },
    
    /**
     * Property to store the currently active equipment modal character ID
     */
    currentEquipmentCharacterId: null,

    /**
     * Handle equipment slot click: open equipment selection modal for the slot.
     * @param {string} slotName - Equipment slot name
     */
    handleEquipmentSlotClick: function(slotName) {
        console.log(`Clicked equipment slot: ${slotName}`);
        if (!this.currentEquipmentCharacterId) {
            console.error("No current equipment character set");
            return;
        }
        this.openEquipmentSelectionModal(slotName, this.currentEquipmentCharacterId);
    },

    /**
     * Opens a modal to display available equipment items for the specified slot.
     * @param {string} slotName - Equipment slot name
     * @param {string} characterId - Character ID
     */
    openEquipmentSelectionModal: function(slotName, characterId) {
        // Retrieve available equipment items for the slot from Inventory
        const availableItems = Inventory.getAvailableEquipmentForSlot(slotName, characterId);

        let modal = document.getElementById("equipment-selection-modal");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "equipment-selection-modal";
            modal.className = "modal";
            document.body.appendChild(modal);
        }
        modal.innerHTML = "";
        
        // Build modal content
        const content = document.createElement("div");
        content.className = "modal-content";
        
        const header = document.createElement("div");
        header.className = "modal-header";
        const title = document.createElement("h2");
        title.className = "modal-title";
        title.textContent = "Select Equipment for " + slotName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        header.appendChild(title);
        const closeBtn = document.createElement("span");
        closeBtn.className = "close-modal";
        closeBtn.innerHTML = "&times;";
        closeBtn.addEventListener("click", function() {
            Utils.hideModal("equipment-selection-modal");
        });
        header.appendChild(closeBtn);
        content.appendChild(header);
        
        const body = document.createElement("div");
        body.className = "modal-body";
        
        if (availableItems.length === 0) {
            const noItemsMsg = document.createElement("div");
            noItemsMsg.textContent = "No available equipment for this slot.";
            noItemsMsg.style.textAlign = "center";
            noItemsMsg.style.padding = "20px";
            noItemsMsg.style.color = "#00f7ff";
            body.appendChild(noItemsMsg);
        } else {
            // Create equipment grid
            const equipmentGrid = document.createElement("div");
            equipmentGrid.className = "equipment-selection-grid";
            equipmentGrid.style.display = "grid";
            equipmentGrid.style.gridTemplateColumns = "repeat(auto-fill, 80px)";
            equipmentGrid.style.gap = "10px";
            equipmentGrid.style.justifyContent = "center";
            
            availableItems.forEach(item => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "equipment-item";
                
                // Set fixed size for equipment items
                itemDiv.style.width = "80px";
                itemDiv.style.height = "110px";
                itemDiv.style.padding = "8px";
                itemDiv.style.boxSizing = "border-box";
                itemDiv.style.border = "1px solid #444";
                itemDiv.style.borderRadius = "5px";
                itemDiv.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
                itemDiv.style.display = "flex";
                itemDiv.style.flexDirection = "column";
                itemDiv.style.alignItems = "center";
                itemDiv.style.cursor = "pointer";
                
                const imgContainer = document.createElement("div");
                imgContainer.style.width = "64px";
                imgContainer.style.height = "64px";
                imgContainer.style.display = "flex";
                imgContainer.style.justifyContent = "center";
                imgContainer.style.alignItems = "center";
                imgContainer.style.marginBottom = "5px";
                
                const img = document.createElement("img");
                img.src = item.icon || (Items.createPlaceholderImage ? Items.createPlaceholderImage(item.id) : "");
                img.alt = item.name;
                img.style.maxWidth = "64px";
                img.style.maxHeight = "64px";
                img.style.objectFit = "contain";
                
                imgContainer.appendChild(img);
                itemDiv.appendChild(imgContainer);
                
                const itemName = document.createElement("div");
                itemName.className = "equipment-item-name";
                itemName.textContent = item.name;
                itemName.style.fontSize = "12px";
                itemName.style.textAlign = "center";
                itemName.style.width = "100%";
                itemName.style.overflow = "hidden";
                itemName.style.textOverflow = "ellipsis";
                itemName.style.whiteSpace = "nowrap";
                itemDiv.appendChild(itemName);
                
                // Add rarity color if available
                if (item.rarity && item.rarity.color) {
                    itemDiv.style.borderColor = item.rarity.color;
                    itemName.style.color = item.rarity.color;
                }
                
                // Add tooltip functionality
                itemDiv.addEventListener("mouseenter", (e) => {
                    Inventory.showItemTooltip(item, e.target);
                });
                
                itemDiv.addEventListener("mouseleave", () => {
                    Inventory.hideItemTooltip();
                });
                
                itemDiv.addEventListener("click", () => {
                    // Equip the selected item using its index
                    Inventory.equipItem(item.index, characterId);
                    
                    // Update the equipment modal display for the character
                    const character = this.getCharacterById(characterId);
                    if (character) {
                        this.updateCharacterEquipmentModal(character);
                    }
                    Utils.hideModal("equipment-selection-modal");
                });
                
                equipmentGrid.appendChild(itemDiv);
            });
            
            body.appendChild(equipmentGrid);
        }
        
        content.appendChild(body);
        modal.appendChild(content);
        Utils.showModal("equipment-selection-modal");
    },
    
    /**
     * Position a character on the screen
     * @param {Object} character - Character to position
     */
    positionCharacter: function(character) {
        if (!character.mapElement) return;
        
        const container = document.getElementById("characters-container");
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        // Define the box boundaries higher on the screen
        const movementBox = {
            top: 450,    // Adjusted lower (was 400)
            bottom: 650, // Adjusted lower (was 600)
            left: containerRect.width * 0.2,
            right: containerRect.width * 0.8
        };
        
        // Random initial position within the box
        character.x = Math.random() * (movementBox.right - movementBox.left) + movementBox.left;
        character.y = Math.random() * (movementBox.bottom - movementBox.top) + movementBox.top;
        character.baseY = character.y;
        
        // Store movement boundaries in character object
        character.movementBounds = movementBox;
        
        character.mapElement.style.left = `${character.x}px`;
        character.mapElement.style.top = `${character.y}px`;
        character.mapElement.style.zIndex = Math.round(character.y);
    },
    
    /**
     * Update all characters
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateCharacters: function(deltaTime) {
        const now = Date.now();
        this.activeCharacters.forEach(character => {
            // Check for stun status
            const isStunned = character.isHit && (now - character.hitTime < character.stunDuration);

            // Clear hit state if stun duration is over
            if (character.isHit && !isStunned) {
                character.isHit = false;
            }

            // Skip updates if stunned
            if (isStunned) {
                // Optionally, you could add a specific "hit" animation here
                // this.setAnimation(character, "hit"); // Assuming a "hit" animation exists
                return; // Skip the rest of the update for this character
            }

            const frameElapsed = now - character.lastFrameTime;
            // Scale animation speed with attack speed for attack animations
            const baseFrameDuration = character.isAttacking ? 100 : 200;
            const frameDuration = character.isAttacking 
                ? baseFrameDuration / (character.stats.attackSpeed || 1) 
                : baseFrameDuration;
            
            if (frameElapsed >= frameDuration) {
                let frameCount;
                switch (character.currentAnimation) {
                    case "sit":
                    case "idle":
                        frameCount = 2;
                        break;
                    case "run":
                        frameCount = 8;
                        break;
                    case "attack":
                        frameCount = 13;
                        break;
                    case "ranged":
                        frameCount = 13;
                        break;
                    case "magic":
                        frameCount = 7;
                        break;
                    default:
                        frameCount = 2;
                        break;
                }
                
                // Store old frame for transition detection
                const oldFrame = character.currentFrame;
                
                // Update to new frame
                character.currentFrame = (character.currentFrame + 1) % frameCount;
                character.lastFrameTime = now;
                
                if (character.mapElement) {
                    let spriteUrl;
                    switch (character.currentAnimation) {
                        case "sit":
                            spriteUrl = character.sitSprite;
                            break;
                        case "run":
                            spriteUrl = character.runningSprite;
                            break;
                        case "attack":
                            spriteUrl = character.attackSprite;
                            // Apply attack width for attack animation
                            character.mapElement.style.width = `${character.attackWidth}px`;
                            break;
                        case "ranged":
                            spriteUrl = character.rangedSprite;
                            break;
                        case "magic":
                            spriteUrl = character.magicSprite;
                            break;
                        case "idle":
                        default:
                            spriteUrl = character.idleSprite;
                            // Reset to normal width for non-attack animations
                            character.mapElement.style.width = `${character.width}px`;
                            break;
                    }
                    character.mapElement.style.backgroundImage = `url(${spriteUrl})`;
                    
                    // Use attackWidth for attack animations, regular width for others
                    const frameWidth = character.currentAnimation === "attack" ? character.attackWidth : character.width;
                    character.mapElement.style.backgroundPosition = `-${character.currentFrame * frameWidth}px 0`;
                    
                    // Check for projectile launch at specific animation frames
                    if (character.pendingProjectile && character.isAttacking && 
                        typeof ProjectileEffects !== 'undefined') {
                        
                        let launchProjectile = false;
                        
                        // For ranged attacks (bow/crossbow), launch at specific frame
                        if (character.currentAnimation === "ranged") {
                            // Launch at frame 8 (about 2/3 through the animation)
                            if (character.currentFrame === 8) {
                                launchProjectile = true;
                                console.log("Launching arrow projectile from " + character.name);
                            }
                        }
                        // For magic attacks (staff/wand/grimoire), launch at specific frame
                        else if (character.currentAnimation === "magic") {
                            // Launch at frame 3 (middle of the animation)
                            if (character.currentFrame === 3) {
                                launchProjectile = true;
                                console.log("Launching fireball projectile from " + character.name);
                            }
                        }
                        
                        if (launchProjectile) {
                            // Get position info
                            const sourceX = character.x + character.width / 2;
                            const sourceY = character.y + character.height / 2;
                            const target = character.pendingProjectile.target;
                            
                            if (target && !target.isDead) {
                                const targetX = target.x + target.width / 2;
                                const targetY = target.y + target.height / 2;
                                
                                // Create the projectile, passing pre-calculated damage and crit status
                                ProjectileEffects.createProjectile(
                                    character.pendingProjectile.type,
                                    sourceX, sourceY,
                                    targetX, targetY,
                                    target,
                                    character,
                                    character.pendingProjectile.damage, // Pass calculated damage
                                    character.pendingProjectile.isCrit    // Pass crit status
                                );
                            }

                            // Clear pending projectile
                            character.pendingProjectile = null;
                        }
                    }
                }
                
                // Check for attack completion (loop back to frame 0)
                if (character.isAttacking && character.currentFrame === 0) {
                    character.isAttacking = false;
                    character.currentAnimation = "idle";
                    character.attackTarget = null;
                    
                    // Clear any remaining pending projectile
                    character.pendingProjectile = null;
                }
            }
            this.updateVerticalMovement(character, deltaTime);
            this.updateCooldowns(character, deltaTime);
            if (character.buffs) {
                CharacterBuffs.updateBuffs(character);
            }
            this.checkCombat(character);
        });
    },
    
    /**
     * Update character position and state
     * @param {Object} character - Character to update
     * @param {number} deltaTime - Time since last update
     */
    updateCharacter: function(character, deltaTime) {
        if (!character || !character.mapElement) return;
        
        // If already attacking a target, continue until it dies
        if (character.attackTarget) {
            const currentTarget = this.activeMonsters.find(m => m.id === character.attackTarget);
            if (currentTarget && currentTarget.hp > 0) {
                this.handleCombat(character, currentTarget, deltaTime);
                return;
            }
        }
        
        // No current target or target died - check for new monsters
        const nearestMonster = this.getNearestMonster(character);
        if (nearestMonster && this.isMonsterInMovementBox(nearestMonster, character.movementBounds)) {
            this.handleCombat(character, nearestMonster, deltaTime);
        } else {
            // No monsters in range - resume random movement
            character.isAttacking = false;
            character.attackTarget = null;
            character.isPositionedForAttack = false;
            this.updateVerticalMovement(character, deltaTime);
        }
    },

    /**
     * Handle combat with monster
     * @param {Object} character - Character in combat
     * @param {Object} monster - Target monster
     * @param {number} deltaTime - Time since last update
     */
    handleCombat: function(character, monster, deltaTime) {
        // If already attacking a monster, continue attacking until it dies
        if (character.attackTarget) {
            const currentTarget = this.activeMonsters.find(m => m.id === character.attackTarget);
            
            // If current target still exists and isn't dead, continue attacking it
            if (currentTarget && currentTarget.hp > 0) {
                const charCenter = {
                    x: character.x + character.width / 2,
                    y: character.y + character.height / 2
                };
                const targetCenter = {
                    x: currentTarget.x + currentTarget.width / 2,
                    y: currentTarget.y + currentTarget.height / 2
                };
                
                const dx = targetCenter.x - charCenter.x;
                const dy = targetCenter.y - charCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Use the calculated attackRange from stats
                const attackRange = character.stats.attackRange || 100; // Fallback to 100 if undefined
                
                if (distance <= attackRange) {
                    // In range - maintain position and continue attacking
                    if (!character.isPositionedForAttack) {
                        // Pass the actual attack range for positioning
                        this.positionCharacterForAttack(character, currentTarget, attackRange);
                        character.isPositionedForAttack = true;
                    }
                    
                    // Update facing direction
                    const direction = targetCenter.x > charCenter.x ? 1 : -1;
                    if (character.mapElement) {
                        character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
                    }
                    
                    // Continue attacking
                    this.attackMonster(character, currentTarget);
                    return; // Exit early to maintain focus on current target
                } else {
                    // Target moved out of range - move towards it
                    character.isPositionedForAttack = false;
                    this.moveTowardsMonster(character, currentTarget);
                    return;
                }
            } else {
                // Current target is dead or gone - clear target
                character.attackTarget = null;
                character.isAttacking = false;
                character.isPositionedForAttack = false;
            }
        }
        
        // No current target or previous target died - check for new target
        const charCenter = {
            x: character.x + character.width / 2,
            y: character.y + character.height / 2
        };
        const monsterCenter = {
            x: monster.x + monster.width / 2,
            y: monster.y + monster.height / 2
        };
        
        const dx = monsterCenter.x - charCenter.x;
        const dy = monsterCenter.y - charCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Use the calculated attackRange from stats
        const attackRange = character.stats.attackRange || 100; // Fallback to 100 if undefined
        
        if (distance <= attackRange) {
            // New monster in range - start attacking
            character.isAttacking = true;
            character.attackTarget = monster.id;
            
            if (!character.isPositionedForAttack) {
                // Pass the actual attack range for positioning
                this.positionCharacterForAttack(character, monster, attackRange);
                character.isPositionedForAttack = true;
            }
            
            // Update facing direction
            const direction = monsterCenter.x > charCenter.x ? 1 : -1;
            if (character.mapElement) {
                character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
            }
            
            this.attackMonster(character, monster);
        } else {
            // Monster not in range - move towards it
            character.isPositionedForAttack = false;
            this.moveTowardsMonster(character, monster);
        }
    },

    /**
     * Attack monster
     * @param {Object} character - Attacking character
     * @param {Object} monster - Target monster
     */
    attackMonster: function(character, monster) {
        // Only attack if not in attack cooldown
        const now = Date.now();
        if (!character.lastAttackTime || now - character.lastAttackTime >= character.attackCooldown) {
            character.isAttacking = true;
            
            // Calculate damage based on character's attack and monster's defense
            const damage = Math.max(1, character.stats.attack - (monster.defense || 0));
            
            // Apply damage to monster
            if (monster.hp) {
                monster.hp = Math.max(0, monster.hp - damage);
                
                // Show damage text
                Utils.createDamageText(monster.x + monster.width / 2, monster.y, damage, "#ff0000");
                
                // Set monster hit state
                monster.isHit = true;
                monster.hitTime = now;
                
                // Play attack animation
                if (character.mapElement) {
                    character.mapElement.classList.add('attacking');
                    setTimeout(() => {
                        character.mapElement.classList.remove('attacking');
                    }, 500);
                }
                
                // Play attack sound if available
                if (typeof AudioSystem !== 'undefined') {
                    AudioSystem.playSound('attack');
                }
            }
            
            // Update last attack time
            character.lastAttackTime = now;
        }
    },

    /**
     * Update vertical movement for character
     * @param {Object} character - Character to update
     * @param {number} deltaTime - Time since last update
     */
    updateVerticalMovement: function(character, deltaTime) {
        // Only move if not attacking
        if (character.isAttacking) return;
        
        if (!character.moveTarget) {
            this.setNewMoveTarget(character);
        }
        
        const dx = character.moveTarget.x - character.x;
        const dy = character.moveTarget.y - character.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 5) {
            this.setNewMoveTarget(character);
        } else {
            // Reduced speed from 0.05 to 0.02 for even slower movement
            const speed = 0.1;
            character.x += (dx / distance) * speed * deltaTime;
            character.y += (dy / distance) * speed * deltaTime;
            
            // Keep within boundaries
            character.x = Math.max(character.movementBounds.left, 
                        Math.min(character.movementBounds.right, character.x));
            character.y = Math.max(character.movementBounds.top, 
                        Math.min(character.movementBounds.bottom, character.y));
            
            // Update position
            character.mapElement.style.left = `${character.x}px`;
            character.mapElement.style.top = `${character.y}px`;
            
            // Update character facing direction based on movement
            if (character.mapElement) {
                // Flip sprite based on horizontal movement direction
                const movingRight = dx > 0;
                character.mapElement.style.transform = movingRight ? "scaleX(1)" : "scaleX(-1)";
                
                // Set running animation if moving
                if (distance > 0.1) {
                    this.setAnimation(character, "run");
                } else {
                    this.setAnimation(character, "idle");
                }
            }
        }
    },
    
    /**
     * Set new random movement target within bounds
     * @param {Object} character - Character to set target for
     */
    setNewMoveTarget: function(character) {
        const bounds = character.movementBounds;
        character.moveTarget = {
            x: Math.random() * (bounds.right - bounds.left) + bounds.left,
            y: Math.random() * (bounds.bottom - bounds.top) + bounds.top
        };
    },
    
    /**
     * Update ability cooldowns
     * @param {Object} character - Character to update
     * @param {number} deltaTime - Time since last update in milliseconds
     */
    updateCooldowns: function(character, deltaTime) {
        for (const abilityId in character.cooldowns) {
            character.cooldowns[abilityId] -= deltaTime / 1000;
            if (character.cooldowns[abilityId] <= 0) {
                delete character.cooldowns[abilityId];
            }
        }
    },
    
    /**
     * Check for combat with monsters
     * @param {Object} character - Character to check
     */
    checkCombat: function(character) {
        const nearestMonster = this.getNearestMonster(character);
        if (nearestMonster) {
            const monsterInBox = this.isMonsterInMovementBox(nearestMonster, character.movementBounds);
            
            if (monsterInBox) {
                const charCenter = {
                    x: character.x + character.width / 2,
                    y: character.y + character.height / 2
                };
                const monsterCenter = {
                    x: nearestMonster.x + nearestMonster.width / 2,
                    y: nearestMonster.y + nearestMonster.height / 2
                };
                
                const dx = monsterCenter.x - charCenter.x;
                const dy = monsterCenter.y - charCenter.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Use the calculated attackRange from stats
                const attackRange = character.stats.attackRange || 100; // Fallback to 100 if undefined
                
                // Attack if monster is within range
                if (distance <= attackRange) {
                    // Pass the actual attack range for positioning
                    this.positionCharacterForAttack(character, nearestMonster, attackRange);
                    this.attackMonster(character, nearestMonster);
                    character.chaseStartTime = 0;
                    character.chaseDuration = 0;
                    character.chaseTargetId = null;
                } else {
                    // Move towards monster if within box but not in attack range
                    this.moveTowardsMonster(character, nearestMonster);
                }
            }
        }
    },

    /**
     * Check if monster is within the character movement box
     * @param {Object} monster - Monster to check
     * @param {Object} bounds - Movement box boundaries
     * @returns {boolean} - True if monster is in box
     */
    isMonsterInMovementBox: function(monster, bounds) {
        const monsterCenter = {
            x: monster.x + monster.width / 2,
            y: monster.y + monster.height / 2
        };
        
        return monsterCenter.x >= bounds.left &&
               monsterCenter.x <= bounds.right &&
               monsterCenter.y >= bounds.top &&
               monsterCenter.y <= bounds.bottom;
    },
    
    /**
     * Position character properly for attack based on their attack range.
     * @param {Object} character - Character to position
     * @param {Object} monster - Monster to attack
     * @param {number} attackRange - The character's current calculated attack range.
     */
    positionCharacterForAttack: function(character, monster, attackRange) {
        const monsterCenterX = monster.x + monster.width / 2;
        const monsterCenterY = monster.y + monster.height / 2;
        const direction = monsterCenterX > (character.x + character.width / 2) ? 1 : -1; // Determine direction based on current position

        let desiredDistance;
        const BASE_MELEE_RANGE_THRESHOLD = 150; // Use a threshold slightly above base melee

        if (attackRange > BASE_MELEE_RANGE_THRESHOLD) {
            // Ranged or Magic Attack: Position slightly inside max range
            desiredDistance = attackRange * 0.9; // Position at 90% of max range
        } else {
            // Melee Attack: Position based on character and monster widths
            desiredDistance = (monster.width / 2) + (character.width / 2) + 10; // Add a small buffer
        }

        // Calculate target position based on desired distance and direction
        const targetX = monsterCenterX - (desiredDistance * direction);
        const targetY = monsterCenterY; // Align vertically for simplicity, adjust if needed

        // Calculate new position, clamping within movement bounds
        const newX = targetX - character.width / 2; // Adjust for character width
        const newY = targetY - character.height / 2; // Adjust for character height

        // Ensure position stays within movement bounds
        character.x = Math.max(character.movementBounds.left,
                    Math.min(character.movementBounds.right, newX));
        character.y = Math.max(character.movementBounds.top,
                    Math.min(character.movementBounds.bottom, newY));
        
        // Update character facing direction
        if (character.mapElement) {
            character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
            character.mapElement.style.left = `${character.x}px`;
            character.mapElement.style.top = `${character.y}px`;
        }
    },
    
    /**
     * Get the nearest monster to a character
     * @param {Object} character - Character to check
     * @returns {Object|null} Nearest monster or null if none
     */
    getNearestMonster: function(character) {
        if (MonsterSystem.activeMonsters.length === 0) return null;
        let nearestMonster = null;
        let nearestDistance = Infinity;
        MonsterSystem.activeMonsters.forEach(monster => {
            const distance = Utils.distance(
                { x: character.x + character.width / 2, y: character.y + character.height / 2 },
                { x: monster.x + monster.width / 2, y: monster.y + monster.height / 2 }
            );
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestMonster = monster;
            }
        });
        return nearestMonster;
    },
    
    /**
     * Move a character towards a monster
     * @param {Object} character - Character to move
     * @param {Object} monster - Target monster
     */
    moveTowardsMonster: function(character, monster) {
        const bounds = character.movementBounds;
        
        // Calculate centers
        const charCenterX = character.x + character.width / 2;
        const charCenterY = character.y + character.height / 2;
        const monsterCenterX = monster.x + monster.width / 2;
        const monsterCenterY = monster.y + monster.height / 2;
        
        // Calculate direction and movement
        const dx = monsterCenterX - charCenterX;
        const dy = monsterCenterY - charCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            // Reduced speed from 0.2 to 0.1 for slower movement
            const speed = 0.1;
            const newX = character.x + (dx / distance) * speed;
            const newY = character.y + (dy / distance) * speed;
            
            // Keep within movement box
            character.x = Math.max(bounds.left, Math.min(bounds.right, newX));
            character.y = Math.max(bounds.top, Math.min(bounds.bottom, newY));
            
            // Update position
            character.mapElement.style.left = `${character.x}px`;
            character.mapElement.style.top = `${character.y}px`;
        }
    },
    
    /**
     * Attack a monster
     * @param {Object} character - Attacking character
     * @param {Object} monster - Target monster
     */
    attackMonster: function(character, monster) {
        // Only attack if not in cooldown and not already attacking
        const now = Date.now();
        if (character.isAttacking || (character.lastAttackTime && now - character.lastAttackTime < 1000/character.stats.attackSpeed)) {
            return;
        }
        
        // Prevent rapid attack reset when repositioning
        if (character.isPositionedForAttack && Date.now() - character.positionTime < 100) {
            return;
        }
        
        character.isAttacking = true;
        character.attackTarget = monster.id;
        const charCenterX = character.x + character.width / 2;
        const monsterCenterX = monster.x + monster.width / 2;
        const direction = monsterCenterX > charCenterX ? 1 : -1;
        
        // Calculate cooldown based on attack speed
        character.attackCooldown = 1000 / character.stats.attackSpeed;
        character.lastAttackTime = now;
        if (character.mapElement) {
            character.mapElement.style.transform = direction > 0 ? "scaleX(1)" : "scaleX(-1)";
        }
        
        // Get character's equipped weapon
        const equipment = Inventory.getCharacterEquipment(character.id);
        const weapon = equipment.rightHand;
        
        // Choose animation based on weapon type
        let animationType = "attack"; // Default melee attack
        let projectileType = null;
        let soundEffect = "attackSprite"; // Default attack sound
        
        if (weapon && weapon.equipmentType) {
            // Ranged weapons (bows, crossbows)
            if (["bow", "crossbow", "rifle"].includes(weapon.equipmentType)) {
                animationType = "ranged";
                projectileType = "ARROW";
                soundEffect = "rangedSprite";
            } 
            // Magic weapons (staffs, wands, grimoires)
            else if (["staff", "wand", "grimoire"].includes(weapon.equipmentType)) {
                animationType = "magic";
                projectileType = "FIREBALL";
                soundEffect = "magicSprite";
            }
        }
        
        // Play the appropriate sound effect if AudioSystem is available
        if (typeof AudioSystem !== 'undefined') {
            AudioSystem.playSoundEffect(soundEffect);
        }
        
        // Set the animation based on weapon type
        this.setAnimation(character, animationType);
        
        character.currentFrame = 0;
        if (character.mapElement) {
            character.mapElement.style.backgroundPosition = "0 0";
        }

        // --- Calculate Damage (including Crit/Miss) for ALL attack types ---
        let baseDamage = 0;
        if (animationType === "ranged") {
            baseDamage = character.stats.rangeDamage || character.stats.damage;
        } else if (animationType === "magic") {
            baseDamage = character.stats.magicDamage || character.stats.damage;
        } else { // Melee
            baseDamage = character.stats.damage;
        }

        console.log(`Character ${character.name} attacking with critical stat: ${character.stats?.critical}`);
        const combatResult = CombatMechanics.calculateDamage(character, monster, baseDamage);

        // Display the result (damage number or MISS) - This happens immediately for visual feedback
        CombatMechanics.displayDamageNumber(monster, combatResult.damage, combatResult.isCrit, combatResult.isMiss);

        // --- Apply Damage or Schedule Projectile ---
        if (projectileType) {
            // Ranged/Magic: Schedule projectile hit if it wasn't a miss
            if (!combatResult.isMiss) {
                 character.pendingProjectile = {
                     type: projectileType,
                     target: monster,
                     damage: combatResult.damage, // Pass calculated damage
                     isCrit: combatResult.isCrit, // Pass crit status
                     sourceCharacter: character // Pass source character
                 };
                 // Note: ProjectileEffects.createProjectile has been updated
                 // to accept and use this damage value instead of recalculating.
            } else {
                 // If it was a miss, play miss sound (optional)
                 if (typeof AudioSystem !== 'undefined') {
                     AudioSystem.playSound('miss');
                 }
            }
        } else {
            // Melee: Apply damage directly if it wasn't a miss
            if (!combatResult.isMiss) {
                MonsterSystem.damageMonster(monster.id, combatResult.damage, character);
            } else {
                 // Optional: Play a miss sound or visual effect
                 if (typeof AudioSystem !== 'undefined') {
                    AudioSystem.playSound('miss');
                 }
            }
        }
    },
    
    /**
     * Set character animation
     * @param {Object} character - Character to animate
     * @param {string} animation - Animation name ("idle", "run", "attack", etc.)
     */
    setAnimation: function(character, animation) {
        if (character.currentAnimation === animation) return;
        character.currentAnimation = animation;
        character.currentFrame = 0;
        if (character.mapElement) {
            let spriteUrl;
            switch (animation) {
                case "sit":
                    spriteUrl = character.sitSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "run":
                    spriteUrl = character.runningSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "attack":
                    spriteUrl = character.attackSprite;
                    // Use the wider width for attack animation
                    character.mapElement.style.width = `${character.attackWidth}px`;
                    break;
                case "ranged":
                    spriteUrl = character.rangedSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "magic":
                    spriteUrl = character.magicSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
                case "idle":
                default:
                    spriteUrl = character.idleSprite;
                    character.mapElement.style.width = `${character.width}px`;
                    break;
            }
            character.mapElement.style.backgroundImage = `url(${spriteUrl})`;
            character.mapElement.style.backgroundPosition = "0 0";
        }
    },
    
    /**
     * Get a character by ID
     * @param {string} id - Character ID
     * @returns {Object|null} Character object or null if not found
     */
    getCharacterById: function(id) {
        return this.characters.find(char => char.id === id);
    },
    
    /**
     * Check if a character is active
     * @param {string} id - Character ID
     * @returns {boolean} True if character is active
     */
    isCharacterActive: function(id) {
        return this.activeCharacters.some(char => char.id === id);
    },
    
    /**
     * Get all active characters
     * @returns {Array} Array of active characters
     */
    getActiveCharacters: function() {
        return this.activeCharacters;
    },
    
    /**
     * Get the active character (first one)
     * @returns {Object|null} Active character or null if none
     */
    getActiveCharacter: function() {
        return this.activeCharacters.length > 0 ? this.activeCharacters[0] : null;
    },
    
    /**
     * Open the character list UI with Three.js visualization
     */
    openCharacterList: function() {
        // Create modal if it doesn't exist
        let modal = document.getElementById("character-list-modal");
        if (!modal) {
            modal = this.createCharacterListModal();
        }
        
        // Show the modal
        Utils.showModal("character-list-modal");
        
        // Initialize Three.js visualization after modal is shown
        setTimeout(() => {
            if (typeof CharacterThreeEnvironment !== 'undefined') {
                CharacterThreeEnvironment.init('character-three-container');
            } else {
                console.warn('CharacterThreeEnvironment not available, falling back to standard UI');
                this.updateCharacterListUI();
            }
        }, 100);
    },
    
    /**
     * Create character list modal with Three.js container
     * @returns {HTMLElement} Modal element
     */
    createCharacterListModal: function() {
        const modal = document.createElement("div");
        modal.id = "character-list-modal";
        modal.className = "modal";
        
        modal.innerHTML = `
            <div class="modal-content cyberpunk-modal">
                <div class="modal-header">
                    <h2 class="modal-title">CHARACTER ROSTER</h2>
                    <span class="close-modal" onclick="Utils.hideModal('character-list-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <!-- Three.js container -->
                    <div id="character-three-container" class="character-three-container" style="width: 100%; height: 70vh;"></div>
                    
                    <!-- Fallback container for standard UI -->
                    <div id="character-list-container" style="display: none;">
                        <div id="character-list"></div>
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="character-count-info">
                        Characters: <span id="active-character-count">0</span>/<span id="total-character-count">0</span>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add some additional styles for the modal
        const style = document.createElement("style");
        style.textContent = `
            .character-three-container {
                background-color: rgb(0, 13, 31);
                border-radius: 5px;
                overflow: hidden;
                box-shadow: 0 0 20px rgba(0, 247, 255, 0.3);
            }
            
            .modal-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background-color: rgba(0, 13, 31, 0.8);
                border-top: 1px solid rgba(0, 247, 255, 0.3);
            }
            
            .character-count-info {
                color: #00f7ff;
                font-size: 14px;
            }
            
            #character-action-buttons {
                transition: all 0.3s ease;
                transform-origin: top left;
                animation: buttonAppear 0.3s forwards;
            }
            
            @keyframes buttonAppear {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        document.head.appendChild(style);
        
        return modal;
    },
    
    /**
     * Update the character list UI (fallback when Three.js isn't available)
     */
    updateCharacterListUI: function() {
        const characterList = document.getElementById("character-list");
        if (!characterList) return;
        characterList.innerHTML = "";
        
        // Update character counts
        const activeCount = document.getElementById("active-character-count");
        const totalCount = document.getElementById("total-character-count");
        if (activeCount) activeCount.textContent = this.activeCharacters.length;
        if (totalCount) totalCount.textContent = this.characters.length;
        
        // Show standard UI container and hide Three.js container
        const threeContainer = document.getElementById("character-three-container");
        const standardContainer = document.getElementById("character-list-container");
        
        if (threeContainer) threeContainer.style.display = "none";
        if (standardContainer) standardContainer.style.display = "block";
        
        const uniqueCharacters = {};
        this.characters.forEach(character => {
            uniqueCharacters[character.id] = character;
        });
        
        Object.values(uniqueCharacters).forEach(character => {
            const card = document.createElement("div");
            card.className = `character-card ${this.isCharacterActive(character.id) ? "active" : ""}`;
            card.dataset.id = character.id;
            
            // Character image container
            const imgContainer = document.createElement("div");
            imgContainer.className = "character-image-container2";
            const img = document.createElement("img");
            img.src = character.thumbnail || character.idleSprite;
            img.alt = character.name;
            imgContainer.appendChild(img);
            card.appendChild(imgContainer);
            
            // Character name at the top 
            const name = document.createElement("h3");
            name.textContent = character.name;
            name.style.marginTop = "0";
            name.style.marginBottom = "5px";
            name.style.textAlign = "center";
            card.appendChild(name);
            
            // Character info section
            const infoSection = document.createElement("div");
            infoSection.className = "character-info";
            
            // Level first
            const level = document.createElement("div");
            level.className = "character-level";
            level.textContent = `Level ${character.level}`;
            infoSection.appendChild(level);
            
            // Add upgrade level info
            const upgradeInfo = document.createElement("div");
            upgradeInfo.className = "upgrade-info";
            
            // Current upgrade level as overlay on character image
            /*const upgradeLevel = document.createElement("div");
            upgradeLevel.className = "upgrade-level";
            upgradeLevel.innerHTML = `<span>Upgrade</span><span>Lv. ${character.level}</span>`;
            upgradeLevel.style.position = "absolute";
            upgradeLevel.style.top = "30px"; // Position below character name
            upgradeLevel.style.left = "0";
            upgradeLevel.style.width = "100%";
            upgradeLevel.style.fontSize = "16px";
            upgradeLevel.style.fontWeight = "bold";
            upgradeLevel.style.color = "#f7ff00"; // Bright yellow for contrast
            upgradeLevel.style.textAlign = "center";
            upgradeLevel.style.padding = "3px 0";
            upgradeLevel.style.backgroundColor = "rgba(0, 0, 30, 0.7)";
            upgradeLevel.style.zIndex = "5";
            upgradeLevel.style.textShadow = "0 0 3px #000, 0 0 5px #000";
            imgContainer.appendChild(upgradeLevel); // Add to image container instead of upgradeInfo*/
            
            // Upgrade progress bar
            const upgradeBarContainer = document.createElement("div");
            upgradeBarContainer.className = "upgrade-bar-container";
            upgradeBarContainer.style.width = "100%";
            upgradeBarContainer.style.height = "10px";
            upgradeBarContainer.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
            upgradeBarContainer.style.borderRadius = "5px";
            upgradeBarContainer.style.margin = "5px 0";
            
            const upgradeFill = document.createElement("div");
            upgradeFill.className = "upgrade-fill";
            
            // Calculate upgrade progress (using XP as placeholder)
            const xpRequired = character.level * 1000;
            const currentXp = character.experience % xpRequired;
            const upgradeProgress = (currentXp / xpRequired) * 100;
            
            upgradeFill.style.width = `${upgradeProgress}%`;
            upgradeFill.style.height = "100%";
            upgradeFill.style.backgroundColor = "#aa00ff";
            upgradeFill.style.borderRadius = "5px";
            upgradeBarContainer.appendChild(upgradeFill);
            
            // Append upgrade elements
            upgradeInfo.appendChild(upgradeBarContainer);
            
            // Add upgrade info to character info section
            infoSection.appendChild(upgradeInfo);
            
            // Add rarity indicator at the bottom
            const rarityElement = document.createElement("div");
            rarityElement.className = `rarity rarity-${character.rarity}`;
            rarityElement.textContent = character.rarity.charAt(0).toUpperCase() + character.rarity.slice(1);
            card.appendChild(rarityElement);
            
            card.appendChild(infoSection);
            
            card.addEventListener("click", (event) => {
                this.handleCharacterCardClick(character.id, event);
            });
            
            characterList.appendChild(card);
        });
    },
    
    /**
     * Handle character card click
     * @param {string} characterId - Character ID
     */
    handleCharacterCardClick: function(characterId, event) {
        // Show the character popover instead of the full modal
        this.showCharacterPopover(characterId, event);
    },
    
    /**
     * Show character popover with action buttons
     * @param {string} characterId - Character ID
     * @param {MouseEvent} event - Click event
     */
    showCharacterPopover: function(characterId, event) {
        const character = this.getCharacterById(characterId);
        if (!character) return;
        
        // Remove any existing popovers
        this.hideAllPopovers();
        
        // Create popover element
        const popover = document.createElement("div");
        popover.className = "character-popover";
        popover.id = `character-popover-${characterId}`;
        
        // Add character name as header
        const header = document.createElement("div");
        header.className = "character-popover-header";
        header.textContent = character.name;
        popover.appendChild(header);
        
        // Create deploy/dispatch toggle
        const isActive = this.isCharacterActive(characterId);
        const deployToggle = document.createElement("div");
        deployToggle.className = "character-switch-container";
        
        const toggleLabel = document.createElement("div");
        toggleLabel.className = "character-switch-label";
        toggleLabel.textContent = "Deploy";
        deployToggle.appendChild(toggleLabel);
        
        const switchLabel = document.createElement("label");
        switchLabel.className = "character-switch";
        
        const toggleInput = document.createElement("input");
        toggleInput.type = "checkbox";
        toggleInput.checked = isActive;
        
        const slider = document.createElement("span");
        slider.className = "character-switch-slider";
        
        switchLabel.appendChild(toggleInput);
        switchLabel.appendChild(slider);
        deployToggle.appendChild(switchLabel);
        
        // Add toggle event
        toggleInput.addEventListener("change", () => {
            if (toggleInput.checked) {
                this.activateCharacter(characterId);
            } else {
                this.deactivateCharacter(characterId);
            }
            
            // Update character list UI if visible
            if (document.getElementById("character-list-modal").style.display !== "none") {
                this.updateCharacterListUI();
            }
        });
        
        popover.appendChild(deployToggle);
        
        // Equipment button
        const equipmentButton = document.createElement("button");
        equipmentButton.className = "character-popover-button equipment";
        equipmentButton.textContent = "Equipment";
        equipmentButton.addEventListener("click", () => {
            this.hideAllPopovers();
            this.openCharacterEquipmentModal(characterId);
        });
        popover.appendChild(equipmentButton);
        
        // Upgrade button
        const upgradeButton = document.createElement("button");
        upgradeButton.className = "character-popover-button upgrade";
        upgradeButton.textContent = "Upgrade";
        upgradeButton.addEventListener("click", () => {
            this.hideAllPopovers();
            if (typeof ShardSystem !== 'undefined' && ShardSystem.showUpgradeUI) {
                ShardSystem.showUpgradeUI(characterId);
            } else {
                console.error("Shard system not available");
            }
        });
        popover.appendChild(upgradeButton);
        
        // Add to document
        document.body.appendChild(popover);
        
        // Position popover near the clicked element
        const targetElement = event.currentTarget || event.target;
        const rect = targetElement.getBoundingClientRect();
        popover.style.left = `${rect.right + 10}px`;
        popover.style.top = `${rect.top}px`;
        
        // Ensure popover is fully visible on screen
        const popoverRect = popover.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (popoverRect.right > windowWidth) {
            // Show on left side of target if won't fit on right
            popover.style.left = `${rect.left - popoverRect.width - 10}px`;
        }
        
        if (popoverRect.bottom > windowHeight) {
            // Adjust vertical position to fit
            popover.style.top = `${Math.max(0, rect.top - (popoverRect.bottom - windowHeight))}px`;
        }
        
        // Add click outside listener
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick);
        }, 0);
    },
    
    /**
     * Handle click outside of popover to close it
     * @param {MouseEvent} event - Click event
     */
    handleOutsideClick: function(event) {
        const popover = document.querySelector('.character-popover');
        if (popover && !popover.contains(event.target) && 
            !event.target.closest('.character-card')) {
            CharacterSystem.hideAllPopovers();
        }
    },
    
    /**
     * Hide all character popovers
     */
    hideAllPopovers: function() {
        const popovers = document.querySelectorAll('.character-popover');
        popovers.forEach(popover => popover.remove());
        document.removeEventListener('click', this.handleOutsideClick);
    },
    
    /**
     * Show the character actions menu with EQUIP, DEPLOY/DISPATCH, UPGRADE buttons
     * @param {string} characterId - Character ID
     */
    showCharacterActionsMenu: function(characterId) {
        const character = this.getCharacterById(characterId);
        if (!character) return;
        
        // Check if modal already exists
        let modal = document.getElementById("character-actions-modal");
        if (!modal) {
            // Create the modal
            modal = document.createElement("div");
            modal.id = "character-actions-modal";
            modal.className = "modal";
            
            // Create modal content
            const content = document.createElement("div");
            content.className = "modal-content";
            
            // Modal header
            const header = document.createElement("div");
            header.className = "modal-header";
            
            const title = document.createElement("h2");
            title.className = "modal-title";
            title.textContent = "Character Actions";
            
            const closeButton = document.createElement("span");
            closeButton.className = "close-modal";
            closeButton.innerHTML = "&times;";
            closeButton.addEventListener("click", () => {
                Utils.hideModal("character-actions-modal");
            });
            
            header.appendChild(title);
            header.appendChild(closeButton);
            
            // Create body
            const body = document.createElement("div");
            body.className = "modal-body";
            
            // Character info
            const characterInfo = document.createElement("div");
            characterInfo.className = "character-info";
            
            const characterImage = document.createElement("img");
            characterImage.src = character.thumbnail || character.idleSprite;
            characterImage.alt = character.name;
            
            const characterDetails = document.createElement("div");
            characterDetails.className = "character-details";
            
            const characterName = document.createElement("div");
            characterName.textContent = character.name;
            
            const characterLevel = document.createElement("div");
            characterLevel.textContent = `Level ${character.level}`;
            
            const characterRarity = document.createElement("div");
            characterRarity.textContent = character.rarity.charAt(0).toUpperCase() + character.rarity.slice(1);
            characterRarity.className = `rarity-${character.rarity}`;
            
            characterDetails.appendChild(characterName);
            characterDetails.appendChild(characterLevel);
            characterDetails.appendChild(characterRarity);
            
            characterInfo.appendChild(characterImage);
            characterInfo.appendChild(characterDetails);
            
            // Create HP bar
            const hpContainer = document.createElement("div");
            hpContainer.className = "stat-container";
            
            const hpLabel = document.createElement("div");
            hpLabel.className = "stat-label";
            const hpName = document.createElement("span");
            hpName.textContent = "HP";
            const hpValue = document.createElement("span");
            hpValue.textContent = `${character.stats.currentHp}/${character.stats.maxHp}`;
            hpLabel.appendChild(hpName);
            hpLabel.appendChild(hpValue);
            
            const hpBarContainer = document.createElement("div");
            hpBarContainer.className = "stat-bar-container hp-bar";
            const hpFill = document.createElement("div");
            hpFill.className = "stat-fill";
            hpFill.style.width = `${(character.stats.currentHp / character.stats.maxHp) * 100}%`;
            hpBarContainer.appendChild(hpFill);
            
            hpContainer.appendChild(hpLabel);
            hpContainer.appendChild(hpBarContainer);
            
            // Create SP bar
            const spContainer = document.createElement("div");
            spContainer.className = "stat-container";
            
            const spLabel = document.createElement("div");
            spLabel.className = "stat-label";
            const spName = document.createElement("span");
            spName.textContent = "SP";
            const spValue = document.createElement("span");
            spValue.textContent = `${character.stats.currentSp}/${character.stats.maxSp}`;
            spLabel.appendChild(spName);
            spLabel.appendChild(spValue);
            
            const spBarContainer = document.createElement("div");
            spBarContainer.className = "stat-bar-container sp-bar";
            const spFill = document.createElement("div");
            spFill.className = "stat-fill";
            spFill.style.width = `${(character.stats.currentSp / character.stats.maxSp) * 100}%`;
            spBarContainer.appendChild(spFill);
            
            body.appendChild(characterInfo);
            body.appendChild(hpContainer);
            body.appendChild(spContainer);
            
            content.appendChild(body);
            modal.appendChild(content);
            
            document.body.appendChild(modal);
        }
        
        Utils.showModal("character-actions-modal");
    },
    
    /**
     * Add reset stats method to character
     * @param {Object} character - Character to add method to
     */
    addResetStatsMethod: function(character) {
        character.resetStats = function() {
            const baseStats = this.baseStats;
            for (const stat in baseStats) {
                this.stats[stat] = baseStats[stat];
            }
        };
    },
    
    /**
     * Save character data
     */
    saveData: function() {
        const data = {
            characters: this.characters.map(char => ({
                id: char.id,
                name: char.name,
                level: char.level,
                experience: char.experience,
                stats: char.stats,
                baseStats: char.baseStats,
                abilities: char.abilities,
                cooldowns: char.cooldowns,
                buffs: char.buffs,
                sitSprite: char.sitSprite,
                idleSprite: char.idleSprite,
                runningSprite: char.runningSprite,
                attackSprite: char.attackSprite,
                rangedSprite: char.rangedSprite,
                magicSprite: char.magicSprite,
                specialAbility: char.specialAbility,
                thumbnail: char.thumbnail,
                rarity: char.rarity,
                element: char.element,
                mapElement: char.mapElement,
                thumbnailElement: char.thumbnailElement,
                currentAnimation: char.currentAnimation,
                currentFrame: char.currentFrame,
                lastFrameTime: char.lastFrameTime,
                x: char.x,
                y: char.y,
                baseY: char.baseY,
                verticalOffset: char.verticalOffset,
                verticalDirection: char.verticalDirection,
                width: char.width,
                height: char.height,
                attackWidth: char.attackWidth,
                isAttacking: char.isAttacking,
                attackTarget: char.attackTarget,
                chaseStartTime: char.chaseStartTime,
                chaseDuration: char.chaseDuration,
                chaseTargetId: char.chaseTargetId,
                attackRange: char.attackRange
            })),
            activeCharacters: this.activeCharacters.map(char => char.id)
        };
        Utils.saveToStorage('characters', data);
    },
    
    /**
     * Load character data
     */
    loadData: function() {
        const data = Utils.loadFromStorage('characters');
        if (data) {
            this.loadFromData(data);
        }
    },
    
    /**
     * Reset all characters
     */
    resetAllCharacters: function() {
        this.characters.forEach(char => {
            char.resetStats();
        });
        this.saveData();
    },
    
    /**
     * Reset a specific character
     * @param {string} characterId - ID of the character to reset
     */
    resetCharacter: function(characterId) {
        const character = this.getCharacterById(characterId);
        if (character) {
            
            spContainer.appendChild(spLabel);
            spContainer.appendChild(spBarContainer);
            
            // Create XP bar
            const xpRequired = character.level * 1000;
            const currentXp = character.experience % xpRequired;
            const xpContainer = document.createElement("div");
            xpContainer.className = "stat-container";
            
            const xpLabel = document.createElement("div");
            xpLabel.className = "stat-label";
            const xpName = document.createElement("span");
            xpName.textContent = "XP";
            const xpValue = document.createElement("span");
            xpValue.textContent = `${currentXp}/${xpRequired}`;
            xpLabel.appendChild(xpName);
            xpLabel.appendChild(xpValue);
            
            const xpBarContainer = document.createElement("div");
            xpBarContainer.className = "stat-bar-container xp-bar";
            const xpFill = document.createElement("div");
            xpFill.className = "stat-fill";
            xpFill.style.width = `${(currentXp / xpRequired) * 100}%`;
            xpBarContainer.appendChild(xpFill);
            
            xpContainer.appendChild(xpLabel);
            xpContainer.appendChild(xpBarContainer);
            
            // Add stat bars
            const statBars = document.createElement("div");
            statBars.className = "character-stat-bars";
            statBars.appendChild(hpContainer);
            statBars.appendChild(spContainer);
            statBars.appendChild(xpContainer);
            
            // Action buttons container
            const actionButtons = document.createElement("div");
            actionButtons.className = "action-buttons";
            
            // Equipment button
            const equipButton = document.createElement("button");
            equipButton.className = "game-button equip";
            equipButton.textContent = "EQUIP";
            equipButton.addEventListener("click", () => {
                Utils.hideModal("character-actions-modal");
                this.openCharacterEquipmentModal(characterId);
            });
            
            // Deploy/Dispatch button
            const deployButton = document.createElement("button");
            const isActive = this.isCharacterActive(characterId);
            
            if (isActive) {
                deployButton.className = "game-button dispatch";
                deployButton.textContent = "DISPATCH";
            } else {
                deployButton.className = "game-button deploy";
                deployButton.textContent = "DEPLOY";
            }
            
            deployButton.addEventListener("click", () => {
                if (isActive) {
                    this.deactivateCharacter(characterId);
                } else {
                    this.activateCharacter(characterId);
                }
                Utils.hideModal("character-actions-modal");
                this.updateCharacterListUI();
            });
            
            // Upgrade button
            const upgradeButton = document.createElement("button");
            upgradeButton.className = "game-button upgrade";
            upgradeButton.textContent = "UPGRADE";
            upgradeButton.addEventListener("click", () => {
                Utils.hideModal("character-actions-modal");
                if (typeof ShardSystem !== 'undefined' && ShardSystem.showUpgradeUI) {
                    ShardSystem.showUpgradeUI(characterId);
                } else {
                    console.error("Shard system not available");
                }
            });
            
            actionButtons.appendChild(equipButton);
            actionButtons.appendChild(deployButton);
            actionButtons.appendChild(upgradeButton);
            
            // Add elements to body
            body.appendChild(characterInfo);
            body.appendChild(statBars);
            body.appendChild(actionButtons);
            
            // Assemble modal
            content.appendChild(header);
            content.appendChild(body);
            modal.appendChild(content);
            
            document.body.appendChild(modal);
        } else {
            // Update existing modal for this character
            const characterName = modal.querySelector(".modal-title");
            if (characterName) characterName.textContent = `Character Actions: ${character.name}`;
            
            const characterImage = modal.querySelector("img");
            if (characterImage) characterImage.src = character.thumbnail || character.idleSprite;
            
            const nameDisplay = modal.querySelector(".modal-body div div:first-child");
            if (nameDisplay) nameDisplay.textContent = character.name;
            
            const levelDisplay = modal.querySelector(".modal-body div div:nth-child(2)");
            if (levelDisplay) levelDisplay.textContent = `Level ${character.level}`;
            
            const rarityDisplay = modal.querySelector(".modal-body div div:nth-child(3)");
            if (rarityDisplay) {
                rarityDisplay.textContent = character.rarity.charAt(0).toUpperCase() + character.rarity.slice(1);
                rarityDisplay.className = `rarity-${character.rarity}`;
            }
            
            // Update deploy/dispatch button
            const deployButton = modal.querySelectorAll("button")[1];
            if (deployButton) {
                const isActive = this.isCharacterActive(characterId);
                deployButton.textContent = isActive ? "DISPATCH" : "DEPLOY";
                deployButton.onclick = () => {
                    if (isActive) {
                        this.deactivateCharacter(characterId);
                    } else {
                        this.activateCharacter(characterId);
                    }
                    Utils.hideModal("character-actions-modal");
                    this.updateCharacterListUI();
                };
            }
        }
        
        // Show the modal
        Utils.showModal("character-actions-modal");
    },
    
    /**
     * Add experience to a character
     * @param {Object} character - Character to add experience to
     * @param {number} amount - Amount of experience to add
     */
    addExperience: function(character, amount) {
        if (!character?.id || typeof amount !== 'number' || amount <= 0) {
            console.error('Invalid XP addition:', { character, amount });
            return false;
        }

        const originalXP = character.experience;
        character.experience = Math.floor(character.experience + amount);
        
        const newLevel = Utils.calculateLevel(character.experience);
        const leveledUp = newLevel > character.level;
        
        if (leveledUp) {
            console.log(`${character.name} leveled up to ${newLevel} (${originalXP} -> ${character.experience} XP)`);
            character.level = newLevel;
            this.calculateDerivedStats(character);
            
            // Visual feedback
            Utils.createDamageText(
                character.x + character.width / 2,
                character.y,
                "Level Up!",
                "#ffff00"
            );
            
            // Audio feedback if available
            if (typeof AudioSystem?.playSound === 'function') {
                AudioSystem.playSound('level_up');
            }
        } else {
            console.debug(`${character.name} gained ${amount} XP (${originalXP} -> ${character.experience})`);
        }
        
        // Update UI elements
        if (character.thumbnailElement) {
            // Update XP bar
            const xpRequired = character.level * 1000;
            const currentXp = character.experience % xpRequired;
            const xpBar = character.thumbnailElement.querySelector('.character-xp-bar');
            if (xpBar) {
                xpBar.style.width = `${(currentXp / xpRequired) * 100}%`;
            }
            
            // Update level indicator
            const levelIndicator = character.thumbnailElement.querySelector('.character-level-indicator');
            if (levelIndicator) {
                levelIndicator.textContent = `Lv.${character.level}`;
            }
        }
        
        // Always save after XP changes
        this.saveData();
        return leveledUp;
    },
    
    /**
     * Heal a character
     * @param {Object} character - Character to heal
     * @param {number} amount - Amount to heal
     */
    heal: function(character, amount) {
        character.stats.currentHp = Math.min(character.stats.currentHp + amount, character.stats.maxHp);
        Utils.createDamageText(character.x + character.width / 2, character.y, amount, "#00ff00");
        UIManager.updateCharacterHpBar(character);
        if (this.activeCharacters.length > 0 && this.activeCharacters[0].id === character.id) {
            UIManager.updateCharacterStatsDisplay(character);
        }
    },
    
    /**
     * Reset stats method for a character instance
     */
    addResetStatsMethod: function(character) {
        character.resetStats = function() {
            CharacterSystem.resetStats(this);
        };
    },
    
    /**
     * Reset character stats to base values
     * @param {Object} character - Character to reset
     */
    resetStats: function(character) {
        for (const key in character.baseStats) {
            character.stats[key] = character.baseStats[key];
        }
        this.calculateDerivedStats(character);
    },
    
    /**
     * Save character data
     */
    saveData: function() {
        const data = {
            characters: this.characters.map(char => ({
                id: char.id,
                name: char.name,
                level: char.level,
                experience: char.experience,
                stats: char.stats,
                baseStats: char.baseStats,
                abilities: char.abilities,
                sitSprite: char.sitSprite,
                idleSprite: char.idleSprite,
                runningSprite: char.runningSprite,
                attackSprite: char.attackSprite,
                rangedSprite: char.rangedSprite,
                magicSprite: char.magicSprite,
                specialAbility: char.specialAbility,
                thumbnail: char.thumbnail,
                rarity: char.rarity
            })),
            activeCharacters: this.activeCharacters.map(char => char.id)
        };
        Utils.saveToStorage("characters", data);
    },
    
    /**
     * Load character data
     * @returns {Object|null} Loaded character data or null if not found
     */
    loadData: function() {
        return Utils.loadFromStorage("characters");
    },
    
    /**
     * Apply damage to character
     * @param {Object} character - Character to damage
     * @param {number} damage - Amount of damage
     * @param {Object} source - Damage source
     */
    applyDamage: function(character, damage, source) {
        if (!character || character.isDead) return;
        
        // Calculate actual damage
        const actualDamage = Math.max(1, damage - character.stats.defense);
        character.stats.currentHp = Math.max(0, character.stats.currentHp - actualDamage);
        
        // Show damage number
        Utils.createDamageText(
            character.x + character.width / 2,
            character.y,
            actualDamage,
            "#ff0000"
        );

        // Set hit state for stun
        character.isHit = true;
        character.hitTime = Date.now();
        
        // Update UI
        if (window.UIManager) {
            UIManager.updateCharacterHpBar(character);
        }
        
        // Check for death
        if (character.stats.currentHp <= 0) {
            CharacterDeath.handleDeath(character);
        }
    },
    
    /**
     * Apply upgrade bonus to character
     * @param {Object} character - Character to apply upgrade bonus to
     */
    applyUpgradeBonus: function(character) {
        // Double stats for each upgrade level
        const upgradeMultiplier = Math.pow(2, character.upgradeLevel);
        
        // Apply to base stats
        for (const stat in character.baseStats) {
            // Get original stat value (before any upgrades)
            const originalValue = this.getOriginalStatValue(character, stat);
            
            // Apply multiplier
            character.baseStats[stat] = Math.floor(originalValue * upgradeMultiplier);
        }
        
        // Recalculate all derived stats
        CharacterSystem.calculateDerivedStats(character);
        
        // Save character data
        CharacterSystem.saveData();
        
        // Trigger save event for database sync
        const event = new CustomEvent('characterUpgraded', {
            detail: { characterId: character.id }
        });
        document.dispatchEvent(event);
    }
};
