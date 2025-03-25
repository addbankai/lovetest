/**
 * Database integration for LovelaceVerse
 * Provides utility functions for interacting with the new Supabase database structure
 */

const DatabaseIntegration = {
    // Centralized data operation functions to interface with the new database structure
    
    /**
     * Initialize user data after authentication
     * @param {string} userId - The authenticated user ID
     * @param {boolean} isGuest - Whether the user is a guest
     * @param {string} walletAddress - Optional wallet address for wallet-based auth
     * @returns {Promise<boolean>} - Whether initialization was successful
     */
    initializeUserData: async function(userId, isGuest, walletAddress = null) {
        if (!AuthenticationSystem.supabase) return false;
        
        try {
            console.log('Initializing user data in new database structure');
            
            // Create/update user record first
            const { error: userError } = await AuthenticationSystem.supabase
                .from('users')
                .upsert({
                    id: userId,
                    is_guest: isGuest,
                    wallet_address: walletAddress,
                    updated_at: new Date().toISOString()
                });
                
            if (userError) {
                console.error('Error initializing user:', userError);
                return false;
            }
            
            // Initialize currency record
            const { error: currencyError } = await AuthenticationSystem.supabase
                .from('currency')
                .upsert({
                    user_id: userId,
                    copper: 0,
                    silver: 0,
                    gold: 0,
                    diamond: 0
                });
                
            if (currencyError) {
                console.error('Error initializing currency:', currencyError);
            }
            
            console.log('User data initialized successfully');
            return true;
        } catch (error) {
            console.error('Exception initializing user data:', error);
            return false;
        }
    },
    
    /**
     * Load user progress from the new database structure
     * @param {string} userId - The user ID to load progress for
     * @returns {Promise<Object>} - The loaded progress data
     */
    loadUserProgress: async function(userId) {
        try {
            const { data, error } = await AuthenticationSystem.supabase
                .from('game_progress')
                .select('data')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) throw error;

            if (data?.data) {
                // Load shards if present
                if (data.data.shards) {
                    ShardSystem.init(data.data.shards);
                }
                
                // Load currency
                const { data: currencyData, error: currencyError } = await AuthenticationSystem.supabase
                    .from('currency')
                    .select('*')
                    .eq('user_id', userId)
                    .maybeSingle();
                    
                if (currencyError) {
                    console.error('Error loading currency:', currencyError);
                } else if (currencyData) {
                    progress.currency = {
                        copper: currencyData.copper,
                        silver: currencyData.silver,
                        gold: currencyData.gold,
                        diamond: currencyData.diamond
                    };
                    
                    // Update Currency system
                    if (typeof Currency !== 'undefined') {
                        Currency.loadFromData(progress.currency);
                    }
                }
                
                // Load characters
                const { data: charactersData, error: charactersError } = await AuthenticationSystem.supabase
                    .from('characters')
                    .select('*')
                    .eq('user_id', userId);
                    
                if (charactersError) {
                    console.error('Error loading characters:', charactersError);
                } else if (charactersData) {
                    progress.characters = charactersData;
                    
                    // Update Character system
                    if (typeof CharacterSystem !== 'undefined' && CharacterSystem.loadFromData) {
                        CharacterSystem.loadFromData({
                            characters: charactersData,
                            activeCharacters: charactersData.filter(c => c.is_active).map(c => c.id)
                        });
                    }
                }
                
                // Load inventory
                const { data: inventoryData, error: inventoryError } = await AuthenticationSystem.supabase
                    .from('inventory_items')
                    .select('*')
                    .eq('user_id', userId);
                    
                if (inventoryError) {
                    console.error('Error loading inventory:', inventoryError);
                } else {
                    progress.inventory = {};
                    
                    // Convert to format expected by the Inventory system
                    if (inventoryData) {
                        inventoryData.forEach(item => {
                            progress.inventory[item.item_id] = {
                                id: item.item_id,
                                quantity: item.quantity,
                                ...item.metadata
                            };
                        });
                    }
                    
                    // Update Inventory system
                    if (typeof InventorySystem !== 'undefined') {
                        InventorySystem.loadInventory(progress.inventory);
                    }
                }
                
                // Load character equipment
                if (progress.characters) {
                    for (const character of progress.characters) {
                        const { data: equipmentData, error: equipmentError } = await AuthenticationSystem.supabase
                            .from('character_equipment')
                            .select('*')
                            .eq('character_id', character.id);
                            
                        if (equipmentError) {
                            console.error(`Error loading equipment for character ${character.id}:`, equipmentError);
                        } else if (equipmentData && equipmentData.length > 0) {
                            // Convert to format expected by the Character/Inventory systems
                            const characterEquipment = {};
                            
                            equipmentData.forEach(equip => {
                                characterEquipment[equip.slot] = progress.inventory[equip.item_id];
                            });
                            
                            // Update the Character's equipment
                            if (typeof Inventory !== 'undefined' && Inventory.setCharacterEquipment) {
                                Inventory.setCharacterEquipment(character.id, characterEquipment);
                            }
                        }
                    }
                }
                
                // Also try loading from the legacy game_progress table as fallback
                const { data: legacyData, error: legacyError } = await AuthenticationSystem.supabase
                    .from('game_progress')
                    .select('game_data')
                    .eq('user_id', userId)
                    .maybeSingle();
                    
                if (!legacyError && legacyData && legacyData.game_data) {
                    // Merge any data we couldn't load from the new tables
                    const gameData = legacyData.game_data;
                    
                    if (!progress.currency && gameData.currency) {
                        progress.currency = gameData.currency;
                        if (typeof Currency !== 'undefined') {
                            Currency.loadFromData(progress.currency);
                        }
                    }
                    
                    if ((!progress.characters || progress.characters.length === 0) && gameData.characters) {
                        progress.characters = gameData.characters;
                        if (typeof CharacterSystem !== 'undefined' && CharacterSystem.loadFromData) {
                            CharacterSystem.loadFromData(gameData.characters);
                        }
                    }
                    
                    if (Object.keys(progress.inventory || {}).length === 0 && gameData.inventory) {
                        progress.inventory = gameData.inventory;
                        if (typeof InventorySystem !== 'undefined') {
                            InventorySystem.loadInventory(progress.inventory);
                        }
                    }
                    
                    // Load other data from legacy structure
                    if (gameData.gacha) Utils.saveToStorage('gacha', gameData.gacha);
                    if (gameData.map) Utils.saveToStorage('map', gameData.map);
                    if (gameData.shards) Utils.saveToStorage('shards', gameData.shards);
                    if (gameData.dungeon) Utils.saveToStorage('dungeon', gameData.dungeon);
                    if (gameData.audio) Utils.saveToStorage('audio_settings', gameData.audio);
                    if (gameData.general) Utils.saveToStorage('gameData', gameData.general);
                }
                
                console.log('User progress loaded successfully', progress);
                return progress;
            }
        } catch (error) {
            console.error('Error loading user progress:', error);
            return false;
        }
    },
    
    /**
     * Save user progress to the new database structure
     * @param {string} userId - The user ID to save progress for
     * @param {boolean} forceSave - Whether to force save even if it's not time yet
     * @returns {Promise<boolean>} - Whether the save was successful
     */
    saveUserProgress: async function(userId, forceSave = false) {
        try {
            // Get current game state
            const gameData = {
                currency: Currency ? Currency.saveData() : undefined,
                inventory: Utils.loadFromStorage('inventory'),
                characters: CharacterSystem ? CharacterSystem.loadData() : undefined,
                shards: ShardSystem ? ShardSystem.saveData() : Utils.loadFromStorage('character_shards'),
                gacha: Utils.loadFromStorage('gacha'),
                map: Utils.loadFromStorage('map'),
                dungeon: Utils.loadFromStorage('dungeon'),
                audio: Utils.loadFromStorage('audio_settings'),
                general: Utils.loadFromStorage('gameData'),
                _meta: {
                    lastSaved: new Date().toISOString(),
                    clientVersion: '1.0.0',
                    database_version: 'structured'
                }
            };

            // Save to game_progress table
            const { error } = await AuthenticationSystem.supabase
                .from('game_progress')
                .upsert({
                    user_id: userId,
                    data: gameData,
                    updated_at: new Date().toISOString(),
                    version: 1
                });

            if (error) throw error;
            return true;
        } catch (error) {
            console.error('Error saving user progress:', error);
            return false;
        }
    }
};

