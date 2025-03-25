/**
 * Enhanced WebGL Context Manager
 * Optimized for performance and memory management
 * Helps manage and share WebGL contexts to avoid "too many active WebGL contexts" error
 */

const WebGLContextManager = {
    // Singleton renderer instance
    renderer: null,
    
    // Track which components are using the renderer
    activeUsers: new Set(),
    
    // Track if the renderer is currently in use
    isRendering: false,
    
    // Throttling variables to limit render calls
    lastRenderTime: 0,
    minRenderInterval: 16.67, // ~60fps (16.67ms between frames)
    
    // Memory management
    textureCache: new Map(),
    geometryCache: new Map(),
    materialCache: new Map(),
    memoryWarningThreshold: 500 * 1024 * 1024, // 500MB
    
    // Performance optimization flags
    lowPowerMode: false,
    rendererQuality: 'high', // 'high', 'medium', 'low'
    
    /**
     * Get or create a shared Three.js renderer with optimized settings
     * @param {Object} options - Renderer options
     * @returns {THREE.WebGLRenderer} The shared renderer instance
     */
    getRenderer: function(options = {}) {
        // Create renderer if it doesn't exist
        if (!this.renderer) {
            try {
                // Verify THREE.js is available
                if (typeof THREE === 'undefined') {
                    console.error('THREE.js is not loaded. Cannot create renderer.');
                    return null;
                }
                
                // Default options with safe fallbacks
                const defaultOptions = {
                    antialias: !this.lowPowerMode, // Disable antialiasing in low power mode
                    alpha: true,
                    preserveDrawingBuffer: false,
                    powerPreference: 'high-performance',
                    precision: this.lowPowerMode ? 'mediump' : 'highp',
                    depth: true,
                    stencil: false // Disable stencil buffer if not needed
                };
                
                // Merge options
                const mergedOptions = { ...defaultOptions, ...options };
            
                // Check for WebGL support first
                if (!window.WebGLRenderingContext && !window.WebGL2RenderingContext) {
                    console.error('WebGL not supported by this browser');
                    return null;
                }
                
                // Create the renderer
                this.renderer = new THREE.WebGLRenderer(mergedOptions);
                
                // Apply quality settings
                this.applyQualitySettings();
                
                // Enable shader precision info for debugging
                this.renderer.debug = {
                    checkShaderErrors: true
                };
                
                console.log('Created shared WebGL renderer with optimized settings');
            } catch (error) {
                console.error('Failed to create WebGL renderer:', error);
                // Try to create with fallback options if first attempt failed
                try {
                    const fallbackOptions = {
                        antialias: false,
                        alpha: true,
                        precision: 'mediump',
                        powerPreference: 'default'
                    };
                    this.renderer = new THREE.WebGLRenderer(fallbackOptions);
                    console.log('Created fallback WebGL renderer');
                } catch (fallbackError) {
                    console.error('Failed to create fallback WebGL renderer:', fallbackError);
                    return null;
                }
            }
        }
        
        return this.renderer;
    },
    
    /**
     * Apply quality settings based on current rendererQuality
     */
    applyQualitySettings: function() {
        if (!this.renderer) return;
        
        switch(this.rendererQuality) {
            case 'low':
                this.renderer.setPixelRatio(Math.min(1.0, window.devicePixelRatio));
                this.renderer.shadowMap.enabled = false;
                break;
            case 'medium':
                this.renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.BasicShadowMap;
                break;
            case 'high':
            default:
                this.renderer.setPixelRatio(window.devicePixelRatio);
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                break;
        }
    },
    
    /**
     * Set rendering quality
     * @param {string} quality - 'high', 'medium', or 'low'
     */
    setQuality: function(quality) {
        if (!['high', 'medium', 'low'].includes(quality)) {
            console.warn(`Invalid quality setting: ${quality}. Using 'medium' instead.`);
            quality = 'medium';
        }
        
        this.rendererQuality = quality;
        this.applyQualitySettings();
        
        // Update low power mode based on quality
        this.lowPowerMode = quality === 'low';
        
        console.log(`Renderer quality set to ${quality}`);
    },
    
    /**
     * Register a component as using the renderer
     * @param {string} componentId - Unique identifier for the component
     */
    registerUser: function(componentId) {
        this.activeUsers.add(componentId);
        console.log(`Registered WebGL context user: ${componentId}. Active users: ${this.activeUsers.size}`);
    },
    
    /**
     * Unregister a component from using the renderer
     * @param {string} componentId - Unique identifier for the component
     */
    unregisterUser: function(componentId) {
        this.activeUsers.delete(componentId);
        console.log(`Unregistered WebGL context user: ${componentId}. Active users: ${this.activeUsers.size}`);
        
        // If no more users, dispose the renderer to free memory
        if (this.activeUsers.size === 0 && this.renderer) {
            this.disposeRenderer();
        }
    },
    
    /**
     * Set up the renderer for a specific canvas and size with optimization
     * @param {HTMLCanvasElement} canvas - The canvas to render to
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     */
    setupRenderer: function(canvas, width, height) {
        // Safety checks for parameters
        if (!canvas || !width || !height) {
            console.warn('Invalid parameters for setupRenderer', { canvas, width, height });
            return;
        }
        
        try {
            // Verify THREE.js is available
            if (typeof THREE === 'undefined') {
                console.error('THREE.js is not loaded. Cannot setup renderer.');
                return;
            }
            
            if (!this.renderer) {
                this.getRenderer();
            }
            
            if (!this.renderer) {
                console.warn('Failed to create renderer');
                return;
            }
            
            // Use physical sizing for better performance
            this.renderer.setSize(width, height, false);
            
            // If the canvas is different from the current renderer's canvas
            if (canvas && this.renderer.domElement !== canvas) {
                // Set the canvas dimensions
                canvas.width = width;
                canvas.height = height;
                
            // Store renderer properties before disposing
            const options = {
                canvas: canvas,
                antialias: this.renderer && typeof this.renderer.antialias !== 'undefined' ? this.renderer.antialias : true,
                alpha: this.renderer && typeof this.renderer.alpha !== 'undefined' ? this.renderer.alpha : true,
                preserveDrawingBuffer: this.renderer && typeof this.renderer.preserveDrawingBuffer !== 'undefined' ? this.renderer.preserveDrawingBuffer : false,
                powerPreference: 'high-performance',
                precision: this.lowPowerMode ? 'mediump' : 'highp'
            };
                
                // Dispose the old renderer
                this.disposeRenderer();
                
            try {
                // Create a new renderer with the saved options and explicit canvas
                const newRenderer = new THREE.WebGLRenderer({
                    ...options,
                    canvas: canvas  // Explicitly set canvas
                });
                
                if (newRenderer) {
                    // Dispose the old renderer properly
                    this.disposeRenderer();
                    
                    // Set the new renderer
                    this.renderer = newRenderer;
                    this.renderer.setSize(width, height, false);
                    this.applyQualitySettings();
                    
                    // Verify context is available
                    const gl = this.renderer.getContext();
                    if (!gl) {
                        throw new Error('Failed to get WebGL context');
                    }
                }
            } catch (error) {
                console.error('Error creating WebGL renderer for canvas:', error);
                this.renderer = null;
            }
            }
            
            // Check memory usage and release resources if necessary
            this.checkMemoryUsage();
        } catch (error) {
            console.error('Error in setupRenderer:', error);
        }
    },
    
    /**
     * Begin a render operation with throttling for performance
     * @returns {boolean} True if successful, false if another render is in progress or throttled
     */
    beginRender: function() {
        const now = performance.now();
        
        // Check if we're already rendering
        if (this.isRendering) {
            console.warn('A render operation is already in progress');
            return false;
        }
        
        // Check if we should throttle this render call
        const timeSinceLastRender = now - this.lastRenderTime;
        if (timeSinceLastRender < this.minRenderInterval) {
            // Too soon since last render
            return false;
        }
        
        this.isRendering = true;
        this.lastRenderTime = now;
        return true;
    },
    
    /**
     * End a render operation
     */
    endRender: function() {
        this.isRendering = false;
    },
    
    /**
     * Enable throttling for low power mode
     * @param {boolean} enable - Whether to enable throttling
     * @param {number} fps - Target frames per second (when throttling)
     */
    setThrottling: function(enable, fps = 30) {
        if (enable) {
            // Calculate milliseconds per frame from fps
            this.minRenderInterval = 1000 / fps;
            console.log(`Throttling enabled: ${fps} FPS (${this.minRenderInterval.toFixed(2)}ms per frame)`);
        } else {
            // Disable throttling
            this.minRenderInterval = 0;
            console.log('Throttling disabled');
        }
    },
    
    /**
     * Check memory usage and clear caches if necessary
     */
    checkMemoryUsage: function() {
        if (!performance || !performance.memory) {
            return; // Memory API not available
        }
        
        const usedHeapSize = performance.memory.usedJSHeapSize;
        if (usedHeapSize > this.memoryWarningThreshold) {
            console.warn(`Memory usage high: ${(usedHeapSize / 1024 / 1024).toFixed(2)}MB. Clearing caches.`);
            this.clearCaches();
        }
    },
    
    /**
     * Clear cached resources
     */
    clearCaches: function() {
        // Clear texture cache
        this.textureCache.forEach(texture => {
            if (texture && texture.dispose) {
                texture.dispose();
            }
        });
        this.textureCache.clear();
        
        // Clear geometry cache
        this.geometryCache.forEach(geometry => {
            if (geometry && geometry.dispose) {
                geometry.dispose();
            }
        });
        this.geometryCache.clear();
        
        // Clear material cache
        this.materialCache.forEach(material => {
            if (material && material.dispose) {
                material.dispose();
            }
        });
        this.materialCache.clear();
        
        // Force garbage collection if available (works in some browsers)
        if (window.gc) {
            window.gc();
        }
        
        console.log('Cleared WebGL resource caches');
    },
    
    /**
     * Cache a texture for reuse
     * @param {string} key - Cache key
     * @param {THREE.Texture} texture - Texture to cache
     */
    cacheTexture: function(key, texture) {
        if (this.textureCache.has(key)) {
            const existingTexture = this.textureCache.get(key);
            if (existingTexture !== texture && existingTexture.dispose) {
                existingTexture.dispose();
            }
        }
        this.textureCache.set(key, texture);
    },
    
    /**
     * Get a cached texture
     * @param {string} key - Cache key
     * @returns {THREE.Texture|null} The cached texture or null if not found
     */
    getCachedTexture: function(key) {
        return this.textureCache.get(key) || null;
    },
    
    /**
     * Cache a geometry for reuse
     * @param {string} key - Cache key
     * @param {THREE.BufferGeometry} geometry - Geometry to cache
     */
    cacheGeometry: function(key, geometry) {
        if (this.geometryCache.has(key)) {
            const existingGeometry = this.geometryCache.get(key);
            if (existingGeometry !== geometry && existingGeometry.dispose) {
                existingGeometry.dispose();
            }
        }
        this.geometryCache.set(key, geometry);
    },
    
    /**
     * Get a cached geometry
     * @param {string} key - Cache key
     * @returns {THREE.BufferGeometry|null} The cached geometry or null if not found
     */
    getCachedGeometry: function(key) {
        return this.geometryCache.get(key) || null;
    },
    
    /**
     * Check if the context has been lost
     * @returns {boolean} True if context is lost, false otherwise
     */
    isContextLost: function() {
        try {
            if (!this.renderer) {
                return true;
            }
            // Use getContext() instead of accessing .context directly
            const gl = this.renderer.getContext();
            return gl ? gl.isContextLost() : true;
        } catch (error) {
            console.error("Error checking context status:", error);
            return true; // Assume context is lost if there's an error
        }
    },
    
    /**
     * Attempt to restore a lost context
     * @returns {boolean} True if successfully restored, false otherwise
     */
    restoreContext: function() {
        if (!this.isContextLost()) {
            return true; // Context is not lost, nothing to do
        }
        
        // Dispose the current renderer
        this.disposeRenderer();
        
        // Clear all caches
        this.clearCaches();
        
        // Create a new renderer
        this.renderer = null;
        this.getRenderer();
        
        // Apply quality settings
        if (this.renderer) {
            this.applyQualitySettings();
        }
        
        return this.renderer != null;
    },
    
    /**
     * Dispose the renderer and clean up resources
     */
    disposeRenderer: function() {
        if (this.renderer) {
            console.log('Disposing WebGL renderer');
            
            // Dispose any cached resources
            this.clearCaches();
            
            // Dispose renderer
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            this.renderer = null;
        }
    },
    
    /**
     * Auto-adjust quality based on performance
     */
    autoAdjustQuality: function() {
        // Check if we have access to performance metrics
        if (!window.performance || !window.performance.memory) {
            console.warn('Performance API not fully supported, cannot auto-adjust quality');
            return;
        }
        
        const fps = this.calculateFPS();
        const memoryUsage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit;
        
        console.log(`Auto-adjusting quality - Current FPS: ${fps.toFixed(1)}, Memory usage: ${(memoryUsage * 100).toFixed(1)}%`);
        
        // Adjust based on performance metrics
        if (fps < 30 || memoryUsage > 0.8) {
            // Poor performance, reduce quality
            if (this.rendererQuality === 'high') {
                this.setQuality('medium');
            } else if (this.rendererQuality === 'medium') {
                this.setQuality('low');
            }
        } else if (fps > 55 && memoryUsage < 0.5) {
            // Good performance, can increase quality
            if (this.rendererQuality === 'low') {
                this.setQuality('medium');
            } else if (this.rendererQuality === 'medium') {
                this.setQuality('high');
            }
        }
    },
    
    // FPS tracking
    _frameCount: 0,
    _lastFpsUpdate: 0,
    _currentFps: 60,
    
    /**
     * Calculate current FPS
     * @returns {number} Current frames per second
     */
    calculateFPS: function() {
        const now = performance.now();
        this._frameCount++;
        
        // Update FPS approximately once per second
        if (now - this._lastFpsUpdate >= 1000) {
            this._currentFps = (this._frameCount * 1000) / (now - this._lastFpsUpdate);
            this._frameCount = 0;
            this._lastFpsUpdate = now;
        }
        
        return this._currentFps;
    }
};
