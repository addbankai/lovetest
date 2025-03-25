/**
 * Game Progress Synchronization System
 * Handles syncing game progress between local storage and Supabase
 */

const GameSync = {
    // Configuration
    syncInterval: 30000, // 30 seconds
    syncIntervalId: null,
    syncQueue: [],
    isSyncing: false,
    maxRetries: 3,
    
    /**
     * Initialize the sync system
     * @param {Object} supabaseClient - Initialized Supabase client
     */
    init: function(supabaseClient) {
        this.supabase = supabaseClient;
        
        // Load any pending sync operations
        this.syncQueue = Utils.loadFromStorage('sync_queue') || [];
        
        // Set up auto sync interval
        this.startAutoSync();
        
        // Set up online/offline listeners
        window.addEventListener('online', this.handleOnline.bind(this));
        window.addEventListener('offline', this.handleOffline.bind(this));
        
        // Set up data change listeners for partial syncing
        document.addEventListener('inventoryChanged', (e) => {
            this.savePartialGameData('inventory', e.detail);
        });
        
        document.addEventListener('character_shards_changed', (e) => {
            this.savePartialGameData('character_shards', e.detail);
        });
        
        document.addEventListener('equipmentChanged', (e) => {
            // Get all character equipment data and sync it
            if (Inventory && typeof Inventory.saveToLocal === 'function') {
                Inventory.saveToLocal();
            }
        });
        
        console.log('GameSync initialized with data change listeners');
    },
    
    /**
     * Start automatic synchronization
     */
    startAutoSync: function() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
        }
        
        this.syncIntervalId = setInterval(() => {
            if (navigator.onLine && AuthenticationSystem.isAuthenticated) {
                this.processSyncQueue();
            }
        }, this.syncInterval);
        
        console.log('Auto-sync started');
    },
    
    /**
     * Stop automatic synchronization
     */
    stopAutoSync: function() {
        if (this.syncIntervalId) {
            clearInterval(this.syncIntervalId);
            this.syncIntervalId = null;
        }
        
        console.log('Auto-sync stopped');
    },
    
    /**
     * Handle going online
     */
    handleOnline: function() {
        console.log('Device is online. Resuming syncing...');
        
        // Process any pending sync operations
        if (this.syncQueue.length > 0 && AuthenticationSystem.isAuthenticated) {
            this.processSyncQueue();
        }
    },
    
    /**
     * Handle going offline
     */
    handleOffline: function() {
        console.log('Device is offline. Syncing paused.');
    },
    
    /**
     * Add sync operation to queue
     * @param {Object} syncOperation - Operation to queue
     */
    addToSyncQueue: function(syncOperation) {
        this.syncQueue.push({
            ...syncOperation,
            timestamp: new Date().toISOString(),
            retries: 0
        });
        
        Utils.saveToStorage('sync_queue', this.syncQueue);
        console.log('Added to sync queue. Queue length:', this.syncQueue.length);
    },
    
    /**
     * Process pending sync operations
     */
    processSyncQueue: async function() {
        if (this.isSyncing || this.syncQueue.length === 0 || !navigator.onLine) {
            return;
        }
        
        this.isSyncing = true;
        console.log('Processing sync queue. Items:', this.syncQueue.length);
        
        // Process queue in first-in-first-out order
        const operation = this.syncQueue[0];
        
        try {
            if (operation.type === 'full') {
                await this.syncFullData(operation.data);
            } else if (operation.type === 'partial') {
                await this.syncPartialData(operation.key, operation.data);
            }
            
            // Success - remove from queue
            this.syncQueue.shift();
            Utils.saveToStorage('sync_queue', this.syncQueue);
            
        } catch (error) {
            console.error('Error processing sync operation:', error);
            
            // Increment retry count
            operation.retries++;
            
            // Remove from queue if max retries exceeded
            if (operation.retries >= this.maxRetries) {
                console.warn('Max retries exceeded for sync operation. Abandoning.');
                this.syncQueue.shift();
            }
            
            Utils.saveToStorage('sync_queue', this.syncQueue);
        }
        
        this.isSyncing = false;
        
        // Continue processing if more items in queue
        if (this.syncQueue.length > 0) {
            setTimeout(() => this.processSyncQueue(), 1000);
        }
    },
    
    /**
     * Save all game data locally and sync to server
     */
    saveAllGameData: async function() {
        try {
            if (!AuthenticationSystem.isAuthenticated) {
                console.warn('Cannot save game data: Not authenticated');
                return false;
            }
            
            const gameData = this.collectGameData();
            
            // Always save locally first
            Utils.saveToStorage('game_progress', gameData);
            
            // If online, sync to database
            if (navigator.onLine) {
                return await this.syncFullData(gameData);
            } else {
                // Queue for later if offline
                this.addToSyncQueue({
                    type: 'full',
                    data: gameData
                });
                return true;
            }
        } catch (error) {
            console.error('Error saving game data:', error);
            return false;
        }
    },
    
    /**
     * Collect all game data into a single object
     * @returns {Object} Compiled game data
     */
    collectGameData: function() {
        const characterData = Utils.loadFromStorage('characters') || {};
        const inventoryData = Utils.loadFromStorage('inventoryData') || {};
        const currencyData = Currency ? Currency.saveData() : {};
        const shardData = Utils.loadFromStorage('character_shards') || {};
        const equipmentData = {};
        
        // Collect equipment data from each character
        if (characterData.characters) {
            characterData.characters.forEach(character => {
                const characterId = character.id;
                const equipment = Inventory ? Inventory.getCharacterEquipment(characterId) : {};
                if (equipment && Object.keys(equipment).length > 0) {
                    equipmentData[characterId] = equipment;
                }
            });
        }
        
        // Collect general game state
        const gameState = {
            map: MapSystem ? MapSystem.saveData() : {},
            settings: Utils.loadFromStorage('game_settings') || {},
            lastPlayed: new Date().toISOString()
        };
        
        return {
            characters: characterData,
            inventory: inventoryData,
            currency: currencyData,
            character_shards: shardData,
            equipment: equipmentData,
            game_state: gameState,
            lastSaved: new Date().toISOString(),
            version: (Utils.loadFromStorage('game_progress')?.version || 0) + 1
        };
    },
    
    /**
     * Save specific category of game data
     * @param {string} key - Data category key
     * @param {Object} data - Data to save
     */
    savePartialGameData: async function(key, data) {
        if (!AuthenticationSystem.isAuthenticated) {
            console.warn(`Cannot save ${key} data: Not authenticated`);
            return false;
        }
        
        try {
            // Update the specific category in local storage
            const gameProgress = Utils.loadFromStorage('game_progress') || {};
            gameProgress[key] = data;
            gameProgress.lastSaved = new Date().toISOString();
            gameProgress.version = (gameProgress.version || 0) + 1;
            
            // Save locally
            Utils.saveToStorage('game_progress', gameProgress);
            
            // If online, sync to database
            if (navigator.onLine) {
                return await this.syncPartialData(key, data);
            } else {
                // Queue for later if offline
                this.addToSyncQueue({
                    type: 'partial',
                    key: key,
                    data: data
                });
                return true;
            }
        } catch (error) {
            console.error(`Error saving ${key} data:`, error);
            return false;
        }
    },
    
    /**
     * Sync full game data to database
     * @param {Object} gameData - Complete game data
     */
    syncFullData: async function(gameData) {
        try {
            if (!this.supabase || !AuthenticationSystem.isAuthenticated) {
                throw new Error('Not authenticated or Supabase not initialized');
            }
            
            const userId = AuthenticationSystem.currentUser.id;
            
            // Use the RPC function for saving
            const { data, error } = await this.supabase.rpc(
                'save_game_progress',
                {
                    p_user_id: userId,
                    p_game_data: gameData,
                    p_version: gameData.version || 1
                }
            );
            
            if (error) throw error;
            
            console.log('Game data synced to database successfully');
            
            // Update local version to match server
            if (data && data.success) {
                gameData.version = data.data.version;
                Utils.saveToStorage('game_progress', gameData);
            }
            
            return true;
        } catch (error) {
            console.error('Error syncing full data to database:', error);
            throw error;
        }
    },
    
    /**
     * Sync partial game data to database
     * @param {string} key - Data category key
     * @param {Object} data - Data to sync
     */
    syncPartialData: async function(key, data) {
        try {
            if (!this.supabase || !AuthenticationSystem.isAuthenticated) {
                throw new Error('Not authenticated or Supabase not initialized');
            }
            
            const userId = AuthenticationSystem.currentUser.id;
            const gameProgress = Utils.loadFromStorage('game_progress') || {};
            
            // Use the RPC function for partial saving
            const { data: responseData, error } = await this.supabase.rpc(
                'save_partial_progress',
                {
                    p_user_id: userId,
                    p_data_key: key,
                    p_data: data,
                    p_version: gameProgress.version || 1
                }
            );
            
            if (error) throw error;
            
            console.log(`${key} data synced to database successfully`);
            
            // Update local version to match server
            if (responseData && responseData.success) {
                gameProgress.version = responseData.data.version;
                Utils.saveToStorage('game_progress', gameProgress);
            }
            
            return true;
        } catch (error) {
            console.error(`Error syncing ${key} data to database:`, error);
            throw error;
        }
    },
    
    /**
     * Load user progress from database or local storage
     * @param {string} userId - User ID to load progress for
     */
    loadUserProgress: async function(userId) {
        try {
            // First check local storage
            const localData = Utils.loadFromStorage('game_progress');
            
            // If offline, use local data only
            if (!navigator.onLine) {
                console.log('Offline mode - using local data only');
                if (localData) {
                    this.applyGameData(localData);
                    return true;
                }
                return false;
            }
            
            // Load from database
            const { data, error } = await this.supabase.rpc(
                'load_game_progress',
                { p_user_id: userId }
            );
            
            if (error) throw error;
            
            // Check if we have server data
            if (data && data.success) {
                const serverData = data.data;
                
                // Compare timestamps to use most recent
                if (!localData || !localData.lastSaved || 
                    new Date(serverData.last_synced_at) > new Date(localData.lastSaved)) {
                    console.log('Using server data (newer than local)');
                    this.applyGameData(serverData);
                    // Save server data locally for offline use
                    const formattedData = this.formatServerDataForLocalStorage(serverData);
                    Utils.saveToStorage('game_progress', formattedData);
                } else {
                    console.log('Using local data (newer than server)');
                    this.applyGameData(localData);
                    // Sync local data back to server since it's newer
                    this.addToSyncQueue({
                        type: 'full',
                        data: localData
                    });
                }
                
                return true;
            }
            
            // Fall back to local data if server has none
            if (localData) {
                console.log('No server data found, using local data');
                this.applyGameData(localData);
                return true;
            }
            
            console.log('No progress data found');
            return false;
        } catch (error) {
            console.error('Error loading progress:', error);
            
            // Fall back to local data
            const localData = Utils.loadFromStorage('game_progress');
            if (localData) {
                console.log('Error loading from server, falling back to local data');
                this.applyGameData(localData);
                return true;
            }
            
            return false;
        }
    },
    
    /**
     * Format server data for local storage
     * @param {Object} serverData - Data from server
     * @returns {Object} Formatted data
     */
    formatServerDataForLocalStorage: function(serverData) {
        return {
            characters: serverData.characters || {},
            inventory: serverData.inventory || {},
            currency: serverData.currency || {},
            character_shards: serverData.character_shards || {},
            equipment: serverData.equipment || {},
            game_state: serverData.game_state || {},
            version: serverData.version || 1,
            lastSaved: new Date().toISOString()
        };
    },
    
    /**
     * Apply loaded game data to game systems
     * @param {Object} gameData - Game data to apply
     */
    applyGameData: function(gameData) {
        // Apply character data
        if (gameData.characters && typeof CharacterSystem !== 'undefined') {
            CharacterSystem.loadFromData(gameData.characters);
        }
        
        // Apply currency data
        if (gameData.currency && typeof Currency !== 'undefined') {
            Currency.loadFromData(gameData.currency);
        }
        
        // Apply inventory data
        if (gameData.inventory && typeof Inventory !== 'undefined') {
            Utils.saveToStorage('inventoryData', gameData.inventory);
            Inventory.loadFromData(gameData.inventory);
        }
        
        // Apply character shards
        if (gameData.character_shards && typeof ShardSystem !== 'undefined') {
            Utils.saveToStorage('character_shards', gameData.character_shards);
            ShardSystem.init(gameData.character_shards);
        }
        
        // Apply equipment
        if (gameData.equipment && typeof Inventory !== 'undefined') {
            // For each character, apply equipment properly to each slot
            Object.entries(gameData.equipment).forEach(([characterId, characterEquipment]) => {
                // Initialize this character's equipment
                Inventory.characterEquipment[characterId] = {};
                
                // Apply each equipment piece to the correct slot
                Object.entries(characterEquipment).forEach(([slot, item]) => {
                    if (item) {
                        Inventory.characterEquipment[characterId][slot] = item;
                    } else {
                        Inventory.characterEquipment[characterId][slot] = null;
                    }
                });
            });
            
            // Save equipment after loading
            Inventory.saveToLocal();
            
            // Update any UI if necessary
            if (Game && Game.getActiveCharacter) {
                const activeCharacter = Game.getActiveCharacter();
                if (activeCharacter) {
                    Inventory.updateEquipmentUI(activeCharacter.id);
                }
            }
        }
        
        // Apply game state (map, etc.)
        if (gameData.game_state) {
            if (gameData.game_state.map && typeof MapSystem !== 'undefined') {
                MapSystem.loadData(gameData.game_state.map);
            }
            
            if (gameData.game_state.settings) {
                Utils.saveToStorage('game_settings', gameData.game_state.settings);
            }
        }
        
        console.log('Game data applied to game systems');
    },
    
    /**
     * Link guest account to wallet
     * @param {string} guestId - Guest account ID
     * @param {string} walletAddress - Wallet address
     */
    linkGuestToWallet: async function(guestId, walletAddress) {
        try {
            // Save current progress before linking
            await this.saveAllGameData();
            
            // Link accounts using the database function
            const { data, error } = await this.supabase.rpc(
                'link_guest_to_wallet',
                {
                    p_guest_id: guestId,
                    p_wallet_address: walletAddress
                }
            );
            
            if (error) throw error;
            
            console.log('Guest account linked to wallet successfully');
            return true;
        } catch (error) {
            console.error('Error linking accounts:', error);
            return false;
        }
    },
    
    /**
     * Handle guest-to-wallet transition
     * Called when a guest user connects a wallet
     * @param {string} guestId - Guest account ID
     * @param {string} walletAddress - Wallet address
     */
    handleGuestToWalletTransition: async function(guestId, walletAddress) {
        try {
            // 1. Link accounts in database
            const linked = await this.linkGuestToWallet(guestId, walletAddress);
            if (!linked) throw new Error('Failed to link accounts');
            
            // 2. Update auth state to wallet
            AuthenticationSystem.authMode = 'wallet';
            AuthenticationSystem.currentUser = { 
                id: walletAddress,
                isGuest: false,
                wallet: walletAddress
            };
            
            // 3. Update storage
            Utils.saveToStorage(AuthenticationSystem.STORAGE_KEYS.AUTH_MODE, 'wallet');
            Utils.saveToStorage(AuthenticationSystem.STORAGE_KEYS.USER_WALLET, walletAddress);
            
            // 4. Load wallet progress (which should now include guest data)
            await this.loadUserProgress(walletAddress);
            
            return true;
        } catch (error) {
            console.error('Error transitioning from guest to wallet:', error);
            return false;
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameSync;
}
