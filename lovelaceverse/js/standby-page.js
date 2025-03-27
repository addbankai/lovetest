/**
 * Standby Page System
 * Prevents users from accessing the game until logged in
 */

const StandbyPage = {
    // DOM elements
    elements: {
        overlay: null,
        guestLoginButton: null,
        walletLoginButton: null,
        statusMessage: null
    },
    
    // Login states
    loginState: {
        inProgress: false,
        progressLoaded: false,
        timeout: null
    },
    
    /**
     * Initialize the standby page
     */
    init: function() {
        console.log('Initializing Standby Page System...');
        
        // Get DOM elements
        this.elements.overlay = document.getElementById('standby-overlay');
        this.elements.guestLoginButton = document.getElementById('standby-guest-login');
        this.elements.walletLoginButton = document.getElementById('standby-wallet-login');
        this.elements.statusMessage = document.getElementById('standby-status');
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Check if user is already logged in
        this.checkAuthStatus();
        
        // Add authentication change event listener
        window.addEventListener('authStateChanged', this.handleAuthStateChange.bind(this));
        
        // Add failsafe to hide the overlay after a certain timeout
        // This ensures players can access the game even if there are issues
        setTimeout(() => {
            if (this.elements.overlay && 
                this.elements.overlay.style.display !== 'none' && 
                typeof AuthenticationSystem !== 'undefined' && 
                AuthenticationSystem.isAuthenticated) {
                console.warn('Failsafe: Force hiding standby overlay after page load timeout');
                this.forceHideOverlay();
            }
        }, 10000); // 10 second failsafe after initialization
        
        // Add observer to watch for loading screen changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.target.id === 'loading-screen') {
                    this.manageSpinners();
                }
            });
        });

        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            observer.observe(loadingScreen, { 
                attributes: true, 
                attributeFilter: ['style', 'class'] 
            });
        }

        console.log('Standby Page System initialized');
    },
    
    /**
     * Setup event listeners for buttons
     */
    setupEventListeners: function() {
        // Guest login button
        if (this.elements.guestLoginButton) {
            this.elements.guestLoginButton.addEventListener('click', this.handleGuestLogin.bind(this));
        }
        
        // Wallet login button
        if (this.elements.walletLoginButton) {
            this.elements.walletLoginButton.addEventListener('click', this.handleWalletLogin.bind(this));
        }
    },
    
    /**
     * Check authentication status
     */
    checkAuthStatus: function() {
        // Check if AuthenticationSystem exists and is initialized
        if (typeof AuthenticationSystem !== 'undefined') {
            if (AuthenticationSystem.isAuthenticated) {
                this.hideOverlay();
            } else {
                this.showOverlay();
            }
        } else {
            // Default to showing overlay if auth system isn't available
            this.showOverlay();
            
            // Add a listener for when authentication system becomes available
            document.addEventListener('authSystemReady', () => {
                this.checkAuthStatus();
            });
        }
    },
    
    /**
     * Handle guest login
     */
    handleGuestLogin: function() {
        this.showStatus('Logging in as guest...', 'info');
        
        // Add loading indicator to the status
        if (this.elements.statusMessage) {
            const loadingSpinner = document.createElement('div');
            loadingSpinner.className = 'loading-spinner';
            this.elements.statusMessage.appendChild(loadingSpinner);
        }
        
        // Check if AuthenticationSystem exists
        if (typeof AuthenticationSystem !== 'undefined' && 
            typeof AuthenticationSystem.loginAsGuest === 'function') {
            
            // Attempt guest login
            AuthenticationSystem.loginAsGuest()
                .then(() => {
                    this.showStatus('Guest login successful!', 'success');
                    this.hideOverlay();
                    
                    // Dispatch guest login event
                    const guestLoginEvent = new CustomEvent('guestLoggedIn');
                    document.dispatchEvent(guestLoginEvent);
                    
                    // Set a failsafe to ensure overlay is hidden
                    setTimeout(() => this.forceHideOverlay(), 10000); // Increased failsafe timeout
                })
                .catch(error => {
                    this.showStatus('Guest login failed: ' + error.message, 'error');
                    
                    // Even if login fails, still let the user play (offline mode)
                    setTimeout(() => {
                        this.showStatus('Continuing in offline mode...', 'warning');
                        this.hideOverlay();
                    }, 2000);
                });
                
        } else {
            // If authentication system isn't available, show error
            this.showStatus('Authentication system not available', 'error');
            
            // Still hide overlay after a delay to let user play
            setTimeout(() => {
                this.hideOverlay();
            }, 2000);
        }
    },
    
    /**
     * Handle wallet login
     */
    handleWalletLogin: function() {
        // Remove any existing spinner first
        this.manageSpinners();
        
        // Check if LoadingScreen is visible
        const loadingScreenVisible = document.getElementById('loading-screen') && 
            window.getComputedStyle(document.getElementById('loading-screen')).display !== 'none';
        
        // Reset login state
        this.loginState = {
            inProgress: true,
            progressLoaded: false,
            timeout: null,
            loadingScreenHandlingAuth: loadingScreenVisible
        };
        
        // If loading screen is handling authentication, use a simpler approach
        if (this.loginState.loadingScreenHandlingAuth) {
            console.log('Loading screen is visible, coordinating authentication with it');
            this.showStatus('Connecting wallet via loading screen...', 'info', false); // Never show spinner in this case
            
            window.addEventListener('authStateChanged', (event) => {
                if (event.detail && event.detail.isAuthenticated) {
                    this.showStatus('Authentication successful!', 'success', false);
                    setTimeout(() => this.hideOverlay(), 800);
                }
            }, { once: true });
            
            if (typeof AuthenticationSystem !== 'undefined' && 
                typeof AuthenticationSystem.connectWallet === 'function') {
                AuthenticationSystem.connectWallet().catch(error => {
                    this.showStatus('Connection failed: ' + error.message, 'error', false);
                    setTimeout(() => {
                        this.showStatus('Continuing in offline mode...', 'warning', false);
                        this.hideOverlay();
                    }, 2000);
                });
            }
            return;
        }
        
        // Normal flow when loading screen isn't handling auth
        this.showStatus('Connecting wallet...', 'info', this.manageSpinners());
        
        // Make sure the overlay is fully visible during connection
        if (this.elements.overlay) {
            this.elements.overlay.style.opacity = '1';
            this.elements.overlay.style.display = 'flex';
        }
        
        // Set a status update timer instead of auto-hiding
        this.loginState.timeout = setTimeout(() => {
            if (this.loginState.inProgress && !this.loginState.progressLoaded) {
                console.warn('Wallet login taking longer than expected...');
                this.showStatus('Connection in progress... Please wait or check your wallet extension.', 'info');
                // Do NOT hide overlay - keep waiting for authentication
                
                // Set a longer timeout for a second status update
                setTimeout(() => {
                    if (this.loginState.inProgress && !this.loginState.progressLoaded) {
                        this.showStatus('Still waiting for wallet... Click Cancel in wallet popup to abort.', 'warning');
                    }
                }, 15000);
            }
        }, 15000);
        
        // Check if AuthenticationSystem exists
        if (typeof AuthenticationSystem !== 'undefined' && 
            typeof AuthenticationSystem.connectWallet === 'function') {
            
            // Register progress loading event listener
            const progressLoadedHandler = () => {
                console.log('Progress loaded event received');
                this.loginState.progressLoaded = true;
                document.removeEventListener('progressLoaded', progressLoadedHandler);
                
                // Add a small delay to ensure UI is updated
                setTimeout(() => {
                    this.showStatus('Login successful!', 'success');
                    
                    // Small delay to show success message
                    setTimeout(() => {
                        this.hideOverlay();
                        
                        // Set a failsafe to ensure overlay is hidden
                        setTimeout(() => this.forceHideOverlay(), 2000);
                    }, 800);
                }, 200);
            };
            
            // Listen for progress loaded event
            document.addEventListener('progressLoaded', progressLoadedHandler);
            
            // Attempt wallet connection
            AuthenticationSystem.connectWallet()
                .then(async (success) => {
                    if (!success) {
                        // Clear timeout and reset state
                        clearTimeout(this.loginState.timeout);
                        this.loginState.inProgress = false;
                        
                        this.showStatus('Wallet connection cancelled, continuing in offline mode...', 'warning');
                        
                        // Hide overlay even if wallet connection fails
                        setTimeout(() => this.hideOverlay(), 1500);
                        return;
                    }
                    
                    this.showStatus('Wallet connected! Loading progress...', 'success');
                    
                    try {
                        // Load user progress explicitly with validation
                        if (typeof AuthenticationSystem.loadUserProgress === 'function' && 
                            AuthenticationSystem.currentUser && 
                            AuthenticationSystem.currentUser.id) {
                            
                            console.log('Loading user progress for ID:', AuthenticationSystem.currentUser.id);
                            
                            // Load progress
                            const progressSuccess = await AuthenticationSystem.loadUserProgress(AuthenticationSystem.currentUser.id)
                                .catch(err => {
                                    console.error('Error loading user progress:', err);
                                    return false;
                                });
                            
                            if (progressSuccess) {
                                console.log('Progress loaded successfully');
                                this.loginState.progressLoaded = true;
                                
                                // Dispatch progress loaded event
                                document.dispatchEvent(new CustomEvent('progressLoaded'));
                            } else {
                                console.warn('Progress loading failed');
                                this.showStatus('Error loading progress, continuing anyway...', 'warning');
                                
                                // Still mark as loaded to continue
                                this.loginState.progressLoaded = true;
                                document.dispatchEvent(new CustomEvent('progressLoaded'));
                                
                                // Hide overlay even if progress loading fails
                                setTimeout(() => this.hideOverlay(), 1500);
                            }
                        } else {
                            console.warn('loadUserProgress function not available or user not authenticated');
                            this.showStatus('Missing progress loader, continuing anyway...', 'warning');
                            
                            // Mark as loaded even if function is not available
                            this.loginState.progressLoaded = true;
                            document.dispatchEvent(new CustomEvent('progressLoaded'));
                            
                            // Hide overlay anyway
                            setTimeout(() => this.hideOverlay(), 1500);
                        }
                    } catch (e) {
                        console.error('Error in wallet login process:', e);
                        this.showStatus('Error loading progress, continuing anyway...', 'warning');
                        
                        // Mark as loaded despite error
                        this.loginState.progressLoaded = true;
                        document.dispatchEvent(new CustomEvent('progressLoaded'));
                        
                        // Hide overlay even if there's an error
                        setTimeout(() => this.hideOverlay(), 1500);
                    } finally {
                        // Clear the timeout regardless of outcome
                        clearTimeout(this.loginState.timeout);
                        this.loginState.inProgress = false;
                        
                        // Dispatch event to notify other components that wallet is connected
                        const walletConnectedEvent = new CustomEvent('walletConnected', {
                            detail: { userId: AuthenticationSystem.currentUser?.id || 'unknown' }
                        });
                        document.dispatchEvent(walletConnectedEvent);
                    }
                })
                .catch(error => {
                    // Clear timeout and reset state
                    clearTimeout(this.loginState.timeout);
                    this.loginState.inProgress = false;
                    
                    this.showStatus('Wallet connection failed, continuing in offline mode...', 'warning');
                    
                    // Hide overlay even if wallet connection catches an error
                    setTimeout(() => this.hideOverlay(), 1500);
                });
                
        } else {
            // Clear timeout and reset state
            clearTimeout(this.loginState.timeout);
            this.loginState.inProgress = false;
            
            // If authentication system isn't available, show error
            this.showStatus('Authentication system not available, continuing in offline mode...', 'warning');
            
            // Hide overlay anyway
            setTimeout(() => this.hideOverlay(), 1500);
        }
    },
    
    /**
     * Handle authentication state change
     * @param {Event} event - Auth state change event
     */
    handleAuthStateChange: function(event) {
        const isAuthenticated = event.detail?.isAuthenticated || false;
        const authMode = event.detail?.authMode;
        
        console.log('Auth state changed:', isAuthenticated, 'Mode:', authMode);
        
        if (isAuthenticated) {
            this.hideOverlay();
            
            // Set a failsafe to ensure overlay is hidden
            setTimeout(() => this.forceHideOverlay(), 2000);
        } else {
            this.showOverlay();
        }
    },
    
    /**
     * Show the standby overlay
     */
    showOverlay: function() {
        if (this.elements.overlay) {
            this.elements.overlay.style.display = 'flex';
            this.elements.overlay.style.opacity = '1';
            
            // Pause the game when showing login overlay
            if (typeof GameStateManager !== 'undefined' && typeof GameStateManager.pauseGame === 'function') {
                console.log('Pausing game during overlay show');
                GameStateManager.pauseGame();
            }
        }
    },
    
    /**
     * Hide the standby overlay with transition effect
     */
    hideOverlay: function() {
        if (this.elements.overlay) {
            console.log('Hiding standby overlay');
            
            // Check if it's already hidden to avoid animation glitches
            if (this.elements.overlay.style.display === 'none') {
                return;
            }
            
            try {
                // First set opacity to 0 to start the transition
                this.elements.overlay.style.opacity = '0';
                
                // Force the game container to be visible
                const gameContainer = document.getElementById('game-container');
                if (gameContainer) {
                    gameContainer.style.opacity = '1';
                    gameContainer.style.pointerEvents = 'auto';
                }
                
                // Resume the game when hiding overlay
                if (typeof GameStateManager !== 'undefined' && typeof GameStateManager.resumeGame === 'function') {
                    console.log('Resuming game during overlay hide');
                    // Slight delay to ensure UI transitions first
                    setTimeout(() => GameStateManager.resumeGame(), 100);
                }
                
                // Then after transition completes, hide it completely
                setTimeout(() => {
                    this.elements.overlay.style.display = 'none';
                    console.log('Standby overlay hidden completely');
                    
                    // Double-check game container is visible
                    if (gameContainer) {
                        gameContainer.style.opacity = '1';
                        gameContainer.style.pointerEvents = 'auto';
                    }
                    
                    // Check if we're switching accounts and need to reload progress
                    this.checkForAccountSwitch();
                    
                    // Dispatch an event that overlay is fully hidden
                    const overlayHiddenEvent = new CustomEvent('standbyOverlayHidden');
                    document.dispatchEvent(overlayHiddenEvent);
                }, 800); // Match the CSS transition duration (0.8s)
                
                // Set a failsafe timer to force-hide the overlay if something goes wrong
                setTimeout(() => {
                    if (this.elements.overlay.style.display !== 'none') {
                        console.warn('Failsafe: Force hiding standby overlay after timeout');
                        this.forceHideOverlay();
                    }
                }, 10000); // Increased failsafe timeout
            } catch (e) {
                // If any error occurs, force hide immediately
                console.error('Error during overlay transition, force hiding:', e);
                this.forceHideOverlay();
            }
        }
    },
    
    /**
     * Force hide the overlay immediately without animation
     * This is a failsafe method used when regular hiding fails
     */
    forceHideOverlay: function() {
        if (this.elements.overlay) {
            console.warn('Force hiding standby overlay');
            this.elements.overlay.style.display = 'none';
            
            // Also force the game container to be visible
            const gameContainer = document.getElementById('game-container');
            if (gameContainer) {
                gameContainer.style.opacity = '1';
                gameContainer.style.pointerEvents = 'auto';
            }
            
            // Resume the game when force hiding overlay
            if (typeof GameStateManager !== 'undefined' && typeof GameStateManager.resumeGame === 'function') {
                console.log('Force resuming game after overlay force hide');
                GameStateManager.resumeGame();
            }
            
            // Check if we're switching accounts and need to reload progress
            this.checkForAccountSwitch();
            
            // Dispatch an event that overlay is fully hidden
            const overlayHiddenEvent = new CustomEvent('standbyOverlayHidden');
            document.dispatchEvent(overlayHiddenEvent);
        }
    },
    
    /**
     * Check if we're switching between accounts and need to reload
     */
    checkForAccountSwitch: function() {
        // Only proceed if authentication system is loaded
        if (typeof AuthenticationSystem === 'undefined' || 
            !AuthenticationSystem.isAuthenticated ||
            !AuthenticationSystem.currentUser) {
            return;
        }
        
        // Check if we have both previous and current login, and they're different
        if (AuthenticationSystem.previousLogin && 
            AuthenticationSystem.currentUser.id &&
            AuthenticationSystem.previousLogin !== AuthenticationSystem.currentUser.id) {
            
            console.log('Account switch detected:', 
                AuthenticationSystem.previousLogin, '→', 
                AuthenticationSystem.currentUser.id);
            
            // Force reload of user progress
            if (typeof AuthenticationSystem.reloadUserProgress === 'function') {
                console.log('Forcing reload of user progress due to account switch');
                
                // Show message that we're reloading
                this.showStatus('Account changed, reloading progress...', 'info');
                
                // Add small delay to ensure UI updates
                setTimeout(() => {
                    AuthenticationSystem.reloadUserProgress(AuthenticationSystem.currentUser.id)
                        .then(success => {
                            if (success) {
                                this.showStatus('Progress reloaded successfully', 'success');
                                
                                // Hide status after a moment
                                setTimeout(() => {
                                    if (this.elements.statusMessage) {
                                        this.elements.statusMessage.textContent = '';
                                    }
                                }, 2000);
                            } else {
                                this.showStatus('Error reloading progress, using defaults', 'warning');
                            }
                        })
                        .catch(error => {
                            console.error('Error during progress reload:', error);
                            this.showStatus('Error reloading progress, using defaults', 'warning');
                        });
                }, 100);
            }
            
            // Clear previous login
            AuthenticationSystem.previousLogin = null;
        }
    },
    
    /**
     * Show status message
     * @param {string} message - Message to display
     * @param {string} type - Message type (info, success, error, warning)
     * @param {boolean} showSpinner - Whether to show a spinner
     */
    showStatus: function(message, type = 'info', showSpinner = true) {
        if (this.elements.statusMessage) {
            // Remove any existing spinner first
            const existingSpinner = document.getElementById('standby-spinner');
            if (existingSpinner) {
                existingSpinner.remove();
            }
            
            this.elements.statusMessage.textContent = message;
            this.elements.statusMessage.className = `standby-status ${type}`;
            
            // Only add spinner if explicitly requested AND no loading screen spinner exists
            if (showSpinner && this.manageSpinners() && message.toLowerCase().includes('connect')) {
                const loadingSpinner = document.createElement('div');
                loadingSpinner.className = 'loading-spinner';
                loadingSpinner.id = 'standby-spinner';
                this.elements.statusMessage.appendChild(loadingSpinner);
            }
        }
    },

    // Add new helper method to manage spinners
    manageSpinners: function() {
        // Always remove any existing standby spinner first
        const existingStandbySpinner = document.getElementById('standby-spinner');
        if (existingStandbySpinner) {
            existingStandbySpinner.remove();
        }

        // Check if loading screen spinner exists
        const loadingScreenSpinner = document.querySelector('#loading-screen .loading-spinner');
        const loadingScreenVisible = document.getElementById('loading-screen') && 
            window.getComputedStyle(document.getElementById('loading-screen')).display !== 'none';

        // Return whether we should show our spinner
        return !loadingScreenVisible || !loadingScreenSpinner;
    }
};

// Initialize standby page on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    StandbyPage.init();
});
