/**
 * Resolution handler for the Cyberpunk MMORPG game
 * Ensures consistent game display across different devices and prevents zooming
 */

const ResolutionHandler = {
    // Base resolution for the game (16:9 aspect ratio)
    baseWidth: 1280,
    baseHeight: 720,
    
    // Current scale factor
    currentScale: 1,
    
    // Elements that need to maintain absolute positioning
    absoluteElements: ['#characters-container', '#monsters-container', '#items-container'],
    
    /**
     * Initialize the resolution handler
     */
    init: function() {
        // Apply initial scaling
        this.adjustResolution();
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            this.adjustResolution();
        });
        
        // Prevent zoom events
        this.preventZoom();
        
        console.log("Resolution handler initialized");
    },
    
    /**
     * Adjust the game resolution to match the current viewport
     */
    adjustResolution: function() {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };
        
        // Calculate the scale factor based on the viewport size
        const scaleX = viewport.width / this.baseWidth;
        const scaleY = viewport.height / this.baseHeight;
        
        // Use the smaller scale factor to ensure the game fits within the viewport
        this.currentScale = Math.min(scaleX, scaleY);
        
        // Apply scaling to absolute elements
        this.applyScalingToElements();
    },
    
    /**
     * Apply scaling to elements that need to maintain their position
     */
    applyScalingToElements: function() {
        console.log("Adjusting resolution with scale:", this.currentScale);
        
        // We'll use a more gentle approach than completely resizing the container
        // Instead, just add a CSS class to the body with proper browser protections
        document.body.classList.add('zoom-protected');
        
        // Update the game world size but don't manipulate the entire container
        // which could be causing character visibility problems
        const gameWorld = document.getElementById('game-world');
        if (gameWorld) {
            gameWorld.style.width = '100vw';
            gameWorld.style.height = 'calc(100vh - 80px)'; // Subtract UI height
        }
        
        // Log character elements to help debug
        const characters = document.querySelectorAll('.character-sprite');
        console.log("Character elements found:", characters.length);
        
        // Make sure characters are visible by updating their z-index and other properties
        characters.forEach(char => {
            char.style.zIndex = "10"; // Make sure they're above everything
            char.style.opacity = "1"; // Make sure they're visible
        });
    },
    
    /**
     * Prevent zoom events
     */
    preventZoom: function() {
        // Add viewport meta tag with user-scalable=no
        let metaTag = document.querySelector('meta[name="viewport"]');
        if (!metaTag) {
            metaTag = document.createElement('meta');
            metaTag.name = 'viewport';
            document.head.appendChild(metaTag);
        }
        metaTag.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        
        // Prevent pinch zoom on mobile
        document.addEventListener('touchmove', function(event) {
            if (event.touches.length > 1) {
                event.preventDefault();
            }
        }, { passive: false });
        
        // Prevent Ctrl+mousewheel zoom
        document.addEventListener('wheel', function(event) {
            if (event.ctrlKey) {
                event.preventDefault();
            }
        }, { passive: false });
        
        // Prevent keyboard shortcuts for zoom
        document.addEventListener('keydown', function(event) {
            // Prevent Ctrl++ and Ctrl+-
            if (event.ctrlKey && (event.key === '+' || event.key === '-' || event.key === '=')) {
                event.preventDefault();
            }
        });
        
        // Override browser zoom behavior (experimental)
        window.addEventListener('resize', function() {
            // Force repaint to prevent zoom artifacts
            document.body.style.display = 'none';
            setTimeout(function() {
                document.body.style.display = '';
            }, 0);
        });
        
        // Add CSS to handle fixed positioning
        const style = document.createElement('style');
        style.textContent = `
            #game-container {
                transform-origin: top left;
                overflow: hidden;
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
            }
            
            #map-container, #characters-container, #monsters-container, #items-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                transform-origin: top left;
            }
            
            .map-background-segment {
                position: absolute;
                top: 0;
                height: 100%;
                max-width: none;
            }
            
            @media screen and (max-width: 768px) {
                #game-ui {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    z-index: 1000;
                }
            }
        `;
        document.head.appendChild(style);
    },
    
    /**
     * Get the current scale factor
     * @returns {number} Current scale factor
     */
    getScale: function() {
        return this.currentScale;
    },
    
    /**
     * Convert screen coordinates to game coordinates
     * @param {number} x - Screen X coordinate
     * @param {number} y - Screen Y coordinate
     * @returns {Object} Game coordinates {x, y}
     */
    screenToGameCoords: function(x, y) {
        // Calculate the offset of the game container
        const gameContainer = document.getElementById('game-container');
        const rect = gameContainer.getBoundingClientRect();
        
        // Convert screen coordinates to game coordinates
        return {
            x: (x - rect.left) / this.currentScale,
            y: (y - rect.top) / this.currentScale
        };
    },
    
    /**
     * Convert game coordinates to screen coordinates
     * @param {number} x - Game X coordinate
     * @param {number} y - Game Y coordinate
     * @returns {Object} Screen coordinates {x, y}
     */
    gameToScreenCoords: function(x, y) {
        // Calculate the offset of the game container
        const gameContainer = document.getElementById('game-container');
        const rect = gameContainer.getBoundingClientRect();
        
        // Convert game coordinates to screen coordinates
        return {
            x: (x * this.currentScale) + rect.left,
            y: (y * this.currentScale) + rect.top
        };
    }
};

// Initialize on load
window.addEventListener('load', function() {
    ResolutionHandler.init();
});
