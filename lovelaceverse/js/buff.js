/**
 * Buff system for the Cyberpunk MMORPG game
 * Handles temporary stat boosts and effects
 */

const BuffSystem = {
    // Active buffs
    activeBuffs: [],
    
    // Maximum number of buffs per dungeon
    maxBuffsPerDungeon: 4,
    
    // Current buff count for this dungeon
    currentBuffCount: 0,
    
    // Buff multiplier (starts at 1x, can stack up to 4x)
    damageMultiplier: 1,
    attackSpeedMultiplier: 1,
    
    /**
     * Initialize the buff system
     */
    init: function() {
        this.activeBuffs = [];
        this.currentBuffCount = 0;
        this.damageMultiplier = 1;
        this.attackSpeedMultiplier = 1;
        
        this.setupEventListeners();
    },
    
    /**
     * Set up event listeners for buff buttons
     */
    setupEventListeners: function() {
        // Damage buff button
        const damageBuff = document.getElementById('damage-buff');
        if (damageBuff) {
            damageBuff.addEventListener('click', () => {
                this.activateBuff('damage');
            });
        }
        
        // Attack speed buff button
        const speedBuff = document.getElementById('speed-buff');
        if (speedBuff) {
            speedBuff.addEventListener('click', () => {
                this.activateBuff('attackSpeed');
            });
        }
    },
    
    /**
     * Activate a buff
     * @param {string} buffType - Type of buff ('damage' or 'attackSpeed')
     * @returns {boolean} True if buff was activated successfully
     */
    activateBuff: function(buffType) {
        // Check if we've reached the maximum number of buffs for this dungeon
        if (this.currentBuffCount >= this.maxBuffsPerDungeon) {
            console.log('Maximum number of buffs reached for this dungeon');
            return false;
        }
        
        // Check if the buff can be stacked further
        let canStack = false;
        
        switch (buffType) {
            case 'damage':
                canStack = this.damageMultiplier < 4;
                break;
            case 'attackSpeed':
                canStack = this.attackSpeedMultiplier < 4;
                break;
            default:
                console.error(`Unknown buff type: ${buffType}`);
                return false;
        }
        
        if (!canStack) {
            console.log(`${buffType} buff already at maximum stack`);
            return false;
        }
        
        // Apply the buff
        switch (buffType) {
            case 'damage':
                this.damageMultiplier *= 2;
                break;
            case 'attackSpeed':
                this.attackSpeedMultiplier *= 2;
                break;
        }
        
        // Add to active buffs
        this.activeBuffs.push({
            type: buffType,
            timestamp: Date.now()
        });
        
        // Increment buff count
        this.currentBuffCount++;
        
        // Update UI
        this.updateBuffUI();
        
        // Apply buff to all active characters
        this.applyBuffsToCharacters();
        
        return true;
    },
    
    /**
     * Apply active buffs to all characters
     */
    applyBuffsToCharacters: function() {
        const characters = Game.getActiveCharacters();
        
        characters.forEach(character => {
            // Apply damage multiplier
            character.setDamageMultiplier(this.damageMultiplier);
            
            // Apply attack speed multiplier
            character.setAttackSpeedMultiplier(this.attackSpeedMultiplier);
        });
    },
    
    /**
     * Update the buff UI
     */
    updateBuffUI: function() {
        // Update buff counter
        const buffCounter = document.getElementById('buff-counter');
        if (buffCounter) {
            buffCounter.textContent = `Buffs: ${this.currentBuffCount}/${this.maxBuffsPerDungeon}`;
        }
        
        // Update damage buff button
        const damageBuff = document.getElementById('damage-buff');
        if (damageBuff) {
            damageBuff.textContent = `${this.damageMultiplier}x DMG`;
            
            // Disable button if at max stacks or max buffs used
            damageBuff.disabled = this.damageMultiplier >= 4 || this.currentBuffCount >= this.maxBuffsPerDungeon;
            
            // Visual feedback on button
            damageBuff.classList.toggle('max-stack', this.damageMultiplier >= 4);
            
            // Force button re-enhancement if it was already enhanced
            if (window.CyberpunkButtons && damageBuff.hasAttribute('data-cyberpunk-enhanced')) {
                damageBuff.removeAttribute('data-cyberpunk-enhanced');
                
                // Use a small timeout to ensure the class change has taken effect
                setTimeout(() => {
                    window.CyberpunkButtons.enhanceAllButtons();
                }, 50);
            }
        }
        
        // Update attack speed buff button
        const speedBuff = document.getElementById('speed-buff');
        if (speedBuff) {
            speedBuff.textContent = `${this.attackSpeedMultiplier}x SPD`;
            
            // Disable button if at max stacks or max buffs used
            speedBuff.disabled = this.attackSpeedMultiplier >= 4 || this.currentBuffCount >= this.maxBuffsPerDungeon;
            
            // Visual feedback on button
            speedBuff.classList.toggle('max-stack', this.attackSpeedMultiplier >= 4);
            
            // Force button re-enhancement if it was already enhanced
            if (window.CyberpunkButtons && speedBuff.hasAttribute('data-cyberpunk-enhanced')) {
                speedBuff.removeAttribute('data-cyberpunk-enhanced');
                
                // Use a small timeout to ensure the class change has taken effect
                setTimeout(() => {
                    window.CyberpunkButtons.enhanceAllButtons();
                }, 50);
            }
        }
    },
    
    /**
     * Reset buffs for a new dungeon
     */
    resetForNewDungeon: function() {
        this.activeBuffs = [];
        this.currentBuffCount = 0;
        this.damageMultiplier = 1;
        this.attackSpeedMultiplier = 1;
        
        this.updateBuffUI();
        this.applyBuffsToCharacters();
    },
    
    /**
     * Get the current damage multiplier
     * @returns {number} Damage multiplier
     */
    getDamageMultiplier: function() {
        return this.damageMultiplier;
    },
    
    /**
     * Get the current attack speed multiplier
     * @returns {number} Attack speed multiplier
     */
    getAttackSpeedMultiplier: function() {
        return this.attackSpeedMultiplier;
    },
    
    /**
     * Get the number of remaining buffs for this dungeon
     * @returns {number} Number of remaining buffs
     */
    getRemainingBuffs: function() {
        return this.maxBuffsPerDungeon - this.currentBuffCount;
    },
    
    /**
     * Check if a specific buff type is at maximum stack
     * @param {string} buffType - Type of buff ('damage' or 'attackSpeed')
     * @returns {boolean} True if buff is at maximum stack
     */
    isBuffMaxStacked: function(buffType) {
        switch (buffType) {
            case 'damage':
                return this.damageMultiplier >= 4;
            case 'attackSpeed':
                return this.attackSpeedMultiplier >= 4;
            default:
                return false;
        }
    },
    
    /**
     * Save buff data
     * @returns {Object} Buff data for saving
     */
    saveData: function() {
        return {
            activeBuffs: this.activeBuffs,
            currentBuffCount: this.currentBuffCount,
            damageMultiplier: this.damageMultiplier,
            attackSpeedMultiplier: this.attackSpeedMultiplier
        };
    },
    
    /**
     * Load buff data
     * @param {Object} data - Saved buff data
     */
    loadData: function(data) {
        if (!data) return;
        
        this.activeBuffs = data.activeBuffs || [];
        this.currentBuffCount = data.currentBuffCount || 0;
        this.damageMultiplier = data.damageMultiplier || 1;
        this.attackSpeedMultiplier = data.attackSpeedMultiplier || 1;
        
        this.updateBuffUI();
        this.applyBuffsToCharacters();
    }
};

