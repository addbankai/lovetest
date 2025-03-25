/**
 * Character Shard system for the Cyberpunk MMORPG game
 * Handles character shards and upgrades
 */

const ShardSystem = {
    // Character shards storage
    // Format: { characterId: count }
    characterShards: {},
    
    // Upgrade costs (base cost is 5, multiplied by 2 for each level)
    // +1 = 5 shards
    // +2 = 10 shards
    // +3 = 20 shards
    // +4 = 40 shards, etc.
    baseUpgradeCost: 5,
    maxUpgradeLevel: 10, // Maximum upgrade level is +10
    
    /**
     * Initialize the shard system
     * @param {Object} savedData - Saved shard data (optional)
     */
    init: function(savedData = null) {
        // Reset shards
        this.characterShards = {};
        
        // First try to load from local storage
        const localData = Utils.loadFromStorage('character_shards');
        if (localData && localData.characterShards) {
            this.characterShards = localData.characterShards;
        }
        
        // Override with saved data if provided
        if (savedData && savedData.characterShards) {
            this.characterShards = savedData.characterShards;
        }
        
        // Set up event listeners
        this.setupEventListeners();
    },
    
    /**
     * Set up shard UI event listeners
     */
    setupEventListeners: function() {
        // Listen for character list click events to show upgrade options
        document.addEventListener('click', (e) => {
            if (e.target.closest('.character-upgrade-button')) {
                const characterId = e.target.closest('.character-card').dataset.id;
                this.showUpgradeUI(characterId);
            }
        });
    },
    
    /**
     * Add shards for a character
     * @param {string} characterId - Character ID
     * @param {number} amount - Amount of shards to add
     */
    addShards: function(characterId, amount) {
        if (!this.characterShards[characterId]) {
            this.characterShards[characterId] = 0;
        }
        
        this.characterShards[characterId] += amount;
        this.saveData(); // Save after modification
        
        // Notify the player
        Utils.showNotification(
            "Shards Acquired", 
            `Received ${amount} shards for ${CharacterSystem.getCharacterById(characterId)?.name || characterId}`, 
            2000
        );
    },
    
    /**
     * Get the number of shards for a character
     * @param {string} characterId - Character ID
     * @returns {number} Number of shards
     */
    getShardCount: function(characterId) {
        return this.characterShards[characterId] || 0;
    },
    
    /**
     * Calculate the cost to upgrade a character
     * @param {Object} character - Character to upgrade
     * @returns {number} Upgrade cost in shards
     */
    calculateUpgradeCost: function(character) {
        const upgradeLevel = character.upgradeLevel || 0;
        
        // Cost doubles with each level: 5, 10, 20, 40, etc.
        return this.baseUpgradeCost * Math.pow(2, upgradeLevel);
    },
    
    /**
     * Check if a character can be upgraded
     * @param {string} characterId - Character ID
     * @returns {boolean} True if character can be upgraded
     */
    canUpgradeCharacter: function(characterId) {
        const character = CharacterSystem.getCharacterById(characterId);
        if (!character) return false;
        
        // Check if character is already at max level
        const upgradeLevel = character.upgradeLevel || 0;
        if (upgradeLevel >= this.maxUpgradeLevel) return false;
        
        // Check if player has enough shards
        const cost = this.calculateUpgradeCost(character);
        return this.getShardCount(characterId) >= cost;
    },
    
    /**
     * Upgrade a character
     * @param {string} characterId - Character ID
     * @returns {boolean} True if upgrade was successful
     */
    upgradeCharacter: function(characterId) {
        // Check if upgrade is possible
        if (!this.canUpgradeCharacter(characterId)) {
            return false;
        }
        
        const character = CharacterSystem.getCharacterById(characterId);
        if (!character) return false;
        
        // Get current upgrade level
        const currentLevel = character.upgradeLevel || 0;
        
        // Calculate upgrade cost
        const cost = this.calculateUpgradeCost(character);
        
        // Spend shards
        this.characterShards[characterId] -= cost;
        
        // Upgrade character
        character.upgradeLevel = currentLevel + 1;
        
        // Apply stat bonuses
        this.applyUpgradeBonus(character);
        
        // Save data
        this.saveData();
        CharacterSystem.saveData();
        
        // Show upgrade notification
        Utils.showNotification(
            "Character Upgraded", 
            `${character.name} has been upgraded to +${character.upgradeLevel}!`, 
            3000
        );
        
        return true;
    },
    
    /**
     * Apply upgrade stat bonuses to a character
     * @param {Object} character - Character to upgrade
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
    },
    
    /**
     * Get the original stat value for a character (before upgrades)
     * @param {Object} character - Character to check
     * @param {string} stat - Stat name
     * @returns {number} Original stat value
     */
    getOriginalStatValue: function(character, stat) {
        // If we have the original template stored, use that
        const template = GachaSystem.characterTemplates.find(t => t.id === character.id);
        if (template && template.baseStats && template.baseStats[stat] !== undefined) {
            return template.baseStats[stat];
        }
        
        // Otherwise, calculate from current value and upgrade level
        const upgradeMultiplier = Math.pow(2, character.upgradeLevel || 0);
        return Math.floor(character.baseStats[stat] / upgradeMultiplier);
    },
    
    /**
     * Show character upgrade UI
     * @param {string} characterId - Character ID
     */
    showUpgradeUI: function(characterId) {
        const character = CharacterSystem.getCharacterById(characterId);
        if (!character) return;
        
        // Create or get the upgrade modal
        let upgradeModal = document.getElementById('upgrade-modal');
        if (!upgradeModal) {
            upgradeModal = this.createUpgradeModal();
        }
        
        // Update modal content
        const modalTitle = upgradeModal.querySelector('.modal-title');
        modalTitle.textContent = `Upgrade ${character.name}`;
        
        const characterLevel = upgradeModal.querySelector('#upgrade-character-level');
        characterLevel.textContent = `+${character.upgradeLevel || 0}`;
        
        const shardCount = upgradeModal.querySelector('#upgrade-shard-count');
        shardCount.textContent = this.getShardCount(characterId);
        
        const upgradeCost = upgradeModal.querySelector('#upgrade-cost');
        upgradeCost.textContent = this.calculateUpgradeCost(character);
        
        const upgradeButton = upgradeModal.querySelector('#upgrade-button');
        upgradeButton.disabled = !this.canUpgradeCharacter(characterId);
        upgradeButton.dataset.id = characterId;
        
        // Show stat preview
        this.showStatPreview(character, upgradeModal);
        
        // Show the modal
        Utils.showModal('upgrade-modal');
    },
    
    /**
     * Create the upgrade modal if it doesn't exist
     * @returns {HTMLElement} The upgrade modal element
     */
    createUpgradeModal: function() {
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'upgrade-modal';
        modal.className = 'modal';
        
        // Modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">Upgrade Character</h2>
                    <span class="close-button" onclick="Utils.hideModal('upgrade-modal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="upgrade-info">
                        <div class="upgrade-level">
                            <h3>Current Level</h3>
                            <span id="upgrade-character-level">+0</span>
                        </div>
                        <div class="upgrade-shards">
                            <h3>Shards Available</h3>
                            <span id="upgrade-shard-count">0</span>
                        </div>
                        <div class="upgrade-cost-container">
                            <h3>Upgrade Cost</h3>
                            <span id="upgrade-cost">5</span> <span>shards</span>
                        </div>
                    </div>
                    <div class="stat-preview">
                        <h3>Stat Preview</h3>
                        <div id="stat-preview-container"></div>
                    </div>
                    <div class="upgrade-buttons">
                        <button id="upgrade-button" class="game-button">Upgrade</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add event listener for upgrade button
        const upgradeButton = modal.querySelector('#upgrade-button');
        upgradeButton.addEventListener('click', (e) => {
            const characterId = e.target.dataset.id;
            if (this.upgradeCharacter(characterId)) {
                // Update UI after upgrade
                this.showUpgradeUI(characterId);
            }
        });
        
        // Add modal to the document
        document.body.appendChild(modal);
        
        // Add styles for the upgrade modal
        const style = document.createElement('style');
        style.textContent = `
            .upgrade-info {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 20px;
                margin-bottom: 20px;
                text-align: center;
            }
            
            .upgrade-level, .upgrade-shards, .upgrade-cost-container {
                padding: 10px;
                background-color: rgba(0, 0, 0, 0.3);
                border-radius: 5px;
            }
            
            .upgrade-level span, .upgrade-shards span, .upgrade-cost-container span {
                font-size: 24px;
                font-weight: bold;
                color: #ffcc00;
            }
            
            .stat-preview {
                margin-bottom: 20px;
            }
            
            .stat-preview h3 {
                margin-bottom: 10px;
            }
            
            .stat-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
            }
            
            .stat-name {
                flex: 1;
            }
            
            .stat-current, .stat-new {
                flex: 1;
                text-align: center;
            }
            
            .stat-current {
                color: #ffffff;
            }
            
            .stat-new {
                color: #00ff00;
            }
            
            #upgrade-button {
                width: 100%;
                padding: 10px;
                font-size: 18px;
            }
            
            #upgrade-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
        
        return modal;
    },
    
    /**
     * Show stat preview in the upgrade UI
     * @param {Object} character - Character being upgraded
     * @param {HTMLElement} modal - Upgrade modal element
     */
    showStatPreview: function(character, modal) {
        const previewContainer = modal.querySelector('#stat-preview-container');
        previewContainer.innerHTML = '';
        
        // Create preview table header
        const headerRow = document.createElement('div');
        headerRow.className = 'stat-row stat-header';
        
        const statHeader = document.createElement('div');
        statHeader.className = 'stat-name';
        statHeader.textContent = 'Stat';
        headerRow.appendChild(statHeader);
        
        const currentHeader = document.createElement('div');
        currentHeader.className = 'stat-current';
        currentHeader.textContent = 'Current';
        headerRow.appendChild(currentHeader);
        
        const newHeader = document.createElement('div');
        newHeader.className = 'stat-new';
        newHeader.textContent = 'After Upgrade';
        headerRow.appendChild(newHeader);
        
        previewContainer.appendChild(headerRow);
        
        // Calculate next level stats
        const nextLevelStats = {};
        const upgradeMultiplier = Math.pow(2, (character.upgradeLevel || 0) + 1);
        
        // Calculate and display each base stat
        ['strength', 'agility', 'vitality', 'dexterity', 'intelligence', 'luck'].forEach(stat => {
            const originalValue = this.getOriginalStatValue(character, stat);
            const currentValue = character.baseStats[stat];
            const newValue = Math.floor(originalValue * upgradeMultiplier);
            nextLevelStats[stat] = newValue;
            
            const statRow = document.createElement('div');
            statRow.className = 'stat-row';
            
            const statName = document.createElement('div');
            statName.className = 'stat-name';
            statName.textContent = stat.charAt(0).toUpperCase() + stat.slice(1);
            statRow.appendChild(statName);
            
            const currentStat = document.createElement('div');
            currentStat.className = 'stat-current';
            currentStat.textContent = currentValue;
            statRow.appendChild(currentStat);
            
            const newStat = document.createElement('div');
            newStat.className = 'stat-new';
            newStat.textContent = newValue;
            statRow.appendChild(newStat);
            
            previewContainer.appendChild(statRow);
        });
    },
    
    /**
     * Convert a duplicate character to shards
     * @param {Object} character - Duplicate character
     * @returns {number} Number of shards generated
     */
    convertToShards: function(character) {
        // Base amount of shards based on rarity
        let shardAmount;
        switch (character.rarity) {
            case 'common':
                shardAmount = 1;
                break;
            case 'uncommon':
                shardAmount = 2;
                break;
            case 'rare':
                shardAmount = 5;
                break;
            case 'epic':
                shardAmount = 10;
                break;
            case 'legendary':
                shardAmount = 20;
                break;
            default:
                shardAmount = 1;
        }
        
        // Add shards to collection
        this.addShards(character.id, shardAmount);
        
        return shardAmount;
    },
    
    /**
     * Check if a character is a duplicate
     * @param {Object} character - Character to check
     * @returns {boolean} True if character is a duplicate
     */
    isDuplicate: function(characterTemplate) {
        // Check if character is already in the user's collection
        const existingCharacter = CharacterSystem.characters.find(c => c.id === characterTemplate.id);
        return existingCharacter !== undefined;
    },
    
    /**
     * Save shard data
     */
    saveData: function() {
        const data = {
            characterShards: this.characterShards,
            lastSaved: new Date().toISOString()
        };
        
        // Save to local storage
        Utils.saveToStorage('character_shards', data);
        
        // Trigger save event for database sync
        const event = new CustomEvent('character_shards_changed', {
            detail: data
        });
        document.dispatchEvent(event);
        
        // If GameSync exists, try to save the data using partial sync
        if (window.GameSync && typeof GameSync.savePartialGameData === 'function') {
            GameSync.savePartialGameData('character_shards', data);
        }
        
        return data; // Return data for external use
    },

    /**
     * Spend shards for character upgrade
     * @param {string} characterId - Character ID
     * @param {number} amount - Amount of shards to spend
     */
    spendShards: function(characterId, amount) {
        if (!this.characterShards[characterId]) return false;
        if (this.characterShards[characterId] < amount) return false;
        
        this.characterShards[characterId] -= amount;
        this.saveData(); // Save after modification
        return true;
    },
    
    /**
     * Load shard data
     * @returns {Object|null} Loaded shard data or null if not found
     */
    loadData: function() {
        return Utils.loadFromStorage('character_shards');
    }
};
