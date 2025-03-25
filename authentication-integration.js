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
        GameSync.init(this.supabase);
        
        console.log('Enhanced AuthenticationSystem initialized with GameSync');
    };

    //-------------------------------------------------------
    // Override AuthenticationSystem.loadUserProgress
    //-------------------------------------------------------
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
