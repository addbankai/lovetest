/**
 * UI Manager for the Cyberpunk MMORPG game
 * Manages the game's UI elements and interactions
 */

const UIManager = {
    /**
     * Initialize the UI system
     */
    init: function() {
        console.log('Initializing UI Manager...');
        this.setupTabSystem();
        this.setupCharacterUIEvents();
        this.initializeCharacterPanel();
        this.setupMenuButtons();
        this.setupButtonSounds();
        // Call the tutorial arrow update initially
        // this.updateGachaTutorialArrow(); // Commented out
    },

    /**
     * Setup menu button event listeners
     */
    setupMenuButtons: function() {
        // Inventory button
        const inventoryButton = document.getElementById('inventory-button');
        if (inventoryButton) {
            inventoryButton.title = 'Inventory'; // Add tooltip
            inventoryButton.addEventListener('click', function() {
                document.getElementById('inventory-modal').style.display = 'block';
            });
        }

        // Character list button
        const characterListButton = document.getElementById('character-list-button');
        if (characterListButton) {
            characterListButton.title = 'Character List'; // Add tooltip
            characterListButton.addEventListener('click', function() {
                document.getElementById('character-list-modal').style.display = 'block';
            });
        }

        // Gacha button
        const gachaButton = document.getElementById('gacha-button');
        if (gachaButton) {
            gachaButton.title = 'DNA Gacha'; // Add tooltip
            gachaButton.addEventListener('click', function() {
                document.getElementById('gacha-modal').style.display = 'block';
                // Initialize gacha animation if available
                if (typeof GachaThreeEnvironment !== 'undefined' &&
                    typeof GachaThreeEnvironment.init === 'function') {
                    GachaThreeEnvironment.init();
                }
            });
        }

        // Dungeon button
        const dungeonButton = document.getElementById('dungeon-button');
        if (dungeonButton) {
            dungeonButton.title = 'Dungeons'; // Add tooltip
            dungeonButton.addEventListener('click', function() {
                if (document.getElementById('dungeon-modal')) {
                    document.getElementById('dungeon-modal').style.display = 'block';
                    // Initialize dungeon animation if available
                    // if (typeof DungeonThreeEnvironment !== 'undefined' &&
                    //     typeof DungeonThreeEnvironment.init === 'function') {
                    //     DungeonThreeEnvironment.init();
                    // }
                }
            });
        }

        // Marketplace button
        const marketplaceButton = document.getElementById('marketplace-button');
        if (marketplaceButton) {
            marketplaceButton.title = 'Marketplace'; // Add tooltip
            marketplaceButton.addEventListener('click', function() {
                document.getElementById('marketplace-modal').style.display = 'block';
                // Initialize marketplace 3D environment
                if (typeof MarketplaceThreeEnvironment !== 'undefined' &&
                    typeof MarketplaceThreeEnvironment.init === 'function') {
                    MarketplaceThreeEnvironment.init('marketplace-three-container');
                }
            });
        }

        // Crafting button
        const craftingButton = document.getElementById('crafting-button');
        if (craftingButton) {
            craftingButton.title = 'Crafting'; // Add tooltip
            craftingButton.addEventListener('click', function() {
                console.log('Crafting button clicked from UI.js');
                const craftingModal = document.getElementById('crafting-modal');
                if (craftingModal) {
                    craftingModal.style.display = 'block';
                    if (typeof Crafting !== 'undefined') {
                        Crafting.updateCraftingUI('cybernetics');
                    }
                }
            });
        }

        // Market button
        const marketButton = document.getElementById('market-button');
        if (marketButton) {
            marketButton.title = 'Market (Coming Soon)'; // Add tooltip
            marketButton.addEventListener('click', function() {
                Utils.showNotification(
                    'Coming Soon',
                    'Market feature will be available soon!',
                    3000
                );
            });
        }

        // Faction War button
        const warButton = document.getElementById('war-button');
        if (warButton) {
            warButton.title = 'Faction War (Coming Soon)'; // Add tooltip
            warButton.addEventListener('click', function() {
                Utils.showNotification(
                    'Coming Soon',
                    'Faction War feature will be available soon!',
                    3000
                );
            });
        }

        // PvP button
        const pvpButton = document.getElementById('pvp-button');
        if (pvpButton) {
            pvpButton.title = 'PvP Arena (Coming Soon)'; // Add tooltip
            pvpButton.addEventListener('click', function() {
                Utils.showNotification(
                    'Coming Soon',
                    'PvP Arena feature will be available soon!',
                    3000
                );
            });
        }

        // Adamons button
        const adamonsButton = document.getElementById('adamons-button');
        if (adamonsButton) {
            adamonsButton.title = 'Adamons (Coming Soon)'; // Add tooltip
            adamonsButton.addEventListener('click', function() {
                Utils.showNotification(
                    'Coming Soon',
                    'Adamons feature will be available soon!',
                    3000
                );
            });
        }
    },

    /**
     * Setup click sound effects for buttons
     */
    setupButtonSounds: function() {
        // Add click sound to all buttons
        document.addEventListener('click', (e) => {
            // Check if the clicked element is a button or has a button role
            if (e.target.tagName === 'BUTTON' ||
                e.target.closest('button') ||
                e.target.role === 'button' ||
                e.target.className.includes('button') ||
                e.target.closest('.modal-header .close-modal')) {

                // Play click sound if AudioSystem is available
                if (typeof AudioSystem !== 'undefined') {
                    AudioSystem.playSoundEffect('click');
                }
            }
        });
    },

    /**
     * Initialize the character panel with all active characters
     */
    initializeCharacterPanel: function() {
        const characterPanel = document.getElementById('character-panel');
        if (!characterPanel) return;

        // Clear the panel first
        characterPanel.innerHTML = '';

        // Initialize p5.js effects
        CharacterPanelEffects.init();

        // Get all active characters
        const activeCharacters = CharacterSystem.getActiveCharacters();

        // Add thumbnails for all active characters
        activeCharacters.forEach(character => {
            if (!character.thumbnailElement) {
                const thumbnail = this.createCharacterThumbnail(character);
                character.thumbnailElement = thumbnail;
                characterPanel.appendChild(thumbnail);
                // Add p5.js effects to thumbnail
                CharacterPanelEffects.enhanceThumbnail(thumbnail);
            } else {
                this.updateCharacterPanel(character);
                characterPanel.appendChild(character.thumbnailElement);
            }
        });

        this.updateCharacterPanelActiveStatus();
    },

/**
 * /**
 * Create a character thumbnail for the panel
 * @param {Object} character - Character data
 * @returns {HTMLElement} Thumbnail element
 */
createCharacterThumbnail: function(character) {
    const thumbnail = document.createElement('div');
    thumbnail.className = 'character-thumbnail';
    thumbnail.id = `character-thumbnail-${character.id}`;
    thumbnail.dataset.id = character.id;

    // Add level indicator
    const thumbLevel = document.createElement('div');
    thumbLevel.className = 'thumbnail-level';
    thumbLevel.textContent = `Lv.${character.level}`;

    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'thumbnail-content-wrapper';

    const thumbImg = document.createElement('img');
    // Use thumbnail if available, otherwise idle sprite
    thumbImg.src = character.thumbnail || character.idleSprite;
    thumbImg.alt = character.name;

    // Add info section with HP/SP bars
    const thumbInfo = document.createElement('div');
    thumbInfo.className = 'thumbnail-info';

    // HP bar
    const hpPercentage = (character.stats.currentHp / character.stats.maxHp) * 100;
    const thumbHpBar = document.createElement('div');
    thumbHpBar.className = 'thumbnail-hp-bar';
    const thumbHpFill = document.createElement('div');
    thumbHpFill.className = 'thumbnail-hp-fill';
    thumbHpFill.style.width = `${hpPercentage}%`;
    thumbHpBar.appendChild(thumbHpFill);

    // SP bar
    const spPercentage = (character.stats.currentSp / character.stats.maxSp) * 100;
    const thumbSpBar = document.createElement('div');
    thumbSpBar.className = 'thumbnail-sp-bar';
    const thumbSpFill = document.createElement('div');
    thumbSpFill.className = 'thumbnail-sp-fill';
    thumbSpFill.style.width = `${spPercentage}%`;
    thumbSpBar.appendChild(thumbSpFill);

    // Assemble info
    thumbInfo.appendChild(thumbHpBar);
    thumbInfo.appendChild(thumbSpBar);

    // Assemble content wrapper
    contentWrapper.appendChild(thumbImg);
    contentWrapper.appendChild(thumbInfo);

    // Assemble thumbnail
    thumbnail.appendChild(thumbLevel);
    thumbnail.appendChild(contentWrapper);

    // Add click handler to open equipment modal
    thumbnail.addEventListener('click', () => {
        CharacterSystem.openCharacterEquipmentModal(character.id);
    });

    return thumbnail;
},

    /**
     * Update active status in character panel thumbnails
     */
    updateCharacterPanelActiveStatus: function() {
        // Get the first active character (main character)
        const mainCharacter = CharacterSystem.getActiveCharacter();
        if (!mainCharacter) return;

        // Remove active class from all thumbnails
        const thumbnails = document.querySelectorAll('.character-thumbnail');
        thumbnails.forEach(thumbnail => {
            thumbnail.classList.remove('active');
        });

        // Add active class to main character's thumbnail
        const mainThumbnail = document.getElementById(`character-thumbnail-${mainCharacter.id}`);
        if (mainThumbnail) {
            mainThumbnail.classList.add('active');
        }
    },

    /**
     * Setup the inventory tab system
     */
    setupTabSystem: function() {
        const tabs = document.querySelectorAll('.inventory-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));

                // Add active class to clicked tab
                tab.classList.add('active');

                // Hide all tab content
                const tabContents = document.querySelectorAll('.inventory-tab-content');
                tabContents.forEach(content => content.classList.remove('active'));

                // Show the selected tab content
                const tabId = tab.getAttribute('data-tab');
                document.getElementById(`inventory-tab-${tabId}`).classList.add('active');

                // Update the inventory grid for the selected tab
                this.updateTabInventory(tabId);
            });
        });
    },

    /**
     * Setup character UI events
     */
    setupCharacterUIEvents: function() {
        // Set up character equipment modal interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.character-wrapper')) {
                const characterWrapper = e.target.closest('.character-wrapper');
                const characterId = characterWrapper.id.replace('character-wrapper-', '');
                CharacterSystem.openCharacterEquipmentModal(characterId);
            }
        });
    },

    /**
     * Update inventory grid for a specific tab
     * @param {string} tabId - Tab ID
     */
    updateTabInventory: function(tabId) {
        // Get the grid for this tab
        const grid = document.getElementById(`inventory-${tabId}-grid`);
        if (!grid) return;

        // Clear grid
        grid.innerHTML = '';

        // Filter items based on tab
        const items = [];

        switch (tabId) {
            case 'all':
                // Show all items
                for (let i = 0; i < Inventory.slots.length; i++) {
                    if (Inventory.slots[i]) {
                        items.push({ item: Inventory.slots[i], index: i });
                    }
                }
                break;

            case 'usables':
                // Show consumables
                for (let i = 0; i < Inventory.slots.length; i++) {
                    const item = Inventory.slots[i];
                    if (item && item.category === Items.CATEGORIES.CONSUMABLE) {
                        items.push({ item, index: i });
                    }
                }
                break;

            case 'weapons':
                // Show weapons
                for (let i = 0; i < Inventory.slots.length; i++) {
                    const item = Inventory.slots[i];
                    if (item && item.category === Items.CATEGORIES.WEAPON) {
                        items.push({ item, index: i });
                    }
                }
                break;

            case 'armor':
                // Show armor, gloves, and boots
                for (let i = 0; i < Inventory.slots.length; i++) {
                    const item = Inventory.slots[i];
                    if (item && (
                        item.category === Items.CATEGORIES.ARMOR ||
                        item.category === Items.CATEGORIES.GLOVES ||
                        item.category === Items.CATEGORIES.BOOTS
                    )) {
                        items.push({ item, index: i });
                    }
                }
                break;

            case 'accessory':
                // Show accessories
                for (let i = 0; i < Inventory.slots.length; i++) {
                    const item = Inventory.slots[i];
                    if (item && item.category === Items.CATEGORIES.ACCESSORY) {
                        items.push({ item, index: i });
                    }
                }
                break;

            case 'utility':
                // Show utility items (including character shards)
                for (let i = 0; i < Inventory.slots.length; i++) {
                    const item = Inventory.slots[i];
                    if (item && (
                        item.category === Items.CATEGORIES.UTILITY ||
                        item.id === 'character_shard'
                    )) {
                        items.push({ item, index: i });
                    }
                }

                // Add character shards display
                this.addCharacterShardsDisplay(grid);
                break;
        }

        // Add items to grid
        items.forEach(({ item, index }) => {
            // Create slot
            const slotElement = document.createElement('div');
            slotElement.className = 'inventory-slot';
            slotElement.dataset.index = index;

            // Add item image
            let imgSrc = item.icon;

            // If icon doesn't exist, create placeholder
            if (!imgSrc || imgSrc.includes('undefined')) {
                imgSrc = Items.createPlaceholderImage(item.id);
            }

            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = item.name;
            slotElement.appendChild(img);

            // Add quantity for stackable items
            if (item.stackable && item.quantity > 1) {
                const quantityElement = document.createElement('div');
                quantityElement.className = 'item-count';
                quantityElement.textContent = item.quantity;
                slotElement.appendChild(quantityElement);
            }

            // Add tooltip
            slotElement.addEventListener('mouseenter', (e) => {
                Inventory.showItemTooltip(item, e.target);
            });

            slotElement.addEventListener('mouseleave', () => {
                Inventory.hideItemTooltip();
            });

            // Add click handler
            slotElement.addEventListener('click', () => {
                Inventory.handleSlotClick(index);
            });

            // Add to grid
            grid.appendChild(slotElement);
        });
    },

    /**
     * Add character shards display to utility tab
     * @param {HTMLElement} grid - Grid element
     */
    addCharacterShardsDisplay: function(grid) {
        // Add character shards summary section
        const shardsSection = document.createElement('div');
        shardsSection.className = 'character-shards-section';
        shardsSection.innerHTML = '<h3>Character Shards</h3>';

        // Add shards for each character
        const characters = CharacterSystem.characters;
        const shardsList = document.createElement('div');
        shardsList.className = 'character-shards-list';

        let hasShards = false;

        characters.forEach(character => {
            const shardCount = ShardSystem.getShardCount(character.id);

            // Only show if character has shards
            if (shardCount > 0) {
                hasShards = true;
                const shardItem = document.createElement('div');
                shardItem.className = 'character-shard-item';

                // Create character thumbnail
                const thumbnail = document.createElement('div');
                thumbnail.className = 'character-shard-thumbnail';

                const img = document.createElement('img');
                img.src = character.idleSprite;
                img.alt = character.name;
                thumbnail.appendChild(img);

                const characterName = document.createElement('div');
                characterName.className = 'character-shard-name';
                characterName.textContent = character.name;

                const shardValue = document.createElement('div');
                shardValue.className = 'character-shard-value';
                shardValue.textContent = `${shardCount} shards`;

                shardItem.appendChild(thumbnail);
                shardItem.appendChild(characterName);
                shardItem.appendChild(shardValue);
                shardsList.appendChild(shardItem);

                // Add click handler to upgrade character
                shardItem.addEventListener('click', () => {
                    if (ShardSystem.canUpgradeCharacter(character.id)) {
                        ShardSystem.showUpgradeUI(character.id);
                    } else {
                        Utils.showNotification(
                            'Cannot Upgrade',
                            `Not enough shards to upgrade ${character.name}`,
                            3000
                        );
                    }
                });
            }
        });

        if (!hasShards) {
            const noShardsMsg = document.createElement('div');
            noShardsMsg.className = 'no-shards-message';
            noShardsMsg.textContent = 'No character shards available. Obtain shards from duplicate character pulls.';
            shardsList.appendChild(noShardsMsg);
        }

        shardsSection.appendChild(shardsList);
        grid.parentNode.appendChild(shardsSection);

        // Add styling for character shards
        const style = document.createElement('style');
        if (!document.getElementById('character-shard-styles')) {
            style.id = 'character-shard-styles';
            style.textContent = `
                .character-shards-section {
                    margin-top: 20px;
                    padding: 15px;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: var(--border-radius-md);
                    border: 1px solid rgba(0, 255, 255, 0.2);
                }

                .character-shards-section h3 {
                    color: var(--accent-cyan);
                    margin-top: 0;
                    margin-bottom: 15px;
                    border-bottom: 1px solid rgba(0, 255, 255, 0.2);
                    padding-bottom: 5px;
                }

                .character-shard-item {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    margin-bottom: 8px;
                    background: rgba(0, 0, 0, 0.2);
                    border-radius: var(--border-radius-sm);
                    cursor: pointer;
                    transition: all var(--transition-speed);
                }

                .character-shard-item:hover {
                    background: rgba(0, 255, 255, 0.1);
                    transform: translateY(-2px);
                }

                .character-shard-thumbnail {
                    width: 40px;
                    height: 40px;
                    overflow: hidden;
                    border-radius: 50%;
                    margin-right: 10px;
                    border: 1px solid var(--accent-cyan);
                }

                .character-shard-thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .character-shard-name {
                    flex: 1;
                    font-weight: bold;
                    color: var(--text-primary);
                }

                .character-shard-value {
                    color: var(--accent-yellow);
                    font-weight: bold;
                }

                .no-shards-message {
                    padding: 10px;
                    color: var(--text-secondary);
                    font-style: italic;
                    text-align: center;
                }
            `;
            document.head.appendChild(style);
        }
    },

    /**
     * Update character stats display
     * @param {Object} character - Character to update
     */
    updateCharacterStatsDisplay: function(character) {
        // Update level
        const levelElement = document.getElementById('character-level');
        if (levelElement) {
            levelElement.textContent = character.level;
        }

        // Update HP
        const hpElement = document.getElementById('character-hp');
        const maxHpElement = document.getElementById('character-max-hp');
        if (hpElement && maxHpElement) {
            hpElement.textContent = Math.floor(character.stats.currentHp);
            maxHpElement.textContent = Math.floor(character.stats.maxHp);
        }

        // Update HP bar
        const hpBar = document.querySelector('.hp-bar .stat-bar-fill');
        if (hpBar) {
            const hpPercentage = (character.stats.currentHp / character.stats.maxHp) * 100;
            hpBar.style.width = `${hpPercentage}%`;
        }

        // Update SP
        const spElement = document.getElementById('character-sp');
        const maxSpElement = document.getElementById('character-max-sp');
        if (spElement && maxSpElement) {
            spElement.textContent = Math.floor(character.stats.currentSp);
            maxSpElement.textContent = Math.floor(character.stats.maxSp);
        }

        // Update SP bar
        const spBar = document.querySelector('.sp-bar .stat-bar-fill');
        if (spBar) {
            const spPercentage = (character.stats.currentSp / character.stats.maxSp) * 100;
            spBar.style.width = `${spPercentage}%`;
        }

        // Update portrait level
        const portrait = document.getElementById('character-portrait');
        if (portrait) {
            portrait.dataset.level = character.level;
        }
    },

    /**
     * Update character HP bar in the game world
     * @param {Object} character - Character to update
     */
    updateCharacterHpBar: function(character) {
        // Update HP bar in battle area
        this.updateBattleHpBar(character);

        // Update HP bar in character panel
        this.updateCharacterPanel(character);
    },

    /**
     * Update HP bar in battle area
     * @param {Object} character - Character to update
     */
    updateBattleHpBar: function(character) {
        const wrapper = document.getElementById(`character-wrapper-${character.id}`);
        if (!wrapper) return;

        const hpBar = wrapper.querySelector('.character-hp-bar');
        const hpDisplay = wrapper.querySelector('.character-hp-display');

        if (hpBar) {
            const hpPercentage = (character.stats.currentHp / character.stats.maxHp) * 100;
            hpBar.style.width = `${hpPercentage}%`;

            // Change color based on HP percentage
            if (hpPercentage < 25) {
                hpBar.style.background = 'linear-gradient(to right, #ff0000, #ff3333)';
            } else if (hpPercentage < 50) {
                hpBar.style.background = 'linear-gradient(to right, #ff3333, #ff6633)';
            } else {
                hpBar.style.background = 'linear-gradient(to right, #ff3366, #ff6633)';
            }
        }

        if (hpDisplay) {
            hpDisplay.textContent = `${Math.floor(character.stats.currentHp)}/${Math.floor(character.stats.maxHp)}`;
        }
    },

    /**
     * Update character thumbnail in character panel
     * @param {Object} character - Character to update
     */
    updateCharacterPanel: function(character) {
        if (!character.thumbnailElement) return;

        // Update HP bar in thumbnail
        const thumbHpFill = character.thumbnailElement.querySelector('.thumbnail-hp-fill');
        if (thumbHpFill) {
            const hpPercentage = (character.stats.currentHp / character.stats.maxHp) * 100;
            thumbHpFill.style.width = `${hpPercentage}%`;

            // Change color based on HP percentage
            if (hpPercentage < 25) {
                thumbHpFill.style.background = 'linear-gradient(to right, #ff0000, #ff3333)';
            } else if (hpPercentage < 50) {
                thumbHpFill.style.background = 'linear-gradient(to right, #ff3333, #ff6633)';
            } else {
                thumbHpFill.style.background = 'linear-gradient(to right, #ff3366, #ff6633)';
            }
        }

        // Update SP bar in thumbnail
        const thumbSpFill = character.thumbnailElement.querySelector('.thumbnail-sp-fill');
        if (thumbSpFill) {
            const spPercentage = (character.stats.currentSp / character.stats.maxSp) * 100;
            thumbSpFill.style.width = `${spPercentage}%`;
        }
    },

    /**
     * Show a floating number (damage, healing, etc.)
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string|number} value - Value to display
     * @param {string} type - Type of number ('damage', 'crit', 'heal', 'exp')
     */
    showFloatingNumber: function(x, y, value, type = 'damage') {
        const container = document.getElementById('game-container');
        if (!container) return;

        const element = document.createElement('div');
        element.className = `floating-number ${type}`;
        element.textContent = value;
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;

        container.appendChild(element);

        // Remove after animation completes
        setTimeout(() => {
            element.remove();
        }, 1500);
    },

    /**
     * Updates the visibility and position of the Gacha tutorial arrow.
     * Shows the arrow pointing to the Gacha button if the player has no characters.
     */
    // updateGachaTutorialArrow: function() {
    //     console.log("Attempting to update Gacha tutorial arrow..."); // Debug log
    //     const arrowElement = document.getElementById('gacha-tutorial-arrow');
    //     const gachaButton = document.getElementById('gacha-button');

    //     if (!arrowElement || !gachaButton) {
    //         console.warn('Tutorial arrow or Gacha button not found in DOM.');
    //         return;
    //     }

    //     // Ensure CharacterSystem is loaded and ready
    //     if (typeof CharacterSystem === 'undefined' || typeof CharacterSystem.characters === 'undefined') {
    //         console.log("CharacterSystem not ready, hiding arrow.");
    //         arrowElement.style.display = 'none';
    //         return;
    //     }

    //     const characterCount = CharacterSystem.characters.length;
    //     console.log(`Character count: ${characterCount}`); // Debug log

    //     if (characterCount === 0) {
    //         // Player has no characters, show the arrow
    //         arrowElement.style.display = 'block';

    //         // Use requestAnimationFrame to ensure elements are rendered before getting rects
    //         requestAnimationFrame(() => {
    //             try {
    //                 const buttonRect = gachaButton.getBoundingClientRect();
    //                 // Ensure arrow has dimensions before calculating position
    //                 if (arrowElement.offsetWidth === 0 || arrowElement.offsetHeight === 0) {
    //                      // If arrow isn't rendered yet, try again shortly
    //                      setTimeout(() => this.updateGachaTutorialArrow(), 50);
    //                      return;
    //                 }

    //                 // Position arrow above the button, centered horizontally
    //                 const arrowWidth = arrowElement.offsetWidth;
    //                 const arrowHeight = arrowElement.offsetHeight;
    //                 const buttonCenterX = buttonRect.left + buttonRect.width / 2;

    //                 arrowElement.style.left = `${buttonCenterX - arrowWidth / 2}px`;
    //                 arrowElement.style.top = `${buttonRect.top - arrowHeight - 5}px`; // 5px spacing above

    //                 console.log(`Showing Gacha tutorial arrow at top: ${arrowElement.style.top}, left: ${arrowElement.style.left}`); // Debug log
    //             } catch (e) {
    //                 console.error("Error positioning tutorial arrow:", e);
    //                 arrowElement.style.display = 'none'; // Hide if error occurs
    //             }
    //         });
    //     } else {
    //         // Player has characters, hide the arrow
    //         arrowElement.style.display = 'none';
    //         console.log('Hiding Gacha tutorial arrow (characters exist).');
    //     }
    // }
};

// Initialize UI Manager when document is ready
document.addEventListener('DOMContentLoaded', () => {
    UIManager.init();
});
