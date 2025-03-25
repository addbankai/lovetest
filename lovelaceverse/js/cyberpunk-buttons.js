/**
 * Cyberpunk-themed 3D Buttons using Three.js
 * Creates immersive, futuristic button effects for UI elements
 */

const CyberpunkButtons = {
    // Track all button instances
    buttons: {},
    
    // Color schemes for cyberpunk theme
    colors: {
        neon: {
            cyan: 0x00f7ff,
            magenta: 0xff00ff,
            blue: 0x0066ff,
            purple: 0x9900ff,
            green: 0x00ff66,
            yellow: 0xffee00
        },
        dark: {
            base: 0x000d1f,
            accent: 0x0a1a2f
        }
    },
    
    /**
     * Initialize the CyberpunkButtons system
     */
    init: function() {
        console.log('Initializing Cyberpunk Buttons system...');
        
        // Check for THREE global
        if (typeof THREE === 'undefined') {
            console.warn('THREE.js not loaded, attempting to use window.THREE');
            if (typeof window.THREE !== 'undefined') {
                THREE = window.THREE;
            } else {
                console.error('THREE.js not available');
                // Try to manually inject Three.js if not loaded yet
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                script.onload = () => {
                    console.log('THREE.js manually loaded');
                    // Wait a brief moment to ensure THREE.js is fully initialized
                    setTimeout(() => {
                        this.init(); // Try initialization again
                    }, 100);
                };
                document.head.appendChild(script);
                return false;
            }
        }
        
        // Verify WebGL support
        if (!this.checkWebGLSupport()) {
            console.error('WebGL not supported in this browser');
            return false;
        }
        
        this.applyGlobalStyles();
        
        // Find all buttons to enhance
        this.enhanceAllButtons();
        
        // Start animation loop
        this.animate();
        
        // Set up mutation observer to catch dynamically added buttons
        this.setupMutationObserver();
        
        console.log(`Initialized ${Object.keys(this.buttons).length} cyberpunk buttons`);
        return true;
    },
    
    /**
     * Check if WebGL is supported in the browser
     * @returns {boolean} True if WebGL is supported
     */
    checkWebGLSupport: function() {
        try {
            const canvas = document.createElement('canvas');
            return !!(
                window.WebGLRenderingContext &&
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
            );
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Apply global styles needed for buttons
     */
    applyGlobalStyles: function() {
        // Add global styles if not already present
        if (!document.getElementById('cyberpunk-button-styles')) {
            const styleElement = document.createElement('style');
            styleElement.id = 'cyberpunk-button-styles';
            styleElement.textContent = `
                .cyberpunk-button, .menu-button, .gacha-pull-button, .buff-button, .inventory-tab, .enter-dungeon-button {
                    position: relative;
                    overflow: hidden;
                    transition: all 0.3s ease;
                    font-family: 'Share Tech Mono', monospace;
                    color: #ffffff;
                    text-shadow: 0 0 5px #00f7ff, 0 0 10px rgba(0, 247, 255, 0.5);
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    z-index: 1;
                }
                
                .cyberpunk-button-text {
                    position: relative;
                    z-index: 2;
                    pointer-events: none;
                }
                
                .cyberpunk-button-canvas {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: 0;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(styleElement);
        }
    },
    
    /**
     * Enhance all buttons in the document
     */
    enhanceAllButtons: function() {
        // Clear existing buttons to avoid duplicates
        this.cleanup();
        
        // Find all elements with button classes
        const buttonElements = document.querySelectorAll('.cyberpunk-button, .menu-button, .gacha-pull-button, .buff-button, .inventory-tab, .enter-dungeon-button');
        
        buttonElements.forEach((buttonElement, index) => {
            // Skip if already enhanced
            if (buttonElement.hasAttribute('data-cyberpunk-enhanced')) return;
            
            this.createButton(buttonElement, index);
            buttonElement.setAttribute('data-cyberpunk-enhanced', 'true');
        });
    },
    
    /**
     * Setup mutation observer to catch dynamically added buttons
     */
    setupMutationObserver: function() {
        const observer = new MutationObserver((mutations) => {
            let shouldEnhance = false;
            
            mutations.forEach(mutation => {
                // Check for added nodes that might be buttons
                if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const node = mutation.addedNodes[i];
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Check if the node itself is a button
                            if (node.classList && 
                                (node.classList.contains('cyberpunk-button') || 
                                 node.classList.contains('menu-button') || 
                                 node.classList.contains('gacha-pull-button') || 
                                 node.classList.contains('buff-button') || 
                                 node.classList.contains('inventory-tab') || 
                                 node.classList.contains('enter-dungeon-button'))) {
                                shouldEnhance = true;
                            }
                            
                            // Check if the node contains buttons
                            if (node.querySelector) {
                                const childButtons = node.querySelectorAll('.cyberpunk-button, .menu-button, .gacha-pull-button, .buff-button, .inventory-tab, .enter-dungeon-button');
                                if (childButtons.length > 0) {
                                    shouldEnhance = true;
                                }
                            }
                        }
                    }
                }
            });
            
            // If buttons were added, re-enhance all non-enhanced buttons
            if (shouldEnhance) {
                this.enhanceAllButtons();
            }
        });
        
        // Observe the entire document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },
    
    /**
     * Create a 3D button for a given DOM element
     * @param {HTMLElement} buttonElement - The DOM element to enhance
     * @param {number} index - Unique identifier for the button
     */
    createButton: function(buttonElement, index) {
        // Create a unique ID for this button instance
        const buttonId = `cyberpunk-button-${index}`;
        
        // Get button text and style
        const buttonText = buttonElement.textContent || 'BUTTON';
        const buttonWidth = buttonElement.offsetWidth;
        const buttonHeight = buttonElement.offsetHeight;
        
        // Skip if dimensions are invalid
        if (buttonWidth <= 0 || buttonHeight <= 0) {
            console.warn(`Button ${buttonId} has invalid dimensions, skipping`, { width: buttonWidth, height: buttonHeight });
            return;
        }
        
        // Hide the original button text but keep the button interactive
        const originalTextNode = buttonElement.firstChild;
        if (originalTextNode && originalTextNode.nodeType === Node.TEXT_NODE) {
            buttonElement.removeChild(originalTextNode);
        } else {
            buttonElement.innerHTML = '';
        }
        
        // Create a container for the Three.js canvas
        const canvasContainer = document.createElement('div');
        canvasContainer.className = 'cyberpunk-button-canvas';
        canvasContainer.style.width = '100%';
        canvasContainer.style.height = '100%';
        canvasContainer.style.position = 'absolute';
        canvasContainer.style.top = '0';
        canvasContainer.style.left = '0';
        canvasContainer.style.pointerEvents = 'none'; // Allow clicks to pass through
        canvasContainer.id = buttonId;
        
        // Add the canvas container before other children
        if (buttonElement.firstChild) {
            buttonElement.insertBefore(canvasContainer, buttonElement.firstChild);
        } else {
            buttonElement.appendChild(canvasContainer);
        }
        
        // Add the text in a span that will float above the Three.js canvas
        const textContainer = document.createElement('span');
        textContainer.className = 'cyberpunk-button-text';
        textContainer.style.position = 'relative';
        textContainer.style.zIndex = '1';
        textContainer.style.pointerEvents = 'none';
        textContainer.style.fontFamily = "'Share Tech Mono', monospace";
        textContainer.style.textShadow = '0 0 5px #00f7ff, 0 0 10px rgba(0, 247, 255, 0.5)';
        textContainer.style.fontSize = '16px';
        textContainer.style.fontWeight = 'bold';
        textContainer.style.letterSpacing = '1px';
        textContainer.textContent = buttonText;
        buttonElement.appendChild(textContainer);
        
        // Make the button relative positioned if it's not already
        if (getComputedStyle(buttonElement).position === 'static') {
            buttonElement.style.position = 'relative';
        }
        
        try {
            // Check if THREE.js is available
            if (typeof THREE === 'undefined') {
                console.error('THREE.js is not available when creating button');
                return;
            }
            
            // Set up Three.js scene for this button
            const scene = new THREE.Scene();
            
            // Set up camera
            const aspect = buttonWidth / buttonHeight;
            const camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 1000);
            camera.position.z = 3;
            
            // Make sure WebGLContextManager is available
            if (!window.WebGLContextManager) {
                console.error('WebGLContextManager is not available');
                return;
            }
            
            // Use shared WebGL renderer from context manager instead of creating a new one
            const sharedRenderer = WebGLContextManager.getRenderer({ 
                alpha: true,
                antialias: true
            });
            
            if (!sharedRenderer) {
                console.error('Failed to get shared renderer');
                return;
            }
            
            // Register this component as using WebGL
            WebGLContextManager.registerUser(buttonId);
            
            // Create a custom canvas for this button
            const buttonCanvas = document.createElement('canvas');
            buttonCanvas.width = buttonWidth;
            buttonCanvas.height = buttonHeight;
            
            // Find the canvas container and append the canvas
            canvasContainer.appendChild(buttonCanvas);
            
            // Determine color based on button type or class
            let primaryColor = this.colors.neon.cyan;
            let secondaryColor = this.colors.neon.magenta;
            
            if (buttonElement.classList.contains('menu-button')) {
                primaryColor = this.colors.neon.blue;
                secondaryColor = this.colors.neon.cyan;
            } else if (buttonElement.classList.contains('gacha-pull-button')) {
                primaryColor = this.colors.neon.purple;
                secondaryColor = this.colors.neon.cyan;
            } else if (buttonElement.classList.contains('buff-button')) {
                // Special coloring for buff buttons
                if (buttonElement.id === 'damage-buff') {
                    primaryColor = 0xff3030; // Reddish for damage
                    secondaryColor = 0xff9000; // Orange glow
                } else if (buttonElement.id === 'speed-buff') {
                    primaryColor = 0x30ff90; // Greenish for speed
                    secondaryColor = 0x00ffff; // Cyan glow
                } else {
                    primaryColor = this.colors.neon.green;
                    secondaryColor = this.colors.neon.yellow;
                }
                
                // Check if button is disabled and adjust appearance
                if (buttonElement.disabled) {
                    primaryColor = 0x444444; // Dimmed color for disabled state
                    secondaryColor = 0x222222;
                } else if (buttonElement.classList.contains('max-stack')) {
                    primaryColor = 0xffcc00; // Gold color for max stack
                    secondaryColor = 0xff9900;
                }
            }
            
            // Create a glowing button background
            const buttonGeometry = new THREE.PlaneGeometry(1.8, 0.8);
            
            // Use try-catch for shader creation
            let buttonMaterial;
            try {
                buttonMaterial = new THREE.ShaderMaterial({
                    uniforms: {
                        time: { value: 0 },
                        primaryColor: { value: new THREE.Color(primaryColor) },
                        secondaryColor: { value: new THREE.Color(secondaryColor) },
                        hovered: { value: 0.0 }, // 0 = not hovered, 1 = hovered
                        pressed: { value: 0.0 }  // 0 = not pressed, 1 = pressed
                    },
                    vertexShader: `
                        varying vec2 vUv;
                        
                        void main() {
                            vUv = uv;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `,
                    fragmentShader: `
                        uniform float time;
                        uniform vec3 primaryColor;
                        uniform vec3 secondaryColor;
                        uniform float hovered;
                        uniform float pressed;
                        varying vec2 vUv;
                        
                        // Noise function
                        float noise(vec2 p) {
                            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                        }
                        
                        void main() {
                            // Base gradient
                            vec3 color = mix(primaryColor, secondaryColor, vUv.x);
                            
                            // Border glow
                            float borderWidth = 0.05;
                            float borderGlow = 1.0 - smoothstep(borderWidth, borderWidth + 0.1, vUv.x) *
                                               smoothstep(borderWidth, borderWidth + 0.1, vUv.y) *
                                               smoothstep(borderWidth, borderWidth + 0.1, 1.0 - vUv.x) *
                                               smoothstep(borderWidth, borderWidth + 0.1, 1.0 - vUv.y);
                            
                            // Pulsating effect
                            float pulse = 0.5 + 0.5 * sin(time * 2.0);
                            borderGlow *= (0.8 + 0.2 * pulse) * (1.0 + hovered * 0.5);
                            
                            // Add electronic noise
                            float noise1 = noise(vUv * 10.0 + vec2(time * 0.1));
                            float noise2 = noise(vUv * 50.0 + vec2(time * 0.5));
                            float combinedNoise = mix(noise1, noise2, 0.5) * 0.1;
                            
                            // Grid pattern
                            float gridX = step(0.05, fract(vUv.x * 10.0));
                            float gridY = step(0.05, fract(vUv.y * 10.0));
                            float grid = gridX * gridY;
                            
                            // Horizontal scan line
                            float scanline = 0.5 + 0.5 * sin(vUv.y * 50.0 - time * 10.0);
                            
                            // Add hover effect
                            float hoverGlow = hovered * 0.3 * (0.5 + 0.5 * sin(time * 5.0));
                            
                            // Add press effect
                            float pressGlow = pressed * 0.5;
                            
                            // Mix all effects
                            color = mix(color, primaryColor, borderGlow * 0.5);
                            color = mix(color, vec3(1.0), combinedNoise);
                            color = mix(color, color * 0.8, 1.0 - grid * 0.2);
                            color = mix(color, color * 1.2, scanline * 0.05);
                            color = mix(color, primaryColor, hoverGlow);
                            color = mix(color, secondaryColor, pressGlow);
                            
                            // Button fill - slightly transparent background
                            float alpha = 0.85 + borderGlow * 0.15 + hoverGlow + pressGlow;
                            
                            gl_FragColor = vec4(color, alpha);
                        }
                    `,
                    transparent: true
                });
            } catch (error) {
                console.error('Error creating button shader material:', error);
                // Fallback to a basic material if shader compilation fails
                buttonMaterial = new THREE.MeshBasicMaterial({
                    color: primaryColor,
                    transparent: true,
                    opacity: 0.8
                });
            }
            
            const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
            scene.add(buttonMesh);
            
            // Create holographic circuit lines
            const lineGeometry = new THREE.BufferGeometry();
            const lineCount = 5;
            const linePositions = [];
            
            for (let i = 0; i < lineCount; i++) {
                const y = (i / (lineCount - 1)) * 0.7 - 0.35;
                linePositions.push(-0.9, y, 0.01);
                linePositions.push(0.9, y, 0.01);
            }
            
            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            
            const lineMaterial = new THREE.LineBasicMaterial({
                color: primaryColor,
                transparent: true,
                opacity: 0.5
            });
            
            const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
            scene.add(lines);
            
            // Add some particles
            const particleCount = 15;
            const particleGeometry = new THREE.BufferGeometry();
            const particlePositions = new Float32Array(particleCount * 3);
            const particleSizes = new Float32Array(particleCount);
            const particleVelocities = [];
            
            for (let i = 0; i < particleCount; i++) {
                // Random position within button bounds
                particlePositions[i * 3] = (Math.random() - 0.5) * 1.8;
                particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.8;
                particlePositions[i * 3 + 2] = 0.02;
                
                // Random size
                particleSizes[i] = Math.random() * 0.03 + 0.01;
                
                // Random velocity
                particleVelocities.push({
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02
                });
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
            particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));
            
            const particleMaterial = new THREE.PointsMaterial({
                color: secondaryColor,
                size: 0.05,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            
            const particles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(particles);
            
            // Add event listeners for hover and click
            let isHovered = false;
            let isPressed = false;
            
            const onMouseEnter = () => {
                isHovered = true;
                if (buttonMaterial.uniforms) {
                    buttonMaterial.uniforms.hovered.value = 1.0;
                }
                lineMaterial.opacity = 0.8;
            };
            
            const onMouseLeave = () => {
                isHovered = false;
                if (buttonMaterial.uniforms) {
                    buttonMaterial.uniforms.hovered.value = 0.0;
                    buttonMaterial.uniforms.pressed.value = 0.0;
                }
                lineMaterial.opacity = 0.5;
                isPressed = false;
            };
            
            const onMouseDown = () => {
                isPressed = true;
                if (buttonMaterial.uniforms) {
                    buttonMaterial.uniforms.pressed.value = 1.0;
                }
            };
            
            const onMouseUp = () => {
                isPressed = false;
                if (buttonMaterial.uniforms) {
                    buttonMaterial.uniforms.pressed.value = 0.0;
                }
            };
            
            // Add the event listeners to the button element
            buttonElement.addEventListener('mouseenter', onMouseEnter);
            buttonElement.addEventListener('mouseleave', onMouseLeave);
            buttonElement.addEventListener('mousedown', onMouseDown);
            buttonElement.addEventListener('mouseup', onMouseUp);
            
            // Store everything in the buttons object for animation
            this.buttons[buttonId] = {
                element: buttonElement,
                container: canvasContainer,
                scene: scene,
                camera: camera,
                renderer: sharedRenderer,
                canvas: buttonCanvas,
                buttonMesh: buttonMesh,
                buttonMaterial: buttonMaterial,
                lines: lines,
                particles: particles,
                particleVelocities: particleVelocities,
                isHovered: isHovered,
                isPressed: isPressed,
                onMouseEnter: onMouseEnter,
                onMouseLeave: onMouseLeave,
                onMouseDown: onMouseDown,
                onMouseUp: onMouseUp
            };
        } catch (error) {
            console.error('Error creating cyberpunk button:', error);
        }
    },
    
    /**
     * Global animation loop for all buttons
     */
    animate: function() {
        requestAnimationFrame(() => this.animate());
        
        // Update all buttons
        Object.values(this.buttons).forEach(button => {
            this.updateButton(button);
        });
    },
    
    /**
     * Update a specific button's animation
     * @param {Object} button - Button object with Three.js components
     */
    updateButton: function(button) {
        // Skip if the button element is no longer in the DOM or has zero dimensions
        if (!document.body.contains(button.element) || 
            button.element.offsetWidth <= 0 || 
            button.element.offsetHeight <= 0) {
            return;
        }
        
        // Skip if canvas is missing or invalid
        if (!button.canvas || !(button.canvas instanceof HTMLCanvasElement)) {
            return;
        }
        
        try {
            // Check if WebGLContextManager is loaded and working
            if (!WebGLContextManager) {
                console.warn("WebGLContextManager not available");
                return;
            }
            
            if (WebGLContextManager.isContextLost()) {
                // Skip rendering if context is lost
                console.debug("WebGL context is lost, skipping render");
                return;
            }
            
            // Begin render operation on shared context
            if (!WebGLContextManager.beginRender()) {
                // Another component is currently rendering, try again next frame
                return;
            }
            
            try {
                // Update uniform time
                const time = performance.now() * 0.001;
                if (button.buttonMaterial && button.buttonMaterial.uniforms && button.buttonMaterial.uniforms.time) {
                    button.buttonMaterial.uniforms.time.value = time;
                }
                
                // Update particle positions
                if (button.particles && button.particles.geometry && 
                    button.particles.geometry.attributes && 
                    button.particles.geometry.attributes.position) {
                    
                    const positions = button.particles.geometry.attributes.position.array;
                    
                    for (let i = 0; i < positions.length / 3; i++) {
                        // Get current position
                        let x = positions[i * 3];
                        let y = positions[i * 3 + 1];
                        
                        // Apply velocity
                        if (button.particleVelocities && button.particleVelocities[i]) {
                            x += button.particleVelocities[i].x;
                            y += button.particleVelocities[i].y;
                        }
                        
                        // Bounds checking - wrap around if out of bounds
                        if (x < -0.9) x = 0.9;
                        if (x > 0.9) x = -0.9;
                        if (y < -0.4) y = 0.4;
                        if (y > 0.4) y = -0.4;
                        
                        // Update position
                        positions[i * 3] = x;
                        positions[i * 3 + 1] = y;
                    }
                    
                    button.particles.geometry.attributes.position.needsUpdate = true;
                }
                
                // Make lines pulse based on time
                if (button.lines && button.lines.material) {
                    const pulseOpacity = 0.5 + 0.3 * Math.sin(time * 2.0);
                    button.lines.material.opacity = button.isHovered ? 0.8 : pulseOpacity;
                }
                
                // Get button dimensions
                const width = button.element.offsetWidth;
                const height = button.element.offsetHeight;
                
                // Only proceed if the button has valid dimensions
                if (width > 0 && height > 0 && button.canvas && button.scene && button.camera) {
                    // Ensure canvas size matches button size
                    if (button.canvas.width !== width || button.canvas.height !== height) {
                        button.canvas.width = width;
                        button.canvas.height = height;
                        
                        // Update camera aspect ratio
                        button.camera.aspect = width / height;
                        button.camera.updateProjectionMatrix();
                    }
                    
                    // Get the shared renderer
                    const renderer = WebGLContextManager.getRenderer();
                    if (renderer) {
                        try {
                            // Set up renderer for this button's canvas and size
                            WebGLContextManager.setupRenderer(
                                button.canvas,
                                width,
                                height
                            );
                            
                            // Only render if renderer setup was successful
                            if (renderer.getContext()) {
                                // Render the scene
                                renderer.render(button.scene, button.camera);
                            }
                        } catch (renderError) {
                            console.error("Error during button rendering:", renderError);
                        }
                    } else {
                        console.warn("Failed to get WebGL renderer for button update");
                    }
                }
            } catch (error) {
                console.error("Error updating button animation:", error);
            } finally {
                // Always end render operation, even if there was an error
                WebGLContextManager.endRender();
            }
        } catch (error) {
            console.error("Error updating button:", error);
            
            // Ensure render operation is ended
            try {
                WebGLContextManager.endRender();
            } catch (e) {
                // Ignore additional errors when trying to end render
            }
        }
    },
    
    /**
     * Update button size if the element size has changed
     * @param {Object} button - Button object with Three.js components
     */
    updateButtonSize: function(button) {
        const width = button.element.offsetWidth;
        const height = button.element.offsetHeight;
        
        // Check if size has changed and renderer exists
        if (button.renderer && button.renderer.domElement && 
            (button.renderer.domElement.width !== width || 
             button.renderer.domElement.height !== height)) {
            
            // Update camera aspect ratio
            button.camera.aspect = width / height;
            button.camera.updateProjectionMatrix();
            
            // Update renderer size
            button.renderer.setSize(width, height);
        }
    },
    
    /**
     * Clean up a button
     * @param {string} buttonId - ID of the button to clean up
     */
    cleanupButton: function(buttonId) {
        if (!this.buttons[buttonId]) return;
        
        const button = this.buttons[buttonId];
        
        // Remove event listeners
        button.element.removeEventListener('mouseenter', button.onMouseEnter);
        button.element.removeEventListener('mouseleave', button.onMouseLeave);
        button.element.removeEventListener('mousedown', button.onMouseDown);
        button.element.removeEventListener('mouseup', button.onMouseUp);
        
        try {
            // Dispose of Three.js resources
            if (button.buttonMesh && button.buttonMesh.geometry) {
                button.buttonMesh.geometry.dispose();
            }
            if (button.buttonMesh && button.buttonMesh.material) {
                button.buttonMesh.material.dispose();
            }
            if (button.lines && button.lines.geometry) {
                button.lines.geometry.dispose();
            }
            if (button.lines && button.lines.material) {
                button.lines.material.dispose();
            }
            if (button.particles && button.particles.geometry) {
                button.particles.geometry.dispose();
            }
            if (button.particles && button.particles.material) {
                button.particles.material.dispose();
            }
            
            // Unregister from WebGLContextManager
            if (WebGLContextManager) {
                WebGLContextManager.unregisterUser(buttonId);
            }
        } catch (error) {
            console.error('Error disposing button resources:', error);
        }
        
        // Remove renderer from DOM
        if (button.container && button.container.parentNode) {
            button.container.parentNode.removeChild(button.container);
        }
        
        // Remove from buttons object
        delete this.buttons[buttonId];
    },
    
    /**
     * Clean up all buttons by iterating through registered buttons
     */
    cleanup: function() {
        Object.keys(this.buttons).forEach(buttonId => {
            this.cleanupButton(buttonId);
        });
    },
    
    /**
     * Initialize a menu button with proper symbol and text handling
     * @param {HTMLElement} buttonElement - The button element to initialize
     * @param {string} symbol - The symbol to display (e.g., '👤')
     */
    initializeMenuButton: function(buttonElement, symbol) {
        // Clear existing content
        buttonElement.innerHTML = '';
        
        // Create symbol container
        const symbolContainer = document.createElement('span');
        symbolContainer.className = 'menu-button-symbol';
        symbolContainer.textContent = symbol;
        symbolContainer.style.fontSize = '24px';
        symbolContainer.style.lineHeight = '1';
        symbolContainer.style.display = 'flex';
        symbolContainer.style.justifyContent = 'center';
        symbolContainer.style.alignItems = 'center';
        symbolContainer.style.width = '100%';
        symbolContainer.style.height = '100%';
        
        // Add symbol to button
        buttonElement.appendChild(symbolContainer);
        
        // Add hover effect if there's a tooltip
        if (buttonElement.hasAttribute('data-tooltip')) {
            buttonElement.style.position = 'relative';
        }
    }
};

class CyberpunkButtonEnhancer {
    constructor() {
        this.audioContext = null;
        this.hoverSound = null;
        this.clickSound = null;
        this.initAudioContext();
        this.initButtons();
    }

    initAudioContext() {
        try {
            // Create audio context only on user interaction to comply with browser policies
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    async initButtons() {
        const buttons = document.querySelectorAll('.menu-button');
        
        buttons.forEach(button => {
            // Wrap button text in span for glitch effect
            if (!button.querySelector('span')) {
                const text = button.textContent;
                button.innerHTML = `<span>${text}</span>`;
            }

            // Add hover effect
            button.addEventListener('mouseenter', () => {
                this.playHoverSound();
            });

            // Add click effect
            button.addEventListener('click', (e) => {
                this.createClickRipple(e);
                this.playClickSound();
            });

            // Initialize audio context on first interaction
            button.addEventListener('mouseenter', () => {
                if (this.audioContext?.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
        });
    }

    async playHoverSound() {
        if (!this.audioContext) return;
        
        try {
            // Create a simple synthesized hover sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(2000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1500, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.warn('Error playing hover sound:', e);
        }
    }

    async playClickSound() {
        if (!this.audioContext) return;
        
        try {
            // Create a simple synthesized click sound
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(500, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (e) {
            console.warn('Error playing click sound:', e);
        }
    }

    createClickRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('div');
        
        ripple.classList.add('ripple');
        button.appendChild(ripple);

        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.width = ripple.style.height = `${size}px`;
        ripple.style.left = `${event.clientX - rect.left - size/2}px`;
        ripple.style.top = `${event.clientY - rect.top - size/2}px`;

        ripple.addEventListener('animationend', () => {
            ripple.remove();
        });
    }
}

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    new CyberpunkButtonEnhancer();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Clean up audio context when page is hidden
        const enhancer = window.cyberpunkButtonEnhancer;
        if (enhancer?.audioContext) {
            enhancer.audioContext.suspend();
        }
    }
});
