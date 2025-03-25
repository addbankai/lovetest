/**
 * Loading Screen System for the Cyberpunk MMORPG game
 * Handles loading screen display and initialization sequence management
 */

const LoadingScreen = {
    // Add background images array
    backgroundImages: [
        'img/loadingbg.png',
        'img/loadingbg2.png',
        'img/loadingbg3.png',
        'img/loadingbg4.png'
    ],
    
    // State
    isVisible: false,
    progress: 0,
    maxProgress: 100,
    message: 'Loading game...',
    steps: [],
    currentStep: 0,
    
    // Elements
    container: null,
    progressBar: null,
    messageEl: null,
    
    // Flag to track if authentication is complete
    authenticationComplete: false,
    
    /**
     * Initialize the loading screen
     */
    init: function() {
        console.log('Initializing Loading Screen...');
        
        // Create loading screen container if it doesn't exist
        if (!document.getElementById('loading-screen')) {
            this.createLoadingScreen();
        }
        
        // Get references to elements
        this.container = document.getElementById('loading-screen');
        this.progressBar = document.getElementById('loading-progress-bar');
        this.messageEl = document.getElementById('loading-message');
        
        // Listen for authentication completion events
        this.setupAuthenticationListener();
        
        // Set up initialization steps
        this.setupInitSteps();
        
        // Show loading screen
        this.show();
        
        // Start initialization sequence
        this.startInitSequence().catch(error => {
            console.error('Initialization sequence failed:', error);
            this.showError('Game initialization failed. Please refresh the page.');
        });
        
        console.log('Loading Screen initialized');
    },
    
    /**
     * Setup authentication event listeners
     */
    setupAuthenticationListener: function() {
        // Track if authentication is already handled
        let authHandled = false;
        
        // Listen for auth state change events
        window.addEventListener('authStateChanged', (event) => {
            console.log('Auth state changed during loading:', event.detail);
            if (event.detail && event.detail.isAuthenticated && !authHandled) {
                authHandled = true;
                this.authenticationComplete = true;
                console.log('Authentication completed during loading sequence');
            }
        });
        
        // Wait for standby overlay to be hidden (which means authentication is done)
        document.addEventListener('standbyOverlayHidden', () => {
            if (!authHandled) {
                authHandled = true;
                console.log('Standby overlay hidden, marking authentication as complete');
                this.authenticationComplete = true;
            }
        });
        
        // Mark authentication as complete immediately if we're already authenticated
        if (typeof AuthenticationSystem !== 'undefined' && AuthenticationSystem.isUserAuthenticated()) {
            console.log('User already authenticated at loading screen init');
            authHandled = true;
            this.authenticationComplete = true;
        }
    },
    
    /**
     * Create loading screen elements
     */
    createLoadingScreen: function() {
        // Create container
        const container = document.createElement('div');
        container.id = 'loading-screen';
        container.className = 'loading-screen';
        
        // Set random background
        const randomBg = this.getRandomBackground();
        container.style.backgroundImage = `url(${randomBg})`;
        
        // Create content
        container.innerHTML = `
            <div class="loading-content">
                <h1 class="loading-title">LOVELACE<span>VERSE</span></h1>
                <div class="loading-subtitle">Cyberpunk MMORPG</div>
                
                <div class="loading-progress-container">
                    <div id="loading-progress-bar" class="loading-progress-bar"></div>
                </div>
                
                <div id="loading-message" class="loading-message">Initializing game systems...</div>
                
                <div id="loading-error" class="loading-error" style="display: none;"></div>
                
                <div class="loading-tips">
                    <p>TIP: Connect a Cardano wallet to save your progress across devices.</p>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(container);
    },
    
    /**
     * Add method to get random background
     */
    getRandomBackground: function() {
        const randomIndex = Math.floor(Math.random() * this.backgroundImages.length);
        return this.backgroundImages[randomIndex];
    },
    
    /**
     * Set up initialization steps
     * Each step has a function to execute and a message to display
     */
    setupInitSteps: function() {
        this.steps = [
            {
                name: 'utilities',
                message: 'Loading utility functions...',
                weight: 5,
                execute: () => {
                    // Utils is already loaded via script tags
                    return Promise.resolve();
                }
            },
            {
                name: 'assets',
                message: 'Loading game assets...',
                weight: 15,
                execute: () => {
                    // Preload critical assets (images, CSS)
                    return this.preloadAssets();
                }
            },
            {
                name: 'authentication',
                message: 'Setting up authentication...',
                weight: 20,
                execute: () => {
                    // Initialize authentication system
                    if (typeof AuthenticationSystem !== 'undefined' && typeof AuthenticationSystem.init === 'function') {
                        return AuthenticationSystem.init().catch(error => {
                            console.warn('Auth initialization error, continuing in offline mode:', error);
                            // Don't fail the loading - we'll handle auth in offline mode
                            return Promise.resolve();
                        });
                    }
                    return Promise.resolve();
                }
            },
            {
                name: 'waitForAuth',
                message: 'Waiting for authentication to complete...',
                weight: 10,
                execute: () => {
                    // Wait for authentication to complete before proceeding
                    return new Promise((resolve) => {
                        // If authentication is already complete, resolve immediately
                        if (this.authenticationComplete) {
                            console.log('Authentication already complete, skipping wait');
                            return resolve();
                        }
                        
                        // Check for direct authentication state first
                        if (typeof AuthenticationSystem !== 'undefined' && AuthenticationSystem.isUserAuthenticated()) {
                            console.log('User already authenticated via direct check, skipping wait');
                            this.authenticationComplete = true;
                            return resolve();
                        }
                        
                        console.log('Waiting for authentication to complete...');
                        
                        // Set a timeout to prevent getting stuck, but use a shorter timeout
                        const timeoutId = setTimeout(() => {
                            console.warn('Authentication wait timed out after 10 seconds');
                            // Even if we time out, try to continue with whatever auth state we have
                            if (typeof AuthenticationSystem !== 'undefined') {
                                const isAuthed = AuthenticationSystem.isUserAuthenticated();
                                console.log('Final auth check before proceeding:', isAuthed ? 'authenticated' : 'not authenticated');
                            }
                            resolve();
                        }, 10000); // Reduced from 20s to 10s
                        
                        // Check periodically if auth is complete
                        const checkInterval = setInterval(() => {
                            if (this.authenticationComplete) {
                                clearTimeout(timeoutId);
                                clearInterval(checkInterval);
                                console.log('Authentication completed, continuing with game load');
                                resolve();
                            }
                            
                            // Also do a direct check on the auth system
                            if (typeof AuthenticationSystem !== 'undefined' && AuthenticationSystem.isUserAuthenticated()) {
                                clearTimeout(timeoutId);
                                clearInterval(checkInterval);
                                this.authenticationComplete = true;
                                console.log('Authentication verified via direct check, continuing');
                                resolve();
                            }
                        }, 250); // Check more frequently (was 500ms)
                        
                        // Also listen for auth events directly
                        const authHandler = (event) => {
                            if (event.detail && event.detail.isAuthenticated) {
                                clearTimeout(timeoutId);
                                clearInterval(checkInterval);
                                window.removeEventListener('authStateChanged', authHandler);
                                console.log('Auth event detected, continuing with game load');
                                resolve();
                            }
                        };
                        
                        // Add auth state change listener
                        window.addEventListener('authStateChanged', authHandler);
                    });
                }
            },
            {
                name: 'gameInitCore',
                message: 'Loading core game systems...',
                weight: 25,
                execute: () => {
                    return new Promise((resolve) => {
                        // Check if Game object exists and wait if needed
                        const checkGame = () => {
                            if (typeof Game !== 'undefined') {
                                try {
                                    Game.init();
                                    resolve();
                                } catch (error) {
                                    console.warn('Error initializing game core:', error);
                                    resolve(); // Continue loading even if there's an error
                                }
                            } else {
                                // Wait and check again
                                setTimeout(checkGame, 100);
                            }
                        };
                        checkGame();
                    });
                }
            },
            {
                name: 'webgl',
                message: 'Setting up 3D rendering...',
                weight: 15,
                execute: () => {
                    // Any WebGL initialization would go here
                    return new Promise(resolve => {
                        // Simulate WebGL initialization time
                        setTimeout(resolve, 500);
                    });
                }
            },
            {
                name: 'finalization',
                message: 'Finalizing game setup...',
                weight: 10,
                execute: () => {
                    return new Promise(resolve => {
                        // Final setup tasks and verification
                        setTimeout(resolve, 300);
                    });
                }
            }
        ];
        
        // Calculate total weight
        this.maxProgress = this.steps.reduce((total, step) => total + step.weight, 0);
    },
    
    /**
     * Start the initialization sequence
     * Executes each step in order
     */
    startInitSequence: async function() {
        console.log('Starting game initialization sequence...');
        this.progress = 0;
        this.currentStep = 0;
        this.updateProgressBar();
        
        // Execute each step in sequence
        for (let i = 0; i < this.steps.length; i++) {
            this.currentStep = i;
            const step = this.steps[i];
            
            // Update message
            this.setMessage(step.message);
            
            try {
                // Execute step function
                console.log(`Executing step: ${step.name}`);
                await step.execute();
                
                // Update progress
                this.progress += step.weight;
                this.updateProgressBar();
            } catch (error) {
                console.error(`Error in initialization step '${step.name}':`, error);
                
                // Don't break the sequence for non-critical errors
                if (step.name === 'authentication' || step.name === 'assets' || step.name === 'waitForAuth') {
                    console.warn(`Continuing despite error in non-critical step: ${step.name}`);
                    this.progress += step.weight;
                    this.updateProgressBar();
                } else {
                    // Show error message but continue anyway
                    this.showWarning(`Warning: Some features may be unavailable. Error in ${step.name}: ${error.message}`);
                    
                    // Still increment progress
                    this.progress += step.weight;
                    this.updateProgressBar();
                }
            }
            
            // Small delay between steps for smoother visual progression
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('Initialization sequence completed');
        
        // Complete loading and hide loading screen
        this.progress = this.maxProgress;
        this.updateProgressBar();
        this.setMessage('Game ready!');
        
        // Delay before hiding loading screen for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
        this.hide();
    },
    
    /**
     * Show the loading screen
     */
    show: function() {
        if (this.container) {
            this.container.style.display = 'flex';
            this.isVisible = true;
        }
    },
    
    /**
     * Hide the loading screen
     */
    hide: function() {
        if (this.container) {
            // Add fade-out animation
            this.container.classList.add('fade-out');
            
            // Remove after animation completes
            setTimeout(() => {
                this.container.style.display = 'none';
                this.container.classList.remove('fade-out');
                this.isVisible = false;
                
                // Fire an event that loading is complete
                document.dispatchEvent(new CustomEvent('loadingComplete'));
            }, 600); // Slightly longer than animation duration
        }
    },
    
    /**
     * Update the progress bar
     */
    updateProgressBar: function() {
        if (this.progressBar) {
            const percentage = (this.progress / this.maxProgress) * 100;
            this.progressBar.style.width = `${percentage}%`;
        }
    },
    
    /**
     * Set the loading message
     * @param {string} message - Message to display
     */
    setMessage: function(message) {
        this.message = message;
        if (this.messageEl) {
            this.messageEl.textContent = message;
        }
    },
    
    /**
     * Show an error message
     * @param {string} error - Error message to display
     */
    showError: function(error) {
        const errorEl = document.getElementById('loading-error');
        if (errorEl) {
            errorEl.textContent = error;
            errorEl.style.display = 'block';
        }
    },
    
    /**
     * Show a warning message
     * @param {string} warning - Warning message to display
     */
    showWarning: function(warning) {
        const errorEl = document.getElementById('loading-error');
        if (errorEl) {
            errorEl.textContent = warning;
            errorEl.style.display = 'block';
            errorEl.className = 'loading-error warning';
        }
    },
    
    /**
     * Preload critical game assets
     * @returns {Promise} Promise that resolves when assets are loaded
     */
    preloadAssets: function() {
        return new Promise((resolve) => {
            console.log('Preloading critical assets...');
            
            // Critical assets to preload
            const criticalAssets = [
                // Character sprites
                'img/chad.png',
                'img/chadattack.png',
                'img/devin.png',
                'img/devinattack.png',
                'img/devinidle.png',
                
                // Map backgrounds
                'img/neon_district.png',
                'img/corporate_plaza.png',
                
                // Weapon images
                'img/items/plasma_pistol.png',
                'img/items/cyber_blade.png',
                
                // Thumbnail images
                'img/thumbnail/chad.png',
                'img/thumbnail/devin.png'
            ];
            
            // Secondary assets to preload if time permits
            const secondaryAssets = [
                // Additional map backgrounds
                'img/data_nexus.png',
                'img/quantum_void.png',
                
                // Additional character animations
                'img/chadidle.png',
                'img/chadmagic.png',
                'img/chadranged.png',
                'img/chadsit.png',
                'img/devinmagic.png',
                'img/devinranged.png',
                'img/devinsit.png',
                
                // Gacha images
                'img/gacha/mortal.png',
                'img/gacha/synthetic.png',
                'img/gacha/divine.png'
            ];
            
            let loaded = 0;
            const totalAssets = criticalAssets.length;
            let secondaryLoaded = 0;
            
            // Function to update progress
            const updateProgress = (isPrimary = true) => {
                if (isPrimary) {
                    loaded++;
                    this.setMessage(`Loading assets (${loaded}/${totalAssets})...`);
                } else {
                    secondaryLoaded++;
                }
                
                // Update loading percentage (only based on critical assets)
                const percentage = Math.min(100, Math.round((loaded / totalAssets) * 100));
                if (this.progressBar) {
                    this.progressBar.style.width = `${percentage}%`;
                }
                
                // Check if all critical assets are loaded
                if (loaded >= totalAssets) {
                    console.log(`Loaded ${loaded} critical assets and ${secondaryLoaded} secondary assets`);
                    resolve();
                }
            };
            
            // Preload critical assets first
            criticalAssets.forEach(asset => {
                this.preloadAsset(asset, () => updateProgress(true));
            });
            
            // Preload secondary assets in the background (don't block loading completion)
            secondaryAssets.forEach(asset => {
                this.preloadAsset(asset, () => updateProgress(false));
            });
            
            // Safeguard: if no assets to load, resolve immediately
            if (totalAssets === 0) {
                console.log('No critical assets to preload');
                resolve();
            }
        });
    },
    
    /**
     * Preload a single asset
     * @param {string} src - Asset source path
     * @param {Function} callback - Callback on load complete
     */
    preloadAsset: function(src, callback) {
        const extension = src.split('.').pop().toLowerCase();
        
        // Handle different asset types
        switch(extension) {
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                this.preloadImage(src, callback);
                break;
                
            case 'mp3':
            case 'wav':
            case 'ogg':
                this.preloadAudio(src, callback);
                break;
                
            case 'css':
                this.preloadCSS(src, callback);
                break;
                
            default:
                // For unknown types, just call callback
                setTimeout(callback, 10);
        }
    },
    
    /**
     * Preload an image file
     */
    preloadImage: function(src, callback) {
        const img = new Image();
        img.onload = callback;
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            callback(); // Still call callback on error to continue loading
        };
        img.src = src;
    },
    
    /**
     * Preload an audio file
     */
    preloadAudio: function(src, callback) {
        const audio = new Audio();
        audio.oncanplaythrough = callback;
        audio.onerror = () => {
            console.warn(`Failed to load audio: ${src}`);
            callback(); // Still call callback on error
        };
        audio.src = src;
        audio.load();
    },
    
    /**
     * Preload a CSS file
     */
    preloadCSS: function(href, callback) {
        // Skip if the stylesheet is already loaded
        if (document.querySelector(`link[href="${href}"]`)) {
            callback();
            return;
        }
        
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = callback;
        link.onerror = () => {
            console.warn(`Failed to load CSS: ${href}`);
            callback(); // Still call callback on error
        };
        
        document.head.appendChild(link);
    }
};

// Initialize the loading screen when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LoadingScreen.init();
});
