/**
 * Wallet Data Loading Fix for LovelaceVerse
 * 
 * This script specifically improves wallet data loading, addressing the issue where
 * wallet users don't get their progress loaded correctly after login.
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Applying wallet data loading fix...');
    
    // Make sure AuthenticationSystem is loaded
    if (typeof AuthenticationSystem === 'undefined') {
        console.error('AuthenticationSystem not found, cannot apply wallet data loading fix');
        return;
    }
    
    // Save original method to enhance
    const originalLoadUserProgress = AuthenticationSystem.loadUserProgress;
    
    // Enhanced version of loadUserProgress specifically for wallet users
    AuthenticationSystem.loadUserProgress = async function(userId) {
        try {
            console.log('⚡ Enhanced loadUserProgress for user:', userId);
            
            // Handle wallet users differently
            if (userId && !userId.startsWith('guest_') && this.authMode === 'wallet') {
                console.log('⚡ Wallet user detected, using specialized data loading...');
                
                // Try multiple approaches to ensure data loads properly
                return await loadWalletData(userId, this.supabase);
            }
            
            // For non-wallet users (guests), use the original method
            return await originalLoadUserProgress.call(this, userId);
        } catch (error) {
            console.error('Error in enhanced loadUserProgress:', error);
            return await originalLoadUserProgress.call(this, userId);
        }
    };
    
    /**
     * Specialized wallet data loading function with multiple attempts
     * @param {string} walletId - Wallet address/ID
     * @param {Object} supabase - Supabase client
     * @returns {Promise<boolean>} Success indicator
     */
    async function loadWalletData(walletId, supabase) {
        console.log('🔄 Loading wallet data with enhanced method...');
        
        // Ensure user exists in database first
        const { error: userError } = await supabase
            .from('users')
            .upsert({
                id: walletId,
                is_guest: false,
                wallet_address: walletId,
                updated_at: new Date().toISOString()
            });
        
        if (userError) {
            console.error('Error ensuring user exists:', userError);
        }

        let success = false;
        let attempts = 0;
        const maxAttempts = 3;
        
        while (!success && attempts < maxAttempts) {
            attempts++;
            console.log(`Wallet data loading attempt ${attempts}/${maxAttempts}`);
            
            try {
                // APPROACH 1: Using RPC function
                console.log('Approach 1: Using get_game_progress_version RPC function');
                
                try {
                    const { data: rpcData, error: rpcError } = await supabase
                        .rpc('get_game_progress_version', {
                            p_user_id: walletId
                        });
                        
                    if (!rpcError && rpcData && rpcData.game_data) {
                        console.log('✅ Successfully loaded wallet data via RPC function');
                        
                        // Load the game data
                        await loadGameData(rpcData.game_data);
                        success = true;
                        break;
                    } else {
                        console.warn('RPC approach failed:', rpcError);
                    }
                } catch (rpcError) {
                    console.warn('RPC approach exception:', rpcError);
                }
                
                // APPROACH 2: Direct query with retry
                if (!success) {
                    console.log('Approach 2: Using direct database query');
                    
                    try {
                        const { data: directData, error: directError } = await supabase
                            .from('game_progress')
                            .select('game_data, version')
                            .eq('user_id', walletId)
                            .maybeSingle();
                            
                        if (!directError && directData && directData.game_data) {
                            console.log('✅ Successfully loaded wallet data via direct query');
                            
                            // Load the game data
                            await loadGameData(directData.game_data);
                            success = true;
                            break;
                        } else {
                            console.warn('Direct query approach failed:', directError);
                        }
                    } catch (directError) {
                        console.warn('Direct query approach exception:', directError);
                    }
                }
                
                // Add a delay before next attempt
                if (!success && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (attemptError) {
                console.error(`Error during wallet data loading attempt ${attempts}:`, attemptError);
                
                // Add a delay before next attempt
                if (attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }
        
        // If all attempts failed, create default data
        if (!success) {
            console.warn('All wallet data loading attempts failed, creating new default data...');
            
            // Create default game data
            const defaultData = {
                inventory: {},
                currency: { copper: 0, silver: 1, gold: 0, diamond: 0 }, // Give 1 silver instead
                general: { version: 1, firstLogin: true },
                characters: { characters: [], activeCharacters: [] } // No default character
            };
            
            // Load default data
            await loadGameData(defaultData);
            success = true;
        }
        
        return success;
    }
    
    /**
     * Load game data into appropriate systems
     * @param {Object} gameData - The game data to load
     */
    async function loadGameData(gameData) {
        try {
            console.log('🔄 Loading game data into systems:', Object.keys(gameData).join(', '));
            
            // CURRENCY: Special handling using the correct method
            if (gameData.currency && typeof Currency !== 'undefined') {
                console.log('Loading currency data...');
                
                // Use the correct method based on what's available
                if (typeof Currency.init === 'function') {
                    console.log('Using Currency.init() method');
                    Currency.init(gameData.currency);
                } else if (typeof Currency.loadFromData === 'function') {
                    console.log('Using Currency.loadFromData() method');
                    Currency.loadFromData(gameData.currency);
                } else {
                    console.warn('No Currency loading method available, using manual approach');
                    // Manually update currency values
                    ['copper', 'silver', 'gold', 'diamond'].forEach(currency => {
                        if (typeof gameData.currency[currency] === 'number') {
                            Currency[currency] = gameData.currency[currency];
                        }
                    });
                    if (typeof Currency.updateDisplay === 'function') {
                        Currency.updateDisplay();
                    }
                }
                
                // Verify currency was loaded
                console.log('Currency loaded:', 
                    'copper:', Currency.copper, 
                    'silver:', Currency.silver, 
                    'gold:', Currency.gold,
                    'diamond:', Currency.diamond);
            }
            
            // INVENTORY: Handle with better verification
            if (gameData.inventory) {
                console.log('Loading inventory data...');
                
                // Check specifically for Inventory.loadFromData
                if (typeof Inventory !== 'undefined' && typeof Inventory.loadFromData === 'function') {
                    Inventory.loadFromData(gameData.inventory);
                    console.log('Inventory loaded via Inventory.loadFromData()');
                    
                    // Log inventory count for verification
                    let itemCount = 0;
                    if (Inventory.slots) {
                        itemCount = Inventory.slots.filter(slot => slot !== null).length;
                    } else if (typeof gameData.inventory === 'object') {
                        itemCount = Object.keys(gameData.inventory).length;
                    }
                    console.log(`Loaded ${itemCount} inventory items`);
                } else {
                    // Fallback to direct storage saving
                    console.log('Using localStorage fallback for inventory');
                    Utils.saveToStorage('inventory', gameData.inventory);
                }
            }
            
            // CHARACTERS: Handle character loading
            if (gameData.characters) {
                console.log('Loading character data...');
                Utils.saveToStorage('characters', gameData.characters);
                
                // Notify system of changes if possible
                if (typeof CharacterSystem !== 'undefined' && 
                    typeof CharacterSystem.refreshCharacters === 'function') {
                    setTimeout(() => {
                        try {
                            CharacterSystem.refreshCharacters();
                            console.log('Characters refreshed');
                        } catch (e) {
                            console.warn('Error refreshing characters:', e);
                        }
                    }, 500);
                }
                
                // Log character count for verification
                if (gameData.characters.characters) {
                    console.log(`Loaded ${gameData.characters.characters.length} characters`);
                }
            }
            
            // OTHER SYSTEMS: Handle other data types
            if (gameData.gacha) Utils.saveToStorage('gacha', gameData.gacha);
            if (gameData.map) Utils.saveToStorage('map', gameData.map);
            if (gameData.shards) Utils.saveToStorage('shards', gameData.shards);
            if (gameData.dungeon) Utils.saveToStorage('dungeon', gameData.dungeon);
            if (gameData.audio) Utils.saveToStorage('audio_settings', gameData.audio);
            
            // Handle general game data based on structure
            if (gameData.general) {
                Utils.saveToStorage('gameData', gameData.general);
            } else if (gameData.version || gameData.firstLogin || gameData.startDate) {
                // This might be flat top-level data, organize it
                const generalData = {
                    version: gameData.version || 1,
                    firstLogin: gameData.firstLogin || false,
                    startDate: gameData.startDate || new Date().toISOString()
                };
                Utils.saveToStorage('gameData', generalData);
            }
            
            // Trigger events to let other systems know data is loaded
            document.dispatchEvent(new CustomEvent('gameDataLoaded', { 
                detail: { source: 'wallet-data-loading-fix', walletMode: true } 
            }));
            
            console.log('✅ Game data loading complete!');
        } catch (error) {
            console.error('Error loading game data:', error);
            throw error;
        }
    }
    
    // Add an event listener for when wallet is connected
    document.addEventListener('walletConnected', (event) => {
        if (event.detail && event.detail.userId) {
            console.log('Wallet connected event detected, ensuring data is loaded');
            setTimeout(() => {
                // Force a reload of the wallet data
                if (AuthenticationSystem.isAuthenticated && 
                    AuthenticationSystem.currentUser &&
                    AuthenticationSystem.currentUser.id === event.detail.userId) {
                    
                    AuthenticationSystem.loadUserProgress(event.detail.userId)
                        .catch(error => console.error('Error in wallet data reload:', error));
                }
            }, 1000);
        }
    });
    
    console.log('✅ Wallet data loading fix applied');
});
