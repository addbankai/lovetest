/**
 * Currency system for the Cyberpunk MMORPG game
 * Handles currency conversion and management
 */

const Currency = {
    // Currency values
    copper: 0,
    silver: 0,
    gold: 0,
    diamond: 0,
    
    // Conversion rates
    COPPER_TO_SILVER: 100,
    SILVER_TO_GOLD: 100,
    GOLD_TO_DIAMOND: 100,
    
    // Passive income timer
    passiveIncomeTimer: null,
    passiveIncomeInterval: 2000, // 2 seconds in milliseconds
    
    /**
     * Initialize the currency system
     * @param {Object} savedData - Saved currency data (optional)
     */
    init: function(savedData = null) {
        if (savedData) {
            this.copper = savedData.copper || 0;
            this.silver = savedData.silver || 0;
            this.gold = savedData.gold || 0;
            this.diamond = savedData.diamond || 0;
        }
        
        this.updateDisplay();
        
        // Start passive income timer
        this.startPassiveIncome();
    },
    
    /**
     * Start passive income timer (1 copper every 2 seconds)
     */
    startPassiveIncome: function() {
        // Clear existing timer if any
        if (this.passiveIncomeTimer) {
            clearInterval(this.passiveIncomeTimer);
        }
        
        // Set new timer
        this.passiveIncomeTimer = setInterval(() => {
            this.addCopper(1);
            
            // Create floating text for visual feedback
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                const containerRect = gameContainer.getBoundingClientRect();
                Utils.createDamageText(
                    containerRect.width * 0.15, 
                    containerRect.height * 0.1, 
                    "+1 copper", 
                    "#cd7f32"
                );
            }
        }, this.passiveIncomeInterval);
    },
    
    /**
     * Stop passive income timer
     */
    stopPassiveIncome: function() {
        if (this.passiveIncomeTimer) {
            clearInterval(this.passiveIncomeTimer);
            this.passiveIncomeTimer = null;
        }
    },
    
    /**
     * Add copper to the player's currency
     * @param {number} amount - Amount of copper to add
     * @param {boolean} autoConvert - Whether to automatically convert to higher currencies
     */
    addCopper: function(amount, autoConvert = true) {
        this.copper += amount;
        
        if (autoConvert) {
            this.convertCurrencies();
        }
        
        this.updateDisplay();
        this.saveData();
    },
    
    /**
     * Add silver to the player's currency
     * @param {number} amount - Amount of silver to add
     * @param {boolean} autoConvert - Whether to automatically convert to higher currencies
     */
    addSilver: function(amount, autoConvert = true) {
        this.silver += amount;
        
        if (autoConvert) {
            this.convertCurrencies();
        }
        
        this.updateDisplay();
        this.saveData();
    },
    
    /**
     * Add gold to the player's currency
     * @param {number} amount - Amount of gold to add
     * @param {boolean} autoConvert - Whether to automatically convert to higher currencies
     */
    addGold: function(amount, autoConvert = true) {
        this.gold += amount;
        
        if (autoConvert) {
            this.convertCurrencies();
        }
        
        this.updateDisplay();
        this.saveData();
    },
    
    /**
     * Add diamond to the player's currency
     * @param {number} amount - Amount of diamond to add
     */
    addDiamond: function(amount) {
        this.diamond += amount;
        this.updateDisplay();
        this.saveData();
    },
    
    /**
     * Convert lower currencies to higher ones based on conversion rates
     */
    convertCurrencies: function() {
        // Convert copper to silver
        if (this.copper >= this.COPPER_TO_SILVER) {
            const silverToAdd = Math.floor(this.copper / this.COPPER_TO_SILVER);
            this.copper -= silverToAdd * this.COPPER_TO_SILVER;
            this.silver += silverToAdd;
        }
        
        // Convert silver to gold
        if (this.silver >= this.SILVER_TO_GOLD) {
            const goldToAdd = Math.floor(this.silver / this.SILVER_TO_GOLD);
            this.silver -= goldToAdd * this.SILVER_TO_GOLD;
            this.gold += goldToAdd;
        }
        
        // Convert gold to diamond
        if (this.gold >= this.GOLD_TO_DIAMOND) {
            const diamondToAdd = Math.floor(this.gold / this.GOLD_TO_DIAMOND);
            this.gold -= diamondToAdd * this.GOLD_TO_DIAMOND;
            this.diamond += diamondToAdd;
        }
    },
    
    /**
     * Check if the player has enough of a specific currency
     * @param {string} type - Currency type ('copper', 'silver', 'gold', 'diamond')
     * @param {number} amount - Amount to check
     * @returns {boolean} True if player has enough currency
     */
    hasEnough: function(type, amount) {
        switch (type) {
            case 'copper':
                return this.getTotalCopper() >= amount;
            case 'silver':
                return this.getTotalSilver() >= amount;
            case 'gold':
                return this.getTotalGold() >= amount;
            case 'diamond':
                return this.diamond >= amount;
            default:
                return false;
        }
    },
    
    /**
     * Spend a specific currency
     * @param {string} type - Currency type ('copper', 'silver', 'gold', 'diamond')
     * @param {number} amount - Amount to spend
     * @returns {boolean} True if successful, false if not enough currency
     */
    spend: function(type, amount) {
        if (!this.hasEnough(type, amount)) {
            return false;
        }
        
        switch (type) {
            case 'copper':
                this.spendCopper(amount);
                break;
            case 'silver':
                this.spendSilver(amount);
                break;
            case 'gold':
                this.spendGold(amount);
                break;
            case 'diamond':
                this.diamond -= amount;
                break;
        }
        
        this.updateDisplay();
        this.saveData();
        return true;
    },
    
    /**
     * Spend copper (may convert higher currencies if needed)
     * @param {number} amount - Amount of copper to spend
     */
    spendCopper: function(amount) {
        let remainingAmount = amount;
        
        // Use available copper
        if (this.copper >= remainingAmount) {
            this.copper -= remainingAmount;
            remainingAmount = 0;
        } else {
            remainingAmount -= this.copper;
            this.copper = 0;
        }
        
        // Convert silver to copper if needed
        while (remainingAmount > 0 && this.silver > 0) {
            this.silver--;
            this.copper += this.COPPER_TO_SILVER;
            
            if (this.copper >= remainingAmount) {
                this.copper -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= this.copper;
                this.copper = 0;
            }
        }
        
        // Convert gold to silver if needed
        while (remainingAmount > 0 && this.gold > 0) {
            this.gold--;
            this.silver += this.SILVER_TO_GOLD;
            
            // Convert silver to copper
            this.silver--;
            this.copper += this.COPPER_TO_SILVER;
            
            if (this.copper >= remainingAmount) {
                this.copper -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= this.copper;
                this.copper = 0;
            }
        }
        
        // Convert diamond to gold if needed
        while (remainingAmount > 0 && this.diamond > 0) {
            this.diamond--;
            this.gold += this.GOLD_TO_DIAMOND;
            
            // Convert gold to silver
            this.gold--;
            this.silver += this.SILVER_TO_GOLD;
            
            // Convert silver to copper
            this.silver--;
            this.copper += this.COPPER_TO_SILVER;
            
            if (this.copper >= remainingAmount) {
                this.copper -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= this.copper;
                this.copper = 0;
            }
        }
    },
    
    /**
     * Spend silver (may convert higher currencies if needed)
     * @param {number} amount - Amount of silver to spend
     */
    spendSilver: function(amount) {
        let remainingAmount = amount;
        
        // Use available silver
        if (this.silver >= remainingAmount) {
            this.silver -= remainingAmount;
            remainingAmount = 0;
        } else {
            remainingAmount -= this.silver;
            this.silver = 0;
        }
        
        // Convert gold to silver if needed
        while (remainingAmount > 0 && this.gold > 0) {
            this.gold--;
            this.silver += this.SILVER_TO_GOLD;
            
            if (this.silver >= remainingAmount) {
                this.silver -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= this.silver;
                this.silver = 0;
            }
        }
        
        // Convert diamond to gold if needed
        while (remainingAmount > 0 && this.diamond > 0) {
            this.diamond--;
            this.gold += this.GOLD_TO_DIAMOND;
            
            // Convert gold to silver
            this.gold--;
            this.silver += this.SILVER_TO_GOLD;
            
            if (this.silver >= remainingAmount) {
                this.silver -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= this.silver;
                this.silver = 0;
            }
        }
    },
    
    /**
     * Spend gold (may convert higher currencies if needed)
     * @param {number} amount - Amount of gold to spend
     */
    spendGold: function(amount) {
        let remainingAmount = amount;
        
        // Use available gold
        if (this.gold >= remainingAmount) {
            this.gold -= remainingAmount;
            remainingAmount = 0;
        } else {
            remainingAmount -= this.gold;
            this.gold = 0;
        }
        
        // Convert diamond to gold if needed
        while (remainingAmount > 0 && this.diamond > 0) {
            this.diamond--;
            this.gold += this.GOLD_TO_DIAMOND;
            
            if (this.gold >= remainingAmount) {
                this.gold -= remainingAmount;
                remainingAmount = 0;
            } else {
                remainingAmount -= this.gold;
                this.gold = 0;
            }
        }
    },
    
    /**
     * Get total copper value (including higher currencies converted to copper)
     * @returns {number} Total copper value
     */
    getTotalCopper: function() {
        return this.copper + 
               this.silver * this.COPPER_TO_SILVER + 
               this.gold * this.COPPER_TO_SILVER * this.SILVER_TO_GOLD + 
               this.diamond * this.COPPER_TO_SILVER * this.SILVER_TO_GOLD * this.GOLD_TO_DIAMOND;
    },
    
    /**
     * Get total silver value (including higher currencies converted to silver)
     * @returns {number} Total silver value
     */
    getTotalSilver: function() {
        return Math.floor(this.copper / this.COPPER_TO_SILVER) + 
               this.silver + 
               this.gold * this.SILVER_TO_GOLD + 
               this.diamond * this.SILVER_TO_GOLD * this.GOLD_TO_DIAMOND;
    },
    
    /**
     * Get total gold value (including higher currencies converted to gold)
     * @returns {number} Total gold value
     */
    getTotalGold: function() {
        return Math.floor(this.copper / (this.COPPER_TO_SILVER * this.SILVER_TO_GOLD)) + 
               Math.floor(this.silver / this.SILVER_TO_GOLD) + 
               this.gold + 
               this.diamond * this.GOLD_TO_DIAMOND;
    },
    
    /**
     * Update the currency display in the UI
     */
    updateDisplay: function() {
        document.getElementById('copper-amount').textContent = Utils.formatNumber(this.copper);
        document.getElementById('silver-amount').textContent = Utils.formatNumber(this.silver);
        document.getElementById('gold-amount').textContent = Utils.formatNumber(this.gold);
        document.getElementById('diamond-amount').textContent = Utils.formatNumber(this.diamond);
    },
    
    /**
     * Save currency data to local storage
     */
    saveData: function() {
        const data = {
            copper: this.copper,
            silver: this.silver,
            gold: this.gold,
            diamond: this.diamond
        };
        Utils.saveToStorage('currency', data);
        return data;
    },
    
    /**
     * Load currency data from local storage
     */
    loadData: function() {
        const data = Utils.loadFromStorage('currency');
        if (data) {
            this.copper = data.copper || 0;
            this.silver = data.silver || 0;
            this.gold = data.gold || 0;
            this.diamond = data.diamond || 0;
            this.updateDisplay();
        }
    },
    
    /**
     * Load currency values from provided data object
     * @param {Object} data - Currency data object
     * @returns {boolean} Whether data was loaded successfully
     */
    loadFromData: function(data) {
        if (!data) return false;
        
        this.copper = data.copper || 0;
        this.silver = data.silver || 0;
        this.gold = data.gold || 0;
        this.diamond = data.diamond || 0;
        
        this.updateDisplay();
        return true;
    },
    
    /**
     * Reset currency values to zero
     */
    reset: function() {
        this.copper = 0;
        this.silver = 0;
        this.gold = 0;
        this.diamond = 0;
        
        this.updateDisplay();
    }
};
