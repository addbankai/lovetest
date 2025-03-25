/**
 * Cyberpunk-themed Preloader System
 * Loads game assets and displays loading progress
 */

const PreloaderSystem = {
    /**
     * Assets to preload (images, videos, scripts, etc.)
     */
    assets: [
        // Only preload CSS and media files, not JS (to avoid duplicate declarations)
        // CSS Files
        'css/style.css',
        'css/modal.css',
        'css/character.css',
        'css/character-enhanced.css',
        'css/character-panel.css',
        'css/gacha.css',
        'css/gacha-enhanced.css',
        'css/marketplace.css',
        'css/dungeon-modal.css',
        'css/cyberpunk-dungeon-modal.css',
        'css/cyberpunk-buttons-css.css',
        'css/preloader.css',
        
        // Images (sample - add more as needed)
        'img/gacha/mortal.png',
        'img/gacha/synthetic.png',
        'img/gacha/divine.png',
        'img/thumbnail/chad.png',
        'img/thumbnail/devin.png',
        'img/items/plasma_pistol.png',
        'img/items/cyber_blade.png',
        'img/items/quantum_shield.png',
        'img/items/neural_implant.png',
        'img/items/chrono_amulet.png',
        'img/items/synth_vest.png',
        'img/items/circuit_board.png',
        'img/items/energy_drink.png',
        'img/items/scrap_metal.png',
        'img/items/health_stim.png',
        
        // Character sprites
        'img/chad.png',
        'img/chadattack.png',
        'img/chadattack22.png',
        'img/chadidle.png',
        'img/chadmagic.png',
        'img/chadranged.png',
        'img/chadsit.png',
        'img/devin.png',
        'img/devinattack.png',
        'img/devinattack22.png',
        'img/devindead.png',
        'img/devinidle.png',
        'img/devinmagic.png',
        'img/devinranged.png',
        'img/devinsit.png',
        
        // Map backgrounds
        'img/neon_district.png',
        'img/corporate_plaza.png',
        'img/data_nexus.png',
        'img/quantum_void.png',
        
        // Add loading backgrounds to preload list
        'img/loadingbg.png',
        'img/loadingbg2.png',
        'img/loadingbg3.png',
        'img/loadingbg4.png'
    ],
    
    // Track loading progress
    totalAssets: 0,
    loadedAssets: 0,
    
    // Digital rain character set
    rainCharacters: '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
    rainDrops: [],
    
    /**
     * Initialize the preloader system
     */
    init: function() {
        console.log('Initializing preloader system...');
        
        // Create preloader HTML structure
        this.createPreloader();
        
        // Initialize digital rain
        this.initDigitalRain();
        
        // Track total assets to load
        this.totalAssets = this.assets.length;
        
        // Start preloading assets
        this.preloadAssets();
    },
    
    /**
     * Create preloader HTML structure
     */
    createPreloader: function() {
        const preloader = document.createElement('div');
        preloader.id = 'preloader';
        
        // Create background elements
        const background = document.createElement('div');
        background.className = 'preloader-background';
        
        const grid = document.createElement('div');
        grid.className = 'preloader-grid';
        background.appendChild(grid);
        
        const digitalRain = document.createElement('div');
        digitalRain.className = 'preloader-digital-rain';
        background.appendChild(digitalRain);
        
        preloader.appendChild(background);
        
        // Create title
        const title = document.createElement('h1');
        title.className = 'preloader-title';
        title.textContent = 'LovelaceVerse';
        preloader.appendChild(title);
        
        // Create progress bar
        const progressContainer = document.createElement('div');
        progressContainer.className = 'preloader-progress-container';
        
        const progressBar = document.createElement('div');
        progressBar.className = 'preloader-progress-bar';
        progressContainer.appendChild(progressBar);
        
        preloader.appendChild(progressContainer);
        
        // Create status text
        const status = document.createElement('div');
        status.className = 'preloader-status';
        status.textContent = 'Loading...';
        preloader.appendChild(status);
        
        // Create loading indicator
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'loading-indicator';
        
        // Add 8 dots for the spinner
        for (let i = 0; i < 8; i++) {
            const dot = document.createElement('span');
            loadingIndicator.appendChild(dot);
        }
        
        preloader.appendChild(loadingIndicator);
        
        // Add to document
        document.body.appendChild(preloader);
        
        // Store references
        this.preloader = preloader;
        this.progressBar = progressBar;
        this.statusText = status;
        this.digitalRain = digitalRain;
    },
    
    /**
     * Initialize digital rain effect
     */
    initDigitalRain: function() {
        const containerWidth = window.innerWidth;
        const numDrops = Math.floor(containerWidth / 20); // One drop approximately every 20px
        
        for (let i = 0; i < numDrops; i++) {
            const drop = document.createElement('span');
            
            // Random properties for each rain drop
            const x = Math.random() * containerWidth;
            const delay = Math.random() * 5; // 0-5s delay
            const duration = 5 + Math.random() * 10; // 5-15s duration
            const fontSize = 10 + Math.floor(Math.random() * 14); // 10-24px font size
            
            // Random character string for this drop
            const chars = [];
            const length = 5 + Math.floor(Math.random() * 15); // 5-20 characters
            for (let j = 0; j < length; j++) {
                chars.push(this.rainCharacters.charAt(Math.floor(Math.random() * this.rainCharacters.length)));
            }
            
            drop.textContent = chars.join('');
            drop.style.left = `${x}px`;
            drop.style.fontSize = `${fontSize}px`;
            drop.style.animationDuration = `${duration}s`;
            drop.style.animationDelay = `${delay}s`;
            
            this.digitalRain.appendChild(drop);
            this.rainDrops.push(drop);
        }
        
        // Start animation cycle
        this.animateDigitalRain();
    },
    
    /**
     * Animate digital rain - randomize characters
     */
    animateDigitalRain: function() {
        setInterval(() => {
            this.rainDrops.forEach(drop => {
                // 15% chance to change a character
                if (Math.random() < 0.15) {
                    const chars = drop.textContent.split('');
                    const pos = Math.floor(Math.random() * chars.length);
                    chars[pos] = this.rainCharacters.charAt(Math.floor(Math.random() * this.rainCharacters.length));
                    drop.textContent = chars.join('');
                }
            });
        }, 200);
    },
    
    /**
     * Preload all game assets
     */
    preloadAssets: function() {
        const startTime = Date.now();
        let loadedCount = 0;
        
        // Function to update progress
        const updateProgress = () => {
            loadedCount++;
            const percent = Math.min(100, Math.round((loadedCount / this.totalAssets) * 100));
            
            // Update progress bar
            this.progressBar.style.width = `${percent}%`;
            
            // Update status text with current asset info
            const currentAsset = this.assets[loadedCount - 1] || '';
            const assetName = currentAsset.split('/').pop();
            
            if (currentAsset) {
                this.statusText.textContent = `Loading: ${assetName} (${percent}%)`;
            }
            
            // Check if all assets are loaded
            if (loadedCount >= this.totalAssets) {
                // Calculate load time
                const loadTime = (Date.now() - startTime) / 1000;
                this.statusText.textContent = `Load complete in ${loadTime.toFixed(2)}s`;
                
                // Show 100% for a moment, then hide preloader
                setTimeout(() => {
                    // Fade out preloader
                    this.preloader.classList.add('hidden');
                    
                    // Remove from DOM after transition
                    setTimeout(() => {
                        this.preloader.remove();
                        console.log('Preloader removed, game ready');
                    }, 500);
                }, 1000);
            }
        };
        
        // Load each asset
        this.assets.forEach(asset => {
            const extension = asset.split('.').pop().toLowerCase();
            
            // Handle different asset types
            switch(extension) {
                case 'png':
                case 'jpg':
                case 'jpeg':
                case 'gif':
                case 'svg':
                    this.preloadImage(asset, updateProgress);
                    break;
                    
                case 'mp4':
                case 'webm':
                case 'ogg':
                    this.preloadVideo(asset, updateProgress);
                    break;
                    
                case 'js':
                    this.preloadScript(asset, updateProgress);
                    break;
                    
                case 'css':
                    this.preloadCSS(asset, updateProgress);
                    break;
                    
                default:
                    // For unknown types, just call update
                    setTimeout(updateProgress, 50);
            }
        });
    },
    
    /**
     * Preload an image file
     */
    preloadImage: function(src, callback) {
        const img = new Image();
        img.onload = callback;
        img.onerror = callback; // Still call callback on error to continue loading
        img.src = src;
    },
    
    /**
     * Preload a video file
     */
    preloadVideo: function(src, callback) {
        const video = document.createElement('video');
        
        // Some videos might have multiple sources
        const videoSrc = document.createElement('source');
        videoSrc.src = src;
        video.appendChild(videoSrc);
        
        // Assign event handlers before setting attributes
        video.onloadeddata = callback;
        video.onerror = callback; // Still call callback on error
        
        // Set video attributes
        video.preload = 'auto';
        video.style.display = 'none';
        video.load();
    },
    
    /**
     * Preload a JavaScript file
     */
    preloadScript: function(src, callback) {
        // Skip preloader.js (this file)
        if (src === 'js/preloader.js') {
            callback();
            return;
        }
        
        const script = document.createElement('script');
        script.onload = callback;
        script.onerror = callback; // Still call callback on error
        script.src = src;
        
        // Add to head to load but not execute (defer)
        document.head.appendChild(script);
    },
    
    /**
     * Preload a CSS file
     */
    preloadCSS: function(href, callback) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = callback;
        link.onerror = callback; // Still call callback on error
        
        document.head.appendChild(link);
    }
};

// Start preloader when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    PreloaderSystem.init();
});