// Extend AuthenticationSystem with new data loading/saving methods
// This will be called after both files are loaded
document.addEventListener('DOMContentLoaded', function() {
    if (typeof AuthenticationSystem !== 'undefined') {
        // Replace the loadUserProgress method to use the new database structure
        const originalLoadUserProgress = AuthenticationSystem.loadUserProgress;
        AuthenticationSystem.loadUserProgress = async function(userId) {
            try {
                // First try to load from the new structure
                const result = await DatabaseIntegration.loadUserProgress(userId);
                
                // If that fails, fall back to the original implementation
                if (!result) {
                    console.log('Falling back to original loadUserProgress implementation');
                    return await originalLoadUserProgress.call(AuthenticationSystem, userId);
                }
                
                return true;
            } catch (error) {
                console.error('Error in enhanced loadUserProgress:', error);
                return await originalLoadUserProgress.call(AuthenticationSystem, userId);
            }
        };
        
        // Replace the saveUserProgress method to use the new database structure
        const originalSaveUserProgress = AuthenticationSystem.saveUserProgress;
        AuthenticationSystem.saveUserProgress = async function(forceSave = false) {
            try {
                if (!this.isAuthenticated || !this.currentUser) {
                    console.error('Cannot save progress: Not authenticated');
                    return false;
                }
                
                // First try to save to the new structure
                const result = await DatabaseIntegration.saveUserProgress(this.currentUser.id, forceSave);
                
                // If that fails, fall back to the original implementation
                if (!result) {
                    console.log('Falling back to original saveUserProgress implementation');
                    return await originalSaveUserProgress.call(AuthenticationSystem, forceSave);
                }
                
                return true;
            } catch (error) {
                console.error('Error in enhanced saveUserProgress:', error);
                return await originalSaveUserProgress.call(AuthenticationSystem, forceSave);
            }
        };
        
        // After user creation, initialize the new database structure
        const originalCreateUserInDatabase = AuthenticationSystem.createUserInDatabase;
        AuthenticationSystem.createUserInDatabase = async function(userData) {
            try {
                // First call the original implementation for backward compatibility
                const result = await originalCreateUserInDatabase.call(AuthenticationSystem, userData);
                
                // Then initialize in the new structure
                if (result) {
                    await DatabaseIntegration.initializeUserData(
                        userData.id,
                        userData.isGuest || false,
                        userData.wallet_address
                    );
                }
                
                return result;
            } catch (error) {
                console.error('Error in enhanced createUserInDatabase:', error);
                return await originalCreateUserInDatabase.call(AuthenticationSystem, userData);
            }
        };
        
        console.log('Enhanced AuthenticationSystem with new database integration');
    }
});

async function verifyDatabaseSchema() {
    try {
        const { data, error } = await AuthenticationSystem.supabase
            .from('game_progress')
            .select('data')  // Try to select the 'data' column
            .limit(1);
            
        if (error) {
            console.error('Schema verification failed:', error);
            return false;
        }
        console.log('Schema verification successful');
        return true;
    } catch (error) {
        console.error('Schema verification error:', error);
        return false;
    }
}
