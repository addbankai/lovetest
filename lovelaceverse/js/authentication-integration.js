/**
 * Authentication Integration for Lovelace Verse
 * Connects the AuthenticationSystem with GameSync for proper wallet login progress loading
 */

// This file should be included after both authentication.js and game-sync.js

(function() {
    // Original methods we need to modify
    const originalAuthInit = AuthenticationSystem.init;
    const originalLoadUserProgress = AuthenticationSystem.loadUserProgress;
    const originalConnectWallet = AuthenticationSystem.connectWallet;
    const originalLoginAsGuest = AuthenticationSystem.loginAsGuest;
    const originalLinkAccounts = AuthenticationSystem.linkAccounts;
    const originalSaveUserProgress = AuthenticationSystem.saveUserProgress;

    //-------------------------------------------------------
    // Override AuthenticationSystem.init
    //-------------------------------------------------------
    AuthenticationSystem.init = async function() {
        // Call the original init first
        await originalAuthInit.call(this);
        
        // Initialize the GameSync system with Supabase client
        // Use EnhancedSupabaseClient to ensure consistent connection
        const client = EnhancedSupabaseClient.getInstance();
        GameSync.init(client);
        
        // Set the client directly on the authentication system as well
        this.supabase = client;
        
        console.log('Enhanced AuthenticationSystem initialized with GameSync');
        
        // Debug connection
        try {
            // Test connection with a simple query
            const { data, error } = await client
                .from('health_check')
                .select('*')
                .limit(1);
                
            if (error) {
                console.error('Supabase connection test error:', error);
                console.warn('API Key might be invalid or RLS policies are not set up correctly');
            } else {
                console.log('Supabase connection test successful:', data);
            }
        } catch (e) {
            console.error('Connection test exception:', e);
        }
    };

    //-------------------------------------------------------
    // Add a new override for createUserInDatabase to fix the 401/403 errors
    //-------------------------------------------------------
    const originalCreateUserInDatabase = AuthenticationSystem.createUserInDatabase;
    
    AuthenticationSystem.createUserInDatabase = async function(userData) {
        console.log('Enhanced createUserInDatabase called with:', userData);
        
        try {
            if (this.offlineMode) {
                console.log('In offline mode, skipping database creation for user:', userData.id);
                return true;
            }
            
            if (!this.supabase) {
                // Try to get client from EnhancedSupabaseClient
                this.supabase = EnhancedSupabaseClient.getInstance();
                if (!this.supabase) {
                    console.error('Supabase not initialized in createUserInDatabase');
                    this.enableOfflineMode("Database not available, running in offline mode");
                    return true;
                }
            }
            
            // Modified approach - first check if the user exists
            const { data: existingUser, error: lookupError } = await this.supabase
                .from('users')
                .select('id')
                .eq('id', userData.id)
                .maybeSingle();
                
            console.log('User lookup result:', { existingUser, lookupError });
                
            if (lookupError) {
                console.error('User lookup error:', lookupError);
                this.enableOfflineMode(`Error looking up user: ${lookupError.message}`);
                return true;
            }
            
            // Skip creation if user already exists
            if (existingUser) {
                console.log('User already exists, skipping creation:', userData.id);
                return true;
            }
            
            // Create user record
            const { error: userError } = await this.supabase
                .from('users')
                .insert({
                    id: userData.id,
                    is_guest: userData.is_guest ? true : false,
                    wallet_address: userData.wallet_address || null,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                
            if (userError) {
                console.error('Error creating user:', userError);
                this.enableOfflineMode(`Error creating user: ${userError.message}`);
                return true; 
            }
            
            // Initialize empty progress record
            const { error: progressError } = await this.supabase
                .from('player_progress')
                .insert({
                    user_id: userData.id,
                    characters: {},
                    inventory: {},
                    currency: {},
                    character_shards: {},
                    equipment: {},
                    game_state: {},
                    version: 1,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                
            if (progressError) {
                console.error('Error creating progress record:', progressError);
                // Continue anyway since the user was created
            }
            
            console.log('User and progress record created successfully for:', userData.id);
            return true;
        } catch (error) {
            console.error('Critical error in createUserInDatabase:', error);
            this.enableOfflineMode(`Critical database error: ${error.message}`);
            return true;
        }
    };
    AuthenticationSystem.loadUserProgress = async function(userId) {
        console.log('Enhanced loadUserProgress for user:', userId);
        
        try {
            // Use GameSync for progress loading
            const loaded = await GameSync.loadUserProgress(userId);
            
            if (loaded) {
                console.log('User progress loaded successfully via GameSync');
                
                // Dispatch events to notify other components
                document.dispatchEvent(new CustomEvent('progressLoaded', {
                    detail: { userId: userId }
                }));
                
                return true;
            }
            
            // If GameSync fails, fall back to original method
            console.log('GameSync load failed, falling back to original method');
            return await originalLoadUserProgress.call(this, userId);
        } catch (error) {
            console.error('Error in enhanced loadUserProgress:', error);
            // Fall back to original method
            return await originalLoadUserProgress.call(this, userId);
        }
    };

    //-------------------------------------------------------
    // Override AuthenticationSystem.connectWallet
    //-------------------------------------------------------
    AuthenticationSystem.connectWallet = async function() {
        try {
            // If user is currently a guest, we'll need to handle transition
            const isGuest = this.authMode === 'guest';
            const guestId = isGuest ? this.currentUser?.id : null;
            
            // Call original connect wallet method
            const connected = await originalConnectWallet.call(this);
            
            if (connected) {
                const walletAddress = this.currentUser.id;
                
                // If we were a guest before, handle the transition
                if (isGuest && guestId) {
                    console.log('Handling guest to wallet transition');
                    await GameSync.handleGuestToWalletTransition(guestId, walletAddress);
                } else {
                    // Just load progress for the wallet
                    await GameSync.loadUserProgress(walletAddress);
                }
            }
            
            return connected;
        } catch (error) {
            console.error('Error in enhanced connectWallet:', error);
            return false;
        }
    };

    //-------------------------------------------------------
    // Override AuthenticationSystem.loginAsGuest
    //-------------------------------------------------------
    AuthenticationSystem.loginAsGuest = async function() {
        try {
            // Call original login as guest method
            const loggedIn = await originalLoginAsGuest.call(this);
            
            if (loggedIn) {
                const guestId = this.currentUser.id;
                
                // Load progress for guest
                await GameSync.loadUserProgress(guestId);
            }
            
            return loggedIn;
        } catch (error) {
            console.error('Error in enhanced loginAsGuest:', error);
            return false;
        }
    };

    //-------------------------------------------------------
    // Override AuthenticationSystem.linkAccounts
    //-------------------------------------------------------
    AuthenticationSystem.linkAccounts = async function(guestId, walletAddress) {
        try {
            // Use GameSync to handle account linking
            const linked = await GameSync.linkGuestToWallet(guestId, walletAddress);
            
            if (linked) {
                console.log('Accounts linked successfully via GameSync');
                return true;
            }
            
            // Fall back to original method if GameSync fails
            return await originalLinkAccounts.call(this, guestId, walletAddress);
        } catch (error) {
            console.error('Error in enhanced linkAccounts:', error);
            // Fall back to original method
            return await originalLinkAccounts.call(this, guestId, walletAddress);
        }
    };

    //-------------------------------------------------------
    // Override AuthenticationSystem.saveUserProgress
    //-------------------------------------------------------
    AuthenticationSystem.saveUserProgress = async function(forceSync = false) {
        try {
            if (!this.isAuthenticated || !this.currentUser) {
                console.error('Cannot save progress: Not authenticated');
                return false;
            }
            
            // Use GameSync to save all game data
            const saved = await GameSync.saveAllGameData();
            
            if (saved) {
                console.log('User progress saved successfully via GameSync');
                return true;
            }
            
            // Fall back to original method if GameSync fails
            console.log('GameSync save failed, falling back to original method');
            return await originalSaveUserProgress.call(this, forceSync);
        } catch (error) {
            console.error('Error in enhanced saveUserProgress:', error);
            // Fall back to original method
            return await originalSaveUserProgress.call(this, forceSync);
        }
    };

    // Add event listeners for inventory changes to save specific data
    document.addEventListener('inventoryChanged', () => {
        if (AuthenticationSystem.isAuthenticated) {
            const inventory = Utils.loadFromStorage('inventory') || {};
            GameSync.savePartialGameData('inventory', inventory).catch(console.error);
        }
    });

    // Add listener for character changes
    document.addEventListener('characterUpgraded', () => {
        if (AuthenticationSystem.isAuthenticated) {
            const characters = Utils.loadFromStorage('characters') || {};
            GameSync.savePartialGameData('characters', characters).catch(console.error);
        }
    });

    // Add listener for currency changes
    document.addEventListener('currencyChanged', () => {
        if (AuthenticationSystem.isAuthenticated && typeof Currency !== 'undefined') {
            const currency = Currency.saveData() || {};
            GameSync.savePartialGameData('currency', currency).catch(console.error);
        }
    });

    // Add listener for shard changes
    document.addEventListener('shardsChanged', () => {
        if (AuthenticationSystem.isAuthenticated) {
            const shards = Utils.loadFromStorage('shards') || {};
            GameSync.savePartialGameData('character_shards', shards).catch(console.error);
        }
    });

    console.log('Authentication integration with GameSync installed');
})();