/**
 * Character-specific buff management
 * These functions would be part of the Character class
 */
const CharacterBuffs = {
    /**
     * Add a buff to a character
     * @param {Object} character - Character object
     * @param {string} stat - Stat to buff
     * @param {number} value - Buff value
     * @param {number} duration - Buff duration in seconds
     */
    addBuff: function(character, stat, value, duration) {
        if (!character.buffs) {
            character.buffs = [];
        }
        
        // Remove existing buff of the same type
        character.buffs = character.buffs.filter(buff => buff.stat !== stat);
        
        // Add new buff
        character.buffs.push({
            stat: stat,
            value: value,
            duration: duration,
            startTime: Date.now()
        });
        
        // Apply buff immediately
        this.applyBuffs(character);
    },
    
    /**
     * Apply all active buffs to a character
     * @param {Object} character - Character object
     */
    applyBuffs: function(character) {
        if (!character.buffs) return;
        
        // Track buff multipliers
        const buffMultipliers = {
            damage: 1,
            attackSpeed: 1,
            defense: 1
        };
        
        // Calculate buff multipliers from active buffs
        character.buffs.forEach(buff => {
            const elapsed = (Date.now() - buff.startTime) / 1000;
            
            if (elapsed < buff.duration) {
                // Buff is still active
                switch (buff.stat) {
                    case 'damage':
                        buffMultipliers.damage *= (1 + buff.value);
                        break;
                    case 'attackSpeed':
                        buffMultipliers.attackSpeed *= (1 + buff.value);
                        break;
                    case 'defense':
                        buffMultipliers.defense *= (1 + buff.value);
                        break;
                    // Add more stats as needed
                    default:
                        if (character.stats[buff.stat] !== undefined) {
                            // For other stats, apply directly (non-multiplicative)
                            character.stats[buff.stat] += buff.value;
                        }
                }
            }
        });
        
        // Apply global buffs from BuffSystem
        buffMultipliers.damage *= BuffSystem.getDamageMultiplier();
        buffMultipliers.attackSpeed *= BuffSystem.getAttackSpeedMultiplier();
        
        // Apply all multipliers to character stats
        character.stats.damage *= buffMultipliers.damage;
        character.stats.attackSpeed *= buffMultipliers.attackSpeed;
        character.stats.defense *= buffMultipliers.defense;
    },
    
    /**
     * Update buffs, removing expired ones
     * @param {Object} character - Character object
     */
    updateBuffs: function(character) {
        if (!character.buffs) return;
        
        const now = Date.now();
        let buffChanged = false;
        
        // Filter out expired buffs
        const activeBuffs = character.buffs.filter(buff => {
            const elapsed = (now - buff.startTime) / 1000;
            const active = elapsed < buff.duration;
            
            if (!active) {
                buffChanged = true;
            }
            
            return active;
        });
        
        if (buffChanged) {
            character.buffs = activeBuffs;
            this.applyBuffs(character);
        }
    },
    
    /**
     * Check if a character has a specific buff
     * @param {Object} character - Character object
     * @param {string} stat - Stat to check
     * @returns {boolean} True if character has the buff
     */
    hasBuff: function(character, stat) {
        if (!character.buffs) return false;
        
        return character.buffs.some(buff => {
            const elapsed = (Date.now() - buff.startTime) / 1000;
            return buff.stat === stat && elapsed < buff.duration;
        });
    },
    
    /**
     * Get the remaining duration of a buff
     * @param {Object} character - Character object
     * @param {string} stat - Stat to check
     * @returns {number} Remaining duration in seconds, or 0 if buff not found
     */
    getBuffDuration: function(character, stat) {
        if (!character.buffs) return 0;
        
        const buff = character.buffs.find(b => b.stat === stat);
        if (!buff) return 0;
        
        const elapsed = (Date.now() - buff.startTime) / 1000;
        return Math.max(0, buff.duration - elapsed);
    },
    
    /**
     * Remove a specific buff from a character
     * @param {Object} character - Character object
     * @param {string} stat - Stat to remove buff from
     */
    removeBuff: function(character, stat) {
        if (!character.buffs) return;
        
        character.buffs = character.buffs.filter(buff => buff.stat !== stat);
        this.applyBuffs(character);
    },
    
    /**
     * Remove all buffs from a character
     * @param {Object} character - Character object
     */
    removeAllBuffs: function(character) {
        character.buffs = [];
        this.applyBuffs(character);
    }
};
