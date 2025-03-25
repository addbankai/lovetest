/**
 * LovelaceVerse Data Loading Fix
 * 
 * This script fixes the currency and inventory loading/saving issues
 * that cause the game to show 0 items despite having items in inventory
 * and cause "Currency.loadFromData is not a function" errors.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Applying data loading fixes...');
    
    // Only proceed if AuthenticationSystem exists
    if (typeof AuthenticationSystem === 'undefined') {
        console.error('AuthenticationSystem not found, cannot apply data loading fix');
        return;
    }
    
    // FIX 1: PATCH THE LOADGAMEDATAINTOMEMORY FUNCTION
    // This fixes the "Currency.loadFromData is not a function" error
    // by using the correct Currency.init() method instead
    
    // Save original function for reference
    const originalLoadGameDataIntoMemory = AuthenticationSystem.loadGameDataIntoMemory;
    
    // Replace with fixed version
    AuthenticationSystem.loadGameDataIntoMemory = function(gameData) {
        if (!gameData) return;
        
        console.log('Loading game data into memory with fixed loader:', gameData);
        
        try {
            // Load currency using the correct method (init instead of loadFromData)
            if (gameData.currency && typeof Currency !== 'undefined') {
                console.log('Loading currency data:', gameData.currency);
                // Use Currency.init() instead of non-existent Currency.loadFromData()
                Currency.init(gameData.currency);
            }
            
            // Load inventory using the correct method
            if (gameData.inventory && typeof Inventory !== 'undefined') {
                console.log('Loading inventory data using loadFromData');
                Inventory.loadFromData(gameData.inventory);
            }
            
            // Load characters
            if (gameData.characters) {
                console.log('Loading character data');
                Utils.saveToStorage('characters', gameData.characters);
            }
            
            // Load other game systems
            if (gameData.gacha) Utils.saveToStorage('gacha', gameData.gacha);
            if (gameData.map) Utils.saveToStorage('map', gameData.map);
            if (gameData.shards) Utils.saveToStorage('shards', gameData.shards);
            if (gameData.dungeon) Utils.saveToStorage('dungeon', gameData.dungeon);
            if (gameData.audio) Utils.saveToStorage('audio_settings', gameData.audio);
            
            // Handle various form factors for general data
            if (gameData.general) {
                Utils.saveToStorage('gameData', gameData.general);
            } else if (gameData.version || gameData.startDate) {
                // This might be the general data at the top level
                const generalData = {};
                if (gameData.version) generalData.version = gameData.version;
                if (gameData.startDate) generalData.startDate = gameData.startDate;
                if (gameData.firstTimeSetup) generalData.firstTimeSetup = gameData.firstTimeSetup;
                
                Utils.saveToStorage('gameData', generalData);
            }
            
            console.log('Game data loaded into memory successfully with fixed loader');
        } catch (error) {
            console.error('Error in fixed loadGameDataIntoMemory:', error);
        }
    };
    
    // FIX 2: PATCH THE SAVEUSERPROGRESS FUNCTION
    // This fixes the "Inventory items before saving: 0" issue by correctly
    // counting the items in the inventory slots array
    
    // Save original function for reference
    const originalSaveUserProgress = AuthenticationSystem.saveUserProgress;
    
    // Replace with fixed version
    AuthenticationSystem.saveUserProgress = async function(forceSync = false) {
        try {
            if (!this.isAuthenticated || !this.currentUser) {
                console.error('Cannot save progress: Not authenticated');
                return false;
            }
            
            console.log('Enhanced saveUserProgress with fixed inventory counting for user:', this.currentUser.id);
            
            // First make sure the user record exists
            if (typeof this.ensureUserExists === 'function') {
                await this.ensureUserExists(this.currentUser.id);
            }
            
            // Collect data from each game system carefully
            const gameData = {};
            
            // Currency (handle undefined)
            try {
                gameData.currency = typeof Currency !== 'undefined' && typeof Currency.saveData === 'function' 
                    ? Currency.saveData() 
                    : { copper: 0, silver: 0, gold: 0, diamond: 0 };
            } catch (e) {
                console.warn('Error saving currency:', e);
                gameData.currency = { copper: 0, silver: 0, gold: 0, diamond: 0 };
            }
            
            // Inventory - Fixed to properly handle different inventory structures
            try {
                if (typeof Inventory !== 'undefined') {
                    // Get inventory data
                    gameData.inventory = Inventory.slots 
                        ? { slots: Inventory.slots, characterEquipment: Inventory.characterEquipment } 
                        : Utils.loadFromStorage('inventory') || {};
                        
                    // Count items properly
                    let itemCount = 0;
                    if (Inventory.slots && Array.isArray(Inventory.slots)) {
                        // Count non-null slots in the array
                        itemCount = Inventory.slots.filter(slot => slot !== null).length;
                    } else if (gameData.inventory.slots && Array.isArray(gameData.inventory.slots)) {
                        // Alternative structure with slots property
                        itemCount = gameData.inventory.slots.filter(slot => slot !== null).length;
                    } else if (typeof gameData.inventory === 'object') {
                        // Fallback to legacy object counting
                        itemCount = Object.keys(gameData.inventory).length;
                    }
                    
                    console.log('Inventory items before saving:', itemCount);
                } else {
                    gameData.inventory = Utils.loadFromStorage('inventory') || {};
                    console.log('Inventory items before saving:', Object.keys(gameData.inventory).length);
                }
            } catch (e) {
                console.warn('Error handling inventory:', e);
                gameData.inventory = {};
            }
            
            // Characters (handle undefined)
            try {
                const charactersData = Utils.loadFromStorage('characters');
                gameData.characters = charactersData || {};
            } catch (e) {
                console.warn('Error loading characters:', e);
                gameData.characters = {};
            }
            
            // Other game systems
            gameData.gacha = Utils.loadFromStorage('gacha');
            gameData.map = Utils.loadFromStorage('map');
            gameData.shards = Utils.loadFromStorage('shards');
            gameData.dungeon = Utils.loadFromStorage('dungeon');
            gameData.audio = Utils.loadFromStorage('audio_settings');
            gameData.general = Utils.loadFromStorage('gameData') || {};
            
            // Add metadata
            gameData._meta = {
                lastSaved: new Date().toISOString(),
                clientVersion: '1.0.0'
            };
            
            // Save data to local storage as backup
            Utils.saveToStorage('fallback_game_progress', {
                userId: this.currentUser.id,
                gameData: gameData,
                savedAt: new Date().toISOString()
            });
            
            console.log('Saved data to local storage fallback first');
            
            // Use the RLS bypass function if available
            if (typeof this.supabase !== 'undefined' && typeof this.supabase.rpc === 'function') {
                try {
                    console.log('Save approach 1: Using save_game_progress RPC function');
                    
                    const { error: rpcError } = await this.supabase
                        .rpc('save_game_progress', {
                            p_user_id: this.currentUser.id,
                            p_game_data: gameData,
                            p_version: (gameData.general?.version || 0) + 1
                        });
                    
                    if (!rpcError) {
                        console.log('Successfully saved via RPC function');
                        return true;
                    } else {
                        console.warn('RPC save error:', rpcError);
                    }
                } catch (rpcError) {
                    console.warn('RPC save exception:', rpcError);
                }
            }
            
            // Fall back to the original save function
            return await originalSaveUserProgress.call(this, forceSync);
        } catch (error) {
            console.error('Error in enhanced saveUserProgress:', error);
            return false;
        }
    };
    
    // Add Currency.reset function if it doesn't exist
    if (typeof Currency !== 'undefined' && typeof Currency.reset !== 'function') {
        Currency.reset = function() {
            this.copper = 0;
            this.silver = 0;
            this.gold = 0;
            this.diamond = 0;
            this.updateDisplay();
        };
    }
    
    console.log('Data loading fixes applied successfully!');
});
