/**
 * Profile Dashboard System for the Cyberpunk MMORPG game
 * Displays user wallet information and token balances in a cyberpunk-themed dashboard
 */

const ProfileDashboard = {
    // Configuration
    defaultPolicyId: "",
    customPolicyId: null, // Will be loaded from storage or set to default
    
    // Blockfrost API for Cardano blockchain operations
    blockfrostApiKey: "mainnetHGcRSvYEMhCYxdFRFJVHWTszgHCYSKty",
    blockfrostApiUrl: "https://cardano-mainnet.blockfrost.io/api/v0",
    
    // Cache for token balances to reduce API calls
    balanceCache: {
        lastFetched: null,
        cacheDuration: 60000 // 1 minute
    },
    
    // Storage keys
    STORAGE_KEYS: {
        CUSTOM_POLICY_ID: 'custom_token_policy_id'
    },
    
    /**
     * Initialize the profile dashboard
     */
    init: function() {
        console.log('Initializing Profile Dashboard...');
        
        try {
            // Load custom policy ID from storage or use default
            this.loadCustomPolicyId();
            
            // Create profile button in menu
            this.createProfileButton();
            
            // Create profile modal
            this.createProfileModal();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Add logout button to profile dashboard
            this.addLogoutButton();
            
            console.log('Profile Dashboard initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Profile Dashboard:', error);
        }
    },
    
    /**
     * Load custom policy ID from storage or use default
     */
    loadCustomPolicyId: function() {
        const savedPolicyId = Utils.loadFromStorage(this.STORAGE_KEYS.CUSTOM_POLICY_ID);
        this.customPolicyId = savedPolicyId || this.defaultPolicyId;
        console.log('Loaded custom policy ID:', this.customPolicyId);
    },
    
    /**
     * Save custom policy ID to storage
     * @param {string} policyId - Policy ID to save
     */
    saveCustomPolicyId: function(policyId) {
        this.customPolicyId = policyId;
        Utils.saveToStorage(this.STORAGE_KEYS.CUSTOM_POLICY_ID, policyId);
        console.log('Saved custom policy ID:', policyId);
    },
    
    /**
     * Add buttons to profile dashboard
     */
    addLogoutButton: function() {
        // Check if profile modal exists
        const modal = document.getElementById('profile-modal');
        if (!modal) return;
        
        const modalBody = modal.querySelector('.profile-modal-body');
        if (!modalBody) return;
        
        const isGuest = AuthenticationSystem && AuthenticationSystem.authMode === 'guest';
        
        // Create buttons container
        if (!document.getElementById('profile-buttons-container')) {
            // Create buttons container
            const buttonsContainer = document.createElement('div');
            buttonsContainer.id = 'profile-buttons-container';
            buttonsContainer.className = 'profile-buttons-container';
            
            // Style container for better positioning
            buttonsContainer.style.marginTop = '20px';
            buttonsContainer.style.textAlign = 'center';
            buttonsContainer.style.borderTop = '1px solid rgba(0, 247, 255, 0.3)';
            buttonsContainer.style.paddingTop = '20px';
            buttonsContainer.style.display = 'flex';
            buttonsContainer.style.flexDirection = 'column';
            buttonsContainer.style.gap = '15px';
            
            // Add to modal body
            modalBody.appendChild(buttonsContainer);
        }
        
        // Get the container
        const buttonsContainer = document.getElementById('profile-buttons-container');
        
        // Add "Link Wallet" button for guest users
        if (isGuest) {
            // Check if link wallet button already exists
            if (!document.getElementById('profile-link-wallet-btn')) {
                // Create Link Wallet button
                const linkWalletBtn = document.createElement('button');
                linkWalletBtn.id = 'profile-link-wallet-btn';
                linkWalletBtn.className = 'cyberpunk-btn-primary';
                linkWalletBtn.style.padding = '10px 25px';
                linkWalletBtn.style.fontWeight = 'bold';
                linkWalletBtn.textContent = 'LINK WALLET';
                
                // Add hover effect for cyberpunk look
                linkWalletBtn.style.position = 'relative';
                linkWalletBtn.style.overflow = 'hidden';
                linkWalletBtn.style.background = 'linear-gradient(90deg, #003c5f, #0077b6)';
                linkWalletBtn.style.color = '#00f7ff';
                linkWalletBtn.style.border = '1px solid #00f7ff';
                linkWalletBtn.style.boxShadow = '0 0 10px rgba(0, 247, 255, 0.3)';
                
                // Add to buttons container
                buttonsContainer.appendChild(linkWalletBtn);
                
                // Add event listener
                linkWalletBtn.addEventListener('click', async () => {
                    // Hide the profile modal first
                    this.hideProfileModal();
                    
                    // Check if AuthenticationSystem exists and has connectWallet function
                    if (typeof AuthenticationSystem !== 'undefined' && 
                        typeof AuthenticationSystem.connectWallet === 'function') {
                        try {
                            console.log('Attempting to connect wallet from profile...');
                            // Attempt to connect wallet (this will handle the flow)
                            const walletConnected = await AuthenticationSystem.connectWallet();
                            
                            if (walletConnected) {
                                console.log('Wallet connected successfully from profile');
                            } else {
                                console.log('Wallet connection cancelled or failed from profile');
                            }
                        } catch (error) {
                            console.error('Error connecting wallet from profile:', error);
                        }
                    } else {
                        console.error('AuthenticationSystem not available or missing connectWallet function');
                    }
                });
            }
        } else {
            // Remove link wallet button if user is no longer a guest
            const linkWalletBtn = document.getElementById('profile-link-wallet-btn');
            if (linkWalletBtn) {
                linkWalletBtn.remove();
            }
        }
        
        // Add/update logout button
        // Check if logout button already exists
        if (!document.getElementById('profile-logout-btn')) {
            // Create button with enhanced styling
            const buttonClass = isGuest ? "cyberpunk-btn-danger" : "cyberpunk-btn";
            const buttonText = isGuest ? "LOGOUT (DELETES GUEST DATA)" : "LOGOUT";
            
            // Create Logout button
            const logoutBtn = document.createElement('button');
            logoutBtn.id = 'profile-logout-btn';
            logoutBtn.className = buttonClass;
            logoutBtn.style.padding = '10px 25px';
            logoutBtn.style.fontWeight = 'bold';
            logoutBtn.textContent = buttonText;
            
            // Add to buttons container
            buttonsContainer.appendChild(logoutBtn);
            
            // Add event listener with enhanced logout flow
            logoutBtn.addEventListener('click', async () => {
                // Hide the profile modal first
                this.hideProfileModal();
                
                // Check if AuthenticationSystem exists and has logout function
                if (typeof AuthenticationSystem !== 'undefined' && typeof AuthenticationSystem.logout === 'function') {
                    try {
                        // Call logout function (this will show warning for guest users)
                        const logoutSuccessful = await AuthenticationSystem.logout();
                        
                        if (logoutSuccessful) {
                            console.log('Logout successful, showing standby page...');
                            
                            // The authStateChanged event will trigger StandbyPage to show
                            // and AuthenticationSystem.resetGameState() will handle the reset
                        } else {
                            console.log('Logout cancelled by user');
                        }
                    } catch (error) {
                        console.error('Error during logout:', error);
                    }
                } else {
                    console.error('AuthenticationSystem not available or missing logout function');
                }
            });
        } else {
            // Update button text and style based on current auth mode
            const logoutBtn = document.getElementById('profile-logout-btn');
            if (logoutBtn) {
                logoutBtn.className = isGuest ? "cyberpunk-btn-danger" : "cyberpunk-btn";
                logoutBtn.textContent = isGuest ? "LOGOUT (DELETES GUEST DATA)" : "LOGOUT";
            }
        }
    },
    
    /**
     * Create profile button in menu
     */
    createProfileButton: function() {
        // Check if menu buttons container exists
        const menuButtons = document.getElementById('menu-buttons');
        if (!menuButtons) {
            console.error('Menu buttons container not found');
            return;
        }
        
        // Create button if it doesn't exist yet
        if (!document.getElementById('profile-button')) {
            const button = document.createElement('button');
            button.id = 'profile-button';
            button.className = 'menu-button';
            button.setAttribute('data-tooltip', 'Dashboard');
            button.textContent = '👤';
            
            // Add button to menu
            menuButtons.appendChild(button);
        }
        
        // Update button content based on auth state
        this.updateProfileButton();
    },
    
    /**
     * Update profile button content based on authentication state
     */
    updateProfileButton: function() {
        const button = document.getElementById('profile-button');
        if (!button) return;
        
        // Clear existing content
        button.innerHTML = '';
        
        // Create icon element
        const iconElement = document.createElement('span');
        iconElement.className = 'profile-icon';
        iconElement.textContent = '👤';
        
        // Create text element
        const textElement = document.createElement('span');
        textElement.className = 'profile-text';
        
        if (AuthenticationSystem.isAuthenticated) {
            if (AuthenticationSystem.authMode === 'wallet') {
                // Show shortened wallet address
                const walletAddress = AuthenticationSystem.currentUser.wallet;
                textElement.textContent = walletAddress.substring(0, 6) + '...';
            } else {
                // Show guest text
                textElement.textContent = 'Guest';
            }
        } else {
            // Default text if not authenticated
            textElement.textContent = 'Profile';
        }
        
        // Add elements to button
        button.appendChild(iconElement);
        button.appendChild(textElement);
    },
    
    /**
     * Create profile modal
     */
    createProfileModal: function() {
        // Check if profile modal already exists
        if (document.getElementById('profile-modal')) return;
        
        // Create modal element
        const modal = document.createElement('div');
        modal.id = 'profile-modal';
        modal.className = 'modal';
        modal.style.display = 'none'; // Initially hidden
        
        // Set modal content
        modal.innerHTML = `
            <div class="profile-modal-content">
                <div class="profile-modal-header">
                    <h2>USER PROFILE</h2>
                    <button class="close-profile-modal">&times;</button>
                </div>
                <div class="profile-modal-body">
                    <div class="user-identity">
                        <div class="address-container">
                            <span class="address-label">IDENTITY:</span>
                            <div id="wallet-address-display" class="wallet-address">Loading...</div>
                        </div>
                        <div class="login-status">
                            <div id="status-indicator" class="status-indicator"></div>
                            <span id="status-text" class="status-text">Checking connection status...</span>
                        </div>
                    </div>
                    
                    <div class="token-balances">
                        <h3 class="balance-header">DIGITAL ASSETS</h3>
                        
                        <div class="balance-item">
                            <div class="token-info">
                                <div class="token-icon shelly"></div>
                                <div>
                                    <span class="token-name">SHELLY TOKEN</span>
                                </div>
                            </div>
                            <div id="shelly-token-balance" class="token-amount shelly loading">Loading</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modal);
    },
    
    /**
     * Set up event listeners for profile dashboard
     */
    setupEventListeners: function() {
        // Profile button click
        const profileButton = document.getElementById('profile-button');
        if (profileButton) {
            profileButton.addEventListener('click', this.showProfileModal.bind(this));
        }
        
        // Close button click
        const closeButton = document.querySelector('.close-profile-modal');
        if (closeButton) {
            closeButton.addEventListener('click', this.hideProfileModal.bind(this));
        }
        
        // Remove the update policy button event listener since we removed the input
    },
    
    /**
     * Show profile modal and update data
     */
    showProfileModal: function() {
        const modal = document.getElementById('profile-modal');
        if (!modal) return;
        
        // Show modal
        modal.style.display = 'flex';
        
        // Update user identity display
        this.updateIdentityDisplay();
    },
    
    /**
     * Hide profile modal
     */
    hideProfileModal: function() {
        const modal = document.getElementById('profile-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    },
    
    /**
     * Update custom policy ID from input field
     */
    updateCustomPolicyId: function() {
        const input = document.getElementById('policy-id-input');
        if (!input) return;
        
        const newPolicyId = input.value.trim();
        if (newPolicyId === '') {
            alert('Please enter a valid policy ID');
            return;
        }
        
        // Save new policy ID
        this.saveCustomPolicyId(newPolicyId);
        
        // Update display
        const policyDisplay = document.getElementById('custom-policy-display');
        if (policyDisplay) {
            policyDisplay.textContent = `Policy: ${newPolicyId.substring(0, 8)}...`;
        }
        
        // Reset and fetch balance with new policy ID
        const customBalance = document.getElementById('custom-token-balance');
        if (customBalance) {
            customBalance.textContent = 'Loading';
            customBalance.classList.add('loading');
        }
        
        // Invalidate cache
        this.balanceCache.customToken = null;
        this.balanceCache.lastFetched = null;
        
        // Re-fetch if authenticated
        if (AuthenticationSystem.isAuthenticated && AuthenticationSystem.authMode === 'wallet') {
            this.fetchTokenBalances(AuthenticationSystem.currentUser.wallet);
        }
    },
    
    /**
     * Update user identity display
     */
    updateIdentityDisplay: function() {
        const addressDisplay = document.getElementById('wallet-address-display');
        const statusIndicator = document.getElementById('status-indicator');
        const statusText = document.getElementById('status-text');
        
        if (!addressDisplay || !statusIndicator || !statusText) return;
        
        // Check auth state directly from AuthenticationSystem
        const isAuthenticated = AuthenticationSystem.isUserAuthenticated ? 
                               AuthenticationSystem.isUserAuthenticated() : 
                               AuthenticationSystem.isAuthenticated;
        
        const authMode = AuthenticationSystem.getAuthMode ? 
                        AuthenticationSystem.getAuthMode() : 
                        AuthenticationSystem.authMode;
                        
        console.log('Profile updating identity display - Auth state:', isAuthenticated, 'Mode:', authMode);
        
        if (isAuthenticated) {
            if (authMode === 'wallet') {
                // Display wallet address and connected status
                const walletAddress = AuthenticationSystem.currentUser?.wallet || 
                                     (AuthenticationSystem.getCurrentUser && AuthenticationSystem.getCurrentUser().wallet);
                                     
                addressDisplay.textContent = walletAddress || 'Wallet Connected';
                addressDisplay.classList.remove('guest');
                
                statusIndicator.classList.add('connected');
                statusIndicator.classList.remove('guest', 'error');
                statusText.textContent = 'Connected via Cardano Wallet';
            } else {
                // Display guest status
                addressDisplay.textContent = 'Guest User';
                addressDisplay.classList.add('guest');
                
                statusIndicator.classList.add('guest');
                statusIndicator.classList.remove('connected', 'error');
                statusText.textContent = 'Playing as Guest • Connect Wallet to Save Progress';
            }
        } else {
            // Not authenticated
            addressDisplay.textContent = 'Not Connected';
            addressDisplay.classList.add('guest');
            
            statusIndicator.classList.remove('connected', 'guest');
            statusIndicator.classList.add('error');
            statusText.textContent = 'Not authenticated';
        }
    },
    
    /**
     * Fetch token balances from Blockfrost API
     * @param {string} walletAddress - Wallet address to fetch balances for
     */
    fetchTokenBalances: async function(walletAddress) {
        // Check if cache is still valid
        const now = Date.now();
        if (this.balanceCache.lastFetched && (now - this.balanceCache.lastFetched < this.balanceCache.cacheDuration)) {
            console.log('Using cached balances');
            this.updateBalanceDisplays(
                this.balanceCache.ada || '0',
                this.balanceCache.customToken || '0'
            );
            return;
        }
        
        try {
            // Set loading state
            const adaBalance = document.getElementById('ada-balance');
            const customBalance = document.getElementById('custom-token-balance');
            
            if (adaBalance) {
                adaBalance.textContent = 'Loading';
                adaBalance.classList.add('loading');
            }
            
            if (customBalance) {
                customBalance.textContent = 'Loading';
                customBalance.classList.add('loading');
            }
            
            // First try to get balance directly from wallet API (more accurate)
            let adaAmount = '0';
            let customTokenAmount = '0';
            let usedWalletAPI = false;
            
            try {
                console.log('Trying to get balance from wallet API...');
                
                // Check if we can access the wallet API correctly using CIP-30
                if (typeof window.cardano !== 'undefined') {
                    // Look for available wallets
                    const availableWallets = Object.keys(window.cardano).filter(
                        key => typeof window.cardano[key]?.enable === 'function'
                    );
                    console.log('Available wallet extensions:', availableWallets);
                    
                    // Try with Vespr wallet first
                    let api = null;
                    if (window.cardano.vespr) {
                        api = await window.cardano.vespr.enable().catch(e => {
                            console.warn('Failed to enable Vespr wallet:', e);
                            return null;
                        });
                    } 
                    // Then try any other available wallet
                    else if (availableWallets.length > 0) {
                        const firstWallet = window.cardano[availableWallets[0]];
                        api = await firstWallet.enable().catch(e => {
                            console.warn(`Failed to enable ${availableWallets[0]} wallet:`, e);
                            return null;
                        });
                    }
                    
                    if (api && typeof api.getBalance === 'function') {
                        console.log('Getting balance via wallet API...');
                        
                        // Get balance (returns all assets)
                        const balance = await api.getBalance().catch(e => {
                            console.warn('Failed to get wallet balance:', e);
                            return null;
                        });
                        
                        console.log('Wallet balance:', balance);
                        
                        if (balance && balance.length > 0) {
                            // Look for lovelace (ADA) entry - this is the one without asset name
                            const lovelaceEntry = balance.find(entry => entry.unit === 'lovelace');
                            
                            if (lovelaceEntry) {
                                adaAmount = (parseInt(lovelaceEntry.quantity) / 1000000).toFixed(2);
                                this.balanceCache.ada = adaAmount;
                                console.log('ADA balance from wallet:', adaAmount);
                            }
                            
                            // Look for the custom token with our policy ID
                            const customTokenEntry = balance.find(entry => entry.unit && entry.unit.startsWith(this.customPolicyId));
                            
                            if (customTokenEntry) {
                                customTokenAmount = (parseInt(customTokenEntry.quantity) / 1000000).toFixed(2);
                                this.balanceCache.customToken = customTokenAmount;
                                console.log('Custom token balance from wallet:', customTokenAmount);
                            }
                            
                            usedWalletAPI = true;
                        }
                    }
                }
            } catch (walletError) {
                console.warn('Could not get balance from wallet API, falling back to Blockfrost:', walletError);
            }
            
            // If we couldn't get balance from wallet API, use Blockfrost
            if (!usedWalletAPI) {
                console.log('Using Blockfrost API to get balances...');
                
                // Use Promise.all to make parallel requests
                try {
                    const [adaResponse, assetsResponse] = await Promise.all([
                        // Fetch ADA balance
                        fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}`, {
                            method: 'GET',
                            headers: {
                                'project_id': this.blockfrostApiKey
                            }
                        }),
                        
                        // Fetch token balances
                        fetch(`${this.blockfrostApiUrl}/addresses/${walletAddress}/assets`, {
                            method: 'GET',
                            headers: {
                                'project_id': this.blockfrostApiKey
                            }
                        })
                    ]);
                    
                    // Process ADA response
                    if (adaResponse.ok) {
                        const adaData = await adaResponse.json();
                        console.log('Blockfrost ADA data:', adaData);
                        
                        if (adaData && adaData.amount) {
                            // Find the lovelace entry (ADA)
                            const lovelaceEntry = adaData.amount.find(item => item.unit === 'lovelace');
                            
                            if (lovelaceEntry) {
                                // Convert lovelace (millionths of ADA) to ADA
                                adaAmount = (parseInt(lovelaceEntry.quantity) / 1000000).toFixed(2);
                                // Cache the result
                                this.balanceCache.ada = adaAmount;
                                console.log('ADA balance from Blockfrost:', adaAmount);
                            }
                        }
                    } else {
                        console.error('Error fetching ADA balance from Blockfrost:', 
                            adaResponse.status, adaResponse.statusText);
                    }
                    
                    // Process assets response
                    if (assetsResponse.ok) {
                        const assetsData = await assetsResponse.json();
                        console.log('Blockfrost assets data:', assetsData);
                        
                        // Find the asset with our policy ID
                        const customAsset = assetsData.find(asset => 
                            asset && asset.unit && asset.unit.startsWith(this.customPolicyId));
                        
                        if (customAsset) {
                            // Format based on decimals (assuming 6 for simplicity, adjust as needed)
                            customTokenAmount = (parseInt(customAsset.quantity) / 1000000).toFixed(2);
                            // Cache the result
                            this.balanceCache.customToken = customTokenAmount;
                            console.log('Custom token balance from Blockfrost:', customTokenAmount);
                        }
                    } else {
                        console.error('Error fetching assets from Blockfrost:', 
                            assetsResponse.status, assetsResponse.statusText);
                    }
                } catch (blockfrostError) {
                    console.error('Error calling Blockfrost API:', blockfrostError);
                }
            }
            
            // Update cache timestamp
            this.balanceCache.lastFetched = now;
            
            // Update UI
            this.updateBalanceDisplays(adaAmount, customTokenAmount);
        } catch (error) {
            console.error('Error fetching token balances:', error);
            
            // Update UI with error state
            const adaBalance = document.getElementById('ada-balance');
            const customBalance = document.getElementById('custom-token-balance');
            
            if (adaBalance) {
                adaBalance.textContent = 'Error';
                adaBalance.classList.remove('loading');
            }
            
            if (customBalance) {
                customBalance.textContent = 'Error';
                customBalance.classList.remove('loading');
            }
        }
    },
    
    /**
     * Update balance displays
     * @param {string} shellyAmount - Amount of Shelly tokens
     * @param {string} loveAmount - Amount of Love tokens
     */
    updateBalanceDisplays: function(shellyAmount, loveAmount) {
        const shellyBalance = document.getElementById('shelly-token-balance');
        const loveBalance = document.getElementById('love-token-balance');
        
        if (shellyBalance) {
            shellyBalance.textContent = shellyAmount;
            shellyBalance.classList.remove('loading');
        }
        
        if (loveBalance) {
            loveBalance.textContent = loveAmount;
            loveBalance.classList.remove('loading');
        }
    },
    
    /**
     * Handle authentication state changes
     */
    handleAuthStateChange: function() {
        console.log('Auth state changed, updating profile dashboard');
        
        // Update profile button
        this.updateProfileButton();
        
        // Update modal content if it's open
        const modal = document.getElementById('profile-modal');
        if (modal && modal.style.display === 'flex') {
            this.updateIdentityDisplay();
        }
    },
    
    /**
     * Create token balance display
     */
    createTokenDisplay: function() {
        const balancesContainer = document.createElement('div');
        balancesContainer.className = 'token-balances';
        
        // Shelly Token Display
        const shellyTokenItem = document.createElement('div');
        shellyTokenItem.className = 'balance-item';
        shellyTokenItem.innerHTML = `
            <div class="token-info">
                <div class="token-icon shelly"></div>
                <div>
                    <span class="token-name">SHELLY TOKEN</span>
                </div>
            </div>
            <div id="shelly-token-balance" class="token-amount shelly loading">Loading</div>
        `;
        
        // Love Token Display
        const loveTokenItem = document.createElement('div');
        loveTokenItem.className = 'balance-item';
        loveTokenItem.innerHTML = `
            <div class="token-info">
                <div class="token-icon love"></div>
                <div>
                    <span class="token-name">LOVE</span>
                </div>
            </div>
            <div id="love-token-balance" class="token-amount love">0.00</div>
        `;
        
        balancesContainer.appendChild(shellyTokenItem);
        balancesContainer.appendChild(loveTokenItem);
        return balancesContainer;
    }
};

// Add custom event for auth state changes that AuthenticationSystem will dispatch
if (typeof AuthenticationSystem !== 'undefined') {
    // Extend the auth system's updateAuthUI function to dispatch events
    const originalUpdateAuthUI = AuthenticationSystem.updateAuthUI;
    AuthenticationSystem.updateAuthUI = function() {
        // Call the original function
        originalUpdateAuthUI.call(AuthenticationSystem);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('authStateChanged'));
    };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfileDashboard;
}
