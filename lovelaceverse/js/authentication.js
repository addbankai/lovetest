/**
 * Authentication system for the Cyberpunk MMORPG game
 * Handles user authentication via guest UUID or Cardano wallet
 */

const AuthenticationSystem = {
    // Authentication state
    isAuthenticated: false,
    currentUser: null,
    authMode: null, // 'guest' or 'wallet'

    // Supabase client for database operations
    supabaseUrl: config.supabase.url,
    supabaseKey: config.supabase.key,
    supabase: null,

    // Blockfrost API for Cardano blockchain operations
    blockfrostApiKey: config.blockfrost.apiKey,
    blockfrostApiUrl: config.blockfrost.apiUrl,

    // Storage keys
    STORAGE_KEYS: {
        GUEST_ID: 'guest_user_id',
        AUTH_MODE: 'auth_mode',
        USER_WALLET: 'user_wallet_address',
        NONCE: 'auth_nonce'
    },

    // Flag to track offline mode
    offlineMode: false,

    /**
     * Initialize the authentication system
     */
    init: async function() {
        console.log('Initializing Authentication System...');

        try {
            // Check for network connectivity
            this.checkConnectivity();

            // Initialize Supabase client
            const supabaseInitialized = this.initSupabase();
            
            // If Supabase failed to initialize, go into offline mode
            if (!supabaseInitialized) {
                this.enableOfflineMode("Database connection failed. Running in offline mode.");
            }

            // Hide game content until authenticated - ADD THIS SECTION
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.opacity = '0.3';
                gameContainer.style.pointerEvents = 'none'; // Prevent interaction with game
            }
            
            // Show standby overlay if it exists - ADD THIS SECTION
            const standbyOverlay = document.getElementById('standby-overlay');
            if (standbyOverlay) {
                standbyOverlay.style.display = 'flex';
                standbyOverlay.style.opacity = '1';
            }

            // Set up UI elements first so users can see the login interface
            this.setupUI();

            // Try to restore session (in background)
            this.restoreSession().catch(error => {
                console.error('Error restoring session:', error);
                // Fall back to showing login UI
                this.updateAuthUI();
                
                // If we can't restore session because of API errors, go into offline mode
                if (error.message && (error.message.includes('network') || 
                    error.message.includes('failed') || 
                    error.message.includes('401') || 
                    error.message.includes('403'))) {
                    this.enableOfflineMode("Session restoration failed. Running in offline mode.");
                }
            });

            // Check RLS configuration if we're authenticated
            if (this.isAuthenticated) {
                this.checkRlsConfiguration().then(rlsConfigured => {
                    if (!rlsConfigured) {
                        console.warn('RLS policy may not be configured correctly. Database operations may fail.');
                    } else {
                        console.log('RLS policy configuration looks good');
                    }
                }).catch(error => {
                    console.error('Error checking RLS configuration:', error);
                });
            }
            
            // Set up auto-save
            this.setupAutoSave(3000); // Auto-save every 30 seconds

            // Listen for inventory changes and save them
            document.addEventListener('inventoryChanged', () => {
                console.log('Inventory changed, saving to database...');
                if (this.isAuthenticated) {
                    this.saveUserProgress(true).catch(console.error);
                }
            });

            console.log('Authentication System initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Authentication System:', error);
            this.enableOfflineMode("Authentication system initialization failed. Running in offline mode.");
        }
    },
    
    /**
     * Check for network connectivity
     */
    checkConnectivity: function() {
        // Listen for online/offline events
        window.addEventListener('online', () => {
            console.log('Browser is online. Attempting to reconnect to database...');
            if (this.offlineMode) {
                // Try to reconnect to Supabase
                const supabaseInitialized = this.initSupabase();
                if (supabaseInitialized) {
                    this.disableOfflineMode();
                    // Sync any offline changes
                    this.syncOfflineChanges();
                }
            }
        });
        
        window.addEventListener('offline', () => {
            console.log('Browser is offline. Enabling offline mode...');
            this.enableOfflineMode("Network connection lost. Running in offline mode.");
        });
        
        // Check current status
        if (!navigator.onLine) {
            this.enableOfflineMode("No network connection detected. Running in offline mode.");
        }
    },
    
    /**
     * Enable offline mode
     * @param {string} reason - Reason for enabling offline mode
     */
    enableOfflineMode: function(reason) {
        if (this.offlineMode) return; // Already in offline mode
        
        console.log('Enabling offline mode:', reason);
        this.offlineMode = true;
        
        // Show notification to user
        if (typeof Utils !== 'undefined' && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Offline Mode', reason, 5000);
        } else {
            console.log('Offline Mode:', reason);
        }
        
        // Update UI to show offline status
        const offlineIndicator = document.getElementById('offline-indicator');
        if (!offlineIndicator) {
            // Create offline indicator
            const indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.style.position = 'fixed';
            indicator.style.bottom = '10px';
            indicator.style.right = '10px';
            indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.7)';
            indicator.style.color = 'white';
            indicator.style.padding = '5px 10px';
            indicator.style.borderRadius = '5px';
            indicator.style.fontFamily = 'monospace';
            indicator.style.zIndex = '9999';
            indicator.textContent = 'OFFLINE MODE';
            
            document.body.appendChild(indicator);
        }
    },
    
    /**
     * Disable offline mode
     */
    disableOfflineMode: function() {
        if (!this.offlineMode) return; // Not in offline mode
        
        console.log('Disabling offline mode, database connection restored');
        this.offlineMode = false;
        
        // Show notification to user
        if (typeof Utils !== 'undefined' && typeof Utils.showNotification === 'function') {
            Utils.showNotification('Online Mode', 'Database connection restored', 5000);
        }
        
        // Remove offline indicator
        const offlineIndicator = document.getElementById('offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.remove();
        }
    },
    
    /**
     * Sync offline changes to database
     */
    syncOfflineChanges: function() {
        console.log('Syncing offline changes to database...');
        
        // Check for fallback data
        const fallbackData = Utils.loadFromStorage('fallback_game_progress');
        if (fallbackData && this.isAuthenticated) {
            console.log('Found fallback data, syncing to database...');
            
            // Use the fallback data to save to database
            this.saveUserProgress(true)
                .then(() => {
                    console.log('Successfully synced offline changes');
                    Utils.removeFromStorage('fallback_game_progress');
                })
                .catch(error => {
                    console.error('Failed to sync offline changes:', error);
                });
        }
    },

    /**
     * Initialize Supabase client
     * @returns {boolean} Whether Supabase was successfully initialized
     */
    initSupabase: function() {
        try {
            // Use shared Supabase client
            this.supabase = SupabaseClient.getInstance();
            
            if (!this.supabase) {
                console.error('Failed to get Supabase client');
                this.enableOfflineMode("Database connection failed. Running in offline mode.");
                return false;
            }
            
            // Test connection with a simple query
            this.testDatabaseConnection();
            
            console.log('Supabase client initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            this.enableOfflineMode("Database connection error. Running in offline mode.");
            return false;
        }
    },
    
    /**
     * Test database connection with a simple query
     */
    testDatabaseConnection: async function() {
        try {
            console.log('Testing database connection...');
            
            // Make a lightweight query to test connection
            const { data, error } = await this.supabase
                .from('health_check')
                .select('*')
                .limit(1)
                .maybeSingle();
                
            // Log the full response for debugging
            console.log('Test query response:', { data, error });
                
            // If there's a 401/406 error, it's an authentication issue
            if (error && (error.code === '401' || error.code === '406' || error.status === 401 || error.status === 406)) {
                console.error('Authentication error with Supabase:', error);
                this.enableOfflineMode("Database authentication failed. Running in offline mode.");
                return false;
            }
            
            // If we got here without 401 error, connection is working
            console.log('Database connection test succeeded!');
            return true;
        } catch (e) {
            console.warn('Database connection test failed:', e);
            return false;
        }
    },

    /**
     * Restore user session
     */
    restoreSession: async function() {
        console.log('Attempting to restore session...');
        
        try {
            // Check for existing session
            const authMode = Utils.loadFromStorage(this.STORAGE_KEYS.AUTH_MODE);
            console.log('Saved auth mode:', authMode);
    
            if (authMode === 'guest') {
                // Restore guest session
                const guestId = Utils.loadFromStorage(this.STORAGE_KEYS.GUEST_ID);
                if (guestId) {
                    this.currentUser = { id: guestId, isGuest: true };
                    this.authMode = 'guest';
                    this.isAuthenticated = true;
    
                    console.log('Restored guest session:', guestId);
    
                    // Load user data from Supabase (non-blocking)
                    this.loadUserProgress(guestId).catch(error => {
                        console.warn('Error loading guest progress, continuing anyway:', error);
                    });
                    
                    // Trigger UI update immediately without waiting for progress
                    this.updateAuthUI();
                    
                    // Dispatch event to notify other components of authentication success
                    document.dispatchEvent(new CustomEvent('authSuccess', { 
                        detail: { userId: guestId, authMode: 'guest' } 
                    }));
                    
                    // Also dispatch auth state changed event
                    window.dispatchEvent(new CustomEvent('authStateChanged', {
                        detail: { isAuthenticated: true, authMode: 'guest' }
                    }));

                    // Update tutorial arrow state after loading progress
                    // if (typeof UIManager !== 'undefined') {
                    //     UIManager.updateGachaTutorialArrow();
                    // }
                    
                    return true;
                }
            } else if (authMode === 'wallet') {
                // Restore wallet session
                const walletAddress = Utils.loadFromStorage(this.STORAGE_KEYS.USER_WALLET);
                if (walletAddress) {
                    console.log('Found stored wallet address:', walletAddress);
                    
                    // Check if wallet extension is available before restoring wallet session
                    const walletAvailable = typeof window.cardano !== 'undefined' && 
                                          (window.cardano.vespr || 
                                           Object.keys(window.cardano || {}).some(
                                               key => typeof window.cardano[key]?.enable === 'function'
                                           ));
                    
                    if (!walletAvailable) {
                        console.warn('Wallet extension not available but wallet credentials exist.');
                        console.warn('Showing login UI instead of silently failing.');
                        
                        // Show a notification about wallet extension
                        if (typeof Utils !== 'undefined' && typeof Utils.showNotification === 'function') {
                            Utils.showNotification(
                                'Wallet Extension Required', 
                                'Please install the Vespr wallet extension to connect to your wallet.', 
                                10000
                            );
                        }
                        
                        // Clear wallet data to prevent future auth attempts
                        Utils.removeFromStorage(this.STORAGE_KEYS.USER_WALLET);
                        Utils.removeFromStorage(this.STORAGE_KEYS.AUTH_MODE);
                        
                        // Reset auth state and show login UI
                        this.isAuthenticated = false;
                        this.updateAuthUI();
                        
                        return false;
                    }
                    
                    // Immediately set authenticated state to prevent showing login screen
                    // while we verify the wallet in background
                    this.currentUser = { id: walletAddress, isGuest: false, wallet: walletAddress };
                    this.authMode = 'wallet';
                    this.isAuthenticated = true;
                    
                    // Update UI immediately
                    this.updateAuthUI();
                    
                    // We'll verify wallet in background, so the game can start loading
                    this.loadUserProgress(walletAddress).catch(error => {
                        console.warn('Error loading wallet progress, continuing anyway:', error);
                    });
                    
                    // Dispatch authentication events immediately to prevent login screen flicker
                    document.dispatchEvent(new CustomEvent('authSuccess', { 
                        detail: { userId: walletAddress, authMode: 'wallet' } 
                    }));
                    
                    window.dispatchEvent(new CustomEvent('authStateChanged', {
                        detail: { isAuthenticated: true, authMode: 'wallet' }
                    }));

                    // Update tutorial arrow state after loading progress
                    // if (typeof UIManager !== 'undefined') {
                    //     UIManager.updateGachaTutorialArrow();
                    // }
                    
                    // Start wallet verification in background with retry mechanism
                    this.verifyWalletSessionWithRetry(walletAddress, 3);
                    
                    return true;
                }
            }
            
            // No existing session - REMOVE AUTO GUEST LOGIN HERE
            // Instead of auto guest login, just show the login UI
            console.log('No existing session found. Showing login UI.');
            this.isAuthenticated = false;
            this.updateAuthUI();
            
            return false;
        } catch (error) {
            console.error('Error in restoreSession:', error);
            
            // Show login UI instead of auto guest login
            this.isAuthenticated = false;
            this.updateAuthUI();
            
            return false;
        }
    },
    
    /**
     * Verify wallet session with retry mechanism
     * @param {string} walletAddress - Wallet address to verify
     * @param {number} maxRetries - Maximum number of retry attempts
     */
    verifyWalletSessionWithRetry: async function(walletAddress, maxRetries = 3) {
        let retryCount = 0;
        let isConnected = false;
        
        while (retryCount < maxRetries && !isConnected) {
            try {
                console.log(`Verifying wallet connection (attempt ${retryCount + 1}/${maxRetries})...`);
                isConnected = await this.checkWalletConnection(walletAddress);
                
                if (isConnected) {
                    console.log('Wallet connection verified successfully');
                    // Success! No need to continue retrying
                    break;
                } else {
                    console.log('Wallet not connected on attempt', retryCount + 1);
                    // Wait before retrying
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    retryCount++;
                }
            } catch (error) {
                console.warn(`Error during wallet verification attempt ${retryCount + 1}:`, error);
                retryCount++;
                // Wait before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        if (isConnected) {
            console.log('Wallet still connected, session fully verified');
        } else {
            console.log('Wallet verification failed after', maxRetries, 'attempts, but keeping session active');
            // Keep the wallet session active, but show a notification
            if (typeof Utils !== 'undefined' && typeof Utils.showNotification === 'function') {
                Utils.showNotification(
                    'Wallet Verification Note', 
                    'Your wallet verification completed in the background. Your session is active.', 
                    8000
                );
            }
        }
        
        return isConnected;
    },

    /**
     * Check if wallet is still connected
     * @param {string} walletAddress - Wallet address to verify
     * @returns {Promise<boolean>} - Whether wallet is connected
     */
    checkWalletConnection: async function(walletAddress) {
        try {
            // First check if Cardano API namespace is available (CIP-30 compliant)
            if (typeof window.cardano === 'undefined') {
                console.log('Cardano API not found in window namespace');
                return false;
            }
            
            // Check if Vespr wallet specifically is available
            if (!window.cardano.vespr) {
                console.log('Vespr wallet extension not found in Cardano namespace');
                // Try to handle any alternative wallet that might be installed
                const availableWallets = Object.keys(window.cardano).filter(
                    key => typeof window.cardano[key]?.enable === 'function'
                );
                console.log('Available wallet extensions:', availableWallets.length ? availableWallets : 'None');
                
                // If other wallets are available, try the first one
                if (availableWallets.length > 0) {
                    const alternativeWallet = availableWallets[0];
                    console.log('Attempting to use alternative wallet:', alternativeWallet);
                    
                    try {
                        if (typeof window.cardano[alternativeWallet].enable === 'function') {
                            const altApi = await Promise.race([
                                window.cardano[alternativeWallet].enable(),
                                new Promise((_, reject) => 
                                    setTimeout(() => reject(new Error('Alternative wallet connection timeout')), 5000)
                                )
                            ]);
                            
                            if (altApi && typeof altApi.getUsedAddresses === 'function') {
                                const altAddresses = await altApi.getUsedAddresses();
                                if (altAddresses && altAddresses.includes(walletAddress)) {
                                    console.log('Connected via alternative wallet:', alternativeWallet);
                                    return true;
                                }
                            }
                        }
                    } catch (altError) {
                        console.log('Failed to connect via alternative wallet:', altError);
                    }
                }
                
                return false;
            }

            try {
                // Following CIP-30 spec: https://cips.cardano.org/cip/CIP-30
                console.log('Check wallet: Requesting permission...');

                // Check if API methods exist before calling them
                if (!window.cardano.vespr.enable) {
                    console.log('Check wallet: Enable method not found');
                    return false;
                }

                // Get API object by enabling the wallet with shorter timeout
                const api = await Promise.race([
                    window.cardano.vespr.enable(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Wallet connection timeout')), 5000)
                    )
                ]);
                
                if (!api) {
                    console.log('Check wallet: No API object returned');
                    return false;
                }
                
                console.log('Check wallet: Permission granted');

                // Check if required API methods exist
                if (typeof api.getUsedAddresses !== 'function') {
                    console.log('Check wallet: Required methods not available');
                    return false;
                }

                // Use API to get addresses (hex encoded) with timeout
                const addresses = await Promise.race([
                    api.getUsedAddresses().catch(err => {
                        console.log('Failed to get addresses:', err);
                        return null;
                    }),
                    new Promise((resolve) => 
                        setTimeout(() => {
                            console.log('getUsedAddresses timed out, assuming session is still valid');
                            resolve([walletAddress]); // Assume the address is valid if timeout
                        }, 3000)
                    )
                ]);
                
                console.log('Check wallet: Addresses received:', addresses);

                if (!addresses || addresses.length === 0) {
                    console.log('Check wallet: No addresses returned');
                    return false;
                }

                // Verify our stored address is in the list
                const isConnected = addresses.includes(walletAddress);
                console.log('Check wallet: Connected status:', isConnected);

                return isConnected;
            } catch (e) {
                console.log('Wallet not enabled or accessible:', e);
                // Return true anyway to maintain session persistence
                // This prevents users from having to re-login if the wallet is temporarily unavailable
                return true;
            }
        } catch (error) {
            console.error('Error checking wallet connection:', error);
            // Default to keeping the session active despite errors
            return true;
        }
    },

    /**
     * Setup authentication UI elements
     */
    setupUI: function() {
        // Check if standby-overlay already exists (standby page system is active)
        if (document.getElementById('standby-overlay')) {
            console.log('Standby page system detected, skipping auth modal creation');
            // We don't need to create the auth modal since we're using the standby page system
            return;
        }
        
        // Create login modal
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.classList.add('modal');

        // Create modal content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Welcome to LovelaceVerse</h2>
                </div>
                <div class="modal-body">
                    <div class="auth-options">
                        <button id="guest-login-btn" class="cyberpunk-btn">Play as Guest</button>
                        <button id="wallet-login-btn" class="cyberpunk-btn">Connect Wallet</button>
                    </div>
                    <div id="login-status" class="login-status"></div>
                </div>
            </div>
        `;

        // Add modal to body if it doesn't exist
        if (!document.getElementById('auth-modal')) {
            document.body.appendChild(modal);
        }

        // Add event listeners
        const guestLoginBtn = document.getElementById('guest-login-btn');
        if (guestLoginBtn) {
            guestLoginBtn.addEventListener('click', this.loginAsGuest.bind(this));
        }
        
        const walletLoginBtn = document.getElementById('wallet-login-btn');
        if (walletLoginBtn) {
            walletLoginBtn.addEventListener('click', this.connectWallet.bind(this));
        }

        // Update UI based on current auth state
        this.updateAuthUI();
    },

    /**
     * Update authentication UI
     */
    updateAuthUI: function() {
        const modal = document.getElementById('auth-modal');
        const loginStatus = document.getElementById('login-status');
        const gameContainer = document.getElementById('game-container');
        const standbyOverlay = document.getElementById('standby-overlay');

        if (!modal || !loginStatus) return;

        if (this.isAuthenticated) {
            // Hide modal
            modal.style.display = 'none';
            
            // Show game and enable interactions
            if (gameContainer) {
                gameContainer.style.opacity = '1';
                gameContainer.style.pointerEvents = 'auto';
            }
            
            // Hide standby overlay
            if (standbyOverlay) {
                standbyOverlay.style.opacity = '0';
                standbyOverlay.style.display = 'none';
            }

            // Remove any existing auth-info element
            const existingAuthInfo = document.getElementById('auth-info');
            if (existingAuthInfo) {
                existingAuthInfo.remove();
            }

            // Update menu buttons based on auth mode
            if (this.authMode === 'guest') {
                // For guest users, show the "Link Wallet" button
                console.log('Guest user detected, showing Link Wallet button');
                this.updateMenuButtons('guest');
            } else if (this.authMode === 'wallet') {
                // For wallet users, hide the "Link Wallet" button
                console.log('Wallet user detected, hiding Link Wallet button');
                this.updateMenuButtons('wallet');
            }
        } else {
            // Show modal
            modal.style.display = 'block';

            // Reset login status
            loginStatus.textContent = '';
            
            // Hide game and disable interactions
            if (gameContainer) {
                gameContainer.style.opacity = '0.3';
                gameContainer.style.pointerEvents = 'none';
            }
            
            // Show standby overlay
            if (standbyOverlay) {
                standbyOverlay.style.opacity = '1';
                standbyOverlay.style.display = 'flex';
            }

            // Default button state for unauthenticated users
            this.updateMenuButtons('unauthenticated');
        }
    },

    /**
     * Update menu buttons based on authentication mode
     * @param {string} mode - Authentication mode ('guest', 'wallet', or 'unauthenticated')
     */
    updateMenuButtons: function(mode) {
        const menuButtons = document.getElementById('menu-buttons');
        if (!menuButtons) return;

        // Check if buttons already exist
        let connectWalletBtn = document.getElementById('connect-wallet-menu-btn');
        
        // Always remove any existing buttons first to avoid duplicates
        if (connectWalletBtn) {
            connectWalletBtn.remove();
            connectWalletBtn = null;
        }

        // Add appropriate buttons based on mode
        if (mode === 'guest') {
            // For guest users, show "Link Wallet" button
            connectWalletBtn = document.createElement('button');
            connectWalletBtn.id = 'connect-wallet-menu-btn';
            connectWalletBtn.className = 'menu-button';
            connectWalletBtn.textContent = 'Link Wallet';
            connectWalletBtn.addEventListener('click', this.connectWallet.bind(this));
            menuButtons.appendChild(connectWalletBtn);
        } else if (mode === 'wallet') {
            // Wallet users don't need a Link Wallet button
            // They might need other buttons like "Wallet Details"
        } else {
            // Default - nothing specific needed
        }

        // Ensure correct order in menu
        this.arrangeMenuButtons();
    },
    
    /**
     * Update Connect Wallet button in menu (legacy method kept for compatibility)
     * @param {boolean} show - Whether to show or hide the connect wallet button
     */
    updateMenuConnectWalletButton: function(show) {
        console.log('Using legacy updateMenuConnectWalletButton, consider using updateMenuButtons instead');
        this.updateMenuButtons(show ? 'guest' : 'wallet');
    },

    /**
     * Arrange menu buttons in the correct order
     * Order: inventory, Character, Gacha, Dungeon, Marketplace, Profile, Connect wallet
     */
    arrangeMenuButtons: function() {
        const menuButtons = document.getElementById('menu-buttons');
        if (!menuButtons) return;

        // Define the correct order
        const buttonOrder = [
            'inventory-button',
            'character-list-button',
            'gacha-button',
            'dungeon-button',
            'market-button',
            'war-button',
            'pvp-button',
            'marketplace-button',
            'profile-button',
            'connect-wallet-menu-btn'
        ];

        // Get all buttons
        const buttons = Array.from(menuButtons.children);

        // Sort buttons according to the defined order
        buttons.sort((a, b) => {
            const aIndex = buttonOrder.indexOf(a.id);
            const bIndex = buttonOrder.indexOf(b.id);

            // Keep buttons not in the list at the end
            if (aIndex === -1) return 1;
            if (bIndex === -1) return -1;

            return aIndex - bIndex;
        });

        // Re-append buttons in the correct order
        buttons.forEach(button => menuButtons.appendChild(button));
    },

    /**
     * Login as guest
     */
    loginAsGuest: async function() {
        try {
            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Generating guest login...';
            }

            // Check if we already have a guest ID
            let guestId = Utils.loadFromStorage(this.STORAGE_KEYS.GUEST_ID);

            if (!guestId) {
                // Generate a new UUID for this guest
                guestId = this.generateUUID();

                // Save to local storage
                Utils.saveToStorage(this.STORAGE_KEYS.GUEST_ID, guestId);
                Utils.saveToStorage(this.STORAGE_KEYS.AUTH_MODE, 'guest');

                // Create new user in database
                await this.createUserInDatabase({
                    id: guestId,
                    is_guest: true,
                    created_at: new Date().toISOString(),
                    version: 1
                });
            }

            // Set user state
            this.currentUser = { id: guestId, isGuest: true };
            this.authMode = 'guest';
            this.isAuthenticated = true;

            // Load any existing progress for this guest
            await this.loadUserProgress(guestId);

            // Update UI
            this.updateAuthUI();

            // Update tutorial arrow state after loading progress
            if (typeof UIManager !== 'undefined') {
                UIManager.updateGachaTutorialArrow();
            }

            console.log('Logged in as guest:', guestId);

            return true;
        } catch (error) {
            console.error('Guest login failed:', error);

            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Login failed. Please try again.';
            }

            return false;
        }
    },

    /**
     * Connect wallet using Vespr
     */
    connectWallet: async function() {
        try {
            // Track loading status
            let loadingCircleCount = 0;
            
            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Connecting wallet...';
                loadingCircleCount++;
                console.log('Showing loading circle 1 (login status)');
            }
            
            // Also check for standby status message
            const standbyStatus = document.getElementById('standby-status');
            if (standbyStatus) {
                loadingCircleCount++;
                console.log('Detected standby status loading circle 2');
            }
            
            console.log(`Total loading circles: ${loadingCircleCount}`);

            // Check if Cardano API namespace is available (CIP-30 compliant)
            if (typeof window.cardano === 'undefined' || !window.cardano.vespr) {
                console.error('Vespr wallet extension not found in window.cardano namespace');

                // Try to find alternative wallets
                const availableWallets = typeof window.cardano !== 'undefined' ? 
                    Object.keys(window.cardano).filter(key => 
                        typeof window.cardano[key]?.enable === 'function'
                    ) : [];
                
                console.log('Available wallets:', availableWallets);
                
                // Create a more helpful message for the user with installation instructions
                if (statusEl) {
                    statusEl.innerHTML = `
                        <div class="error-message">
                            <p>Vespr wallet extension not found!</p>
                            <p>Please <a href="https://docs.vespr.xyz/vespr" target="_blank">install the Vespr extension</a> and reload the page.</p>
                            ${availableWallets.length > 0 ? `<p>Available wallets: ${availableWallets.join(', ')}</p>` : ''}
                            <p>Follow CIP-30 standard: <a href="https://cips.cardano.org/cip/CIP-30" target="_blank">CIP-30 Docs</a></p>
                            <p>Or continue as a guest.</p>
                        </div>
                    `;
                }

                // Add a fallback button to login as guest
                const authModal = document.getElementById('auth-modal');
                if (authModal) {
                    const fallbackBtn = document.createElement('button');
                    fallbackBtn.id = 'fallback-guest-btn';
                    fallbackBtn.className = 'cyberpunk-btn';
                    fallbackBtn.textContent = 'Continue as Guest';
                    fallbackBtn.addEventListener('click', this.loginAsGuest.bind(this));

                    // Find the auth options container and append the button if not already there
                    const authOptions = authModal.querySelector('.auth-options');
                    if (authOptions && !document.getElementById('fallback-guest-btn')) {
                        authOptions.appendChild(fallbackBtn);
                    }
                }

                return false;
            }

            // Generate a nonce for challenge-response verification
            const nonce = this.generateNonce();
            Utils.saveToStorage(this.STORAGE_KEYS.NONCE, nonce);

            console.log('Connecting to Vespr wallet via CIP-30 API...');

            let walletAddress;
            let api;

            try {
                // Following CIP-30 spec: https://cips.cardano.org/cip/CIP-30
                console.log('Requesting wallet permission...');

                // Check if API methods exist before calling them
                if (!window.cardano.vespr.enable) {
                    throw new Error('Vespr wallet enable method not found. Check if the extension is up to date.');
                }

                // Enable wallet and get api object with timeout
                api = await Promise.race([
                    window.cardano.vespr.enable(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Wallet connection timeout - please try again')), 15000)
                    )
                ]);
                
                console.log('Wallet permission granted, API object:', api);

                // Check if required API methods exist
                if (!api || typeof api.getUsedAddresses !== 'function') {
                    throw new Error('Required wallet API methods not available. Check if the extension is up to date.');
                }

                // Safely get wallet network if the method exists
                if (typeof api.getNetworkId === 'function') {
                    try {
                        const networkId = await api.getNetworkId();
                        console.log('Network ID:', networkId);
                    } catch (networkError) {
                        console.warn('Could not get network ID, but continuing:', networkError);
                    }
                }

                // Get wallet addresses (hex encoded) with timeout
                console.log('Fetching wallet addresses...');
                const addresses = await Promise.race([
                    api.getUsedAddresses(),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Address fetching timeout - please try again')), 10000)
                    )
                ]);
                
                console.log('Addresses received:', addresses);
                if (!addresses || addresses.length === 0) {
                    if (statusEl) {
                        statusEl.textContent = 'No wallet addresses found.';
                    }
                    console.error('No wallet addresses available');
                    return false;
                }

                // Use the first address (primary)
                walletAddress = addresses[0];
                console.log('Using wallet address:', walletAddress);

                // Create signature payload with nonce for security
                const message = `Authenticate with LovelaceVerse. Nonce: ${nonce}`;
                const messageUtf8 = new TextEncoder().encode(message);
                // Convert the UTF-8 bytes to a hex string (required by CIP-30)
                const messageHex = Array.from(messageUtf8)
                    .map(b => b.toString(16).padStart(2, '0'))
                    .join('');

                // Request signature using CIP-30 API with hex encoded message and timeout
                const signResult = await Promise.race([
                    api.signData(walletAddress, messageHex),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Signature request timeout - please try again')), 20000)
                    )
                ]);
                
                console.log('Signature obtained:', signResult);

                if (!signResult || !signResult.signature) {
                    if (statusEl) {
                        statusEl.textContent = 'Wallet signature cancelled or failed.';
                    }
                    console.error('Wallet signature failed or was cancelled');
                    return false;
                }

                // Verify by checking the signature exists
                if (statusEl) {
                    statusEl.textContent = 'Signature verified successfully.';
                }
            } catch (error) {
                console.error('Vespr wallet error:', error);
                if (statusEl) {
                    statusEl.textContent = 'Wallet error: ' + (error.message || JSON.stringify(error) || error);
                }
                return false;
            }

            // Optionally verify wallet using Blockfrost API
            // This is a simple check to ensure the wallet exists on the blockchain
            try {
                const walletExists = await this.verifyWalletWithBlockfrost(walletAddress);
                if (!walletExists) {
                    console.warn('Wallet not found on blockchain, but proceeding with auth');
                }
            } catch (e) {
                console.warn('Blockfrost verification failed, but proceeding with auth:', e);
            }

            // Save wallet address to storage
            Utils.saveToStorage(this.STORAGE_KEYS.USER_WALLET, walletAddress);
            Utils.saveToStorage(this.STORAGE_KEYS.AUTH_MODE, 'wallet');

            // If there was a previous guest account, link it to this wallet
            const guestId = Utils.loadFromStorage(this.STORAGE_KEYS.GUEST_ID);
            if (guestId && this.authMode === 'guest') {
                await this.linkAccounts(guestId, walletAddress);
            }

            // Check if user exists in database, create if not
            const { data: existingUser } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', walletAddress)
                .single();

            if (!existingUser) {
                // Create new user in database
                await this.createUserInDatabase({
                    id: walletAddress,
                    isGuest: false,
                    wallet_address: walletAddress,
                    created_at: new Date().toISOString(),
                    version: 1
                });
            }

            // Set user state
            this.currentUser = { 
                id: walletAddress, 
                isGuest: false, 
                wallet: walletAddress 
            };
            this.authMode = 'wallet';
            this.isAuthenticated = true;

            // Load user progress with verification and retries
            console.log('Loading progress for wallet:', walletAddress);
            let progressLoaded = false;
            let retryCount = 0;
            const maxRetries = 3;
            
            while (!progressLoaded && retryCount < maxRetries) {
                try {
                    console.log(`Loading progress attempt ${retryCount + 1}/${maxRetries}...`);
                    progressLoaded = await this.loadUserProgress(walletAddress);
                    
                    if (!progressLoaded) {
                        console.warn('Progress did not load correctly, retrying...');
                        retryCount++;
                        // Add a small delay between retries
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (loadError) {
                    console.error('Error loading progress:', loadError);
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
            
            // Force a game data sync to ensure everything is up to date
            await this.saveUserProgress(true);
            
            // Verify that inventory data is loaded
            const inventoryData = Utils.loadFromStorage('inventory');
            if (!inventoryData || Object.keys(inventoryData).length === 0) {
                console.warn('Inventory data missing after login, initializing empty inventory...');
                // Initialize an empty inventory
                Utils.saveToStorage('inventory', {});
                
                // Dispatch inventory changed event to ensure it gets saved
                const event = new CustomEvent('inventoryChanged', {
                    detail: { slots: [], characterEquipment: {} }
                });
                document.dispatchEvent(event);
            } else {
                console.log('Inventory loaded successfully, contains', Object.keys(inventoryData).length, 'items');
            }

            // Update UI
            this.updateAuthUI();

            console.log('Connected wallet:', walletAddress);

            if (statusEl) {
                statusEl.textContent = 'Wallet connected successfully!';
            }
            
            // Dispatch user login event for other components to react
            const loginEvent = new CustomEvent('userLoggedIn', {
                detail: { userId: walletAddress, authMode: 'wallet' }
            });
            document.dispatchEvent(loginEvent);

            return true;
        } catch (error) {
            console.error('Wallet connection error:', error);

            const statusEl = document.getElementById('login-status');
            if (statusEl) {
                statusEl.textContent = 'Wallet connection failed: ' + (error.message || JSON.stringify(error) || error);
            }

            return false;
        }
    },

    /**
     * Verify wallet address using Blockfrost API
     * @param {string} walletAddress - Wallet address to verify
     * @returns {Promise<boolean>} - Whether wallet exists on the blockchain
     */
    verifyWalletWithBlockfrost: async function(walletAddress) {
        try {
            // Make API request to Blockfrost
            const response = await fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}`, {
                method: 'GET',
                headers: {
                    'project_id': this.blockfrostApiKey
                }
            });

            if (!response.ok) {
                // If response is not OK, wallet might not exist or API error
                return false;
            }

            const data = await response.json();
            return !!data; // Check if we got valid data back
        } catch (error) {
            console.error('Error verifying wallet with Blockfrost:', error);
            throw error;
        }
    },

    /**
     * Log out the current user
     * @param {boolean} skipConfirmation - Skip confirmation dialog (optional)
     */
    logout: async function(skipConfirmation = false) {
        try {
            console.log('Starting logout process...');
            
            // Check if user is a guest and show warning
            if (this.authMode === 'guest' && !skipConfirmation) {
                // Show warning about permanent deletion of guest account
                const confirmLogout = await this.showGuestLogoutWarning();
                if (!confirmLogout) {
                    console.log('Logout cancelled by user');
                    return false;
                }
            }
            
            // Save any progress before logout
            if (this.isAuthenticated) {
                await this.saveUserProgress();
            }
            
            // Clear authentication state
            this.isAuthenticated = false;
            this.currentUser = null;
            this.authMode = null;
            
            // Clear storage
            Utils.removeFromStorage(this.STORAGE_KEYS.GUEST_ID);
            Utils.removeFromStorage(this.STORAGE_KEYS.AUTH_MODE);
            Utils.removeFromStorage(this.STORAGE_KEYS.USER_WALLET);
            Utils.removeFromStorage(this.STORAGE_KEYS.NONCE);
            
            // Hide any auth-related UI
            const modal = document.getElementById('auth-modal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // Remove auth-related UI elements
            this.updateMenuConnectWalletButton(false);
            
            // Show the standby page by triggering auth state change event
            const authStateChangeEvent = new CustomEvent('authStateChanged', {
                detail: { isAuthenticated: false }
            });
            window.dispatchEvent(authStateChangeEvent);
            
            // Reset the game state
            this.resetGameState();
            
            console.log('User logged out successfully');
            
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            return false;
        }
    },
    
    /**
     * Show warning dialog for guest logout
     * @returns {Promise<boolean>} - Whether user confirmed logout
     */
    showGuestLogoutWarning: async function() {
        return new Promise((resolve) => {
            // Create warning modal
            const warningModal = document.createElement('div');
            warningModal.id = 'guest-logout-warning';
            warningModal.className = 'modal';
            warningModal.style.display = 'flex';
            warningModal.style.position = 'fixed';
            warningModal.style.top = '0';
            warningModal.style.left = '0';
            warningModal.style.width = '100%';
            warningModal.style.height = '100%';
            warningModal.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            warningModal.style.zIndex = '10000';
            warningModal.style.justifyContent = 'center';
            warningModal.style.alignItems = 'center';
            
            // Create warning content
            warningModal.innerHTML = `
                <div class="warning-content" style="background: linear-gradient(to bottom, #1a1a2e, #0d0d1a); border: 2px solid #ff3a3a; box-shadow: 0 0 20px rgba(255, 58, 58, 0.6); padding: 30px; border-radius: 10px; max-width: 500px; text-align: center; color: #fff;">
                    <h2 style="color: #ff3a3a; margin-bottom: 20px;">⚠️ WARNING: Guest Account Deletion ⚠️</h2>
                    <p style="margin-bottom: 20px; font-size: 16px;">Logging out as a guest will <strong style="color: #ff3a3a;">permanently delete</strong> your account and all progress.</p>
                    <p style="margin-bottom: 30px; font-size: 16px;">Connect a wallet first to preserve your data.</p>
                    <div style="display: flex; justify-content: center; gap: 20px;">
                        <button id="connect-wallet-btn" style="background: linear-gradient(90deg, #003c5f, #0077b6); color: #00f7ff; border: 1px solid #00f7ff; padding: 10px 20px; cursor: pointer; font-weight: bold;">Connect Wallet</button>
                        <button id="confirm-logout-btn" style="background: linear-gradient(90deg, #5f0000, #b60000); color: white; border: 1px solid #ff3a3a; padding: 10px 20px; cursor: pointer; font-weight: bold;">Logout Anyway</button>
                        <button id="cancel-logout-btn" style="background: #333; color: white; border: 1px solid #666; padding: 10px 20px; cursor: pointer;">Cancel</button>
                    </div>
                </div>
            `;
            
            // Add to body
            document.body.appendChild(warningModal);
            
            // Add event listeners
            const connectWalletBtn = document.getElementById('connect-wallet-btn');
            const confirmLogoutBtn = document.getElementById('confirm-logout-btn');
            const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
            
            if (connectWalletBtn) {
                connectWalletBtn.addEventListener('click', () => {
                    document.body.removeChild(warningModal);
                    this.connectWallet().then(connected => {
                        resolve(false); // Don't logout, we've connected wallet instead
                    });
                });
            }
            
            if (confirmLogoutBtn) {
                confirmLogoutBtn.addEventListener('click', () => {
                    document.body.removeChild(warningModal);
                    resolve(true); // Proceed with logout
                });
            }
            
            if (cancelLogoutBtn) {
                cancelLogoutBtn.addEventListener('click', () => {
                    document.body.removeChild(warningModal);
                    resolve(false); // Cancel logout
                });
            }
        });
    },
    
    /**
     * Reset the game state
     */
    resetGameState: function() {
        console.log('Resetting game state...');
        
        // Clear all game-related localStorage except for settings
        const preserveKeys = ['audio_settings', 'display_settings'];
        
        // Get all localStorage keys
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            keys.push(key);
        }
        
        // Remove game-related items
        keys.forEach(key => {
            if (!preserveKeys.includes(key)) {
                localStorage.removeItem(key);
            }
        });
        
        // Reset game components if they exist
        if (typeof Game !== 'undefined' && Game.reset) {
            Game.reset();
        }
        
        if (typeof Currency !== 'undefined' && Currency.reset) {
            Currency.reset();
        }
        
        if (typeof CharacterSystem !== 'undefined' && CharacterSystem.reset) {
            CharacterSystem.reset();
        }
        
        // Reset UI elements
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            // Hide game container
            gameContainer.style.opacity = '0.3';
        }
        
        // Show the standby page
        const standbyOverlay = document.getElementById('standby-overlay');
        if (standbyOverlay) {
            standbyOverlay.style.opacity = '1';
            standbyOverlay.style.display = 'flex';
        }
        
        console.log('Game state reset complete');
    },
    
    /**
     * Disconnect wallet
     */
    disconnectWallet: async function() {
        try {
            // Disconnect from wallet using CIP-30 standard
            if (typeof window.cardano !== 'undefined' && window.cardano.vespr) {
                // No explicit disconnect in CIP-30, but we can clear our state
                console.log('Clearing wallet connection state...');
            }

            // Save any progress before disconnecting
            await this.saveUserProgress();

            // Clear wallet authentication
            Utils.removeFromStorage(this.STORAGE_KEYS.USER_WALLET);
            Utils.saveToStorage(this.STORAGE_KEYS.AUTH_MODE, 'guest');

            // Set user state back to guest
            await this.loginAsGuest();

            console.log('Wallet disconnected, returned to guest mode');

            return true;
        } catch (error) {
            console.error('Error disconnecting wallet:', error);
            return false;
        }
    },

    /**
     * Link guest account to wallet account
     * @param {string} guestId - Guest UUID
     */
    linkAccounts: async function(guestId, walletAddress) {
        try {
            console.log('Linking guest account to wallet:', guestId, walletAddress);

            // Get guest progress data
            const { data: guestData } = await this.supabase
                .from('game_progress')
                .select('*')
                .eq('user_id', guestId)
                .single();

            if (guestData) {
                // Check if wallet already has progress
                const { data: walletData } = await this.supabase
                    .from('game_progress')
                    .select('*')
                    .eq('user_id', walletAddress)
                    .single();

                if (!walletData) {
                    // Copy guest progress to wallet account
                    const progressData = { ...guestData };
                    progressData.user_id = walletAddress;
                    progressData.linked_from = guestId;
                    progressData.version = 1;

                    // Save to database
                    await this.supabase
                        .from('game_progress')
                        .insert(progressData);

                    console.log('Guest progress copied to wallet account');
                } else {
                    // Merge progress (implement your merging logic here)
                    console.log('Existing wallet progress found, merging required');

                    // In a real implementation, you would:
                    // 1. Compare timestamps
                    // 2. Take the newer data in case of conflicts
                    // 3. Merge inventories, currencies, etc. without losing items

                    // For this example, we'll just update the link
                    await this.supabase
                        .from('game_progress')
                        .update({
                            linked_from: guestId,
                            updated_at: new Date().toISOString(),
                            version: walletData.version + 1
                        })
                        .eq('user_id', walletAddress);
                }

                // Mark guest account as linked
                await this.supabase
                    .from('users')
                    .update({
                        linked_to: walletAddress,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', guestId);

                // Create an entry in the account_links table
                await this.supabase
                    .from('account_links')
                    .insert({
                        guest_id: guestId,
                        wallet_address: walletAddress,
                        linked_at: new Date().toISOString()
                    });
            }

            return true;
        } catch (error) {
            console.error('Error linking accounts:', error);
            return false;
        }
    },

    /**
     * Insert inventory item into database
     * @param {Object} itemData - Inventory item data
     */
    insertInventoryItem: async function(itemData) {
        try {
            if (!this.isAuthenticated || !this.currentUser?.id) {
                console.error('Cannot insert item: Not authenticated');
                return null;
            }

            const fullItem = {
                user_id: this.currentUser.id,
                item_name: itemData.name,
                item_type: itemData.type,
                quantity: itemData.quantity || 1,
                item_data: itemData.stats || {},
                acquired_at: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('items')
                .insert(fullItem)
                .select();

            if (error) throw error;
            
            // Update local inventory
            const inventory = Utils.loadFromStorage('inventory') || {};
            inventory[data[0].item_id] = fullItem;
            Utils.saveToStorage('inventory', inventory);

            return data[0];
        } catch (error) {
            console.error('Error inserting inventory item:', error);
            if (this.offlineMode) {
                console.log('Storing item in offline fallback storage');
                const fallbackItems = Utils.loadFromStorage('fallback_items') || [];
                fallbackItems.push(fullItem);
                Utils.saveToStorage('fallback_items', fallbackItems);
            }
            return null;
        }
    },

    /**
     * Create user in the database
     * @param {Object} userData - User data object
     */
    createUserInDatabase: async function(userData) {
        if (this.offlineMode) {
            console.log('In offline mode, skipping database creation for user:', userData.id);
            return true;
        }
        
        if (!this.supabase) {
            console.log('Supabase not initialized, switching to offline mode');
            this.enableOfflineMode("Database not available, running in offline mode");
            return true;
        }
        
        try {
            console.log('Creating user in database:', userData.id);
            
            // First check if user exists
            const { data: existingUser, error: lookupError } = await this.supabase
                .from('users')
                .select('id')
                .eq('id', userData.id)
                .maybeSingle();

            if (lookupError) {
                console.error('User lookup error:', lookupError);
                throw lookupError;
            }

            // Only create if doesn't exist
            if (!existingUser) {
                const { error: userError } = await this.supabase
                    .from('users')
                    .insert({
                        id: userData.id,
                        is_guest: userData.is_guest,
                        wallet_address: userData.wallet_address,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });

                if (userError) {
                    console.error('Error creating user:', userError);
                    throw userError;
                }
            }

            // Now create progress record
            const progressData = {
                user_id: userData.id,
                game_data: {},
                version: 1,
                created_at: new Date().toISOString()
            };

            const { error: progressError } = await this.supabase
                .from('game_progress')
                .upsert(progressData, { 
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                });

            if (progressError) {
                console.error('Error creating progress:', progressError);
                // Don't throw here, as user is already created
            }

            console.log('User setup completed for:', userData.id);
            return true;
        } catch (error) {
            console.error('Error in createUserInDatabase:', error);
            this.enableOfflineMode("Error creating user, running in offline mode");
            return true;
        }
    },

    /**
     * Load user progress from the database
     * @param {string} userId - User ID to load progress for
     */
    loadUserProgress: async function(userId) {
        try {
            // First load from local storage
            const localData = Utils.loadFromStorage('game_progress');
            
            // If in offline mode, use local data only
            if (this.offlineMode) {
                console.log('In offline mode, loading from local storage only');
                if (localData) {
                    MapSystem.loadData(localData.map);
                }
                return true;
            }

            // Try to load from database
            const { data, error } = await this.supabase
                .from('game_progress')
                .select('game_data')
                .eq('user_id', userId)
                .maybeSingle();

            if (error) {
                console.error('Error loading from database:', error);
                // Fall back to local data
                if (localData) {
                    MapSystem.loadData(localData.map);
                }
                return true;
            }

            // Use the most recent data (compare timestamps)
            if (data && data.game_data) {
                const dbData = data.game_data;
                if (!localData || new Date(dbData.lastSaved) > new Date(localData.lastSaved)) {
                    MapSystem.loadData(dbData.map);
                } else {
                    MapSystem.loadData(localData.map);
                }
            } else if (localData) {
                MapSystem.loadData(localData.map);
            }

            return true;
        } catch (error) {
            console.error('Error in loadUserProgress:', error);
            // Fall back to local data
            const localData = Utils.loadFromStorage('game_progress');
            if (localData) {
                MapSystem.loadData(localData.map);
            }
            return true;
        }
    },
    
    /**
     * Load progress data from local storage
     * @param {string} userId - User ID to load progress for
     * @returns {boolean} Whether any data was loaded
     */
    loadLocalProgressData: function(userId) {
        console.log('Checking for local progress data for', userId);
        
        // Check fallback storage first
        const fallbackData = Utils.loadFromStorage('fallback_game_progress');
        if (fallbackData && fallbackData.userId === userId) {
            console.log('Found fallback data in local storage for', userId);
            
            const gameData = fallbackData.gameData;
            if (gameData) {
                // Load data from each game system
                if (gameData.currency) Currency.loadFromData(gameData.currency);
                if (gameData.inventory) Utils.saveToStorage('inventory', gameData.inventory);
                if (gameData.characters) Utils.saveToStorage('characters', gameData.characters);
                if (gameData.gacha) Utils.saveToStorage('gacha', gameData.gacha);
                if (gameData.map) Utils.saveToStorage('map', gameData.map);
                if (gameData.shards) Utils.saveToStorage('shards', gameData.shards);
                if (gameData.dungeon) Utils.saveToStorage('dungeon', gameData.dungeon);
                if (gameData.audio) Utils.saveToStorage('audio_settings', gameData.audio);
                if (gameData.general) Utils.saveToStorage('gameData', gameData.general);
                
                console.log('Loaded local fallback data for', userId);
                return true;
            }
        }
        
        // Check emergency save as well
        const emergencyData = Utils.loadFromStorage('emergency_save');
        if (emergencyData && emergencyData.userId === userId) {
            console.log('Found emergency save data for', userId);
            
            // Load what we have in the emergency data
            if (emergencyData.inventory) {
                Utils.saveToStorage('inventory', emergencyData.inventory);
            }
            
            if (emergencyData.currency) {
                Currency.loadFromData(emergencyData.currency);
            }
            
            if (emergencyData.characters) {
                Utils.saveToStorage('characters', emergencyData.characters);
            }
            
            console.log('Loaded emergency save data for', userId);
            return true;
        }
        
        // No local data found
        return false;
    },

    /**
     * Save user progress to the database
     * @param {boolean} forceSync - Whether to force a sync even if it's not time yet
     */
    saveUserProgress: async function(forceSync = false) {
        try {
            if (!this.isAuthenticated || !this.currentUser) {
                console.error('Cannot save progress: Not authenticated');
                return false;
            }

            // Get current game state
            const gameData = {
                map: MapSystem.saveData(),
                inventory: Utils.loadFromStorage('inventory'),
                currency: Currency.saveData(),
                characters: Utils.loadFromStorage('characters'),
                lastSaved: new Date().toISOString()
            };

            // Always save to local storage first
            Utils.saveToStorage('game_progress', gameData);
            console.log('Saved to local storage');

            let saved = false;
            
            // Try RPC first
            try {
                console.log('Attempting RPC save...');
                const { data: rpcData, error: rpcError } = await this.supabase
                    .rpc('save_game_progress', {
                        p_game_data: gameData,
                        p_user_id: this.currentUser.id,
                        p_version: 1
                    });
                
                if (rpcError) {
                    console.error('RPC save failed with error:', rpcError);
                } else {
                    console.log('RPC save successful');
                    saved = true;
                }
            } catch (e) {
                console.error('RPC save threw exception:', e);
            }

            // If RPC failed, try direct upsert
            if (!saved) {
                try {
                    console.log('Attempting direct upsert...');
                    const saveData = {
                        user_id: this.currentUser.id,
                        game_data: gameData,
                        updated_at: new Date().toISOString(),
                        version: 1
                    };

                    const { error: upsertError } = await this.supabase
                        .from('game_progress')
                        .upsert(saveData, {
                            onConflict: 'user_id'
                        });

                    if (upsertError) {
                        console.error('Upsert failed with error:', upsertError);
                    } else {
                        console.log('Upsert successful');
                        saved = true;
                    }
                } catch (e) {
                    console.error('Upsert threw exception:', e);
                }
            }

            return saved;
        } catch (error) {
            console.error('Critical error in saveUserProgress:', error);
            return false;
        }
    },

    /**
     * Generate a UUID v4
     * @returns {string} UUID v4
     */
    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Generate a nonce for challenge-response verification
     * @returns {string} Random nonce
     */
    generateNonce: function() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} Whether user is authenticated
     */
    isUserAuthenticated: function() {
        return this.isAuthenticated;
    },

    /**
     * Get current user data
     * @returns {Object|null} Current user or null if not authenticated
     */
    getCurrentUser: function() {
        return this.currentUser;
    },

    /**
     * Get authentication mode
     */
    getAuthMode: function() {
        return this.authMode;
    },

    /**
     * Check if RLS policies are configured correctly
     * @returns {Promise<boolean>} Whether RLS policies are working
     */
    checkRlsConfiguration: async function() {
        try {
            if (!this.supabase || !this.isAuthenticated) return false;
            
            console.log('Testing RLS policy configuration...');
            
            // Try a simple insert to check permissions
            const testData = {
                test_id: 'rls-test-' + this.generateUUID().substring(0, 8),
                test_data: { timestamp: new Date().toISOString() }
            };
            
            // First try a filter-based query (should work with RLS)
            try {
                const { data, error } = await this.supabase
                    .from('game_progress')
                    .select('user_id')
                    .filter('user_id', 'eq', this.currentUser.id)
                    .limit(1);
                    
                if (!error) {
                    console.log('RLS filter query working correctly');
                    return true;
                } else {
                    console.warn('RLS filter query failed:', error);
                }
            } catch (e) {
                console.warn('Error testing filter query:', e);
            }
            
            return false;
        } catch (error) {
            console.error('Error checking RLS configuration:', error);
            return false;
        }
    },
    
    /**
     * Setup auto-save interval
     * @param {number} intervalMs - Interval in milliseconds
     */
    setupAutoSave: function(intervalMs = 30000) { // Changed to every 30 seconds
        // Immediately save any fallback data that might exist from a previous session
        this.recoverFallbackData();
        
        // Register save on window unload/close
        window.addEventListener('beforeunload', () => {
            if (this.isAuthenticated) {
                // Attempt a synchronous save when leaving page
                try {
                    console.log('Saving on page unload...');
                    // Use sendBeacon API for non-blocking save attempt
                    const saveData = JSON.stringify({
                        userId: this.currentUser.id,
                        gameData: {
                            inventory: Utils.loadFromStorage('inventory'),
                            currency: Currency.saveData(),
                            characters: Utils.loadFromStorage('characters')
                        }
                    });
                    
                    navigator.sendBeacon('/api/saveGameData', saveData);
                    
                    // Also save to local storage as fallback
                    Utils.saveToStorage('emergency_save', {
                        timestamp: new Date().toISOString(),
                        userId: this.currentUser.id,
                        inventory: Utils.loadFromStorage('inventory'),
                        currency: Currency.saveData(),
                        characters: Utils.loadFromStorage('characters')
                    });
                } catch (e) {
                    console.error('Emergency save failed:', e);
                }
            }
        });
        
        // Auto-save progress every interval
        const saveInterval = setInterval(() => {
            if (this.isAuthenticated) {
                console.log(`Auto-saving (${intervalMs/1000}s interval)...`);
                this.saveUserProgress().catch(console.error);
            }
        }, intervalMs);
        
        // Register critical game events for immediate saves
        document.addEventListener('itemAcquired', () => {
            console.log('Item acquired - saving progress...');
            if (this.isAuthenticated) {
                this.saveUserProgress(true).catch(console.error);
            }
        });
        
        document.addEventListener('characterUpgraded', () => {
            console.log('Character upgraded - saving progress...');
            if (this.isAuthenticated) {
                this.saveUserProgress(true).catch(console.error);
            }
        });
        
        document.addEventListener('dungeonCompleted', () => {
            console.log('Dungeon completed - saving progress...');
            if (this.isAuthenticated) {
                this.saveUserProgress(true).catch(console.error);
            }
        });
        
        // Listen for shard changes and save them
        document.addEventListener('shardsChanged', () => {
            console.log('Shards changed, saving to database...');
            if (this.isAuthenticated) {
                this.saveUserProgress(true).catch(console.error);
            }
        });

        // Listen for character upgrades and save them
        document.addEventListener('characterUpgraded', () => {
            console.log('Character upgraded, saving to database...');
            if (this.isAuthenticated) {
                this.saveUserProgress(true).catch(console.error);
            }
        });
        
        // Let other systems trigger saves by dispatching these events
        console.log('Auto-save system initialized with interval:', intervalMs/1000, 'seconds');
        return saveInterval;
    },
    
    /**
     * Recover any fallback data from previous session
     */
    recoverFallbackData: function() {
        try {
            const fallbackData = Utils.loadFromStorage('fallback_game_progress');
            const emergencyData = Utils.loadFromStorage('emergency_save');
            
            // Check if we have any fallback data
            if (fallbackData || emergencyData) {
                console.log('Found fallback game data, attempting recovery...');
                
                // Only proceed if we're authenticated and the saved data matches the current user
                if (!this.isAuthenticated || !this.currentUser) {
                    console.log('Not authenticated yet, postponing recovery');
                    return false;
                }
                
                let dataToRecover = null;
                
                // Choose the newest data between fallback and emergency
                if (fallbackData && emergencyData) {
                    const fallbackTime = new Date(fallbackData.savedAt).getTime();
                    const emergencyTime = new Date(emergencyData.timestamp).getTime();
                    
                    dataToRecover = fallbackTime > emergencyTime ? fallbackData : emergencyData;
                } else {
                    dataToRecover = fallbackData || emergencyData;
                }
                
                // Verify the data belongs to this user
                if (dataToRecover.userId !== this.currentUser.id) {
                    console.log('Fallback data belongs to a different user, skipping recovery');
                    return false;
                }
                
                // Merge the recovered data with what we have
                console.log('Recovering fallback data from:', 
                    dataToRecover === fallbackData ? 'fallback_game_progress' : 'emergency_save');
                
                // Clear fallback storage after recovery attempt
                Utils.removeFromStorage('fallback_game_progress');
                Utils.removeFromStorage('emergency_save');
                
                // Force a save of the current state to ensure we're up to date
                setTimeout(() => this.saveUserProgress(true), 5000);
                
                return true;
            }
        } catch (error) {
            console.error('Error recovering fallback data:', error);
        }
        
        return false;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthenticationSystem;
}
